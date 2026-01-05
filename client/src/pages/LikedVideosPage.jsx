import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoCard from '../components/VideoCard';
import { likeAPI } from '../utils/api';
import { useSidebar } from '../context/SidebarContext';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LikedVideosPage = () => {
    const { isOpen } = useSidebar();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLikedVideos();
    }, []);

    const fetchLikedVideos = async () => {
        try {
            const response = await likeAPI.getLikedVideos();
            setVideos(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load liked videos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                    <div className="p-8">
                        <div className="max-w-[1800px] mx-auto">
                            <div className="flex items-center space-x-3 mb-8">
                                <FiHeart className="w-8 h-8 text-red-500" />
                                <h1 className="text-3xl font-bold">Liked Videos</h1>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-lg mb-3"></div>
                                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : videos.length === 0 ? (
                                <div className="text-center py-16">
                                    <FiHeart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">No liked videos</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Videos you like will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {videos.map((item) => (
                                        <VideoCard key={item._id} video={item.targetId} />
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

export default LikedVideosPage;
