import React, { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiSettings } from 'react-icons/fi';
import GestureDetector from '../utils/gestureDetector';

const VideoPlayer = ({ videoUrl, onNext, onShowComments }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const gestureDetectorRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [gestureFeedback, setGestureFeedback] = useState(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            setProgress((video.currentTime / video.duration) * 100);
        };

        const updateDuration = () => {
            setDuration(video.duration);
        };

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', updateDuration);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    // Initialize gesture detector
    useEffect(() => {
        if (!containerRef.current) return;

        gestureDetectorRef.current = new GestureDetector(
            containerRef.current,
            {
                onSingleTapCenter: () => {
                    handlePlayPause();
                },
                onDoubleTapLeft: () => {
                    seekBackward(10);
                    showFeedback('⏪ -10s', 'left');
                },
                onDoubleTapRight: () => {
                    seekForward(10);
                    showFeedback('⏩ +10s', 'right');
                },
                onTripleTapLeft: () => {
                    if (onShowComments) {
                        onShowComments();
                        showFeedback('💬 Comments', 'left');
                    }
                },
                onTripleTapCenter: () => {
                    if (onNext) {
                        onNext();
                        showFeedback('⏭️ Next Video', 'center');
                    }
                },
                onTripleTapRight: () => {
                    if (window.confirm('Close website?')) {
                        window.close();
                    }
                }
            }
        );

        return () => {
            gestureDetectorRef.current?.destroy();
        };
    }, [onNext, onShowComments]);

    // Keyboard controls (YouTube-like)
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Don't trigger shortcuts if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const video = videoRef.current;
            if (!video) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    handlePlayPause();
                    showFeedback(video.paused ? '▶️ Play' : '⏸️ Pause', 'center');
                    break;

                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    seekForward(10);
                    showFeedback('⏩ +10s', 'right');
                    break;

                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    seekBackward(10);
                    showFeedback('⏪ -10s', 'left');
                    break;

                case 'arrowup':
                    e.preventDefault();
                    const newVolumeUp = Math.min(video.volume + 0.05, 1);
                    video.volume = newVolumeUp;
                    showFeedback(`🔊 ${Math.round(newVolumeUp * 100)}%`, 'center');
                    break;

                case 'arrowdown':
                    e.preventDefault();
                    const newVolumeDown = Math.max(video.volume - 0.05, 0);
                    video.volume = newVolumeDown;
                    showFeedback(`🔉 ${Math.round(newVolumeDown * 100)}%`, 'center');
                    break;

                case 'm':
                    e.preventDefault();
                    toggleMute();
                    showFeedback(video.muted ? '🔇 Muted' : '🔊 Unmuted', 'center');
                    break;

                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    showFeedback('⛶ Fullscreen', 'center');
                    break;

                // Number keys for seeking to percentage
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const percentage = parseInt(e.key) * 10;
                    video.currentTime = (video.duration * percentage) / 100;
                    showFeedback(`⏩ ${percentage}%`, 'center');
                    break;

                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handlePlayPause = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const seekForward = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
                videoRef.current.currentTime + seconds,
                videoRef.current.duration
            );
        }
    };

    const seekBackward = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
                videoRef.current.currentTime - seconds,
                0
            );
        }
    };

    const showFeedback = (text, position = 'center') => {
        setGestureFeedback({ text, position });
        setTimeout(() => {
            setGestureFeedback(null);
        }, 800);
    };

    const toggleMute = () => {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        if (containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen();
        }
    };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className="video-player-container relative bg-black rounded-lg overflow-hidden"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Gesture Feedback Overlay */}
            {gestureFeedback && (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 ${gestureFeedback.position === 'left' ? 'justify-start pl-16' :
                    gestureFeedback.position === 'right' ? 'justify-end pr-16' :
                        'justify-center'
                    }`}>
                    <div className="bg-black bg-opacity-70 text-white px-8 py-6 rounded-2xl text-4xl font-bold animate-pulse">
                        {gestureFeedback.text}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress Bar */}
                <div
                    className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        <button onClick={handlePlayPause} className="hover:scale-110 transition-transform">
                            {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
                        </button>
                        <button onClick={toggleMute} className="hover:scale-110 transition-transform">
                            {isMuted ? <FiVolumeX className="w-6 h-6" /> : <FiVolume2 className="w-6 h-6" />}
                        </button>
                        <span className="text-sm">
                            {formatTime(videoRef.current?.currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="hover:scale-110 transition-transform">
                            <FiSettings className="w-5 h-5" />
                        </button>
                        <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                            <FiMaximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VideoPlayer;
