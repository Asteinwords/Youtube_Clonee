import React, { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiCheck } from 'react-icons/fi';
import { channelAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SubscribeButton = ({
    channelId,
    channelName,
    initialSubscribed = false,
    initialSubscriberCount = 0,
    onSubscriptionChange,
    size = 'medium', // 'small', 'medium', 'large'
    showCount = false
}) => {
    const { isAuthenticated } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
    const [subscriberCount, setSubscriberCount] = useState(initialSubscriberCount);
    const [loading, setLoading] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [notificationPreference, setNotificationPreference] = useState('all'); // 'all', 'personalized', 'none'

    // Sync state with props when they change
    useEffect(() => {
        setIsSubscribed(initialSubscribed);
        setSubscriberCount(initialSubscriberCount);
    }, [initialSubscribed, initialSubscriberCount]);

    const handleSubscribe = async (e) => {
        e.stopPropagation(); // Prevent navigation if button is in a clickable card

        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe');
            return;
        }

        setLoading(true);
        try {
            const response = await channelAPI.toggleSubscription(channelId);
            const newSubscribedState = response.data.isSubscribed;
            const newCount = response.data.subscribers;

            setIsSubscribed(newSubscribedState);
            setSubscriberCount(newCount);

            if (onSubscriptionChange) {
                onSubscriptionChange(newSubscribedState, newCount);
            }

            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update subscription');
        } finally {
            setLoading(false);
        }
    };

    const toggleNotificationMenu = (e) => {
        e.stopPropagation();
        setShowNotificationMenu(!showNotificationMenu);
    };

    const handleNotificationChange = (preference, e) => {
        e.stopPropagation();
        setNotificationPreference(preference);
        setShowNotificationMenu(false);

        const messages = {
            all: 'You\'ll get all notifications from this channel',
            personalized: 'You\'ll get personalized notifications',
            none: 'You won\'t get notifications from this channel'
        };
        toast.success(messages[preference]);
    };

    const formatSubscribers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
        return count;
    };

    // Size classes
    const sizeClasses = {
        small: {
            button: 'px-3 py-1.5 text-xs',
            icon: 'w-3.5 h-3.5',
            bell: 'p-1.5'
        },
        medium: {
            button: 'px-4 py-2 text-sm',
            icon: 'w-4 h-4',
            bell: 'p-2'
        },
        large: {
            button: 'px-5 py-2.5 text-base',
            icon: 'w-5 h-5',
            bell: 'p-2.5'
        }
    };

    const currentSize = sizeClasses[size];

    if (!isSubscribed) {
        // Not subscribed - Show subscribe button
        return (
            <button
                onClick={handleSubscribe}
                disabled={loading}
                className={`${currentSize.button} bg-black dark:bg-white text-white dark:text-black rounded-full font-medium transition-all hover:bg-[#272727] dark:hover:bg-[#f2f2f2] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
                {loading ? (
                    <>
                        <div className={`${currentSize.icon} border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin`}></div>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        <span>Subscribe</span>
                        {showCount && subscriberCount > 0 && (
                            <span className="opacity-75">• {formatSubscribers(subscriberCount)}</span>
                        )}
                    </>
                )}
            </button>
        );
    }

    // Subscribed - Show subscribed button with bell icon
    return (
        <div className="flex items-center space-x-2 relative">
            <button
                onClick={handleSubscribe}
                disabled={loading}
                className={`${currentSize.button} bg-[#f2f2f2] dark:bg-[#272727] rounded-full font-medium transition-all hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 group`}
            >
                {loading ? (
                    <>
                        <div className={`${currentSize.icon} border-2 border-gray-600 border-t-transparent rounded-full animate-spin`}></div>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        <FiCheck className={currentSize.icon} />
                        <span className="group-hover:hidden">Subscribed</span>
                        <span className="hidden group-hover:inline">Unsubscribe</span>
                        {showCount && subscriberCount > 0 && (
                            <span className="opacity-75">• {formatSubscribers(subscriberCount)}</span>
                        )}
                    </>
                )}
            </button>

            {/* Bell Icon for Notifications */}
            <div className="relative">
                <button
                    onClick={toggleNotificationMenu}
                    className={`${currentSize.bell} bg-[#f2f2f2] dark:bg-[#272727] rounded-full transition-all hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f]`}
                    title="Notification preferences"
                >
                    {notificationPreference === 'none' ? (
                        <FiBellOff className={currentSize.icon} />
                    ) : (
                        <FiBell className={currentSize.icon} />
                    )}
                </button>

                {/* Notification Menu Dropdown */}
                {showNotificationMenu && (
                    <>
                        {/* Backdrop to close menu */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotificationMenu(false);
                            }}
                        ></div>

                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#3f3f3f] overflow-hidden z-20">
                            <div className="p-3 border-b border-[#e5e5e5] dark:border-[#3f3f3f]">
                                <h4 className="font-semibold text-sm">Notifications</h4>
                            </div>

                            <button
                                onClick={(e) => handleNotificationChange('all', e)}
                                className={`w-full px-4 py-3 text-left text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors flex items-start space-x-3 ${notificationPreference === 'all' ? 'bg-[#f2f2f2] dark:bg-[#3f3f3f]' : ''
                                    }`}
                            >
                                <FiBell className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">All</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                        Get notified about all new videos
                                    </div>
                                </div>
                                {notificationPreference === 'all' && (
                                    <FiCheck className="w-5 h-5 ml-auto flex-shrink-0" />
                                )}
                            </button>

                            <button
                                onClick={(e) => handleNotificationChange('personalized', e)}
                                className={`w-full px-4 py-3 text-left text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors flex items-start space-x-3 ${notificationPreference === 'personalized' ? 'bg-[#f2f2f2] dark:bg-[#3f3f3f]' : ''
                                    }`}
                            >
                                <FiBell className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">Personalized</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                        Occasional notifications for highlights
                                    </div>
                                </div>
                                {notificationPreference === 'personalized' && (
                                    <FiCheck className="w-5 h-5 ml-auto flex-shrink-0" />
                                )}
                            </button>

                            <button
                                onClick={(e) => handleNotificationChange('none', e)}
                                className={`w-full px-4 py-3 text-left text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors flex items-start space-x-3 ${notificationPreference === 'none' ? 'bg-[#f2f2f2] dark:bg-[#3f3f3f]' : ''
                                    }`}
                            >
                                <FiBellOff className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">None</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                        Don't send any notifications
                                    </div>
                                </div>
                                {notificationPreference === 'none' && (
                                    <FiCheck className="w-5 h-5 ml-auto flex-shrink-0" />
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SubscribeButton;
