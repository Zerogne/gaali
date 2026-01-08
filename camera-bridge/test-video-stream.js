/**
 * Test Script for Real-Time Video Streaming
 * 
 * This script tests if the video stream server is working correctly by:
 * 1. Connecting to the WebSocket server
 * 2. Receiving video frames
 * 3. Verifying frame data format
 * 4. Reporting statistics
 * 
 * Usage:
 *   node test-video-stream.js [cameraId] [port]
 * 
 * Examples:
 *   node test-video-stream.js camera-1 3004
 *   node test-video-stream.js camera-2 3004
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Configuration
const CAMERA_ID = process.argv[2] || 'camera-1';
const WS_PORT = parseInt(process.argv[3] || process.env.VIDEO_WS_PORT || '3004', 10);
const WS_URL = `ws://localhost:${WS_PORT}/video/${CAMERA_ID}`;
const TEST_DURATION = 10000; // 10 seconds
const SAVE_FRAMES = process.argv.includes('--save-frames'); // Save frames to disk

// Statistics
let stats = {
  connected: false,
  framesReceived: 0,
  framesParsed: 0,
  framesWithData: 0,
  errors: 0,
  startTime: null,
  endTime: null,
  frameSizes: [],
  frameTypes: new Map(),
  lastFrameTime: null,
  frameIntervals: []
};

// Frame storage (if saving)
const framesDir = path.join(__dirname, 'test-frames');
if (SAVE_FRAMES && !fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

console.log('🧪 Video Stream Test');
console.log('='.repeat(60));
console.log(`Camera ID: ${CAMERA_ID}`);
console.log(`WebSocket URL: ${WS_URL}`);
console.log(`Test Duration: ${TEST_DURATION / 1000} seconds`);
console.log(`Save Frames: ${SAVE_FRAMES ? 'Yes' : 'No'}`);
console.log('='.repeat(60));
console.log('');

// Create WebSocket connection
console.log(`📡 Connecting to ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket connected!');
  stats.connected = true;
  stats.startTime = Date.now();
  
  console.log('⏳ Waiting for video frames...');
  console.log('');
  
  // Set timeout to end test
  setTimeout(() => {
    stats.endTime = Date.now();
    endTest();
  }, TEST_DURATION);
});

ws.on('message', (data) => {
  handleMessage(data);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  stats.errors++;
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 WebSocket closed (code: ${code}, reason: ${reason || 'none'})`);
  if (!stats.endTime) {
    stats.endTime = Date.now();
    endTest();
  }
});

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(data) {
  try {
    // Check if it's a Blob
    if (data instanceof Buffer) {
      console.log('📨 Received binary data (Buffer)');
      stats.framesReceived++;
      return;
    }

    // Try to parse as JSON
    const message = JSON.parse(data.toString());
    stats.framesReceived++;

    // Log message type
    if (!stats.frameTypes.has(message.type)) {
      stats.frameTypes.set(message.type, 0);
    }
    stats.frameTypes.set(message.type, stats.frameTypes.get(message.type) + 1);

    // Handle different message types
    if (message.type === 'connected') {
      console.log(`✅ Connection confirmed: ${message.message || 'Connected'}`);
      if (message.cameraId) {
        console.log(`   Camera ID: ${message.cameraId}`);
      }
      return;
    }

    if (message.type === 'frame') {
      stats.framesParsed++;
      
      // Check if frame has data
      if (message.data && typeof message.data === 'string') {
        stats.framesWithData++;
        const dataLength = message.data.length;
        stats.frameSizes.push(dataLength);

        // Calculate frame rate
        const now = Date.now();
        if (stats.lastFrameTime) {
          const interval = now - stats.lastFrameTime;
          stats.frameIntervals.push(interval);
        }
        stats.lastFrameTime = now;

        // Log frame info (every 10th frame to avoid spam)
        if (stats.framesWithData % 10 === 0) {
          const fps = stats.frameIntervals.length > 0
            ? (1000 / (stats.frameIntervals.slice(-10).reduce((a, b) => a + b, 0) / 10)).toFixed(1)
            : 'N/A';
          console.log(`📹 Frame #${stats.framesWithData}: ${(dataLength / 1024).toFixed(1)} KB, ~${fps} FPS`);
        }

        // Save frame if requested
        if (SAVE_FRAMES) {
          saveFrame(message.data, stats.framesWithData);
        }
      } else {
        console.warn('⚠️ Frame message has no data or invalid format');
      }
    } else {
      console.log(`ℹ️ Received message type: ${message.type}`);
    }

  } catch (error) {
    console.error('❌ Error parsing message:', error.message);
    stats.errors++;
  }
}

/**
 * Save frame to disk
 */
