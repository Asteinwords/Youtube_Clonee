import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        default: 'General'
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cloudinaryVideoId: {
        type: String,
        required: true
    },
    cloudinaryThumbnailId: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search functionality
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Method to increment views
videoSchema.methods.incrementViews = async function () {
    this.views += 1;
    await this.save();
};

const Video = mongoose.model('Video', videoSchema);

export default Video;
