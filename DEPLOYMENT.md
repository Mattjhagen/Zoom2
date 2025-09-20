# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your app will be live at `https://your-app.vercel.app`

### Option 2: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - **Build Command**: `npm run install-all`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
4. Deploy!

### Option 3: Heroku
1. Install Heroku CLI
2. Run these commands:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```
3. Your app will be live at `https://your-app-name.herokuapp.com`

### Option 4: Netlify (Frontend only)
1. Build the project: `npm run build`
2. Drag the `client/build` folder to Netlify
3. Note: This only deploys the frontend - you'll need a separate backend

## Environment Variables

For production deployment, you may need to set:
- `NODE_ENV=production`
- `PORT=5000` (or whatever port your hosting service uses)

## Features Included

✅ **Video Conferencing**: WebRTC peer-to-peer video calls
✅ **Real-time Chat**: Socket.io powered messaging
✅ **Screen Sharing**: Share your screen with participants
✅ **Room Management**: Create and join video rooms
✅ **Responsive Design**: Works on desktop and mobile
✅ **Modern UI**: Beautiful, Zoom-like interface

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Troubleshooting

### Common Issues:
1. **WebRTC not working**: Ensure HTTPS in production
2. **Socket connection failed**: Check CORS settings
3. **Build fails**: Make sure all dependencies are installed

### Local Development:
```bash
npm run install-all
npm run dev
```

### Production Build:
```bash
npm run build
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Ensure all environment variables are set
3. Verify the hosting service supports WebRTC
4. Check that both frontend and backend are deployed
