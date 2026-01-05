import express from 'express';
import {
    uploadVideo,
    getVideos,
    getVideo,
    incrementViews,
    getRecommendedVideos,
    updateVideo,
    deleteVideo
} from '../controllers/videoController.js';
import { protect, requireOTPVerification } from '../middleware/auth.js';
import { uploadVideoWithThumbnail } from '../middleware/upload.js';
import { checkWatchTimeLimit } from '../middleware/subscriptionCheck.js';

const router = express.Router();

// Public routes
router.get('/', getVideos);
router.get('/:id', getVideo);
router.put('/:id/view', incrementViews);
router.get('/:id/recommended', getRecommendedVideos);

// Protected routes
router.post('/upload', protect, requireOTPVerification, uploadVideoWithThumbnail, uploadVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);

export default router;
