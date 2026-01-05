import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    watchedAt: {
        type: Date,
        default: Date.now
    },
    watchDuration: {
        type: Number, // in seconds
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate entries and improve query performance
historySchema.index({ user: 1, video: 1 });
historySchema.index({ user: 1, watchedAt: -1 });

const History = mongoose.model('History', historySchema);

export default History;
