import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'success', 'failed'],
        default: 'created'
    },
    plan: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold'],
        required: true
    },
    invoiceUrl: {
        type: String,
        default: null
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate invoice number
paymentSchema.pre('save', async function (next) {
    if (this.isNew && !this.invoiceNumber) {
        const count = await mongoose.model('Payment').countDocuments();
        this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
    }
    next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
