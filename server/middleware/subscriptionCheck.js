/**
 * Middleware to check subscription plan and watch time limits
 */
export const checkWatchTimeLimit = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user can watch more
        if (!user.canWatch()) {
            const limit = user.getWatchTimeLimit();
            const limitMinutes = Math.floor(limit / 60);

            return res.status(403).json({
                success: false,
                message: `Daily watch time limit reached (${limitMinutes} minutes for ${user.subscriptionPlan} plan)`,
                upgradeRequired: true,
                currentPlan: user.subscriptionPlan,
                watchTimeToday: user.watchTimeToday,
                limit: limit
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking watch time limit'
        });
    }
};

/**
 * Middleware to check download eligibility
 */
export const checkDownloadLimit = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user can download
        if (!user.canDownload()) {
            return res.status(403).json({
                success: false,
                message: 'Daily download limit reached (1 video per day for Free plan)',
                upgradeRequired: true,
                currentPlan: user.subscriptionPlan,
                dailyDownloadCount: user.dailyDownloadCount
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking download limit'
        });
    }
};

/**
 * Middleware to check if user has premium subscription
 */
export const requirePremium = (req, res, next) => {
    const user = req.user;

    if (!['Bronze', 'Silver', 'Gold'].includes(user.subscriptionPlan)) {
        return res.status(403).json({
            success: false,
            message: 'Premium subscription required',
            upgradeRequired: true,
            currentPlan: user.subscriptionPlan
        });
    }

    next();
};
