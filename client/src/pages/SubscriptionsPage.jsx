import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { channelAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiUser, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SubscriptionsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        fetchSubscriptions();
    }, [isAuthenticated, navigate]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await channelAPI.getMySubscriptions();
            setSubscriptions(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleChannelClick = (channelId) => {
        // For now, navigate to home. In the future, this could navigate to a channel page
        navigate(`/`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className="flex-1 p-6 ml-0 lg:ml-64 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <FiUser className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-4" />
                                <h2 className="text-2xl font-semibold mb-2">No subscriptions yet</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Subscribe to channels to see their latest content here
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                >
                                    Explore Videos
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {subscriptions.map((channel) => (
                                    <div
                                        key={channel._id}
                                        onClick={() => handleChannelClick(channel._id)}
                                        className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                    >
                                        {/* Channel Banner */}
                                        <div className="relative h-32 bg-gradient-to-r from-red-500 to-red-700">
                                            {channel.bannerUrl && (
                                                <img
                                                    src={channel.bannerUrl}
                                                    alt={channel.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        {/* Channel Info */}
                                        <div className="p-4 -mt-12 relative">
                                            {/* Avatar */}
                                            <div className="mb-3">
                                                {channel.avatarUrl ? (
                                                    <img
                                                        src={channel.avatarUrl}
                                                        alt={channel.name}
                                                        className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1a1a] bg-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                                        {channel.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Channel Name */}
                                            <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-red-600 transition-colors">
                                                {channel.name}
                                            </h3>

                                            {/* Subscribers Count */}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {channel.subscribers?.toLocaleString() || 0} subscribers
                                            </p>

                                            {/* Description */}
                                            {channel.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {channel.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
