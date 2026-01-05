import express from 'express';
import {
    createChannel,
    getChannel,
    getMyChannel,
    updateChannel,
    uploadBanner as uploadBannerController,
    toggleSubscription,
    getChannelVideos,
    getMySubscriptions
} from '../controllers/channelController.js';
import { protect } from '../middleware/auth.js';
import { uploadBanner } from '../middleware/upload.js';

const router = express.Router();

// Protected routes (must come before /:id to avoid conflicts)
router.get('/my/channel', protect, getMyChannel);
router.get('/subscriptions', protect, getMySubscriptions);
router.post('/', protect, createChannel);
router.put('/:id', protect, updateChannel);
router.put('/:id/banner', protect, uploadBanner, uploadBannerController);
router.post('/:id/subscribe', protect, toggleSubscription);

// Public routes
router.get('/:id', getChannel);
router.get('/:id/videos', getChannelVideos);

export default router;
