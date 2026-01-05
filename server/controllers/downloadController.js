import Download from '../models/Download.js';
import Video from '../models/Video.js';

/**
 * @desc    Download video
 * @route   POST /api/downloads/:videoId
 * @access  Private
 */
export const downloadVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user can download
        const canDownload = req.user.canDownload();

        if (!canDownload) {
            const isPremium = ['Bronze', 'Silver', 'Gold'].includes(req.user.subscriptionPlan);

            return res.status(403).json({
                success: false,
                message: isPremium
                    ? 'Download limit reached. Please try again tomorrow.'
                    : 'Daily download limit reached. Upgrade to premium for unlimited downloads!',
                needsUpgrade: !isPremium,
                currentPlan: req.user.subscriptionPlan,
                dailyDownloadCount: req.user.dailyDownloadCount
            });
        }

        // Create download record
        const download = await Download.create({
            user: req.user.id,
            video: video._id,
            downloadUrl: video.videoUrl
        });

        // Increment user's daily download count (only for free users)
        if (req.user.subscriptionPlan === 'Free') {
            req.user.dailyDownloadCount += 1;
            await req.user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Download initiated successfully',
            data: {
                downloadUrl: download.downloadUrl,
                expiresAt: download.expiresAt,
                videoTitle: video.title,
                remainingDownloads: req.user.subscriptionPlan === 'Free'
                    ? Math.max(0, 1 - req.user.dailyDownloadCount)
                    : 'unlimited'
            }
        });
    } catch (error) {
        console.error('Download video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading video'
        });
    }
};

/**
 * @desc    Get download history
 * @route   GET /api/downloads
 * @access  Private
 */
export const getDownloads = async (req, res) => {
    try {
        const downloads = await Download.find({ user: req.user.id })
            .populate('video', 'title thumbnailUrl duration')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: downloads
        });
    } catch (error) {
        console.error('Get downloads error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching downloads'
        });
    }
};

/**
 * @desc    Check download eligibility
 * @route   GET /api/downloads/check
 * @access  Private
 */
export const checkDownloadEligibility = async (req, res) => {
    try {
        const canDownload = req.user.canDownload();

        res.status(200).json({
            success: true,
            data: {
                canDownload,
                dailyDownloadCount: req.user.dailyDownloadCount,
                subscriptionPlan: req.user.subscriptionPlan,
                isPremium: ['Bronze', 'Silver', 'Gold'].includes(req.user.subscriptionPlan)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking download eligibility'
        });
    }
};
