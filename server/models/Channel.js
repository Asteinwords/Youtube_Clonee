import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    bannerUrl: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1/default-banner.png'
    },
    avatarUrl: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    subscribers: {
        type: Number,
        default: 0
    },
    totalViews: {
        type: Number,
        default: 0
    },
    cloudinaryBannerId: String,
    cloudinaryAvatarId: String
}, {
    timestamps: true
});

// Method to increment subscribers
channelSchema.methods.incrementSubscribers = async function () {
    this.subscribers += 1;
    await this.save();
};

// Method to decrement subscribers
channelSchema.methods.decrementSubscribers = async function () {
    if (this.subscribers > 0) {
        this.subscribers -= 1;
        await this.save();
    }
};

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
