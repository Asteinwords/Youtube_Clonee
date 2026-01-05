import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoCard from '../components/VideoCard';
import { videoAPI } from '../utils/api';
import { useSidebar } from '../context/SidebarContext';
import { FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isOpen } = useSidebar();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredVideos, setFilteredVideos] = useState([]);

    const categories = [
        'All', 'Music', 'Gaming', 'Anime', 'Movies', 'News', 'Live',
        'Sports', 'Education', 'Technology', 'Entertainment', 'Cooking'
    ];

    useEffect(() => {
        fetchVideos();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredVideos(videos);
        } else {
            setFilteredVideos(videos.filter(v => v.category === selectedCategory));
        }
    }, [selectedCategory, videos]);

    const fetchVideos = async () => {
        try {
            const response = await videoAPI.getVideos({ page: 1, limit: 20 });
            setVideos(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] max-w-full overflow-x-hidden">
            <Navbar />
            <div className="flex pt-14 max-w-full overflow-x-hidden">
                <Sidebar />
                <main
                    className={`flex-1 transition-all duration-200 ${isOpen ? 'lg:ml-60' : 'lg:ml-[72px]'
                        }`}
                >
                    <div className="p-0 sm:p-6">
                        {/* Category Chips */}
                        <div className="mb-4 px-2 sm:px-0 overflow-x-auto">
                            <div className="flex space-x-2 pb-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                            ? 'bg-[#0f0f0f] dark:bg-white text-white dark:text-black'
                                            : 'bg-[#f2f2f2] dark:bg-[#272727] hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f]'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Videos Grid */}
                        {loading ? (
                            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        {/* Mobile skeleton - YouTube style */}
                                        <div className="sm:hidden mb-4">
                                            <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 mb-3 rounded-none"></div>
                                            <div className="flex gap-3 px-3">
                                                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
                                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                                </div>
                                                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                        {/* Desktop skeleton */}
                                        <div className="hidden sm:block">
                                            <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-xl mb-3"></div>
                                            <div className="flex space-x-3">
                                                <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredVideos.length === 0 ? (
                            <div className="text-center py-16">
                                <FiPlay className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {selectedCategory === 'All' ? 'No videos yet' : `No ${selectedCategory} videos`}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {selectedCategory === 'All' ? 'Be the first to upload a video!' : 'Try a different category'}
                                </p>
                                {isAuthenticated && selectedCategory === 'All' && (
                                    <button
                                        onClick={() => navigate('/upload')}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Upload Video
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredVideos.map((video) => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;
