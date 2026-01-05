import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Initialize Socket.io client
let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }
    return socket;
};

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    googleLogin: () => `${API_URL.replace('/api', '')}/api/auth/google`,
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    updatePhone: (data) => api.put('/auth/phone', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

// Video APIs
export const videoAPI = {
    getVideos: (params) => api.get('/videos', { params }),
    getVideo: (id) => api.get(`/videos/${id}`),
    uploadVideo: (formData, onProgress) => api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
    }),
    updateVideo: (id, data) => api.put(`/videos/${id}`, data),
    deleteVideo: (id) => api.delete(`/videos/${id}`),
    incrementViews: (id, watchDuration) => api.put(`/videos/${id}/view`, { watchDuration }),
    getRecommended: (id) => api.get(`/videos/${id}/recommended`)
};

// Channel APIs
export const channelAPI = {
    createChannel: (data) => api.post('/channels', data),
    getChannel: (id) => api.get(`/channels/${id}`),
    getMyChannel: () => api.get('/channels/my/channel'),
    updateChannel: (id, data) => api.put(`/channels/${id}`, data),
    uploadBanner: (id, formData) => api.put(`/channels/${id}/banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    toggleSubscription: (id) => api.post(`/channels/${id}/subscribe`),
    getChannelVideos: (id, params) => api.get(`/channels/${id}/videos`, { params }),
    getMySubscriptions: () => api.get('/channels/subscriptions')
};

// Comment APIs
export const commentAPI = {
    getComments: (videoId, params) => api.get(`/comments/${videoId}`, { params }),
    createComment: (data) => api.post('/comments', data),
    updateComment: (id, data) => api.put(`/comments/${id}`, data),
    deleteComment: (id) => api.delete(`/comments/${id}`),
    likeComment: (id, likeType) => api.post(`/comments/${id}/like`, { likeType }),
    translateComment: (id, targetLanguage) => api.post(`/comments/${id}/translate`, { targetLanguage })
};

// Search API
export const searchAPI = {
    search: (params) => api.get('/search', { params })
};

// History APIs
export const historyAPI = {
    getHistory: (params) => api.get('/history', { params }),
    clearHistory: () => api.delete('/history')
};

// Watch Later APIs
export const watchLaterAPI = {
    getWatchLater: () => api.get('/watchlater'),
    addToWatchLater: (videoId) => api.post(`/watchlater/${videoId}`),
    removeFromWatchLater: (videoId) => api.delete(`/watchlater/${videoId}`)
};

// Like APIs
export const likeAPI = {
    likeVideo: (videoId, likeType) => api.post(`/likes/video/${videoId}`, { likeType }),
    getLikedVideos: () => api.get('/likes/videos')
};

// Download APIs
export const downloadAPI = {
    downloadVideo: (videoId) => api.post(`/downloads/${videoId}`),
    getDownloads: () => api.get('/downloads'),
    checkEligibility: () => api.get('/downloads/check')
};

// Payment APIs
export const paymentAPI = {
    createOrder: (plan) => api.post('/payments/create-order', { plan }),
    verifyPayment: (data) => api.post('/payments/verify', data),
    getPaymentHistory: () => api.get('/payments/history')
};

// Theme API
export const themeAPI = {
    getTheme: () => api.get('/theme')
};

// Notification APIs
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// User APIs
export const userAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data)
};

export default api;
