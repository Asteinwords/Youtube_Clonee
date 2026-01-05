import express from 'express';
import {
    downloadVideo,
    getDownloads,
    checkDownloadEligibility
} from '../controllers/downloadController.js';
import { protect } from '../middleware/auth.js';
import { checkDownloadLimit } from '../middleware/subscriptionCheck.js';

const router = express.Router();

router.get('/', protect, getDownloads);
router.get('/check', protect, checkDownloadEligibility);
router.post('/:videoId', protect, checkDownloadLimit, downloadVideo);

export default router;
