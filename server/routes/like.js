import express from 'express';
import { likeVideo, getLikedVideos } from '../controllers/likeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/video/:videoId', protect, likeVideo);
router.get('/videos', protect, getLikedVideos);

export default router;