function saveFrame(base64Data, frameNumber) {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = path.join(framesDir, `frame-${CAMERA_ID}-${frameNumber.toString().padStart(5, '0')}.jpg`);
    fs.writeFileSync(filename, buffer);
    
    if (frameNumber % 10 === 0) {
      console.log(`💾 Saved frame ${frameNumber} to ${filename}`);
    }
  } catch (error) {
    console.error(`❌ Error saving frame ${frameNumber}:`, error.message);
  }
}

/**
 * End test and print statistics
 */
function endTest() {
  const duration = (stats.endTime - stats.startTime) / 1000;
  const avgFPS = stats.frameIntervals.length > 0
    ? (1000 / (stats.frameIntervals.reduce((a, b) => a + b, 0) / stats.frameIntervals.length)).toFixed(2)
    : 0;
  
  const avgFrameSize = stats.frameSizes.length > 0
    ? (stats.frameSizes.reduce((a, b) => a + b, 0) / stats.frameSizes.length / 1024).toFixed(2)
    : 0;

  const minInterval = stats.frameIntervals.length > 0
    ? Math.min(...stats.frameIntervals)
    : null;
  const maxInterval = stats.frameIntervals.length > 0
    ? Math.max(...stats.frameIntervals)
    : null;

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results');
  console.log('='.repeat(60));
  console.log(`✅ Connected: ${stats.connected ? 'Yes' : 'No'}`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📨 Total Messages: ${stats.framesReceived}`);
  console.log(`📹 Frames Parsed: ${stats.framesParsed}`);
  console.log(`🖼️  Frames with Data: ${stats.framesWithData}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log('');
  
  if (stats.framesWithData > 0) {
    console.log('📈 Frame Statistics:');
    console.log(`   Average FPS: ${avgFPS}`);
    console.log(`   Average Frame Size: ${avgFrameSize} KB`);
    if (minInterval !== null && maxInterval !== null) {
      console.log(`   Min Interval: ${minInterval} ms`);
      console.log(`   Max Interval: ${maxInterval} ms`);
    }
    console.log('');
  }

  if (stats.frameTypes.size > 0) {
    console.log('📋 Message Types:');
    for (const [type, count] of stats.frameTypes.entries()) {
      console.log(`   ${type}: ${count}`);
    }
    console.log('');
  }

  // Test result
  console.log('='.repeat(60));
  if (stats.connected && stats.framesWithData > 0) {
    console.log('✅ TEST PASSED: Video streaming is working!');
    console.log(`   Received ${stats.framesWithData} frames in ${duration.toFixed(2)} seconds`);
    if (parseFloat(avgFPS) > 0) {
      console.log(`   Frame rate: ~${avgFPS} FPS`);
    }
  } else if (stats.connected && stats.framesReceived > 0) {
    console.log('⚠️  TEST PARTIAL: Connected but no valid frames received');
    console.log('   Check if camera SDK is sending frames');
  } else if (stats.connected) {
    console.log('❌ TEST FAILED: Connected but no messages received');
    console.log('   Check if video stream server is broadcasting frames');
  } else {
    console.log('❌ TEST FAILED: Could not connect to WebSocket');
    console.log(`   Make sure video stream server is running on port ${WS_PORT}`);
  }
  console.log('='.repeat(60));

  if (SAVE_FRAMES && stats.framesWithData > 0) {
    console.log(`\n💾 Saved ${stats.framesWithData} frames to: ${framesDir}`);
  }

  process.exit(stats.connected && stats.framesWithData > 0 ? 0 : 1);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  if (stats.startTime && !stats.endTime) {
    stats.endTime = Date.now();
    endTest();
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  if (stats.startTime && !stats.endTime) {
    stats.endTime = Date.now();
    endTest();
  }
});
