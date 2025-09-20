const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? ["https://www.cmameet.site", "https://cmameet.site"] : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active rooms
const rooms = new Map();

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

app.get('/api/rooms', (req, res) => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    participantCount: room.participants.size,
    createdAt: room.createdAt
  }));
  res.json(roomsList);
});

app.post('/api/rooms', (req, res) => {
  console.log('POST /api/rooms called with body:', req.body);
  const { roomId } = req.body;
  const id = roomId || uuidv4().substring(0, 6).toUpperCase();
  
  if (!rooms.has(id)) {
    rooms.set(id, {
      id,
      participants: new Set(),
      createdAt: new Date()
    });
    console.log(`Created new room: ${id}`);
  } else {
    console.log(`Room ${id} already exists`);
  }
  
  res.json({ success: true, roomId: id });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({ success: true, room: { ...room, participants: Array.from(room.participants) } });
  } else {
    res.json({ success: false, message: 'Room not found' });
  }
});

// Serve static files from the React app build directory first (in production)
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible build locations for Render
  const buildPaths = [
    path.join(__dirname, '../client/build'),
    path.join(__dirname, '../../client/build'),
    path.join(__dirname, '../build'),
    path.join(__dirname, '../../build'),
    path.join(process.cwd(), 'client/build'),
    path.join(process.cwd(), 'build'),
    path.join(process.cwd(), 'src/client/build'),
    path.join(process.cwd(), '../client/build'),
    path.join(process.cwd(), '../../client/build'),
    path.join('/opt/render/project/src/client/build'), // Render specific path
    path.join('/opt/render/project/client/build') // Render specific path
  ];
  
  let staticPath = null;
  for (const buildPath of buildPaths) {
    if (require('fs').existsSync(buildPath)) {
      app.use(express.static(buildPath));
      staticPath = buildPath;
      console.log(`✅ Serving static files from: ${buildPath}`);
      break;
    }
  }
  
  if (!staticPath) {
    console.log('❌ No build directory found. Available directories:');
    console.log('Current working directory:', process.cwd());
    console.log('Server directory:', __dirname);
    require('fs').readdirSync(process.cwd()).forEach(dir => {
      console.log('-', dir);
    });
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
    
    // Add user to room
    if (rooms.has(roomId)) {
      rooms.get(roomId).participants.add(userId);
    }
    
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  socket.on('leave-room', (roomId, userId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', userId);
    
    // Remove user from room
    if (rooms.has(roomId)) {
      rooms.get(roomId).participants.delete(userId);
    }
  });
});

// Serve static files from React build directory
const buildPath = path.join(__dirname, '../client/build');
if (require('fs').existsSync(buildPath)) {
  console.log('✅ Serving static files from React build directory');
  app.use(express.static(buildPath));
} else {
  console.log('⚠️  React build directory not found, serving from public directory');
  app.use(express.static(path.join(__dirname, '../public')));
}

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
    // Try multiple possible index.html locations
    const indexPaths = [
      path.join(__dirname, '../client/build/index.html'),
      path.join(__dirname, '../../client/build/index.html'),
      path.join(__dirname, '../build/index.html'),
      path.join(__dirname, '../../build/index.html'),
      path.join(process.cwd(), 'client/build/index.html'),
      path.join(process.cwd(), 'build/index.html'),
      path.join(process.cwd(), 'src/client/build/index.html'),
      path.join(process.cwd(), '../client/build/index.html'),
      path.join(process.cwd(), '../../client/build/index.html'),
      path.join('/opt/render/project/src/client/build/index.html'), // Render specific path
      path.join('/opt/render/project/client/build/index.html') // Render specific path
    ];
    
    for (const indexPath of indexPaths) {
      if (require('fs').existsSync(indexPath)) {
        console.log(`✅ Serving index.html from: ${indexPath}`);
        return res.sendFile(indexPath);
      }
    }
    
    console.log('❌ React build not found. Tried paths:');
    indexPaths.forEach(p => console.log('-', p));
    
    // Fallback to public/index.html
    const fallbackPath = path.join(__dirname, '../public/index.html');
    if (require('fs').existsSync(fallbackPath)) {
      console.log('✅ Serving fallback index.html from public directory');
      return res.sendFile(fallbackPath);
    }
    
    res.status(404).send('Frontend not available. Check server logs for details.');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
