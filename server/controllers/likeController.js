import Like from '../models/Like.js';
import Video from '../models/Video.js';

/**
 * @desc    Like/Dislike video
 * @route   POST /api/likes/video/:videoId
 * @access  Private
 */
export const likeVideo = async (req, res) => {
    try {
        const { likeType } = req.body; // 'like' or 'dislike'
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user already liked/disliked
        const existingLike = await Like.findOne({
            user: req.user.id,
            targetType: 'Video',
            targetId: video._id
        });

        if (existingLike) {
            // Remove previous like/dislike
            if (existingLike.likeType === 'like') {
                video.likes -= 1;
            } else {
                video.dislikes -= 1;
            }

            // If same type, remove it (toggle off)
            if (existingLike.likeType === likeType) {
                await existingLike.deleteOne();
                await video.save();

                return res.status(200).json({
                    success: true,
                    data: {
                        likes: video.likes,
                        dislikes: video.dislikes,
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
                targetType: 'Video',
                targetId: video._id,
                likeType
            });
        }

        // Update video counts
        if (likeType === 'like') {
            video.likes += 1;
        } else {
            video.dislikes += 1;
        }

        await video.save();

        res.status(200).json({
            success: true,
            data: {
                likes: video.likes,
                dislikes: video.dislikes,
                userLikeType: likeType
            }
        });
    } catch (error) {
        console.error('Like video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking video'
        });
    }
};

/**
 * @desc    Get liked videos
 * @route   GET /api/likes/videos
 * @access  Private
 */
export const getLikedVideos = async (req, res) => {
    try {
        const likes = await Like.find({
            user: req.user.id,
            targetType: 'Video',
            likeType: 'like'
        })
            .populate({
                path: 'targetId',
                select: 'title thumbnailUrl duration views channel',
                populate: {
                    path: 'channel',
                    select: 'name avatarUrl'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: likes
        });
    } catch (error) {
        console.error('Get liked videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching liked videos'
        });
    }
};
