import React from 'react';
import { FiHome, FiVideo, FiClock, FiHeart, FiDownload, FiDollarSign, FiUser, FiTrendingUp, FiPlayCircle, FiX } from 'react-icons/fi';
import { MdSubscriptions, MdVideoLibrary } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { isOpen, toggleSidebar } = useSidebar();

    const mainItems = [
        { icon: FiHome, label: 'Home', path: '/' },
        { icon: FiPlayCircle, label: 'Shorts', path: '/shorts' },
        { icon: MdSubscriptions, label: 'Subscriptions', path: '/subscriptions' },
    ];

    const userItems = [
        { icon: FiUser, label: 'Your channel', path: '/channel' },
        { icon: FiClock, label: 'History', path: '/history' },
        { icon: MdVideoLibrary, label: 'Your videos', path: '/my-videos' },
        { icon: FiClock, label: 'Watch Later', path: '/watch-later' },
        { icon: FiHeart, label: 'Liked videos', path: '/liked' },
        { icon: FiDownload, label: 'Downloads', path: '/downloads' },
    ];

    const subscriptionItems = [
        { icon: FiDollarSign, label: 'Subscription Plans', path: '/plans' },
    ];

    const isActive = (path) => location.pathname === path;

    const MenuItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <button
                onClick={() => {
                    navigate(item.path);
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024 && isOpen) {
                        toggleSidebar();
                    }
                }}
                className={`w-full flex items-center space-x-6 px-3 py-2 rounded-lg transition-all ${isActive(item.path)
                    ? 'bg-[#f2f2f2] dark:bg-[#272727]'
                    : 'hover:bg-[#f2f2f2] dark:hover:bg-[#272727]'
                    } ${!isOpen ? 'justify-center' : ''}`}
            >
                <Icon className={`flex-shrink-0 ${isOpen ? 'w-6 h-6' : 'w-6 h-6'}`} />
                {isOpen && <span className="text-sm font-normal">{item.label}</span>}
            </button>
        );
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-14 h-[calc(100vh-56px)] bg-white dark:bg-[#0f0f0f] transition-all duration-200 overflow-y-auto z-50 ${
                    // On mobile: full width when open, hidden when closed
                    // On desktop: 240px when open, 72px when closed
                    isOpen ? 'w-60' : 'w-0 lg:w-[72px]'
                    } ${
                    // On mobile, hide completely when closed, show as overlay when open
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                style={{ scrollbarWidth: 'thin' }}
            >
                {/* Mobile close button */}
                {isOpen && (
                    <div className="lg:hidden flex justify-end p-2">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727]"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                )}

                <nav className="py-3 px-3">
                    {/* Main Section */}
                    <div className="mb-3">
                        {mainItems.map((item) => (
                            <MenuItem key={item.path} item={item} />
                        ))}
                    </div>

                    {isOpen && <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3"></div>}

                    {/* You Section */}
                    {isAuthenticated && (
                        <>
                            {isOpen && (
                                <div className="px-3 py-2">
                                    <h3 className="text-base font-medium">You</h3>
                                </div>
                            )}
                            <div className="mb-3">
                                {userItems.map((item) => (
                                    <MenuItem key={item.path} item={item} />
                                ))}
                            </div>
                            {isOpen && <div className="border-t border-gray-200 dark:border-[#3f3f3f] my-3"></div>}
                        </>
                    )}

                    {/* Subscriptions Section */}
                    {isOpen && (
                        <div className="px-3 py-2">
                            <h3 className="text-base font-medium">Subscriptions</h3>
                        </div>
                    )}
                    <div className="mb-3">
                        {subscriptionItems.map((item) => (
                            <MenuItem key={item.path} item={item} />
                        ))}
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
