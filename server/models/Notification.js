import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['upload', 'comment', 'like', 'subscribe', 'reply'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedVideo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    relatedChannel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    thumbnail: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
