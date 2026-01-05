import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { videoAPI } from '../utils/api';
import { FiUpload, FiVideo, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UploadVideoPage = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Education',
        tags: '',
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const categories = [
        'Education', 'Entertainment', 'Music', 'Gaming', 'Sports',
        'News', 'Technology', 'Cooking', 'Travel', 'Other'
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024 * 1024) { // 500MB limit
                toast.error('Video file too large (max 500MB)');
                return;
            }
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Thumbnail too large (max 5MB)');
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile) {
            toast.error('Please select a video file');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('video', videoFile);
        if (thumbnailFile) uploadData.append('thumbnail', thumbnailFile);
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);
        uploadData.append('category', formData.category);
        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
            uploadData.append('tags', tagsArray.join(','));
        }

        try {
            setUploadProgress(0);
            const response = await videoAPI.uploadVideo(uploadData, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            });
            toast.success(response.data.message || 'Video uploaded successfully!');
            navigate(`/video/${response.data.data._id}`);
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
            toast.error(errorMessage);

            // Show more specific error guidance
            if (errorMessage.includes('Cloudinary')) {
                toast.error('Server configuration issue. Please contact support.');
            } else if (errorMessage.includes('channel')) {
                toast.error('Please create a channel first from your profile.');
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Video Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Video File *</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                    {videoPreview ? (
                                        <div className="space-y-4">
                                            <video src={videoPreview} controls className="max-h-64 mx-auto rounded" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVideoFile(null);
                                                    setVideoPreview(null);
                                                }}
                                                className="text-red-600 hover:underline"
                                            >
                                                Remove Video
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <FiVideo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                Click to upload video
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                MP4, WebM, AVI, MKV, or MOV (max 500MB)
                                            </p>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/avi,video/x-msvideo,video/x-matroska,.mp4,.webm,.avi,.mkv,.mov,.wmv,.flv"
                                                onChange={handleVideoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Thumbnail (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                    {thumbnailPreview ? (
                                        <div className="space-y-4">
                                            <img src={thumbnailPreview} alt="Thumbnail" className="max-h-48 mx-auto rounded" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setThumbnailFile(null);
                                                    setThumbnailPreview(null);
                                                }}
                                                className="text-red-600 hover:underline"
                                            >
                                                Remove Thumbnail
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <FiImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                Click to upload thumbnail
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                JPG or PNG (max 5MB)
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter video title"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Tell viewers about your video"
                                    rows={5}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 resize-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., tutorial, react, javascript"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !videoFile}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Uploading... {uploadProgress}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiUpload className="w-5 h-5" />
                                            <span>Upload Video</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UploadVideoPage;
