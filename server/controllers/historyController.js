import History from '../models/History.js';

/**
 * @desc    Get watch history
 * @route   GET /api/history
 * @access  Private
 */
export const getHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const history = await History.find({ user: req.user.id })
            .populate('video', 'title thumbnailUrl duration views channel')
            .populate({
                path: 'video',
                populate: {
                    path: 'channel',
                    select: 'name avatarUrl'
                }
            })
            .sort({ watchedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await History.countDocuments({ user: req.user.id });

        res.status(200).json({
            success: true,
            data: history,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching history'
        });
    }
};

/**
 * @desc    Clear watch history
 * @route   DELETE /api/history
 * @access  Private
 */
export const clearHistory = async (req, res) => {
    try {
        await History.deleteMany({ user: req.user.id });

        res.status(200).json({
            success: true,
            message: 'History cleared successfully'
        });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing history'
        });
    }
};
