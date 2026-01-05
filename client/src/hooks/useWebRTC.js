import { useState, useEffect, useRef, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { getSocket } from '../utils/api';

/**
 * Custom hook for managing WebRTC peer connections
 * Handles video/audio streams, screen sharing, and signaling
 */
const useWebRTC = (roomId, userId, userName) => {
    const [peers, setPeers] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participants, setParticipants] = useState([]);

    const peersRef = useRef({});
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);

    // WebRTC configuration
    const peerConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    };

    /**
     * Initialize local media stream
     */
    const initializeMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error('Failed to get local stream:', error);
            throw error;
        }
    }, []);

    /**
     * Create a new peer connection
     */
    const createPeer = useCallback((socketId, initiator, stream) => {
        const peer = new SimplePeer({
            initiator,
            trickle: true,
            stream,
            config: peerConfig
        });

        peer.on('signal', (signal) => {
            if (initiator) {
                socketRef.current.emit('offer', { offer: signal, to: socketId });
            } else {
                socketRef.current.emit('answer', { answer: signal, to: socketId });
            }
        });

        peer.on('stream', (remoteStream) => {
            console.log('Received remote stream from:', socketId);
            setPeers(prev => ({
                ...prev,
                [socketId]: { ...prev[socketId], stream: remoteStream }
            }));
        });

        peer.on('error', (error) => {
            console.error('Peer error:', error);
        });

        peer.on('close', () => {
            console.log('Peer connection closed:', socketId);
            removePeer(socketId);
        });

        peersRef.current[socketId] = peer;
        setPeers(prev => ({
            ...prev,
            [socketId]: { peer, stream: null }
        }));

        return peer;
    }, []);

    /**
     * Remove a peer connection
     */
    const removePeer = useCallback((socketId) => {
        if (peersRef.current[socketId]) {
            peersRef.current[socketId].destroy();
            delete peersRef.current[socketId];
        }
        setPeers(prev => {
            const newPeers = { ...prev };
            delete newPeers[socketId];
            return newPeers;
        });
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    }, []);

    /**
     * Toggle mute/unmute
     */
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, []);

    /**
     * Toggle video on/off
     */
    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, []);

    /**
     * Start screen sharing
     */
    const startScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'browser'
                },
                audio: false
            });

            screenStreamRef.current = stream;
            setScreenStream(stream);
            setIsScreenSharing(true);

            // Replace video track in all peer connections
            const videoTrack = stream.getVideoTracks()[0];
            Object.values(peersRef.current).forEach(peer => {
                const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });

            // Handle screen share stop
            videoTrack.onended = () => {
                stopScreenShare();
            };

            // Notify others
            socketRef.current.emit('start-screen-share', { roomId });

            return true;
        } catch (error) {
            console.error('Failed to start screen share:', error);
            return false;
        }
    }, [roomId]);

    /**
     * Stop screen sharing
     */
    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
            setIsScreenSharing(false);

            // Restore camera video track
            if (localStreamRef.current) {
                const videoTrack = localStreamRef.current.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(peer => {
                    const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });
            }

            // Notify others
            socketRef.current.emit('stop-screen-share', { roomId });
        }
    }, [roomId]);

    /**
     * Leave the call
     */
    const leaveCall = useCallback(() => {
        // Stop all tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Close all peer connections
        Object.keys(peersRef.current).forEach(socketId => {
            removePeer(socketId);
        });

        // Leave room
        if (socketRef.current) {
            socketRef.current.emit('leave-room');
            socketRef.current.disconnect();
        }

        setLocalStream(null);
        setScreenStream(null);
        setPeers({});
        setParticipants([]);
    }, [removePeer]);

    /**
     * Initialize socket and join room
     */
    useEffect(() => {
        if (!roomId || !userId || !userName) return;

        const socket = getSocket();
        socketRef.current = socket;

        const setupSocket = async () => {
            // Initialize media first
            const stream = await initializeMedia();

            // Connect socket
            socket.connect();

            // Join room
            socket.emit('join-room', { roomId, userId, userName });

            // Handle existing users
            socket.on('existing-users', (users) => {
                console.log('Existing users:', users);
                setParticipants(users);

                // Create peer connections for existing users
                users.forEach(user => {
                    createPeer(user.socketId, true, stream);
                });
            });

            // Handle new user joined
            socket.on('user-joined', ({ socketId, userId: newUserId, userName: newUserName }) => {
                console.log('User joined:', newUserName);
                setParticipants(prev => [...prev, { socketId, userId: newUserId, userName: newUserName }]);
                createPeer(socketId, false, stream);
            });

            // Handle offer
            socket.on('offer', ({ offer, from }) => {
                const peer = peersRef.current[from];
                if (peer) {
                    peer.signal(offer);
                }
            });

            // Handle answer
            socket.on('answer', ({ answer, from }) => {
                const peer = peersRef.current[from];
                if (peer) {
                    peer.signal(answer);
                }
            });

            // Handle ICE candidate
            socket.on('ice-candidate', ({ candidate, from }) => {
                const peer = peersRef.current[from];
                if (peer) {
                    peer.signal(candidate);
                }
            });

            // Handle user left
            socket.on('user-left', ({ socketId }) => {
                console.log('User left:', socketId);
                removePeer(socketId);
            });

            // Handle screen share events
            socket.on('user-started-screen-share', ({ socketId }) => {
                console.log('User started screen share:', socketId);
                // Update UI to show screen share indicator
            });

            socket.on('user-stopped-screen-share', ({ socketId }) => {
                console.log('User stopped screen share:', socketId);
                // Update UI to remove screen share indicator
            });
        };

        setupSocket();

        // Cleanup
        return () => {
            leaveCall();
        };
    }, [roomId, userId, userName, initializeMedia, createPeer, removePeer, leaveCall]);

    return {
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
    };
};

export default useWebRTC;
