import User from '../models/User.js';
import { sendTokenResponse } from '../middleware/auth.js';
import { sendOTPEmail } from '../utils/email.js';
import { sendOTPSMS } from '../utils/sms.js';
import { getLocationFromIP, getIPFromRequest } from '../utils/geolocation.js';

/**
 * @desc    Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleCallback = async (req, res) => {
    try {
        // User is attached by Passport
        const user = req.user;

        // Get user's location
        const ip = getIPFromRequest(req);
        const location = await getLocationFromIP(ip);

        // Update user location
        user.location = location;
        await user.save();

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        };
        await user.save();

        // Send OTP based on location
        if (location.isSouthIndia) {
            // Send email OTP for South India
            await sendOTPEmail(user.email, otp, user.name);
        } else {
            // Send SMS OTP for other states
            if (user.phoneNumber) {
                await sendOTPSMS(user.phoneNumber, otp);
            } else {
                // If no phone number, send email as fallback
                await sendOTPEmail(user.email, otp, user.name);
            }
        }

        // Redirect to frontend with temp token
        const tempToken = Buffer.from(JSON.stringify({ userId: user._id })).toString('base64');
        res.redirect(`${process.env.FRONTEND_URL}/verify-otp?token=${tempToken}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        console.log('OTP Verification Request:', { userId, otp });

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP is valid
        if (!user.otp || !user.otp.code) {
            console.log('No OTP found for user:', userId);
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one.'
            });
        }

        if (user.otp.expiresAt < new Date()) {
            console.log('OTP expired for user:', userId);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Convert both to strings and trim for comparison
        const storedOTP = String(user.otp.code).trim();
        const providedOTP = String(otp).trim();

        console.log('OTP Comparison:', { storedOTP, providedOTP, match: storedOTP === providedOTP });

        if (storedOTP !== providedOTP) {
            console.log('Invalid OTP provided');
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Mark user as verified
        user.otpVerified = true;
        user.otp = undefined;
        await user.save();

        console.log('OTP verified successfully for user:', userId);

        // Send token response
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP'
        });
    }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
        await user.save();

        // Send OTP based on location
        if (user.location?.isSouthIndia) {
            await sendOTPEmail(user.email, otp, user.name);
        } else {
            if (user.phoneNumber) {
                await sendOTPSMS(user.phoneNumber, otp);
            } else {
                await sendOTPEmail(user.email, otp, user.name);
            }
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP'
        });
    }
};

/**
 * @desc    Update phone number
 * @route   PUT /api/auth/phone
 * @access  Private
 */
export const updatePhoneNumber = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        req.user.phoneNumber = phoneNumber;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'Phone number updated successfully'
        });
    } catch (error) {
        console.error('Update phone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating phone number'
        });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-otp');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};
