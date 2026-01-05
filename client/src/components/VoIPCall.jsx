import React, { useState, useRef, useEffect } from 'react';
import useWebRTC from '../hooks/useWebRTC';
import ScreenRecorder from '../utils/ScreenRecorder';
import { useAuth } from '../context/AuthContext';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiPhone, FiCircle, FiStopCircle, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VoIPCall = ({ roomId, onLeave }) => {
    const { user } = useAuth();
    const {
        localStream,
        screenStream,
        peers,
        participants,
        isMuted,
        isVideoOff,
        isScreenSharing,
        toggleMute,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        leaveCall
    } = useWebRTC(roomId, user?.id, user?.name);

    const [isRecording, setIsRecording] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const localVideoRef = useRef(null);
    const screenRecorderRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    const containerRef = useRef(null);

    // Set up local video stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Handle screen share recording
    const handleToggleRecording = async () => {
        if (!isRecording) {
            // Start recording
            const streamToRecord = screenStream || localStream;
            if (!streamToRecord) {
                toast.error('No stream available to record');
                return;
            }

            if (!screenRecorderRef.current) {
                screenRecorderRef.current = new ScreenRecorder();
            }

            const started = screenRecorderRef.current.startRecording(streamToRecord);
            if (started) {
                setIsRecording(true);
                setRecordingTime(0);

                // Start timer
                recordingIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);

                toast.success('Recording started');
            } else {
                toast.error('Failed to start recording');
            }
        } else {
            // Stop recording
            try {
                await screenRecorderRef.current.downloadRecording(`voip-call-${roomId}`);
                setIsRecording(false);
                setRecordingTime(0);

                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                }

                toast.success('Recording saved!');
            } catch (error) {
                toast.error('Failed to save recording');
            }
        }
    };

    // Handle screen share
    const handleToggleScreenShare = async () => {
        if (!isScreenSharing) {
            const success = await startScreenShare();
            if (success) {
                toast.success('Screen sharing started');
            } else {
                toast.error('Failed to start screen sharing');
            }
        } else {
            stopScreenShare();
            toast.success('Screen sharing stopped');
        }
    };

    // Handle leave call
    const handleLeaveCall = () => {
        if (isRecording) {
            screenRecorderRef.current?.cleanup();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        leaveCall();
        if (onLeave) onLeave();
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Format recording time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate grid layout
    const totalParticipants = Object.keys(peers).length + 1; // +1 for local user
    const gridCols = totalParticipants === 1 ? 1 : totalParticipants === 2 ? 2 : totalParticipants <= 4 ? 2 : 3;

    return (
        <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Recording Indicator */}
            {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full">
                    <FiCircle className="w-3 h-3 animate-pulse" />
                    <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
                </div>
            )}

            {/* Room Info */}
            <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                <p className="text-sm">Room: {roomId}</p>
                <p className="text-xs text-gray-300">{totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</p>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4 overflow-auto">
                <div
                    className={`grid gap-4 h-full`}
                    style={{
                        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                        gridAutoRows: 'minmax(200px, 1fr)'
                    }}
                >
                    {/* Local Video */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden group">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                            {user?.name} (You)
                        </div>
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                        {isMuted && (
                            <div className="absolute top-2 right-2 bg-red-600 p-2 rounded-full">
                                <FiMicOff className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Remote Videos */}
                    {Object.entries(peers).map(([socketId, { stream }]) => {
                        const participant = participants.find(p => p.socketId === socketId);
                        return (
                            <RemoteVideo
                                key={socketId}
                                stream={stream}
                                userName={participant?.userName || 'Unknown'}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all ${isMuted
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? (
                        <FiMicOff className="w-6 h-6 text-white" />
                    ) : (
                        <FiMic className="w-6 h-6 text-white" />
                    )}
                </button>

                {/* Video Button */}
                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${isVideoOff
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? (
                        <FiVideoOff className="w-6 h-6 text-white" />
                    ) : (
                        <FiVideo className="w-6 h-6 text-white" />
                    )}
                </button>

                {/* Screen Share Button */}
                <button
                    onClick={handleToggleScreenShare}
                    className={`p-4 rounded-full transition-all ${isScreenSharing
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    <FiMonitor className="w-6 h-6 text-white" />
                </button>

                {/* Recording Button */}
                <button
                    onClick={handleToggleRecording}
                    className={`p-4 rounded-full transition-all ${isRecording
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? (
                        <FiStopCircle className="w-6 h-6 text-white" />
                    ) : (
                        <FiCircle className="w-6 h-6 text-white" />
                    )}
                </button>

                {/* Fullscreen Button */}
                <button
                    onClick={toggleFullscreen}
                    className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? (
                        <FiMinimize2 className="w-6 h-6 text-white" />
                    ) : (
                        <FiMaximize2 className="w-6 h-6 text-white" />
                    )}
                </button>

                {/* Hang Up Button */}
                <button
                    onClick={handleLeaveCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
                    title="Leave call"
                >
                    <FiPhone className="w-6 h-6 text-white transform rotate-135" />
                </button>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
                .rotate-135 {
                    transform: rotate(135deg);
                }
            `}</style>
        </div>
    );
};

// Remote Video Component
const RemoteVideo = ({ stream, userName }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {userName}
            </div>
            {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-white text-3xl font-bold">
                        {userName?.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoIPCall;
