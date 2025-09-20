#!/bin/bash

echo "🚀 Starting build process..."

# Install all dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Build the React app
echo "🔨 Building React app..."
cd client && npm run build && cd ..

echo "✅ Build completed successfully!"
echo "📁 Build directory contents:"
ls -la client/build/ || echo "Build directory not found"

echo "🎯 Ready for deployment!"
