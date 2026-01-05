/**
 * Socket.io handler for VoIP video calling and screen sharing
 */
export const setupVoIPSocket = (io) => {
    // Store active rooms and users
    const rooms = new Map();
    const users = new Map();

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // User joins a room
        socket.on('join-room', ({ roomId, userId, userName }) => {
            socket.join(roomId);

            // Add user to room
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            rooms.get(roomId).add(socket.id);

            // Store user info
            users.set(socket.id, { userId, userName, roomId });

            // Notify others in the room
            socket.to(roomId).emit('user-joined', {
                socketId: socket.id,
                userId,
                userName
            });

            // Send existing users in room to the new user
            const existingUsers = Array.from(rooms.get(roomId))
                .filter(id => id !== socket.id)
                .map(id => ({
                    socketId: id,
                    ...users.get(id)
                }));

            socket.emit('existing-users', existingUsers);

            console.log(`User ${userName} joined room ${roomId}`);
        });

        // WebRTC signaling - offer
        socket.on('offer', ({ offer, to }) => {
            socket.to(to).emit('offer', {
                offer,
                from: socket.id
            });
        });

        // WebRTC signaling - answer
        socket.on('answer', ({ answer, to }) => {
            socket.to(to).emit('answer', {
                answer,
                from: socket.id
            });
        });

        // WebRTC signaling - ICE candidate
        socket.on('ice-candidate', ({ candidate, to }) => {
            socket.to(to).emit('ice-candidate', {
                candidate,
                from: socket.id
            });
        });

        // Screen sharing started
        socket.on('start-screen-share', ({ roomId }) => {
            socket.to(roomId).emit('user-started-screen-share', {
                socketId: socket.id,
                userId: users.get(socket.id)?.userId
            });
        });

        // Screen sharing stopped
        socket.on('stop-screen-share', ({ roomId }) => {
            socket.to(roomId).emit('user-stopped-screen-share', {
                socketId: socket.id,
                userId: users.get(socket.id)?.userId
            });
        });

        // Recording started
        socket.on('start-recording', ({ roomId }) => {
            socket.to(roomId).emit('recording-started', {
                socketId: socket.id,
                userId: users.get(socket.id)?.userId
            });
        });

        // Recording stopped
        socket.on('stop-recording', ({ roomId }) => {
            socket.to(roomId).emit('recording-stopped', {
                socketId: socket.id,
                userId: users.get(socket.id)?.userId
            });
        });

        // Chat message
        socket.on('chat-message', ({ roomId, message }) => {
            const user = users.get(socket.id);
            io.to(roomId).emit('chat-message', {
                userId: user?.userId,
                userName: user?.userName,
                message,
                timestamp: new Date()
            });
        });

        // Leave room
        socket.on('leave-room', () => {
            handleUserDisconnect(socket);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
            handleUserDisconnect(socket);
        });

        // Helper function to handle user disconnect
        function handleUserDisconnect(socket) {
            const user = users.get(socket.id);

            if (user && user.roomId) {
                const room = rooms.get(user.roomId);

                if (room) {
                    room.delete(socket.id);

                    // Notify others in the room
                    socket.to(user.roomId).emit('user-left', {
                        socketId: socket.id,
                        userId: user.userId,
                        userName: user.userName
                    });

                    // Clean up empty rooms
                    if (room.size === 0) {
                        rooms.delete(user.roomId);
                    }
                }
            }

            users.delete(socket.id);
        }
    });

    return io;
};
