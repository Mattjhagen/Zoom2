# Zoom Clone - Free Video Conferencing App

A modern, free alternative to Zoom built with React, Node.js, and WebRTC. This application provides real-time video conferencing, chat, and screen sharing capabilities.

## Features

- 🎥 **Video Conferencing**: High-quality video calls with multiple participants
- 🎤 **Audio Controls**: Mute/unmute functionality
- 📹 **Video Controls**: Turn camera on/off
- 🖥️ **Screen Sharing**: Share your screen with other participants
- 💬 **Real-time Chat**: Text messaging during video calls
- 🏠 **Room Management**: Create and join video rooms
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Secure**: Peer-to-peer connections with WebRTC

## Tech Stack

### Frontend
- React 18
- Styled Components
- Socket.io Client
- React Router
- Lucide React (Icons)

### Backend
- Node.js
- Express
- Socket.io
- CORS
- UUID

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zoom-clone
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating a Room
1. Enter your name
2. Click "Create Room"
3. Share the room ID with others

### Joining a Room
1. Enter your name
2. Enter the room ID
3. Click "Join Room"

### During a Call
- **Mute/Unmute**: Click the microphone button
- **Turn Video On/Off**: Click the camera button
- **Share Screen**: Click the monitor button
- **Chat**: Click the chat icon to open/close the chat panel
- **Leave**: Click the phone button to leave the call

## Project Structure

```
zoom-clone/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── HomePage.js
│   │   │   ├── VideoRoom.js
│   │   │   ├── VideoGrid.js
│   │   │   ├── Controls.js
│   │   │   └── Chat.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Server Endpoints
- `GET /api/rooms` - Get list of active rooms
- `POST /api/rooms` - Create a new room

### Socket.io Events
- `join-room` - Join a video room
- `user-connected` - User joined the room
- `user-disconnected` - User left the room
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate
- `send-message` - Send chat message
- `receive-message` - Receive chat message
- `toggle-audio` - Toggle audio mute
- `toggle-video` - Toggle video on/off

## Browser Compatibility

This application works best with modern browsers that support:
- WebRTC
- getUserMedia API
- WebSocket connections

**Supported Browsers:**
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Camera/Microphone not working**
   - Ensure you've granted camera and microphone permissions
   - Check if other applications are using the camera
   - Try refreshing the page

2. **Connection issues**
   - Check your internet connection
   - Ensure the server is running on port 5000
   - Check browser console for errors

3. **Screen sharing not working**
   - Ensure you're using HTTPS (required for screen sharing)
   - Check browser permissions for screen sharing
   - Try a different browser

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure all dependencies are installed correctly
3. Verify that both frontend and backend servers are running
4. Check that your browser supports WebRTC

## Future Enhancements

- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] File sharing
- [ ] Meeting scheduling
- [ ] User authentication
- [ ] Mobile app
- [ ] Advanced moderation tools

---

**Note**: This is a demonstration project. For production use, consider implementing additional security measures, user authentication, and scalability improvements.
