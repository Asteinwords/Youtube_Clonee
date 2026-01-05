import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import VideoCard from '../components/VideoCard';
import SubscribeButton from '../components/SubscribeButton';
import { videoAPI, channelAPI, commentAPI, watchLaterAPI, likeAPI, downloadAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { FiThumbsUp, FiThumbsDown, FiShare2, FiDownload, FiChevronDown, FiMoreVertical, FiClock, FiFlag, FiGlobe, FiMapPin } from 'react-icons/fi';
import { MdSort } from 'react-icons/md';
import toast from 'react-hot-toast';
import { formatTimeAgo, formatViews as formatViewsUtil, formatSubscribers } from '../utils/formatters';

const VideoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { isOpen } = useSidebar();
    const [video, setVideo] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLikeStatus, setUserLikeStatus] = useState(null);
    const [localLikes, setLocalLikes] = useState(0);
    const [localDislikes, setLocalDislikes] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentSortBy, setCommentSortBy] = useState('top');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState({});
    const [replyText, setReplyText] = useState({});
    const [commentLikeStatus, setCommentLikeStatus] = useState({});
    const [translatedComments, setTranslatedComments] = useState({});
    const [translating, setTranslating] = useState({});
    const moreMenuRef = useRef(null);
    const commentsRef = useRef(null);

    useEffect(() => {
        fetchVideo();
        fetchRecommended();
        fetchComments();
        incrementViews();
    }, [id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVideo = async () => {
        try {
            const response = await videoAPI.getVideo(id);
            const videoData = response.data.data;
            setVideo(videoData);
            setLocalLikes(videoData.likes || 0);
            setLocalDislikes(videoData.dislikes || 0);
            setSubscriberCount(videoData.channel?.subscribers || 0);

            // Check if user is subscribed
            if (isAuthenticated && videoData.channel?._id) {
                checkSubscriptionStatus(videoData.channel._id);
            }

            // Fetch user's like status
            if (isAuthenticated) {
                fetchUserLikeStatus();
            }
        } catch (error) {
            toast.error('Failed to load video');
        } finally {
            setLoading(false);
        }
    };

    const checkSubscriptionStatus = async (channelId) => {
        try {
            const response = await channelAPI.getChannel(channelId);
            setIsSubscribed(response.data.data.isSubscribed || false);
        } catch (error) {
            console.error('Failed to check subscription status');
        }
    };

    const fetchUserLikeStatus = async () => {
        try {
            // We'll check the user's like status from the liked videos
            // This is a workaround since there's no dedicated endpoint
            const response = await likeAPI.getLikedVideos();
            const likedVideo = response.data.data.find(item => item.targetId?._id === id);
            if (likedVideo) {
                setUserLikeStatus(likedVideo.likeType);
            }
        } catch (error) {
            console.error('Failed to fetch user like status');
        }
    };

    const fetchRecommended = async () => {
        try {
            const response = await videoAPI.getRecommended(id);
            setRecommended(response.data.data || []);
        } catch (error) {
            console.error('Failed to load recommendations');
        }
    };

    const fetchComments = async () => {
        try {
            const response = await commentAPI.getComments(id, { sortBy: commentSortBy });
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Failed to load comments');
        }
    };

    // Fetch comments when sortBy changes
    useEffect(() => {
        if (id) {
            fetchComments();
        }
    }, [commentSortBy]);

    const incrementViews = async () => {
        try {
            await videoAPI.incrementViews(id, 0);
        } catch (error) {
            console.error('Failed to increment views');
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe');
            return;
        }

        // If already subscribed, show confirmation dialog
        if (isSubscribed) {
            const confirmed = window.confirm(`Unsubscribe from ${video.channel.name}?`);
            if (!confirmed) return;
        }

        try {
            const response = await channelAPI.toggleSubscription(video.channel._id);
            setIsSubscribed(response.data.data.isSubscribed);
            setSubscriberCount(response.data.data.subscribers);
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Failed to update subscription');
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to like videos');
            return;
        }

        try {
            const newStatus = userLikeStatus === 'like' ? 'none' : 'like';
            const response = await likeAPI.likeVideo(id, newStatus);

            // Update state from API response
            const { likes, dislikes, userLikeType } = response.data.data;
            setLocalLikes(likes);
            setLocalDislikes(dislikes);
            setUserLikeStatus(userLikeType);
        } catch (error) {
            console.error('Like error:', error);
            toast.error('Failed to like video');
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to dislike videos');
            return;
        }

        try {
            const newStatus = userLikeStatus === 'dislike' ? 'none' : 'dislike';
            const response = await likeAPI.likeVideo(id, newStatus);

            // Update state from API response
            const { likes, dislikes, userLikeType } = response.data.data;
            setLocalLikes(likes);
            setLocalDislikes(dislikes);
            setUserLikeStatus(userLikeType);
        } catch (error) {
            console.error('Dislike error:', error);
            toast.error('Failed to dislike video');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDownload = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to download videos');
            return;
        }

        try {
            toast.loading('Preparing download...');

            const response = await downloadAPI.downloadVideo(id);
            const { downloadUrl, videoTitle, remainingDownloads } = response.data.data;

            // Trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${videoTitle}.mp4`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.dismiss();
            toast.success(
                remainingDownloads === 'unlimited'
                    ? 'Download started!'
                    : `Download started! ${remainingDownloads} download(s) remaining today.`
            );
        } catch (error) {
            toast.dismiss();

            if (error.response?.status === 403) {
                const { needsUpgrade, message } = error.response.data;

                if (needsUpgrade) {
                    // Show upgrade prompt
                    const upgrade = window.confirm(
                        `${message}\n\nWould you like to upgrade to a premium plan now?`
                    );

                    if (upgrade) {
                        navigate('/plans');
                    }
                } else {
                    toast.error(message);
                }
            } else {
                toast.error(error.response?.data?.message || 'Download failed');
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please sign in to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            await commentAPI.createComment({
                videoId: id,
                text: newComment
            });
            setNewComment('');
            fetchComments();
            toast.success('Comment posted!');
        } catch (error) {
            console.error('Comment error:', error);
            toast.error(error.response?.data?.message || 'Failed to post comment');
        }
    };

    const handleReplySubmit = async (e, parentCommentId) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please sign in to reply');
            return;
        }

        const reply = replyText[parentCommentId];
        if (!reply?.trim()) return;

        try {
            await commentAPI.createComment({
                videoId: id,
                text: reply,
                parentCommentId
            });
            setReplyText({ ...replyText, [parentCommentId]: '' });
            setShowReplyForm({ ...showReplyForm, [parentCommentId]: false });
            fetchComments();
            toast.success('Reply posted!');
        } catch (error) {
            console.error('Reply error:', error);
            toast.error(error.response?.data?.message || 'Failed to post reply');
        }
    };

    const handleCommentLike = async (commentId, currentStatus) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to like comments');
            return;
        }

        try {
            const newStatus = currentStatus === 'like' ? 'none' : 'like';
            await commentAPI.likeComment(commentId, newStatus);
            fetchComments();
        } catch (error) {
            toast.error('Failed to like comment');
        }
    };

    const handleCommentDislike = async (commentId, currentStatus) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to dislike comments');
            return;
        }

        try {
            const newStatus = currentStatus === 'dislike' ? 'none' : 'dislike';
            await commentAPI.likeComment(commentId, newStatus);
            fetchComments();
        } catch (error) {
            toast.error('Failed to dislike comment');
        }
    };

    const handleTranslateComment = async (commentId, targetLang = 'en') => {
        setTranslating({ ...translating, [commentId]: true });
        try {
            const response = await commentAPI.translateComment(commentId, targetLang);
            setTranslatedComments({
                ...translatedComments,
                [commentId]: {
                    text: response.data.translation, // Changed from response.data.data to response.data.translation
                    language: targetLang,
                    show: true
                }
            });
            toast.success('Comment translated!');
        } catch (error) {
            console.error('Translation error:', error);
            toast.error(error.response?.data?.message || 'Translation failed');
        } finally {
            setTranslating({ ...translating, [commentId]: false });
        }
    };

    const toggleTranslation = (commentId) => {
        setTranslatedComments({
            ...translatedComments,
            [commentId]: {
                ...translatedComments[commentId],
                show: !translatedComments[commentId]?.show
            }
        });
    };

    const scrollToComments = () => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatViews = (views) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views;
    };

    const formatDate = (date) => {
        const now = new Date();
        const videoDate = new Date(date);
        const diffTime = Math.abs(now - videoDate);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const formatSubscribers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
        return count;
    };

    const handleWatchLater = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to save videos');
            return;
        }

        try {
            await watchLaterAPI.addToWatchLater(id);
            toast.success('Added to Watch Later');
            setShowMoreMenu(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to Watch Later');
        }
    };

    const handleReport = () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to report videos');
            return;
        }

        const reason = prompt('Please enter the reason for reporting this video:');
        if (reason && reason.trim()) {
            toast.success('Video reported. Thank you for your feedback.');
            setShowMoreMenu(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
                <Navbar />
                <div className="flex pt-14">
                    <Sidebar />
                    <main className={`flex-1 transition-all duration-200 ${isOpen ? 'lg:ml-60' : 'lg:ml-[72px]'}`}>
                        <div className="p-6">
                            <div className="animate-pulse">
                                <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-xl mb-4"></div>
                                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
                <Navbar />
                <div className="flex pt-14">
                    <Sidebar />
                    <main className={`flex-1 transition-all duration-200 ${isOpen ? 'lg:ml-60' : 'lg:ml-[72px]'}`}>
                        <div className="p-6 text-center">
                            <h2 className="text-2xl font-bold">Video not found</h2>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'lg:ml-60' : 'lg:ml-[72px]'}`}>
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 sm:p-6">
                        {/* Main Video Section */}
                        <div className="flex-1 max-w-[1280px]">
                            {/* Video Player */}
                            <div className="bg-black rounded-xl overflow-hidden mb-3">
                                <VideoPlayer
                                    videoUrl={video.videoUrl}
                                    onNext={() => {
                                        if (recommended.length > 0) {
                                            window.location.href = `/video/${recommended[0]._id}`;
                                        }
                                    }}
                                    onShowComments={scrollToComments}
                                />
                            </div>

                            {/* Video Title */}
                            <h1 className="text-xl font-semibold mb-2">{video.title}</h1>

                            {/* Video Info Row */}
                            <div className="flex items-center justify-between mb-3">
                                {/* Channel Info + Subscribe */}
                                <div className="flex items-center space-x-3">
                                    {video.channel?.avatarUrl && (
                                        <img
                                            src={video.channel.avatarUrl}
                                            alt={video.channel.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-sm">{video.channel?.name || 'Unknown Channel'}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {formatSubscribers(subscriberCount)} subscribers
                                        </p>
                                    </div>
                                    <SubscribeButton
                                        channelId={video.channel._id}
                                        channelName={video.channel.name}
                                        initialSubscribed={isSubscribed}
                                        initialSubscriberCount={subscriberCount}
                                        onSubscriptionChange={(subscribed, count) => {
                                            setIsSubscribed(subscribed);
                                            setSubscriberCount(count);
                                        }}
                                        size="medium"
                                        showCount={false}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    {/* Like/Dislike */}
                                    <div className="flex items-center bg-[#f2f2f2] dark:bg-[#272727] rounded-full">
                                        <button
                                            onClick={handleLike}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-l-full hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f] transition-all ${userLikeStatus === 'like' ? 'text-blue-600' : ''
                                                }`}
                                        >
                                            <FiThumbsUp className="w-5 h-5" />
                                            <span className="text-sm font-medium">{formatViews(localLikes)}</span>
                                        </button>
                                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                        <button
                                            onClick={handleDislike}
                                            className={`px-4 py-2 rounded-r-full hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f] transition-all ${userLikeStatus === 'dislike' ? 'text-blue-600' : ''
                                                }`}
                                        >
                                            <FiThumbsDown className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Share */}
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center space-x-2 px-4 py-2 bg-[#f2f2f2] dark:bg-[#272727] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f] transition-all"
                                    >
                                        <FiShare2 className="w-5 h-5" />
                                        <span className="text-sm font-medium">Share</span>
                                    </button>

                                    {/* Download */}
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center space-x-2 px-4 py-2 bg-[#f2f2f2] dark:bg-[#272727] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f] transition-all"
                                    >
                                        <FiDownload className="w-5 h-5" />
                                        <span className="text-sm font-medium">Download</span>
                                    </button>

                                    {/* More Menu */}
                                    <div className="relative" ref={moreMenuRef}>
                                        <button
                                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                                            className="p-2 bg-[#f2f2f2] dark:bg-[#272727] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#3f3f3f] transition-all"
                                        >
                                            <FiMoreVertical className="w-5 h-5" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showMoreMenu && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#3f3f3f] overflow-hidden z-10">
                                                <button
                                                    onClick={handleWatchLater}
                                                    className="w-full px-4 py-3 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors"
                                                >
                                                    <FiClock className="w-5 h-5" />
                                                    <span>Save to Watch Later</span>
                                                </button>
                                                <button
                                                    onClick={handleReport}
                                                    className="w-full px-4 py-3 text-left text-sm flex items-center space-x-3 hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors"
                                                >
                                                    <FiFlag className="w-5 h-5" />
                                                    <span>Report</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-[#f2f2f2] dark:bg-[#272727] rounded-xl p-3 mb-4">
                                <div className="flex items-center space-x-2 text-sm font-medium mb-2">
                                    <span>{formatViews(video.views)} views</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(video.createdAt)}</span>
                                </div>
                                <p className={`text-sm whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                                    {video.description || 'No description'}
                                </p>
                                {video.description && video.description.length > 100 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="text-sm font-medium mt-2"
                                    >
                                        {showFullDescription ? 'Show less' : '...more'}
                                    </button>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div id="comments" ref={commentsRef}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">{comments.length} Comments</h2>
                                    <div className="relative" ref={moreMenuRef}>
                                        <button
                                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                                            className="flex items-center space-x-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <MdSort className="w-6 h-6" />
                                            <span>{commentSortBy === 'top' ? 'Top comments' : 'Newest first'}</span>
                                        </button>

                                        {/* Sort Dropdown */}
                                        {showMoreMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#3f3f3f] overflow-hidden z-10">
                                                <button
                                                    onClick={() => {
                                                        setCommentSortBy('top');
                                                        setShowMoreMenu(false);
                                                        fetchComments();
                                                    }}
                                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors ${commentSortBy === 'top' ? 'font-semibold' : ''
                                                        }`}
                                                >
                                                    Top comments
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCommentSortBy('newest');
                                                        setShowMoreMenu(false);
                                                        fetchComments();
                                                    }}
                                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f3f] transition-colors ${commentSortBy === 'newest' ? 'font-semibold' : ''
                                                        }`}
                                                >
                                                    Newest first
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add Comment */}
                                {isAuthenticated && (
                                    <form onSubmit={handleCommentSubmit} className="flex space-x-3 mb-8">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 focus:outline-none focus:border-black dark:focus:border-white text-sm"
                                            />
                                            {newComment && (
                                                <div className="flex justify-end space-x-2 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewComment('')}
                                                        className="px-4 py-2 text-sm font-medium rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#272727]"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700"
                                                    >
                                                        Comment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment._id}>
                                            <div className="flex space-x-3">
                                                {comment.user?.avatar ? (
                                                    <img
                                                        src={comment.user.avatar}
                                                        alt={comment.user.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-sm">
                                                        {comment.user?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-sm font-medium">{comment.user?.name}</span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                                            {formatTimeAgo(comment.createdAt)}
                                                        </span>
                                                        {comment.userCity && (
                                                            <span className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                                                <FiMapPin className="w-3 h-3" />
                                                                <span>{comment.userCity}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Comment Text with Translation */}
                                                    {translatedComments[comment._id]?.show && translatedComments[comment._id]?.text ? (
                                                        <div className="mb-2">
                                                            <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded mb-1">
                                                                <FiGlobe className="inline w-3 h-3 mr-1" />
                                                                {translatedComments[comment._id].text}
                                                            </p>
                                                            <button
                                                                onClick={() => toggleTranslation(comment._id)}
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                Show original
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-2">
                                                            <p className="text-sm">{comment.text}</p>
                                                            {translatedComments[comment._id]?.text && (
                                                                <button
                                                                    onClick={() => toggleTranslation(comment._id)}
                                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                                                >
                                                                    Show translation
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={() => handleCommentLike(comment._id, commentLikeStatus[comment._id])}
                                                            className={`flex items-center space-x-1 text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors ${commentLikeStatus[comment._id] === 'like' ? 'text-blue-600' : ''
                                                                }`}
                                                        >
                                                            <FiThumbsUp className="w-4 h-4" />
                                                            <span>{comment.likes || 0}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleCommentDislike(comment._id, commentLikeStatus[comment._id])}
                                                            className={`flex items-center space-x-1 text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors ${commentLikeStatus[comment._id] === 'dislike' ? 'text-blue-600' : ''
                                                                }`}
                                                        >
                                                            <FiThumbsDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowReplyForm({ ...showReplyForm, [comment._id]: !showReplyForm[comment._id] })}
                                                            className="text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors"
                                                        >
                                                            Reply
                                                        </button>

                                                        {/* Translation Button with Language Selector */}
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => handleTranslateComment(comment._id, 'en')}
                                                                disabled={translating[comment._id]}
                                                                className="flex items-center space-x-1 text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors disabled:opacity-50"
                                                            >
                                                                <FiGlobe className="w-4 h-4" />
                                                                <span>{translating[comment._id] ? 'Translating...' : 'Translate'}</span>
                                                            </button>

                                                            {/* Language Selector Dropdown */}
                                                            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 min-w-[120px]">
                                                                <div className="text-xs font-medium mb-2 px-2">Translate to:</div>
                                                                {['en', 'es', 'fr', 'de', 'hi', 'zh', 'ja', 'ar'].map(lang => (
                                                                    <button
                                                                        key={lang}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleTranslateComment(comment._id, lang);
                                                                        }}
                                                                        className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded whitespace-nowrap"
                                                                    >
                                                                        {{
                                                                            en: '🇬🇧 English',
                                                                            es: '🇪🇸 Spanish',
                                                                            fr: '🇫🇷 French',
                                                                            de: '🇩🇪 German',
                                                                            hi: '🇮🇳 Hindi',
                                                                            zh: '🇨🇳 Chinese',
                                                                            ja: '🇯🇵 Japanese',
                                                                            ar: '🇸🇦 Arabic'
                                                                        }[lang]}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Reply Form */}
                                                    {showReplyForm[comment._id] && isAuthenticated && (
                                                        <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="flex space-x-3 mt-4">
                                                            {user?.avatar ? (
                                                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs">
                                                                    {user?.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={replyText[comment._id] || ''}
                                                                    onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                                                                    placeholder="Add a reply..."
                                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 focus:outline-none focus:border-black dark:focus:border-white text-sm"
                                                                />
                                                                {replyText[comment._id] && (
                                                                    <div className="flex justify-end space-x-2 mt-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setReplyText({ ...replyText, [comment._id]: '' });
                                                                                setShowReplyForm({ ...showReplyForm, [comment._id]: false });
                                                                            }}
                                                                            className="px-3 py-1.5 text-sm font-medium rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#272727]"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            type="submit"
                                                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700"
                                                                        >
                                                                            Reply
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </form>
                                                    )}

                                                    {/* Replies */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="mt-4 space-y-4">
                                                            {comment.replies.map((reply) => (
                                                                <div key={reply._id} className="flex space-x-3">
                                                                    {reply.user?.avatar ? (
                                                                        <img
                                                                            src={reply.user.avatar}
                                                                            alt={reply.user.name}
                                                                            className="w-8 h-8 rounded-full"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-xs">
                                                                            {reply.user?.name?.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center space-x-2 mb-1">
                                                                            <span className="text-sm font-medium">{reply.user?.name}</span>
                                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                                {formatTimeAgo(reply.createdAt)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm mb-2">{reply.text}</p>
                                                                        <div className="flex items-center space-x-4">
                                                                            <button
                                                                                onClick={() => handleCommentLike(reply._id, commentLikeStatus[reply._id])}
                                                                                className={`flex items-center space-x-1 text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors ${commentLikeStatus[reply._id] === 'like' ? 'text-blue-600' : ''
                                                                                    }`}
                                                                            >
                                                                                <FiThumbsUp className="w-4 h-4" />
                                                                                <span>{reply.likes || 0}</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleCommentDislike(reply._id, commentLikeStatus[reply._id])}
                                                                                className={`flex items-center space-x-1 text-sm hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors ${commentLikeStatus[reply._id] === 'dislike' ? 'text-blue-600' : ''
                                                                                    }`}
                                                                            >
                                                                                <FiThumbsDown className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setShowReplyForm({ ...showReplyForm, [reply._id]: !showReplyForm[reply._id] })}
                                                                                className="text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#272727] px-2 py-1 rounded transition-colors"
                                                                            >
                                                                                Reply
                                                                            </button>
                                                                        </div>

                                                                        {/* Nested Reply Form */}
                                                                        {showReplyForm[reply._id] && isAuthenticated && (
                                                                            <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="flex space-x-3 mt-4">
                                                                                {user?.avatar ? (
                                                                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                                                                ) : (
                                                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs">
                                                                                        {user?.name?.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex-1">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={replyText[reply._id] || ''}
                                                                                        onChange={(e) => setReplyText({ ...replyText, [reply._id]: e.target.value })}
                                                                                        placeholder={`Reply to ${reply.user?.name}...`}
                                                                                        className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 focus:outline-none focus:border-black dark:focus:border-white text-sm"
                                                                                    />
                                                                                    {replyText[reply._id] && (
                                                                                        <div className="flex justify-end space-x-2 mt-2">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    setReplyText({ ...replyText, [reply._id]: '' });
                                                                                                    setShowReplyForm({ ...showReplyForm, [reply._id]: false });
                                                                                                }}
                                                                                                className="px-3 py-1.5 text-sm font-medium rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#272727]"
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                            <button
                                                                                                type="submit"
                                                                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700"
                                                                                            >
                                                                                                Reply
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </form>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommended Videos Sidebar */}
                        <div className="w-[400px] space-y-2">
                            {recommended.map((video) => (
                                <div
                                    key={video._id}
                                    onClick={() => window.location.href = `/video/${video._id}`}
                                    className="flex space-x-2 cursor-pointer group"
                                >
                                    <div className="relative w-[168px] flex-shrink-0">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full aspect-video object-cover rounded-lg"
                                        />
                                        {video.duration && (
                                            <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{video.channel?.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
};

export default VideoPage;
