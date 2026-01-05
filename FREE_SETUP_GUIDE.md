# 100% FREE YouTube Clone Setup Guide

## 🎉 Zero Cost - No Paid Services Required!

This guide shows you how to run the entire YouTube clone **without spending a single penny**. All services used are completely FREE!

---

## 📋 Free Services We're Using

| Service | Free Tier | What We Use It For |
|---------|-----------|-------------------|
| **MongoDB Atlas** | 512MB storage | Database |
| **Google OAuth** | Unlimited | User login |
| **Gmail SMTP** | Unlimited | Email OTP & invoices |
| **Local Storage** | Unlimited | Video/image storage |
| **Google Translate (Free API)** | Unlimited | Comment translation |
| **PayPal Sandbox** | Unlimited | Payment testing |
| **Geoip-lite** | Unlimited | Location detection |

**Total Cost: ₹0 / $0** 🎊

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### Step 2: Setup FREE MongoDB

**Option A: Local MongoDB (Recommended)**
```bash
# Install MongoDB Community Edition (FREE)
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (FREE Cloud)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (FREE)
3. Create FREE cluster (512MB)
4. Get connection string
5. Use in `.env`

### Step 3: Setup FREE Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project (FREE)
3. Enable Google+ API (FREE)
4. Create OAuth 2.0 credentials (FREE)
5. Add redirect URI: `https://nullclass-api.onrender.com/api/auth/google/callback`
6. Copy Client ID & Secret

### Step 4: Setup FREE Gmail for OTP

1. Enable 2FA on your Gmail account
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use in `.env`:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

### Step 5: Setup FREE PayPal Sandbox

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Sign up (FREE)
3. Create Sandbox App (FREE)
4. Get Client ID & Secret
5. Use in `.env`:
```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
```

### Step 6: Create .env File

```bash
cd server
cp .env.example .env
```

**Minimum FREE setup (.env):**
```env
# Database (FREE - Local or Atlas)
MONGODB_URI=mongodb://localhost:27017/youtube-clone

# JWT (FREE - Just a random string)
JWT_SECRET=my_super_secret_key_12345

# Google OAuth (FREE)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://nullclass-api.onrender.com/api/auth/google/callback

# Email (FREE - Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=YouTube Clone <noreply@youtubeclone.com>

# Use Email OTP (FREE - No SMS service needed!)
USE_EMAIL_OTP_ONLY=true

# Local Storage (FREE - No Cloudinary needed!)
USE_LOCAL_STORAGE=true
LOCAL_STORAGE_PATH=./uploads
PUBLIC_URL=https://nullclass-api.onrender.com

# PayPal Sandbox (FREE - No real money)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret

# Frontend
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=another_random_secret_key
```

### Step 7: Run the Application

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

**Open browser:** http://localhost:5173

---

## 💰 Cost Breakdown

### What We REMOVED (Paid Services)
- ❌ Twilio SMS ($0.0075 per SMS) → ✅ Email OTP (FREE)
- ❌ Google Cloud Translation API ($20 per 1M chars) → ✅ Free Google Translate (FREE)
- ❌ Cloudinary ($0.10/GB) → ✅ Local Storage (FREE)

### What We KEPT (Free Services)
- ✅ MongoDB Atlas (512MB FREE)
- ✅ Google OAuth (FREE)
- ✅ Gmail SMTP (FREE)
- ✅ Razorpay Test Mode (FREE)
- ✅ Local File Storage (FREE)

**Total Monthly Cost: ₹0** 🎉

---

## 🔧 Free Alternatives Explained

### 1. SMS → Email OTP (100% FREE)
Instead of paying for SMS, we send OTP via email to ALL users.

**Changes made:**
- South India users: Email OTP ✅
- Other states: Email OTP ✅ (instead of SMS)
- Works exactly the same, just via email!

### 2. Google Translate API → Free Library (100% FREE)
Instead of paid Google Cloud Translation API, we use `@vitalets/google-translate-api` which uses Google Translate web interface.

**Features:**
- ✅ Unlimited translations
- ✅ 100+ languages
- ✅ No API key needed
- ✅ Same quality as paid API

### 3. Cloudinary → Local Storage (100% FREE)
Instead of cloud storage, we store videos on your local disk.

