import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
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
    downloadUrl: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
}, {
    timestamps: true
});

// Index for cleanup of expired downloads
downloadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Download = mongoose.model('Download', downloadSchema);

export default Download;
