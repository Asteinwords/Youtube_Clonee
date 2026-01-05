import Video from '../models/Video.js';
import Channel from '../models/Channel.js';
import History from '../models/History.js';
import Subscription from '../models/Subscription.js';
import { uploadVideo as uploadToCloudinary, uploadImage, deleteResource } from '../utils/cloudinary.js';
import { cleanupFile } from '../middleware/upload.js';
import { createNotification } from './notificationController.js';

/**
 * @desc    Upload video
 * @route   POST /api/videos/upload
 * @access  Private
 */
export const uploadVideo = async (req, res) => {
    try {
        const { title, description, tags, category } = req.body;
        const videoFile = req.files?.video?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        console.log('=== Upload Request Received ===');
        console.log('Title:', title);
        console.log('Description:', description);
        console.log('Category:', category);
        console.log('Tags:', tags);
        console.log('Video file:', videoFile ? { name: videoFile.originalname, size: videoFile.size, mimetype: videoFile.mimetype } : 'MISSING');
        console.log('Thumbnail file:', thumbnailFile ? { name: thumbnailFile.originalname, size: thumbnailFile.size } : 'None');

        // Validate video file
        if (!videoFile) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }

        // Validate Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary configuration missing!');
            // Cleanup uploaded files
            if (videoFile) cleanupFile(videoFile.path);
            if (thumbnailFile) cleanupFile(thumbnailFile.path);

            return res.status(500).json({
                success: false,
                message: 'Server configuration error: Cloudinary not configured'
            });
        }

        // Get user's channel
        const channel = await Channel.findOne({ owner: req.user.id });
        if (!channel) {
            // Cleanup uploaded file
            if (videoFile) cleanupFile(videoFile.path);
            if (thumbnailFile) cleanupFile(thumbnailFile.path);

            return res.status(400).json({
                success: false,
                message: 'Please create a channel first before uploading videos'
            });
        }

        console.log('Channel found:', channel.name);
        console.log('Uploading video to Cloudinary...');

        // Upload video to Cloudinary
        let videoUpload;
        try {
            videoUpload = await uploadToCloudinary(videoFile.path);
            console.log('✓ Video uploaded successfully:', videoUpload.url);
        } catch (cloudinaryError) {
            console.error('Cloudinary video upload failed:', cloudinaryError);
            // Cleanup uploaded files
            if (videoFile) cleanupFile(videoFile.path);
            if (thumbnailFile) cleanupFile(thumbnailFile.path);

            return res.status(500).json({
                success: false,
                message: 'Failed to upload video to cloud storage: ' + cloudinaryError.message
            });
        }

        let thumbnailUrl = null;
        let cloudinaryThumbnailId = null;

        // Upload thumbnail if provided
        if (thumbnailFile) {
            console.log('Uploading thumbnail to Cloudinary...');
            try {
                const thumbnailUpload = await uploadImage(thumbnailFile.path);
                thumbnailUrl = thumbnailUpload.url;
                cloudinaryThumbnailId = thumbnailUpload.publicId;
                console.log('✓ Thumbnail uploaded successfully:', thumbnailUrl);
            } catch (thumbnailError) {
                console.error('Thumbnail upload failed (non-critical):', thumbnailError);
                // Continue without thumbnail - it's optional
            }
        }

        // Parse tags properly
        let parsedTags = [];
        if (tags) {
            if (Array.isArray(tags)) {
                parsedTags = tags;
            } else if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }

        console.log('Creating video document...');
        // Create video document
        const video = await Video.create({
            title,
            description,
            videoUrl: videoUpload.url,
            thumbnailUrl: thumbnailUrl,
            duration: videoUpload.duration || 0,
            tags: parsedTags,
            category: category || 'General',
            channel: channel._id,
            uploader: req.user.id,
            cloudinaryVideoId: videoUpload.publicId,
            cloudinaryThumbnailId: cloudinaryThumbnailId
        });

        console.log('✓ Video created successfully:', video._id);

        // Cleanup temp files
        cleanupFile(videoFile.path);
        if (thumbnailFile) cleanupFile(thumbnailFile.path);

        // Create notifications for all channel subscribers
        try {
            const subscribers = await Subscription.find({ channel: channel._id }).select('subscriber');
            const notificationPromises = subscribers.map(sub =>
                createNotification({
                    userId: sub.subscriber,
                    type: 'upload',
                    message: `${channel.name} uploaded: ${title}`,
                    relatedVideo: video._id,
                    relatedChannel: channel._id,
                    thumbnail: thumbnailUrl
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error('Failed to create notifications:', notifError);
            // Don't fail the upload if notifications fail
        }

        res.status(201).json({
            success: true,
            data: video,
            message: 'Video uploaded successfully!'
        });
    } catch (error) {
        console.error('=== Upload Video Error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);

        // Cleanup temp files on error
        if (req.files?.video?.[0]) cleanupFile(req.files.video[0].path);
        if (req.files?.thumbnail?.[0]) cleanupFile(req.files.thumbnail[0].path);

        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading video',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc    Get video feed (trending/latest)
 * @route   GET /api/videos
 * @access  Public
 */
export const getVideos = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = 'latest' } = req.query;

        let sortOption = {};
        if (sort === 'latest') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'trending') {
            sortOption = { views: -1, createdAt: -1 };
        } else if (sort === 'popular') {
            sortOption = { likes: -1 };
        }

        const videos = await Video.find({ isPublic: true })
            .populate('channel', 'name avatarUrl subscribers')
            .populate('uploader', 'name avatar')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Video.countDocuments({ isPublic: true });

        res.status(200).json({
            success: true,
            data: videos,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos'
        });
    }
};

