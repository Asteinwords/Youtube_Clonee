import React from 'react';
import { FiPlay, FiEye, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo, formatViews, formatDuration } from '../utils/formatters';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();

    // Safety check for undefined/null video
    if (!video) {
        return null;
    }

    return (
        <div
            className="group cursor-pointer"
        >
            {/* Mobile Layout (YouTube Style - Vertical) */}
            <div className="sm:hidden mb-4">
                {/* Full-width Thumbnail */}
                <div
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="relative w-full aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3 rounded-none"
                >
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiPlay className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    {video.duration && (
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-90 text-white text-xs font-semibold px-1 py-0.5 rounded-sm">
                            {formatDuration(video.duration)}
                        </div>
                    )}
                </div>

                {/* Video Info Below Thumbnail */}
                <div className="flex gap-3 px-3">
                    {/* Channel Avatar */}
                    {video.channel?.avatarUrl && (
                        <img
                            onClick={() => navigate(`/channel/${video.channel._id}`)}
                            src={video.channel.avatarUrl}
                            alt={video.channel.name}
                            className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer"
                        />
                    )}

                    {/* Video Details */}
                    <div className="flex-1 min-w-0">
                        <h3
                            onClick={() => navigate(`/video/${video._id}`)}
                            className="font-medium text-[15px] line-clamp-2 mb-1 leading-tight text-gray-900 dark:text-white"
                        >
                            {video.title}
                        </h3>
                        <p
                            onClick={() => navigate(`/channel/${video.channel._id}`)}
                            className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
                        >
                            {video.channel?.name || 'Unknown Channel'}
                        </p>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            <span>{formatViews(video.views)} views</span>
                            <span className="mx-1">•</span>
                            <span>{formatTimeAgo(video.createdAt)}</span>
                        </div>
                    </div>

                    {/* Three-dot menu */}
                    <button className="p-1 h-fit">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Desktop Layout (Vertical) - Hidden on mobile */}
            <div className="hidden sm:block">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-200 dark:bg-gray-800">
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiPlay className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                            <FiClock className="w-3 h-3" />
                            <span>{formatDuration(video.duration)}</span>
                        </div>
                    )}
                </div>

                {/* Video Info */}
                <div className="flex space-x-3">
                    {/* Channel Avatar */}
                    {video.channel?.avatarUrl && (
                        <img
                            src={video.channel.avatarUrl}
                            alt={video.channel.name}
                            className="w-9 h-9 rounded-full flex-shrink-0"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {video.channel?.name || 'Unknown Channel'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-2">
                            <span className="flex items-center">
                                <FiEye className="w-3 h-3 mr-1" />
                                {formatViews(video.views)} views
                            </span>
                            <span>•</span>
                            <span>{formatTimeAgo(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
