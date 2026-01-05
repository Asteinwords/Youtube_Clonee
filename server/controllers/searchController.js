import Video from '../models/Video.js';

/**
 * @desc    Search videos
 * @route   GET /api/search
 * @access  Public
 */
export const searchVideos = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Text search on title, description, and tags
        const videos = await Video.find({
            $text: { $search: q },
            isPublic: true
        })
            .populate('channel', 'name avatarUrl')
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Video.countDocuments({
            $text: { $search: q },
            isPublic: true
        });

        res.status(200).json({
            success: true,
            data: videos,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching videos'
        });
    }
};
