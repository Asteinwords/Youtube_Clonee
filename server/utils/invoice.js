import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate invoice PDF
 * @param {Object} invoiceData - Invoice details
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generateInvoicePDF = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            // Collect PDF chunks
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc
                .fontSize(20)
                .fillColor('#667eea')
                .text('YouTube Clone', 50, 50)
                .fontSize(10)
                .fillColor('#666')
                .text('Premium Subscription Invoice', 50, 75);

            // Invoice details
            doc
                .fontSize(12)
                .fillColor('#333')
                .text(`Invoice Number: ${invoiceData.invoiceNumber}`, 50, 120)
                .text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, 50, 140);

            // Customer details
            doc
                .fontSize(14)
                .fillColor('#667eea')
                .text('Bill To:', 50, 180)
                .fontSize(12)
                .fillColor('#333')
                .text(invoiceData.customerName, 50, 200)
                .text(invoiceData.customerEmail, 50, 220);

            // Line
            doc
                .strokeColor('#eee')
                .lineWidth(1)
                .moveTo(50, 260)
                .lineTo(550, 260)
                .stroke();

            // Table header
            doc
                .fontSize(12)
                .fillColor('#667eea')
                .text('Description', 50, 280)
                .text('Amount', 450, 280);

            // Line
            doc
                .strokeColor('#eee')
                .moveTo(50, 300)
                .lineTo(550, 300)
                .stroke();

            // Items
            const planDetails = {
                'Bronze': { duration: '1 Month', watchTime: '7 minutes/day' },
                'Silver': { duration: '1 Month', watchTime: '10 minutes/day' },
                'Gold': { duration: '1 Month', watchTime: 'Unlimited' }
            };

            const plan = planDetails[invoiceData.plan] || planDetails['Bronze'];

            doc
                .fontSize(11)
                .fillColor('#333')
                .text(`${invoiceData.plan} Plan Subscription`, 50, 320)
                .fontSize(9)
                .fillColor('#666')
                .text(`Duration: ${plan.duration}`, 50, 340)
                .text(`Watch Time: ${plan.watchTime}`, 50, 355)
                .text(`Unlimited Downloads`, 50, 370);

            doc
                .fontSize(11)
                .fillColor('#333')
                .text(`₹${invoiceData.amount}`, 450, 320);

            // Line
            doc
                .strokeColor('#eee')
                .moveTo(50, 400)
                .lineTo(550, 400)
                .stroke();

            // Total
            doc
                .fontSize(14)
                .fillColor('#667eea')
                .text('Total Amount:', 350, 420)
                .fontSize(16)
                .text(`₹${invoiceData.amount}`, 450, 420);

            // Payment details
            doc
                .fontSize(10)
                .fillColor('#666')
                .text('Payment Details:', 50, 480)
                .text(`Payment ID: ${invoiceData.paymentId}`, 50, 500)
                .text(`Payment Method: Razorpay`, 50, 520)
                .text(`Status: Success`, 50, 540);

            // Footer
            doc
                .fontSize(9)
                .fillColor('#999')
                .text('Thank you for your subscription!', 50, 700, { align: 'center' })
                .text('For support, contact: support@youtubeclone.com', 50, 715, { align: 'center' });

            // Finalize PDF
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export default generateInvoicePDF;
