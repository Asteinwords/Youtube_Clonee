import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userCity: {
        type: String,
        default: 'Unknown'
    },
    originalLanguage: {
        type: String,
        default: 'en'
    },
    translations: {
        type: Map,
        of: String,
        default: {}
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Middleware to check for auto-delete on 2+ dislikes
commentSchema.pre('save', function (next) {
    if (this.dislikes >= 2 && !this.isDeleted) {
        this.isDeleted = true;
    }
    next();
});

// Method to validate comment (no special characters except basic punctuation)
commentSchema.statics.validateCommentText = function (text) {
    // Allow letters, numbers, spaces, and basic punctuation (.,!?-')
    const validPattern = /^[a-zA-Z0-9\s.,!?'\-\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]+$/;
    return validPattern.test(text);
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
