import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { downloadAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { FiDownload, FiClock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DownloadsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isOpen } = useSidebar();
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadLimit, setDownloadLimit] = useState(null);

    useEffect(() => {
        fetchDownloads();
        checkDownloadLimit();
    }, []);

    const fetchDownloads = async () => {
        try {
            const response = await downloadAPI.getDownloads();
            setDownloads(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load downloads');
        } finally {
            setLoading(false);
        }
    };

    const checkDownloadLimit = async () => {
        try {
            const response = await downloadAPI.checkEligibility();
            setDownloadLimit(response.data.data);
        } catch (error) {
            console.error('Failed to check download limit');
        }
    };

    const handleDownload = async (videoId) => {
        try {
            const response = await downloadAPI.downloadVideo(videoId);
            const { downloadUrl } = response.data.data;

            // Trigger download
            window.open(downloadUrl, '_blank');
            toast.success('Download started!');

            // Refresh downloads list
            fetchDownloads();
            checkDownloadLimit();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Download failed');
        }
    };

    const getPlanLimits = () => {
        const limits = {
            Free: '1 download per day',
            Bronze: 'Unlimited downloads',
            Silver: 'Unlimited downloads',
            Gold: 'Unlimited downloads'
        };
        return limits[user?.subscriptionPlan || 'Free'];
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center space-x-3 mb-8">
                                <FiDownload className="w-8 h-8" />
                                <h1 className="text-3xl font-bold">Downloads</h1>
                            </div>

                            {/* Download Limit Info */}
                            <div className={`mb-8 p-4 rounded-lg flex items-start space-x-3 ${downloadLimit?.canDownload
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'bg-orange-50 dark:bg-orange-900/20'
                                }`}>
                                <FiAlertCircle className={`w-5 h-5 mt-0.5 ${downloadLimit?.canDownload
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-orange-600 dark:text-orange-400'
                                    }`} />
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">Your Download Limit</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Current Plan: <span className="font-bold capitalize">{user?.subscriptionPlan || 'Free'}</span>
                                        {' - '}
                                        {getPlanLimits()}
                                    </p>
                                    {downloadLimit && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {downloadLimit.canDownload
                                                ? `You have ${downloadLimit.isPremium ? 'unlimited' : (1 - downloadLimit.dailyDownloadCount)} download(s) remaining today`
                                                : 'Download limit reached for today'}
                                        </p>
                                    )}
                                </div>
                                {downloadLimit && !downloadLimit.canDownload && !downloadLimit.isPremium && (
                                    <button
                                        onClick={() => navigate('/plans')}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 font-semibold whitespace-nowrap"
                                    >
                                        <span>Upgrade Now</span>
                                        <FiArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            <div className="w-32 h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : downloads.length === 0 ? (
                                <div className="text-center py-16">
                                    <FiDownload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Downloaded videos will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {downloads.map((download) => (
                                        <div key={download._id} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-shadow">
                                            <img
                                                src={download.video?.thumbnailUrl || '/placeholder.jpg'}
                                                alt={download.video?.title}
                                                className="w-32 h-20 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">{download.video?.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Downloaded: {new Date(download.createdAt).toLocaleDateString()}
                                                </p>
                                                {download.expiresAt && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-1">
                                                        <FiClock className="w-3 h-3 mr-1" />
                                                        Expires: {new Date(download.expiresAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <a
                                                href={download.downloadUrl}
                                                download
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                            >
                                                <FiDownload className="w-4 h-4" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DownloadsPage;
