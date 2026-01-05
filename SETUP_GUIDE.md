# YouTube Clone - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check
- ✅ Node.js v18+ installed
- ✅ MongoDB running (local or Atlas)
- ✅ Git installed

### Step 1: Install Dependencies (2 minutes)

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### Step 2: Environment Setup (1 minute)

**Backend (.env):**
```bash
cd server
cp .env.example .env
# Edit .env with your API keys
```

**Minimum required for testing:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Any random string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `FRONTEND_URL=http://localhost:5173`

**Frontend (.env):**
```bash
cd client
cp .env.example .env
# Default values work for local development
```

### Step 3: Run the Application (1 minute)

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

### Step 4: Access the App (30 seconds)

Open browser to: **http://localhost:5173**

---

## 📝 API Keys Setup Guide

### 1. Google OAuth 2.0 (Required for Login)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `https://nullclass-api.onrender.com/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### 2. MongoDB (Required)

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Start MongoDB
mongod

# Use in .env:
MONGODB_URI=mongodb://localhost:27017/youtube-clone
```

**Option B: MongoDB Atlas (Free)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to `.env`

### 3. Cloudinary (Required for Video Upload)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Get Cloud Name, API Key, API Secret from dashboard
4. Add to `.env`

### 4. Razorpay (Required for Payments)

1. Go to [Razorpay](https://razorpay.com/)
2. Sign up and get test API keys
3. Add Key ID and Secret to `.env`

### 5. Email Service (Required for OTP)

**Using Gmail:**
1. Enable 2-factor authentication on Gmail
2. Generate App Password: [Google Account](https://myaccount.google.com/apppasswords)
3. Add to `.env`:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 6. Twilio (Required for SMS OTP)

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for free trial
3. Get Account SID, Auth Token, and Phone Number
4. Add to `.env`

### 7. Google Translate API (Required for Comment Translation)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Cloud Translation API"
3. Create API key
4. Add to `.env`

---

## 🧪 Testing Without Full Setup

You can test basic functionality without all API keys:

**Minimum Setup (Backend only):**
```env
MONGODB_URI=mongodb://localhost:27017/youtube-clone
JWT_SECRET=test_secret_key_12345
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=test_session_secret
```

**What works:**
- ✅ Server starts
- ✅ Database connection
- ✅ API endpoints accessible

**What doesn't work:**
- ❌ Google OAuth login
- ❌ Video upload
- ❌ Payments
- ❌ Email/SMS OTP
- ❌ Comment translation

---

## 🐛 Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Issue: "Port 5000 already in use"
**Solution:** Change port in `.env`
```env
PORT=5001
```

### Issue: "Google OAuth error"
**Solution:** 
1. Check redirect URI in Google Console matches exactly
2. Make sure OAuth consent screen is configured
3. Add test users if in development mode

### Issue: "Cloudinary upload failed"
**Solution:**
1. Verify API keys are correct
2. Check file size (max 500MB)
3. Ensure uploads folder exists

### Issue: "Cannot find module"
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Create a Channel** - Required before uploading videos
2. **Upload a Video** - Test video upload and streaming
3. **Test Comments** - Try translation feature
4. **Test Payments** - Use Razorpay test mode
5. **Test Gestures** - Try custom video player controls

---

## 🔗 Useful Links

- [Backend API Documentation](./implementation_plan.md)
- [Feature Walkthrough](./walkthrough.md)
- [Full README](./README.md)

---

## 💡 Pro Tips

1. **Use MongoDB Compass** - Visual tool for viewing database
2. **Use Postman** - Test API endpoints directly
3. **Check Browser Console** - For frontend errors
4. **Check Terminal** - For backend errors
5. **Use React DevTools** - Debug React components

---

## 🆘 Need Help?

1. Check the [walkthrough.md](./walkthrough.md) for detailed feature explanations
2. Review [implementation_plan.md](./implementation_plan.md) for architecture details
3. Check console logs for error messages
4. Verify all environment variables are set correctly

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Node.js v18+ installed
- [ ] MongoDB running
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` files created in both client and server
- [ ] Required API keys added to `.env`
- [ ] Both backend and frontend servers running
- [ ] No port conflicts
- [ ] Browser console shows no errors

---

Happy coding! 🎉
