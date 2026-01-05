import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import Like from '../models/Like.js';
import { detectLanguage, translateText } from '../utils/translation.js';
import { createNotification } from './notificationController.js';

/**
 * @desc    Create comment
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = async (req, res) => {
    try {
        const { text, videoId, parentCommentId } = req.body;

        // Validate comment text (no special characters)
        if (!Comment.validateCommentText(text)) {
            return res.status(400).json({
                success: false,
                message: 'Comment contains invalid characters. Only letters, numbers, and basic punctuation are allowed.'
            });
        }

        // Detect language
        const language = await detectLanguage(text);

        // Create comment
        const comment = await Comment.create({
            text,
            video: videoId,
            user: req.user.id,
            userCity: req.user.location?.city || 'Unknown',
            originalLanguage: language,
            parentComment: parentCommentId || null
        });

        // Populate user data
        await comment.populate('user', 'name avatar');

        // Create notification for video owner (if not commenting on own video)
        try {
            const video = await Video.findById(videoId).populate('channel');
            if (video && video.channel && video.channel.owner.toString() !== req.user.id) {
                const notificationType = parentCommentId ? 'reply' : 'comment';
                const message = parentCommentId
                    ? `${req.user.name} replied to your comment`
                    : `${req.user.name} commented: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`;

                await createNotification({
                    userId: video.channel.owner,
                    type: notificationType,
                    message,
                    relatedVideo: videoId,
                    relatedUser: req.user.id,
                    thumbnail: video.thumbnailUrl
                });
            }
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
            // Don't fail the comment if notification fails
        }

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating comment'
        });
    }
};

/**
 * @desc    Get comments for video
 * @route   GET /api/comments/:videoId
 * @access  Public
 */
export const getComments = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'top' } = req.query;

        // Determine sort order based on sortBy parameter
        let sortOrder = {};
        if (sortBy === 'newest') {
            sortOrder = { createdAt: -1 };
        } else {
            // Default to 'top' - sort by likes descending, then by date
            sortOrder = { likes: -1, createdAt: -1 };
        }

        const comments = await Comment.find({
            video: req.params.videoId,
            parentComment: null,
            isDeleted: false
        })
            .populate('user', 'name avatar')
            .sort(sortOrder)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Get replies for each comment
        for (let comment of comments) {
            const replies = await Comment.find({
                parentComment: comment._id,
                isDeleted: false
            })
                .populate('user', 'name avatar')
                .sort({ createdAt: 1 });

            comment._doc.replies = replies;
        }

        const count = await Comment.countDocuments({
            video: req.params.videoId,
            parentComment: null,
            isDeleted: false
        });

        res.status(200).json({
            success: true,
            data: comments,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
};

/**
 * @desc    Translate comment
 * @route   POST /api/comments/:id/translate
 * @access  Public
 */
export const translateComment = async (req, res) => {
    try {
        const { targetLanguage } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if translation already exists
        if (comment.translations.has(targetLanguage)) {
            return res.status(200).json({
                success: true,
                translation: comment.translations.get(targetLanguage),
                cached: true
            });
        }

        // Translate
        const translation = await translateText(comment.text, targetLanguage);

        // Cache translation
        comment.translations.set(targetLanguage, translation);
        await comment.save();

        res.status(200).json({
            success: true,
            translation,
            cached: false
        });
    } catch (error) {
        console.error('Translate comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error translating comment'
        });
    }
};

/**
 * @desc    Like/Dislike comment
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
export const likeComment = async (req, res) => {
    try {
        const { likeType } = req.body; // 'like' or 'dislike'
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user already liked/disliked
        const existingLike = await Like.findOne({
            user: req.user.id,
            targetType: 'Comment',
            targetId: comment._id
        });

        if (existingLike) {
            // Remove previous like/dislike
            if (existingLike.likeType === 'like') {
                comment.likes -= 1;
            } else {
                comment.dislikes -= 1;
            }

            // If same type, remove it (toggle off)
            if (existingLike.likeType === likeType) {
                await existingLike.deleteOne();
                await comment.save();

                return res.status(200).json({
                    success: true,
                    data: {
                        likes: comment.likes,
                        dislikes: comment.dislikes,
                        userLikeType: null
                    }
                });
            }

            // Update to new type
            existingLike.likeType = likeType;
            await existingLike.save();
        } else {
            // Create new like/dislike
            await Like.create({
                user: req.user.id,
                targetType: 'Comment',
                targetId: comment._id,
                likeType
            });
        }

        // Update comment counts
        if (likeType === 'like') {
            comment.likes += 1;
        } else {
            comment.dislikes += 1;
        }

        await comment.save();

        // Check if comment should be auto-deleted (2+ dislikes)
        if (comment.isDeleted) {
            return res.status(200).json({
                success: true,
                message: 'Comment has been removed due to dislikes',
                deleted: true
            });
        }

        res.status(200).json({
            success: true,
            data: {
                likes: comment.likes,
                dislikes: comment.dislikes,
                userLikeType: likeType
            }
        });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking comment'
        });
    }
};

/**
 * @desc    Update comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
export const updateComment = async (req, res) => {
    try {
        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        const { text } = req.body;

        // Validate comment text
        if (!Comment.validateCommentText(text)) {
            return res.status(400).json({
                success: false,
                message: 'Comment contains invalid characters'
            });
        }

        // Detect new language
        const language = await detectLanguage(text);

        comment.text = text;
        comment.originalLanguage = language;
        comment.translations = new Map(); // Clear cached translations
        await comment.save();

        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating comment'
        });
    }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
};
