import Channel from '../models/Channel.js';
import Subscription from '../models/Subscription.js';
import Video from '../models/Video.js';
import { uploadImage, deleteResource } from '../utils/cloudinary.js';
import { cleanupFile } from '../middleware/upload.js';

/**
 * @desc    Create channel
 * @route   POST /api/channels
 * @access  Private
 */
export const createChannel = async (req, res) => {
    try {
        // Check if user already has a channel
        const existingChannel = await Channel.findOne({ owner: req.user.id });

        if (existingChannel) {
            return res.status(400).json({
                success: false,
                message: 'You already have a channel'
            });
        }

        const { name, description } = req.body;

        const channel = await Channel.create({
            name,
            description,
            owner: req.user.id,
            avatarUrl: req.user.avatar || req.user.picture
        });

        res.status(201).json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Create channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating channel'
        });
    }
};

/**
 * @desc    Get my channel
 * @route   GET /api/channels/my/channel
 * @access  Private
 */
export const getMyChannel = async (req, res) => {
    try {
        const channel = await Channel.findOne({ owner: req.user.id });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found',
                data: null
            });
        }

        // Sync avatar with user's current avatar
        if (req.user.avatar && channel.avatarUrl !== req.user.avatar) {
            channel.avatarUrl = req.user.avatar;
            await channel.save();
        } else if (req.user.picture && channel.avatarUrl !== req.user.picture) {
            channel.avatarUrl = req.user.picture;
            await channel.save();
        }

        res.status(200).json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Get my channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching channel'
        });
    }
};

/**
 * @desc    Get channel
 * @route   GET /api/channels/:id
 * @access  Public
 */
export const getChannel = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id)
            .populate('owner', 'name email');

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if current user is subscribed
        let isSubscribed = false;
        if (req.user) {
            const subscription = await Subscription.findOne({
                subscriber: req.user.id,
                channel: channel._id
            });
            isSubscribed = !!subscription;
        }

        res.status(200).json({
            success: true,
            data: {
                ...channel.toObject(),
                isSubscribed
            }
        });
    } catch (error) {
        console.error('Get channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching channel'
        });
    }
};

/**
 * @desc    Update channel
 * @route   PUT /api/channels/:id
 * @access  Private
 */
export const updateChannel = async (req, res) => {
    try {
        let channel = await Channel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check ownership
        if (channel.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this channel'
            });
        }

        const { name, description } = req.body;

        channel = await Channel.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Update channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating channel'
        });
    }
};

/**
 * @desc    Upload channel banner
 * @route   PUT /api/channels/:id/banner
 * @access  Private
 */
export const uploadBanner = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check ownership
        if (channel.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this channel'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Delete old banner if exists
        if (channel.cloudinaryBannerId) {
            await deleteResource(channel.cloudinaryBannerId, 'image');
        }

        // Upload new banner
        const result = await uploadImage(req.file.path, 'youtube-clone/banners');

        channel.bannerUrl = result.url;
        channel.cloudinaryBannerId = result.publicId;
        await channel.save();

        // Cleanup temp file
        cleanupFile(req.file.path);

        res.status(200).json({
            success: true,
            data: channel
        });
    } catch (error) {
        console.error('Upload banner error:', error);
        if (req.file) cleanupFile(req.file.path);
        res.status(500).json({
            success: false,
            message: 'Error uploading banner'
        });
    }
};

/**
 * @desc    Subscribe/Unsubscribe to channel
 * @route   POST /api/channels/:id/subscribe
 * @access  Private
 */
export const toggleSubscription = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if already subscribed
        const subscription = await Subscription.findOne({
            subscriber: req.user.id,
            channel: channel._id
        });

        if (subscription) {
            // Unsubscribe
            await subscription.deleteOne();
            await channel.decrementSubscribers();

            return res.status(200).json({
                success: true,
                message: 'Unsubscribed successfully',
                isSubscribed: false,
                subscribers: channel.subscribers
            });
        } else {
            // Subscribe
            await Subscription.create({
                subscriber: req.user.id,
                channel: channel._id
            });
            await channel.incrementSubscribers();

            return res.status(200).json({
                success: true,
                message: 'Subscribed successfully',
                isSubscribed: true,
                subscribers: channel.subscribers
            });
        }
    } catch (error) {
        console.error('Toggle subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling subscription'
        });
    }
};

/**
 * @desc    Get channel videos
 * @route   GET /api/channels/:id/videos
 * @access  Public
 */
export const getChannelVideos = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const videos = await Video.find({ channel: req.params.id, isPublic: true })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Video.countDocuments({ channel: req.params.id, isPublic: true });

        res.status(200).json({
            success: true,
            data: videos,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get channel videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching channel videos'
        });
    }
};

/**
 * @desc    Get my subscriptions
 * @route   GET /api/channels/subscriptions
 * @access  Private
 */
export const getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ subscriber: req.user.id })
            .populate({
                path: 'channel',
                select: 'name description avatarUrl bannerUrl subscribers'
            })
            .sort({ createdAt: -1 });

        // Filter out any null channels (in case a channel was deleted)
        const validSubscriptions = subscriptions
            .filter(sub => sub.channel)
            .map(sub => sub.channel);

        res.status(200).json({
            success: true,
            data: validSubscriptions
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions'
        });
    }
};

