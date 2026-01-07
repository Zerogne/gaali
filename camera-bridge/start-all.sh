#!/bin/bash

# Start all camera bridge services
# This script starts the video stream server and optionally the main server

echo "🚀 Starting Camera Bridge Services..."

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 found, starting all services..."
    pm2 start ecosystem.config.js
    pm2 save
    echo "✅ All services started!"
    echo ""
    echo "📊 Check status: pm2 status"
    echo "📋 View logs: pm2 logs"
    echo "🛑 Stop all: pm2 stop all"
else
    echo "⚠️  PM2 not found. Starting video stream server directly..."
    echo "💡 Install PM2 for better process management: npm install -g pm2"
    echo ""
    
    # Start video stream server in background
    node video-stream-server.js &
    VIDEO_PID=$!
    echo "✅ Video stream server started (PID: $VIDEO_PID)"
    echo ""
    echo "🛑 To stop: kill $VIDEO_PID"
    echo "📋 To check if running: curl http://localhost:3004/health"
fi

