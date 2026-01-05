import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send OTP email (100% FREE using Gmail)
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User name
 * @returns {Promise<Object>} - Email send result
 */
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP for YouTube Clone Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 YouTube Clone</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
              <div class="otp-box">${otp}</div>
              <p>This OTP will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 YouTube Clone. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send OTP via Email (FREE alternative to SMS)
 * This replaces Twilio SMS with email OTP
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User name
 * @returns {Promise<Object>} - Email send result
 */
export const sendOTPViaSMS = async (email, otp, name) => {
  // Using email as FREE alternative to SMS
  return sendOTPEmail(email, otp, name);
};

/**
 * Send invoice email with PDF attachment (100% FREE)
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {Object} invoiceData - Invoice details
 * @param {Buffer} pdfBuffer - PDF invoice buffer
 * @returns {Promise<Object>} - Email send result
 */
export const sendInvoiceEmail = async (email, name, invoiceData, pdfBuffer) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Payment Successful - Invoice ${invoiceData.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .details table { width: 100%; }
            .details td { padding: 10px; border-bottom: 1px solid #eee; }
            .details td:first-child { font-weight: bold; width: 40%; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 YouTube Clone</h1>
              <p>Payment Confirmation</p>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Hello ${name}!</h2>
              <p>Your payment has been successfully processed. Thank you for upgrading to <strong>${invoiceData.plan}</strong> plan!</p>
              
              <div class="details">
                <table>
                  <tr>
                    <td>Invoice Number:</td>
                    <td>${invoiceData.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td>Plan:</td>
                    <td>${invoiceData.plan}</td>
                  </tr>
                  <tr>
                    <td>Amount:</td>
                    <td>₹${invoiceData.amount}</td>
                  </tr>
                  <tr>
                    <td>Payment ID:</td>
                    <td>${invoiceData.paymentId}</td>
                  </tr>
                  <tr>
                    <td>Date:</td>
                    <td>${new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
              
              <p>Your invoice is attached to this email. Please keep it for your records.</p>
              <p>Enjoy your enhanced viewing experience!</p>
            </div>
            <div class="footer">
              <p>© 2024 YouTube Clone. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Invoice email send error:', error);
    throw new Error('Failed to send invoice email');
  }
};

export default transporter;
