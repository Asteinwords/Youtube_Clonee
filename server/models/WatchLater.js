import mongoose from 'mongoose';

const watchLaterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate entries
watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });

const WatchLater = mongoose.model('WatchLater', watchLaterSchema);

export default WatchLater;
