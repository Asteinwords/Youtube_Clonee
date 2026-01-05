import express from 'express';
import { getHistory, clearHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getHistory);
router.delete('/', protect, clearHistory);

export default router;
