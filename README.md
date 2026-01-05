# YouTube Clone - Full-Stack MERN Application

A production-ready YouTube clone with advanced features including multi-language comment translation, geolocation-based theming, subscription tiers, video downloads, custom gesture-controlled video player, and VoIP video calling.

## 🚀 Features

### Core Features
- ✅ Google OAuth 2.0 Authentication
- ✅ Location-based OTP (Email for South India, SMS for others)
- ✅ Video Upload & Streaming (Cloudinary)
- ✅ Channel Management
- ✅ Comment System with Translation
- ✅ Search Functionality
- ✅ Watch History
- ✅ Watch Later
- ✅ Like/Dislike System

### Advanced Features
- 🌐 **Multi-language Comment Translation** - Comments can be translated to any language
- 📍 **City Display** - User's city shown with each comment
- 🗑️ **Auto-delete Comments** - Comments with 2+ dislikes are automatically removed
- 🎨 **Dynamic Theming** - White theme for South India (10 AM-12 PM), dark theme otherwise
- 💳 **Subscription Plans** - Free (5 min), Bronze ₹10 (7 min), Silver ₹50 (10 min), Gold ₹100 (unlimited)
- ⬇️ **Video Downloads** - 1/day for free, unlimited for premium
- 💰 **Razorpay Payment Integration** - Secure payments with email invoices
- 🎮 **Custom Video Player with Gestures**:
  - Double-tap right: +10s
  - Double-tap left: -10s
  - Single-tap center: pause/play
  - Triple-tap center: next video
  - Triple-tap right: close website
  - Triple-tap left: show comments
- 📞 **VoIP Video Calling** - WebRTC-based video calls with screen sharing
- 🎥 **Session Recording** - Record and save video call sessions locally

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console account (OAuth 2.0)
- Cloudinary account
- Razorpay account
- Email service (Gmail SMTP or similar)
- Twilio account (for SMS)
- Google Translate API key

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd NullClass
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/youtube-clone

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://nullclass-api.onrender.com/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=YouTube Clone <noreply@youtubeclone.com>

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Translate
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_key
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create `.env` file in `client` directory:
```env
VITE_API_URL=https://nullclass-api.onrender.com/api
VITE_SOCKET_URL=https://nullclass-api.onrender.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: https://nullclass-api.onrender.com
- API Health: https://nullclass-api.onrender.com/api/health

## 📁 Project Structure

```
NullClass/
├── server/                 # Backend
│   ├── config/            # Database & Passport config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, upload, error handling
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── socket/           # Socket.io VoIP handler
│   ├── utils/            # Utilities (Cloudinary, email, SMS, etc.)
│   ├── server.js         # Entry point
│   └── package.json
│
└── client/               # Frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # Context providers
    │   ├── pages/        # Page components
    │   ├── utils/        # API, WebRTC, gestures
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # Entry point
    ├── public/
    └── package.json
```

## 🔑 API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos` - Get video feed
- `GET /api/videos/:id` - Get single video
- `POST /api/videos/upload` - Upload video
- `PUT /api/videos/:id/view` - Increment views
- `GET /api/videos/:id/recommended` - Get recommendations

### Comments
- `GET /api/comments/:videoId` - Get comments
- `POST /api/comments` - Create comment
- `POST /api/comments/:id/translate` - Translate comment
- `POST /api/comments/:id/like` - Like/dislike comment

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

### Downloads
- `POST /api/downloads/:videoId` - Download video
- `GET /api/downloads/check` - Check eligibility

### Theme
- `GET /api/theme` - Get theme based on location & time

[See full API documentation in implementation_plan.md]

## 🎯 Key Features Implementation

### 1. Location-based OTP
- South Indian states (TN, KL, KA, AP, TG): Email OTP
- Other states: SMS OTP
- Uses IP geolocation for automatic detection

### 2. Dynamic Theming
- White theme: South India + 10 AM-12 PM
- Dark theme: All other cases
- Automatic theme switching based on user location and time

### 3. Subscription Plans
| Plan | Price | Watch Time | Downloads |
|------|-------|------------|-----------|
| Free | ₹0 | 5 min/day | 1/day |
| Bronze | ₹10 | 7 min/day | Unlimited |
| Silver | ₹50 | 10 min/day | Unlimited |
| Gold | ₹100 | Unlimited | Unlimited |

### 4. Custom Video Player Gestures
- **Double-tap left**: Rewind 10 seconds
- **Double-tap right**: Forward 10 seconds
- **Single-tap center**: Pause/Play
- **Triple-tap center**: Next video
- **Triple-tap left**: Show comments
- **Triple-tap right**: Close website

### 5. Comment Translation
- Automatic language detection
- Translate to any language
- Cached translations for performance
- City display with each comment

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- CORS protection
- Helmet.js security headers
- Rate limiting
- Input validation
- XSS protection
- CSRF protection

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Touch gesture support
- Adaptive layouts

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📦 Building for Production

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd client
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Google Cloud Platform
- Cloudinary
- Razorpay
- MongoDB
- React
- Express.js
- Socket.io

## 📞 Support

For support, email support@youtubeclone.com or open an issue in the repository.

## 🐛 Known Issues

- None at the moment

## 🗺️ Roadmap

- [ ] Mobile apps (React Native)
- [ ] Live streaming
- [ ] Community posts
- [ ] Playlists
- [ ] Notifications
- [ ] Analytics dashboard

---

Made with ❤️ using MERN Stack
# Youtube_Clonee
