import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VoIPCall from '../components/VoIPCall';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { FiVideo, FiCopy, FiCheck, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VoIPPage = () => {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { isOpen } = useSidebar();

    const [roomId, setRoomId] = useState(urlRoomId || '');
    const [inCall, setInCall] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please sign in to use video calling');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (urlRoomId) {
            setRoomId(urlRoomId);
            setInCall(true);
        }
    }, [urlRoomId]);

    const generateRoomId = () => {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setRoomId(id);
        return id;
    };

    const handleCreateRoom = () => {
        const newRoomId = generateRoomId();
        navigate(`/call/${newRoomId}`);
        setInCall(true);
    };

    const handleJoinRoom = () => {
        if (!roomId.trim()) {
            toast.error('Please enter a room ID');
            return;
        }
        navigate(`/call/${roomId}`);
        setInCall(true);
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/call/${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeaveCall = () => {
        setInCall(false);
        navigate('/call');
    };

    if (inCall && roomId) {
        return <VoIPCall roomId={roomId} onLeave={handleLeaveCall} />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Navbar />
            <div className="flex pt-14">
                <Sidebar />
                <main className={`flex-1 transition-all duration-200 ${isOpen ? 'ml-60' : 'ml-[72px]'}`}>
                    <div className="p-8">
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
                                    <FiVideo className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold mb-2">Video Calling</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Connect with friends through high-quality video calls
                                </p>
                            </div>

                            {/* Main Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {/* Create New Call */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <FiVideo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Start New Call</h2>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Create a new video call room and invite your friends
                                    </p>
                                    <button
                                        onClick={handleCreateRoom}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                                    >
                                        Create New Room
                                    </button>
                                </div>

                                {/* Join Existing Call */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                            <FiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Join Call</h2>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Enter a room ID to join an existing call
                                    </p>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            placeholder="Enter room ID"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                        />
                                        <button
                                            onClick={handleJoinRoom}
                                            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
                                        >
                                            Join Room
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
                                <h3 className="text-2xl font-bold mb-6 text-center">Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FiVideo className="w-8 h-8 text-white" />
                                        </div>
                                        <h4 className="font-semibold mb-2">HD Video Quality</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Crystal clear video up to 720p
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold mb-2">Screen Sharing</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Share your YouTube tab with others
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold mb-2">Session Recording</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Record and save calls locally
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Share Room Link (if room exists) */}
                            {roomId && !inCall && (
                                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold mb-3">Share Room Link</h3>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={`${window.location.origin}/call/${roomId}`}
                                            readOnly
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
                                        >
                                            {copied ? (
                                                <>
                                                    <FiCheck className="w-5 h-5" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiCopy className="w-5 h-5" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VoIPPage;
