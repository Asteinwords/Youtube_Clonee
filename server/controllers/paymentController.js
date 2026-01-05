import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../utils/invoice.js';
import { sendInvoiceEmail } from '../utils/email.js';

// PayPal environment setup (FREE Sandbox)
const environment = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (process.env.PAYPAL_MODE === 'live') {
        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

// PayPal client
const client = () => {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
};

// Plan prices in USD (PayPal uses USD by default)
const PLAN_PRICES = {
    Bronze: 0.15,  // ~₹10
    Silver: 0.70,  // ~₹50
    Gold: 1.40     // ~₹100
};

/**
 * @desc    Create PayPal order (FREE Sandbox)
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!['Bronze', 'Silver', 'Gold'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        const amount = PLAN_PRICES[plan];

        // Create PayPal order request
        const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount.toFixed(2)
                },
                description: `YouTube Clone ${plan} Plan Subscription`
            }],
            application_context: {
                brand_name: 'YouTube Clone',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
            }
        });

        // Execute request
        const order = await client().execute(request);

        // Create payment record
        await Payment.create({
            user: req.user.id,
            razorpayOrderId: order.result.id, // Reusing field for PayPal order ID
            amount: amount,
            plan,
            status: 'created'
        });

        res.status(200).json({
            success: true,
            data: {
                orderId: order.result.id,
                amount: amount,
                currency: 'USD',
                approvalUrl: order.result.links.find(link => link.rel === 'approve').href
            }
        });
    } catch (error) {
        console.error('Create PayPal order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order'
        });
    }
};

/**
 * @desc    Capture PayPal payment and update subscription
 * @route   POST /api/payments/capture
 * @access  Private
 */
export const capturePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Capture the order
        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await client().execute(request);

        if (capture.result.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }

        // Update payment record
        const payment = await Payment.findOne({ razorpayOrderId: orderId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        payment.razorpayPaymentId = capture.result.purchase_units[0].payments.captures[0].id;
        payment.status = 'success';
        await payment.save();

        // Update user subscription
        const user = await User.findById(req.user.id);
        user.subscriptionPlan = payment.plan;
        user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await user.save();

        // Generate invoice PDF
        const invoiceData = {
            invoiceNumber: payment.invoiceNumber,
            date: new Date(),
            customerName: user.name,
            customerEmail: user.email,
            plan: payment.plan,
            amount: payment.amount,
            paymentId: payment.razorpayPaymentId
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Send invoice email
        await sendInvoiceEmail(user.email, user.name, invoiceData, pdfBuffer);

        res.status(200).json({
            success: true,
            message: 'Payment captured and subscription updated',
            data: {
                plan: user.subscriptionPlan,
                expiresAt: user.subscriptionExpiry,
                invoiceNumber: payment.invoiceNumber
            }
        });
    } catch (error) {
        console.error('Capture PayPal payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error capturing payment'
        });
    }
};

/**
 * @desc    Verify payment (for backwards compatibility)
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
    // Redirect to capture payment
    return capturePayment(req, res);
};

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
export const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history'
        });
    }
};
