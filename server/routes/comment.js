import express from 'express';
import {
    createComment,
    getComments,
    translateComment,
    likeComment,
    updateComment,
    deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:videoId', getComments);
router.post('/:id/translate', translateComment);

// Protected routes
router.post('/', protect, createComment);
router.post('/:id/like', protect, likeComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
