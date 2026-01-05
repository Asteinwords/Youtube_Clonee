import express from 'express';
import {
    createOrder,
    capturePayment,
    verifyPayment,
    getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/capture', protect, capturePayment);
router.post('/verify', protect, verifyPayment); // For backwards compatibility
router.get('/history', protect, getPaymentHistory);

export default router;
