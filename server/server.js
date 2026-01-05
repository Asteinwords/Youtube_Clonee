import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import passport from './config/passport.js';
import errorHandler from './middleware/errorHandler.js';
import { setupVoIPSocket } from './socket/voip.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import videoRoutes from './routes/video.js';
import channelRoutes from './routes/channel.js';
import commentRoutes from './routes/comment.js';
import searchRoutes from './routes/search.js';
import historyRoutes from './routes/history.js';
import watchLaterRoutes from './routes/watchLater.js';
import likeRoutes from './routes/like.js';
import downloadRoutes from './routes/download.js';
import paymentRoutes from './routes/payment.js';
import themeRoutes from './routes/theme.js';
import notificationRoutes from './routes/notification.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io for VoIP
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'https://nullclass-client.onrender.com',
        credentials: true
    }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://nullclass-client.onrender.com',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'youtube-clone-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Setup VoIP Socket.io handlers
setupVoIPSocket(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/watchlater', watchLaterRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'YouTube Clone API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Socket.io server ready for VoIP connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    httpServer.close(() => process.exit(1));
});
