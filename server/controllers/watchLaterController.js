import WatchLater from '../models/WatchLater.js';

/**
 * @desc    Add video to watch later
 * @route   POST /api/watchlater/:videoId
 * @access  Private
 */
export const addToWatchLater = async (req, res) => {
    try {
        const watchLater = await WatchLater.create({
            user: req.user.id,
            video: req.params.videoId
        });

        res.status(201).json({
            success: true,
            data: watchLater
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Video already in watch later'
            });
        }

        console.error('Add to watch later error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to watch later'
        });
    }
};

/**
 * @desc    Get watch later videos
 * @route   GET /api/watchlater
 * @access  Private
 */
export const getWatchLater = async (req, res) => {
    try {
        const watchLater = await WatchLater.find({ user: req.user.id })
            .populate('video', 'title thumbnailUrl duration views channel')
            .populate({
                path: 'video',
                populate: {
                    path: 'channel',
                    select: 'name avatarUrl'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: watchLater
        });
    } catch (error) {
        console.error('Get watch later error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watch later'
        });
    }
};

/**
 * @desc    Remove from watch later
 * @route   DELETE /api/watchlater/:videoId
 * @access  Private
 */
export const removeFromWatchLater = async (req, res) => {
    try {
        await WatchLater.findOneAndDelete({
            user: req.user.id,
            video: req.params.videoId
        });

        res.status(200).json({
            success: true,
            message: 'Removed from watch later'
        });
    } catch (error) {
        console.error('Remove from watch later error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from watch later'
        });
    }
};