/**
 * @desc    Get single video
 * @route   GET /api/videos/:id
 * @access  Public
 */
export const getVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('channel', 'name avatarUrl bannerUrl subscribers description')
            .populate('uploader', 'name avatar');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching video'
        });
    }
};

/**
 * @desc    Increment video views
 * @route   PUT /api/videos/:id/view
 * @access  Public
 */
export const incrementViews = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        await video.incrementViews();

        // Add to history if user is logged in
        if (req.user) {
            await History.findOneAndUpdate(
                { user: req.user.id, video: video._id },
                {
                    user: req.user.id,
                    video: video._id,
                    watchedAt: new Date()
                },
                { upsert: true, new: true }
            );

            // Update user's watch time
            const watchDuration = req.body.watchDuration || 0;
            req.user.watchTimeToday += watchDuration;
            await req.user.save();
        }

        res.status(200).json({
            success: true,
            views: video.views
        });
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({
            success: false,
            message: 'Error incrementing views'
        });
    }
};

/**
 * @desc    Get recommended videos
 * @route   GET /api/videos/:id/recommended
 * @access  Public
 */
export const getRecommendedVideos = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Find videos with similar tags or from same channel
        const recommended = await Video.find({
            _id: { $ne: video._id },
            isPublic: true,
            $or: [
                { tags: { $in: video.tags } },
                { channel: video.channel },
                { category: video.category }
            ]
        })
            .populate('channel', 'name avatarUrl')
            .sort({ views: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: recommended
        });
    } catch (error) {
        console.error('Get recommended videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recommended videos'
        });
    }
};

/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private
 */
export const updateVideo = async (req, res) => {
    try {
        let video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check ownership
        if (video.uploader.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this video'
            });
        }

        const { title, description, tags, category } = req.body;

        video = await Video.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : video.tags,
                category
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating video'
        });
    }
};

/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private
 */
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check ownership
        if (video.uploader.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this video'
            });
        }

        // Delete from Cloudinary
        await deleteResource(video.cloudinaryVideoId, 'video');
        await deleteResource(video.cloudinaryThumbnailId, 'image');

        // Delete video
        await video.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting video'
        });
    }
};
