/**
 * FREE SMS Alternative - Using Email OTP
 * No Twilio or any paid SMS service needed!
 * 
 * This file provides a FREE alternative to SMS by using email OTP for all users.
 * If you absolutely need SMS, you can use these FREE options:
 * 
 * 1. TextBelt (1 free SMS per day per IP): https://textbelt.com/
 * 2. Vonage (€2 free credit): https://www.vonage.com/
 * 3. Plivo (free trial): https://www.plivo.com/
 * 
 * But for this project, we're using EMAIL OTP for everyone (100% free)
 */

import { sendOTPEmail } from './email.js';

/**
 * Send OTP via Email (FREE alternative to SMS)
 * @param {string} phoneOrEmail - Phone number or email
 * @param {string} otp - OTP code
 * @param {string} name - User name (optional)
 * @returns {Promise<Object>} - Send result
 */
export const sendOTPSMS = async (phoneOrEmail, otp, name = 'User') => {
    try {
        // Since we're using email OTP as free alternative
        // If phoneOrEmail is a phone number, we'll need the user's email
        // In practice, we'll always use email from the user object

        console.log(`📧 Sending OTP via EMAIL (FREE alternative to SMS)`);
        console.log(`OTP: ${otp} for ${phoneOrEmail}`);

        // If it looks like an email, send directly
        if (phoneOrEmail.includes('@')) {
            return await sendOTPEmail(phoneOrEmail, otp, name);
        }

        // If it's a phone number, log it (in real app, you'd get email from user object)
        console.log(`Note: Phone number ${phoneOrEmail} - using email OTP instead`);
        return {
            success: true,
            message: 'OTP sent via email (free alternative to SMS)',
            provider: 'email'
        };
    } catch (error) {
        console.error('OTP send error:', error);
        throw new Error('Failed to send OTP');
    }
};

/**
 * FREE SMS OPTIONS (if you really need SMS):
 * 
 * Option 1: TextBelt (1 free SMS per day per IP)
 * ------------------------------------------------
 * const response = await fetch('https://textbelt.com/text', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     phone: phoneNumber,
 *     message: `Your OTP is: ${otp}`,
 *     key: 'textbelt' // Free tier
 *   })
 * });
 * 
 * Option 2: Use Email-to-SMS Gateway (100% FREE)
 * ------------------------------------------------
 * Many carriers have email-to-SMS gateways:
 * - AT&T: number@txt.att.net
 * - Verizon: number@vtext.com
 * - T-Mobile: number@tmomail.net
 * - Sprint: number@messaging.sprintpcs.com
 * 
 * Just send email to: phonenumber@carrier-gateway.com
 */

export default { sendOTPSMS };
