import Notification from '../models/Notification.js';

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const notifications = await Notification.find({ user: req.user.id })
            .populate('relatedVideo', 'title thumbnailUrl')
            .populate('relatedChannel', 'name avatarUrl')
            .populate('relatedUser', 'name avatar')
            .sort({ isRead: 1, createdAt: -1 }) // Unread first, then by date
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read'
        });
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read'
        });
    }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    }
};

/**
 * Helper function to create a notification
 */
export const createNotification = async ({ userId, type, message, relatedVideo, relatedChannel, relatedUser, thumbnail }) => {
    try {
        await Notification.create({
            user: userId,
            type,
            message,
            relatedVideo,
            relatedChannel,
            relatedUser,
            thumbnail
        });
    } catch (error) {
        console.error('Create notification error:', error);
    }
};
