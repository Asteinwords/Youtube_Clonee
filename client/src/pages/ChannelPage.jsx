import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { channelAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { FiEdit2, FiImage, FiSave, FiVideo, FiEye, FiThumbsUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatTimeAgo, formatViews as formatViewsUtil } from '../utils/formatters';

const ChannelPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isOpen } = useSidebar();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    useEffect(() => {
        fetchChannel();
    }, []);

    const fetchChannel = async () => {
        try {
            const response = await channelAPI.getMyChannel();
            if (response.data.data) {
                const channelData = response.data.data;
                setChannel(channelData);
                setFormData({
                    name: channelData.name,
                    description: channelData.description || ''
                });
                // Fetch channel videos
                fetchVideos(channelData._id);
            }
        } catch (error) {
            console.error('No channel found');
        } finally {
            setLoading(false);
        }
    };

    const fetchVideos = async (channelId) => {
        try {
            const response = await channelAPI.getChannelVideos(channelId);
            setVideos(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Banner too large (max 5MB)');
                return;
            }
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Please enter a channel name');
            return;
        }

        setCreating(true);
        try {
            const response = await channelAPI.createChannel(formData);
            setChannel(response.data.data);
            toast.success('Channel created successfully!');
            setEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create channel');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateChannel = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            // Update channel info (name and description)
            const response = await channelAPI.updateChannel(channel._id, {
                name: formData.name,
                description: formData.description
            });

            let updatedChannel = response.data.data;

            // Upload banner separately if a new one was selected
            if (bannerFile) {
                const bannerFormData = new FormData();
                bannerFormData.append('banner', bannerFile);

                const bannerResponse = await channelAPI.uploadBanner(channel._id, bannerFormData);
                updatedChannel = bannerResponse.data.data;
            }

            setChannel(updatedChannel);
            toast.success('Channel updated successfully!');
            setEditing(false);
            setBannerFile(null);
            setBannerPreview(null);
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update channel');
        } finally {
            setCreating(false);
        }
    };

    const formatViews = (views) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views || 0;
    };

    const formatDate = (date) => {
        const now = new Date();
        const videoDate = new Date(date);
        const diffTime = Math.abs(now - videoDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
                <Navbar />
                <div className="flex pt-14">
                    <Sidebar />
                    <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                        <div className="p-4 sm:p-8">
                            <div className="animate-pulse">
                                <div className="h-32 sm:h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
                                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // No channel - Show create form
    if (!channel) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
                <Navbar />
                <div className="flex pt-14">
                    <Sidebar />
                    <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                        <div className="p-4 sm:p-8">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <FiVideo className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-blue-600" />
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create Your Channel</h1>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                        Start sharing your videos with the world
                                    </p>
                                </div>

                                <form onSubmit={handleCreateChannel} className="space-y-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Channel Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your channel name"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Tell viewers about your channel"
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                                    >
                                        {creating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="w-5 h-5" />
                                                <span>Create Channel</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // Has channel - Show channel page
    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                    {/* Channel Banner */}
                    <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                        {(bannerPreview || channel.bannerUrl) && (
                            <img
                                src={bannerPreview || channel.bannerUrl}
                                alt="Channel Banner"
                                className="w-full h-full object-cover"
                            />
                        )}
                        {editing && (
                            <label className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 px-3 py-2 sm:px-4 sm:py-2 bg-black bg-opacity-50 text-white rounded-lg cursor-pointer hover:bg-opacity-70 flex items-center space-x-2 text-sm">
                                <FiImage className="w-4 h-4" />
                                <span className="hidden sm:inline">Change Banner</span>
                                <span className="sm:hidden">Banner</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        {/* Channel Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                {/* Profile Photo */}
                                {(channel.avatarUrl || user?.avatar || user?.picture) && (
                                    <img
                                        src={channel.avatarUrl || user?.avatar || user?.picture}
                                        alt={channel.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    {editing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="text-xl sm:text-2xl font-bold mb-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 w-full"
                                        />
                                    ) : (
                                        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 truncate">{channel.name}</h1>
                                    )}
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {formatViews(channel.subscribers || 0)} subscribers • {formatViews(channel.totalViews || 0)} views
                                    </p>
                                </div>
                            </div>

                            {editing ? (
                                <div className="flex space-x-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setBannerFile(null);
                                            setBannerPreview(null);
                                            setFormData({
                                                name: channel.name,
                                                description: channel.description || ''
                                            });
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateChannel}
                                        disabled={creating}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 text-sm"
                                    >
                                        {creating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="w-4 h-4" />
                                                <span>Save</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center space-x-2 text-sm"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                    <span>Edit Channel</span>
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6 sm:mb-8">
                            {editing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Channel description"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 resize-none text-sm"
                                />
                            ) : channel.description ? (
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{channel.description}</p>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No description yet</p>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="mb-6 sm:mb-8">
                            <button
                                onClick={() => navigate('/upload')}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                            >
                                <FiVideo className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Upload Video</span>
                            </button>
                        </div>

                        {/* Videos Section */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Videos</h2>
                            {videos.length === 0 ? (
                                <div className="text-center py-12 sm:py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FiVideo className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                                        No videos uploaded yet
                                    </p>
                                    <button
                                        onClick={() => navigate('/upload')}
                                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                                    >
                                        Upload Your First Video
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {videos.map((video) => (
                                        <div
                                            key={video._id}
                                            onClick={() => navigate(`/video/${video._id}`)}
                                            className="cursor-pointer group"
                                        >
                                            <div className="relative aspect-video mb-2 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                                {video.thumbnailUrl && (
                                                    <img
                                                        src={video.thumbnailUrl}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                )}
                                                {video.duration && (
                                                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                                                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-1">{video.title}</h3>
                                            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center space-x-1">
                                                    <FiEye className="w-3 h-3" />
                                                    <span>{formatViews(video.views)}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <FiThumbsUp className="w-3 h-3" />
                                                    <span>{formatViews(video.likes)}</span>
                                                </span>
                                                <span>•</span>
                                                <span>{formatTimeAgo(video.createdAt)}</span>
                                            </div>
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

export default ChannelPage;