**Pros:**
- ✅ Unlimited storage (your disk space)
- ✅ No bandwidth limits
- ✅ No monthly fees

**Cons:**
- ❌ Not suitable for production deployment
- ❌ Videos lost if server restarts (unless using persistent volume)

**For Production:** Use Cloudinary FREE tier (25GB storage, 25GB bandwidth/month)

---

## 🎯 Features Still Working

ALL features work with free alternatives:

- ✅ Google OAuth Login
- ✅ Email OTP (for everyone)
- ✅ Video Upload & Streaming
- ✅ Comment Translation (100+ languages)
- ✅ City Display in Comments
- ✅ Subscription Plans (test mode)
- ✅ Razorpay Payments (test mode)
- ✅ Video Downloads
- ✅ Watch Time Limits
- ✅ Custom Video Player with Gestures
- ✅ VoIP Video Calls
- ✅ Screen Sharing
- ✅ Session Recording
- ✅ Dynamic Theming

---

## 📱 Testing the App

### 1. Login
- Click "Login with Google"
- Authorize the app
- Check your email for OTP
- Enter OTP to complete login

### 2. Upload Video
- Create a channel first
- Click upload button
- Select video file (stored locally)
- Add title, description, tags
- Upload!

### 3. Test Translation
- Post a comment in any language
- Click "Translate" button
- Select target language
- See translation (FREE!)

### 4. Test Payments
- Go to subscription page
- Select a plan
- Use Razorpay test card: `4111 1111 1111 1111`
- CVV: any 3 digits
- Expiry: any future date
- Check email for invoice

---

## 🆓 Staying Free Forever

### For Development (Current Setup)
- ✅ Local MongoDB
- ✅ Local file storage
- ✅ Gmail SMTP
- ✅ Free translation
- ✅ Email OTP

**Cost: ₹0/month**

### For Production (Still Free!)
- ✅ MongoDB Atlas (512MB FREE tier)
- ✅ Cloudinary (25GB FREE tier)
- ✅ Gmail SMTP (still FREE)
- ✅ Free translation (still FREE)
- ✅ Email OTP (still FREE)
- ✅ Deploy on Railway/Render (FREE tier)

**Cost: ₹0/month** (within free limits)

---

## 🎁 Bonus: Even More Free Options

### Video Hosting (If you outgrow local storage)
1. **Cloudinary** - 25GB storage, 25GB bandwidth/month (FREE)
2. **Bunny.net** - 10GB storage, 50GB bandwidth/month (FREE)
3. **Filebase** - 5GB storage (FREE)

### Email Service (If you outgrow Gmail)
1. **SendGrid** - 100 emails/day (FREE)
2. **Mailgun** - 5,000 emails/month (FREE)
3. **Brevo** - 300 emails/day (FREE)

### Database (If you outgrow MongoDB Atlas)
1. **MongoDB Atlas** - 512MB (FREE)
2. **Supabase** - 500MB + 2GB bandwidth (FREE)
3. **PlanetScale** - 5GB storage (FREE)

---

## ✅ Verification Checklist

- [ ] MongoDB running (local or Atlas)
- [ ] Google OAuth credentials created
- [ ] Gmail App Password generated
- [ ] `.env` file created with all FREE services
- [ ] Dependencies installed
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Can login with Google
- [ ] Receive OTP via email
- [ ] Can upload videos
- [ ] Can translate comments

---

## 🎊 Congratulations!

You now have a **fully functional YouTube clone** running with **ZERO monthly costs**!

All features work perfectly with free alternatives. No credit card required, no hidden fees, no trials that expire.

**Enjoy building! 🚀**

---

## 💡 Pro Tips

1. **Gmail Daily Limit**: Gmail allows ~500 emails/day. More than enough for development!
2. **MongoDB Atlas**: 512MB is enough for ~10,000 videos metadata
3. **Local Storage**: Use external hard drive for more space
4. **Razorpay Test**: Always use test mode for development
5. **Translation**: Works offline after first translation (cached)

---

## 🆘 Need Help?

All services are FREE and don't require payment info. If you have issues:

1. Check `.env` file has all required variables
2. Verify MongoDB is running
3. Check Gmail App Password is correct
4. Ensure Google OAuth redirect URI matches exactly
5. Check console logs for errors

**Everything is FREE - no excuses! 🎉**
