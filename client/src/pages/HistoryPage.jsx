import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoCard from '../components/VideoCard';
import { historyAPI } from '../utils/api';
import { useSidebar } from '../context/SidebarContext';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const HistoryPage = () => {
    const { isOpen } = useSidebar();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await historyAPI.getHistory();
            setHistory(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Clear all watch history?')) return;

        try {
            await historyAPI.clearHistory();
            setHistory([]);
            toast.success('History cleared');
        } catch (error) {
            toast.error('Failed to clear history');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <FiClock className="w-8 h-8" />
                                    <h1 className="text-3xl font-bold">Watch History</h1>
                                </div>
                                {history.length > 0 && (
                                    <button
                                        onClick={handleClearHistory}
                                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                        <span>Clear All</span>
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-lg mb-3"></div>
                                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-16">
                                    <FiClock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">No watch history</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Videos you watch will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {history.map((item) => (
                                        <VideoCard key={item._id} video={item.video} />
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

export default HistoryPage;
