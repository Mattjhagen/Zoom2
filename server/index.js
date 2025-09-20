const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Store active rooms
const rooms = new Map();

// Store user sessions
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    
    // Store user info
    users.set(socket.id, {
      id: userId,
      name: userName,
      roomId: roomId,
      socketId: socket.id
    });

    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    // Notify others in the room
    socket.to(roomId).emit('user-connected', userId, userName);
    
    // Send current users in room to the new user
    const roomUsers = Array.from(rooms.get(roomId))
      .filter(id => id !== socket.id)
      .map(id => users.get(id))
      .filter(Boolean);
    
    socket.emit('current-users', roomUsers);

    console.log(`User ${userName} (${userId}) joined room ${roomId}`);
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const user = users.get(socket.id);
    if (user) {
      io.to(user.roomId).emit('receive-message', {
        ...data,
        senderName: user.name,
        senderId: user.id,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle user leaving
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const roomId = user.roomId;
      
      // Remove user from room
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }

      // Notify others in the room
      socket.to(roomId).emit('user-disconnected', user.id);
      
      // Remove user from users map
      users.delete(socket.id);
      
      console.log(`User ${user.name} (${user.id}) left room ${roomId}`);
    }
  });

  // Handle mute/unmute
  socket.on('toggle-audio', (isMuted) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-audio-toggled', user.id, isMuted);
    }
  });

  // Handle video toggle
  socket.on('toggle-video', (isVideoOff) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-video-toggled', user.id, isVideoOff);
    }
  });
});

// API routes
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomId => ({
    id: roomId,
    userCount: rooms.get(roomId).size
  }));
  res.json(roomList);
});

app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4();
  res.json({ roomId });
});

// Catch all handler: send back React's index.html file for any non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
