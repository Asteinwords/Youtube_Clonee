import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'
    },
    subscriptionPlan: {
        type: String,
        enum: ['Free', 'Bronze', 'Silver', 'Gold'],
        default: 'Free'
    },
    subscriptionExpiry: {
        type: Date,
        default: null
    },
    dailyDownloadCount: {
        type: Number,
        default: 0
    },
    lastDownloadReset: {
        type: Date,
        default: Date.now
    },
    location: {
        country: String,
        state: String,
        city: String,
        ip: String
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    phoneNumber: {
        type: String,
        sparse: true
    },
    watchTimeToday: {
        type: Number,
        default: 0 // in seconds
    },
    lastWatchTimeReset: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to check if user can download
userSchema.methods.canDownload = function () {
    // Reset daily count if it's a new day
    const now = new Date();
    const lastReset = new Date(this.lastDownloadReset);

    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
        this.dailyDownloadCount = 0;
        this.lastDownloadReset = now;
    }

    // Premium users can download unlimited
    if (['Bronze', 'Silver', 'Gold'].includes(this.subscriptionPlan)) {
        return true;
    }

    // Free users: 1 per day
    return this.dailyDownloadCount < 1;
};

// Method to get watch time limit in seconds
userSchema.methods.getWatchTimeLimit = function () {
    const limits = {
        'Free': 5 * 60,      // 5 minutes
        'Bronze': 7 * 60,    // 7 minutes
        'Silver': 10 * 60,   // 10 minutes
        'Gold': Infinity     // Unlimited
    };
    return limits[this.subscriptionPlan] || limits['Free'];
};

// Method to check if user can watch more
userSchema.methods.canWatch = function () {
    // Reset daily watch time if it's a new day
    const now = new Date();
    const lastReset = new Date(this.lastWatchTimeReset);

    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
        this.watchTimeToday = 0;
        this.lastWatchTimeReset = now;
    }

    return this.watchTimeToday < this.getWatchTimeLimit();
};

const User = mongoose.model('User', userSchema);

export default User;
