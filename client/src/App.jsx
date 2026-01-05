import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import HomePage from './pages/HomePage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import VideoPage from './pages/VideoPage';
import UploadVideoPage from './pages/UploadVideoPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import HistoryPage from './pages/HistoryPage';
import WatchLaterPage from './pages/WatchLaterPage';
import LikedVideosPage from './pages/LikedVideosPage';
import DownloadsPage from './pages/DownloadsPage';
import ChannelPage from './pages/ChannelPage';
import VoIPPage from './pages/VoIPPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Router>
            <div className="min-h-screen transition-colors duration-300">
              <Toaster position="top-right" />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verify-otp" element={<VerifyOTPPage />} />
                <Route path="/video/:id" element={<VideoPage />} />
                <Route path="/upload" element={<UploadVideoPage />} />
                <Route path="/plans" element={<SubscriptionPlansPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/watch-later" element={<WatchLaterPage />} />
                <Route path="/liked" element={<LikedVideosPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/channel" element={<ChannelPage />} />
                <Route path="/call" element={<VoIPPage />} />
                <Route path="/call/:roomId" element={<VoIPPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
