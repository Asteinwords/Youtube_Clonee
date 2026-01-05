import React, { useState, useEffect } from 'react';
import { commentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiThumbsUp, FiThumbsDown, FiGlobe, FiMapPin, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CommentSection = ({ videoId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState({});

    useEffect(() => {
        fetchComments();
    }, [videoId]);

    const fetchComments = async () => {
        try {
            const response = await commentAPI.getComments(videoId);
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await commentAPI.createComment({ video: videoId, text: newComment });
            setNewComment('');
            toast.success('Comment posted!');
            fetchComments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    const handleLikeComment = async (commentId, type) => {
        try {
            await commentAPI.likeComment(commentId, type);
            fetchComments();
        } catch (error) {
            toast.error('Failed to like comment');
        }
    };

    const handleTranslate = async (commentId, targetLang = 'en') => {
        setTranslating({ ...translating, [commentId]: true });
        try {
            const response = await commentAPI.translateComment(commentId, targetLang);
            const translated = response.data.data;

            setComments(comments.map(c =>
                c._id === commentId
                    ? { ...c, translatedText: translated, showTranslation: true }
                    : c
            ));
            toast.success('Comment translated!');
        } catch (error) {
            toast.error('Translation failed');
        } finally {
            setTranslating({ ...translating, [commentId]: false });
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await commentAPI.deleteComment(commentId);
            toast.success('Comment deleted');
            fetchComments();
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const toggleTranslation = (commentId) => {
        setComments(comments.map(c =>
            c._id === commentId
                ? { ...c, showTranslation: !c.showTranslation }
                : c
        ));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">{comments.length} Comments</h3>

            {/* Post Comment */}
            {isAuthenticated ? (
                <form onSubmit={handlePostComment} className="flex space-x-3">
                    <img
                        src={user?.avatar || '/default-avatar.png'}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 resize-none"
                            rows={2}
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                            <button
                                type="button"
                                onClick={() => setNewComment('')}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                            >
                                <FiSend className="w-4 h-4" />
                                <span>{loading ? 'Posting...' : 'Comment'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">
                    Sign in to comment
                </p>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                        <img
                            src={comment.user?.avatar || '/default-avatar.png'}
                            alt={comment.user?.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold">{comment.user?.name}</span>
                                {comment.userCity && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <FiMapPin className="w-3 h-3 mr-1" />
                                        {comment.userCity}
                                    </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-gray-800 dark:text-gray-200 mb-2">
                                {comment.showTranslation && comment.translatedText
                                    ? comment.translatedText
                                    : comment.text}
                            </p>

                            {comment.detectedLanguage && comment.detectedLanguage !== 'en' && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Detected: {comment.detectedLanguage}
                                </div>
                            )}

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleLikeComment(comment._id, 'like')}
                                    className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                                >
                                    <FiThumbsUp className="w-4 h-4" />
                                    <span className="text-sm">{comment.likes || 0}</span>
                                </button>

                                <button
                                    onClick={() => handleLikeComment(comment._id, 'dislike')}
                                    className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                                >
                                    <FiThumbsDown className="w-4 h-4" />
                                    <span className="text-sm">{comment.dislikes || 0}</span>
                                </button>

                                {comment.detectedLanguage && comment.detectedLanguage !== 'en' && (
                                    <button
                                        onClick={() => comment.translatedText
                                            ? toggleTranslation(comment._id)
                                            : handleTranslate(comment._id, 'en')
                                        }
                                        disabled={translating[comment._id]}
                                        className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-green-600"
                                    >
                                        <FiGlobe className="w-4 h-4" />
                                        <span className="text-sm">
                                            {translating[comment._id]
                                                ? 'Translating...'
                                                : comment.showTranslation
                                                    ? 'Show Original'
                                                    : 'Translate'}
                                        </span>
                                    </button>
                                )}

                                {user?._id === comment.user?._id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                        <span className="text-sm">Delete</span>
                                    </button>
                                )}
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 ml-8 space-y-4">
                                    {comment.replies.map((reply) => (
                                        <div key={reply._id} className="flex space-x-3">
                                            <img
                                                src={reply.user?.avatar || '/default-avatar.png'}
                                                alt={reply.user?.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-semibold text-sm">{reply.user?.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(reply.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{reply.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
