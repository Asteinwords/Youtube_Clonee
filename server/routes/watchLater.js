import express from 'express';
import {
    addToWatchLater,
    getWatchLater,
    removeFromWatchLater
} from '../controllers/watchLaterController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWatchLater);
router.post('/:videoId', protect, addToWatchLater);
router.delete('/:videoId', protect, removeFromWatchLater);

export default router;
