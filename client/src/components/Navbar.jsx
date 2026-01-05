import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { searchAPI, notificationAPI } from '../utils/api';
import {
    FiMenu, FiSearch, FiVideo, FiUser, FiLogOut, FiUpload, FiBell, FiMic, FiX,
    FiSettings, FiHelpCircle, FiMonitor, FiGlobe, FiMapPin, FiMessageSquare
} from 'react-icons/fi';
import { MdSwitchAccount, MdOutlineVideoLibrary, MdKeyboard } from 'react-icons/md';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, login, logout } = useAuth();
    const { theme, location } = useTheme();
    const { toggleSidebar } = useSidebar();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);

    // Fetch notifications
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getNotifications({ limit: 10 });
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setIsSearchFocused(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                try {
                    const response = await searchAPI.search({ q: searchQuery, limit: 10 });
                    setSearchSuggestions(response.data.data || []);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Search suggestions failed:', error);
                }
            } else {
                setSearchSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowSuggestions(false);
            setSearchQuery('');
            setIsSearchFocused(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/video/${suggestion._id}`);
        setShowSuggestions(false);
        setSearchQuery('');
        setIsSearchFocused(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0f0f0f] h-14 flex items-center px-2 sm:px-4 border-b border-transparent overflow-x-hidden max-w-full">
            <div className="flex items-center justify-between w-full max-w-full">
                {/* Left: Menu + Logo */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <FiVideo className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                        <span className="text-lg sm:text-xl font-medium tracking-tight hidden xs:inline">YouTube</span>
                        <span className="text-[10px] text-gray-500 align-top hidden xs:inline">Clone</span>
                    </div>
                </div>

                {/* Center: Search */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-4 sm:mx-8 relative" ref={searchRef}>
                    <div className={`relative flex items-center ${isSearchFocused ? 'ring-1 ring-blue-500' : ''} rounded-full`}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Search"
                            className="w-full h-10 px-4 pr-12 bg-transparent border border-[#ccc] dark:border-[#303030] rounded-l-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 text-base"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setShowSuggestions(false);
                                }}
                                className="absolute right-16 p-1 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => handleSearch(searchQuery)}
                            className="h-10 px-6 bg-[#f8f8f8] dark:bg-[#222] border border-l-0 border-[#ccc] dark:border-[#303030] rounded-r-full hover:bg-[#f0f0f0] dark:hover:bg-[#3f3f3f] transition-colors"
                        >
                            <FiSearch className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-16 mt-1 bg-white dark:bg-[#212121] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#3f3f3f] overflow-hidden py-2">
                            {searchSuggestions.map((suggestion) => (
                                <div
                                    key={suggestion._id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-4 py-2 cursor-pointer flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors"
                                >
                                    <FiSearch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm truncate">{suggestion.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className="hidden md:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors ml-2">
                    <FiMic className="w-5 h-5" />
                </button>

                {/* Right: Actions */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* Upload Button */}
                    {isAuthenticated && (
                        <button
                            onClick={() => navigate('/upload')}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors"
                            title="Create"
                        >
                            <FiUpload className="w-6 h-6" />
                        </button>
                    )}

                    {/* Video Call Button */}
                    {isAuthenticated && (
                        <button
                            onClick={() => navigate('/call')}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors"
                            title="Video Call"
                        >
                            <FiVideo className="w-6 h-6" />
                        </button>
                    )}


                    {/* Notifications */}
                    {isAuthenticated && (
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors relative"
                                title="Notifications"
                            >
                                <FiBell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-screen max-w-[480px] max-h-[600px] bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#3f3f3f] overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#3f3f3f]">
                                        <h3 className="font-medium">Notifications</h3>
                                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3f3f3f]">
                                            <FiSettings className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="overflow-y-auto max-h-[500px]">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <FiBell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            <>
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        onClick={async () => {
                                                            // Mark as read
                                                            if (!notification.isRead) {
                                                                await notificationAPI.markAsRead(notification._id);
                                                                fetchNotifications();
                                                            }
                                                            // Navigate to video if available
                                                            if (notification.relatedVideo) {
                                                                navigate(`/video/${notification.relatedVideo._id || notification.relatedVideo}`);
                                                                setShowNotifications(false);
                                                            }
                                                        }}
                                                        className={`flex space-x-3 px-4 py-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                            }`}
                                                    >
                                                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                                            {notification.type === 'upload' && <FiVideo className="w-5 h-5" />}
                                                            {notification.type === 'comment' && <FiMessageSquare className="w-5 h-5" />}
                                                            {notification.type === 'reply' && <FiMessageSquare className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                {new Date(notification.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {notification.thumbnail && (
                                                            <img
                                                                src={notification.thumbnail}
                                                                alt=""
                                                                className="w-16 h-9 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0 object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {/* User Dropdown Menu - YouTube Style */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-[#282828] border border-[#e5e5e5] dark:border-[#3f3f3f]">
                                    {/* User Info */}
                                    <div className="px-4 py-4 border-b border-gray-200 dark:border-[#3f3f3f]">
                                        <div className="flex items-center space-x-3 mb-3">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{user?.name}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">@{user?.name?.toLowerCase().replace(/\s+/g, '')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/channel');
                                                setShowUserMenu(false);
                                            }}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View your channel
                                        </button>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiUser className="w-5 h-5" />
                                            <span>Google Account</span>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <MdSwitchAccount className="w-5 h-5" />
                                            <span>Switch account</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors"
                                        >
                                            <FiLogOut className="w-5 h-5" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-[#3f3f3f] py-2">
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <MdOutlineVideoLibrary className="w-5 h-5" />
                                            <span>YouTube Studio</span>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiMonitor className="w-5 h-5" />
                                            <span>Purchases and memberships</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-[#3f3f3f] py-2">
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiMonitor className="w-5 h-5" />
                                            <span>Your data in YouTube</span>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiMonitor className="w-5 h-5" />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span>Appearance: Device theme</span>
                                                <span className="text-xs text-gray-500">›</span>
                                            </div>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiGlobe className="w-5 h-5" />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span>Language: British English</span>
                                                <span className="text-xs text-gray-500">›</span>
                                            </div>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiMapPin className="w-5 h-5" />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span>Location: India</span>
                                                <span className="text-xs text-gray-500">›</span>
                                            </div>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiSettings className="w-5 h-5" />
                                            <span>Settings</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-[#3f3f3f] py-2">
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiHelpCircle className="w-5 h-5" />
                                            <span>Help</span>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <FiMessageSquare className="w-5 h-5" />
                                            <span>Send feedback</span>
                                        </button>
                                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors">
                                            <MdKeyboard className="w-5 h-5" />
                                            <span>Keyboard shortcuts</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            className="flex items-center space-x-2 px-3 py-1.5 border border-[#ccc] dark:border-[#3f3f3f] rounded-full hover:bg-blue-50 dark:hover:bg-[#263850] transition-colors text-sm font-medium text-blue-600"
                        >
                            <FiUser className="w-5 h-5" />
                            <span>Sign in</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
