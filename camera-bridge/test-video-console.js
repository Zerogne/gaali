/**
 * Simple Browser Console Test for Video Streaming
 * 
 * Copy and paste this code into your browser console (F12) to test video streaming
 * 
 * Usage:
 * 1. Open your web app in browser
 * 2. Press F12 to open DevTools
 * 3. Go to Console tab
 * 4. Copy and paste this entire code
 * 5. Press Enter
 */

(function testVideoStream() {
  console.log('🧪 Starting Video Stream Test...');
  console.log('='.repeat(60));
  
  const cameraId = 'camera-1'; // Change to 'camera-2' if needed
  const wsPort = 3004;
  const wsUrl = `ws://localhost:${wsPort}/video/${cameraId}`;
  
  console.log(`📡 Connecting to: ${wsUrl}`);
  
  let stats = {
    connected: false,
    framesReceived: 0,
    framesParsed: 0,
    errors: 0,
    startTime: null,
    lastFrameTime: null,
    frameIntervals: []
  };
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('✅ WebSocket CONNECTED!');
    stats.connected = true;
    stats.startTime = Date.now();
  };
  
  ws.onmessage = (event) => {
    stats.framesReceived++;
    
    console.log(`📨 Message #${stats.framesReceived} received:`, {
      isBlob: event.data instanceof Blob,
      isString: typeof event.data === 'string',
      length: event.data?.length || 0,
      preview: typeof event.data === 'string' ? event.data.substring(0, 100) : 'blob'
    });
    
    try {
      const message = JSON.parse(event.data);
      stats.framesParsed++;
      
      console.log(`📨 Parsed message #${stats.framesParsed}:`, {
        type: message.type,
        hasData: !!message.data,
        dataLength: message.data?.length || 0,
        timestamp: message.timestamp
      });
      
      if (message.type === 'connected') {
        console.log('✅ Connection confirmed:', message);
      } else if (message.type === 'frame') {
        const now = Date.now();
        if (stats.lastFrameTime) {
          const interval = now - stats.lastFrameTime;
          stats.frameIntervals.push(interval);
          const fps = (1000 / interval).toFixed(1);
          console.log(`📹 FRAME #${stats.framesParsed} received! (~${fps} FPS, ${(message.data.length / 1024).toFixed(1)} KB)`);
        } else {
          console.log(`📹 FRAME #${stats.framesParsed} received! (${(message.data.length / 1024).toFixed(1)} KB)`);
        }
        stats.lastFrameTime = now;
      } else {
        console.log(`ℹ️ Other message type: ${message.type}`);
      }
    } catch (err) {
      console.error('❌ Parse error:', err);
      stats.errors++;
    }
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket ERROR:', error);
    stats.errors++;
  };
  
  ws.onclose = (event) => {
    console.log('🔌 WebSocket CLOSED:', {
      code: event.code,
      reason: event.reason || 'none',
      wasClean: event.wasClean
    });
    
    const duration = stats.startTime ? ((Date.now() - stats.startTime) / 1000).toFixed(2) : 0;
    const avgFPS = stats.frameIntervals.length > 0
      ? (1000 / (stats.frameIntervals.reduce((a, b) => a + b, 0) / stats.frameIntervals.length)).toFixed(2)
      : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results:');
    console.log('='.repeat(60));
    console.log(`Connected: ${stats.connected ? '✅ Yes' : '❌ No'}`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Total Messages: ${stats.framesReceived}`);
    console.log(`Frames Parsed: ${stats.framesParsed}`);
    console.log(`Errors: ${stats.errors}`);
    if (avgFPS > 0) {
      console.log(`Average FPS: ${avgFPS}`);
    }
    console.log('='.repeat(60));
    
    if (stats.connected && stats.framesParsed > 0) {
      console.log('✅ TEST PASSED: Video streaming is working!');
    } else if (stats.connected) {
      console.log('⚠️ TEST PARTIAL: Connected but no frames received');
    } else {
      console.log('❌ TEST FAILED: Could not connect');
    }
  };
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('\n⏱️ Test timeout (10 seconds), closing connection...');
      ws.close();
    }
  }, 10000);
  
  console.log('⏳ Waiting for connection and frames (10 second test)...');
  console.log('💡 Check the logs above to see what\'s happening');
})();
