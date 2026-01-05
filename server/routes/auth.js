import express from 'express';
import passport from 'passport';
import {
    googleCallback,
    verifyOTP,
    resendOTP,
    updatePhoneNumber,
    logout,
    getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleCallback
);

// OTP routes
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.put('/phone', protect, updatePhoneNumber);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
