import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['Video', 'Comment'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    likeType: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate likes
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
