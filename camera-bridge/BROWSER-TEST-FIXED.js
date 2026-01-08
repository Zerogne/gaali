// BROWSER CONSOLE TEST - FIXED VERSION
// Make sure you're in BROWSER console (F12), not Node.js terminal!

(function testVideoStream() {
  // Check if we're in browser
  if (typeof window === 'undefined') {
    console.error('❌ This test must be run in BROWSER console, not Node.js!');
    console.log('💡 Press F12 in your browser, go to Console tab, then paste this code');
    return;
  }

  // Use window.WebSocket explicitly
  const WebSocket = window.WebSocket;
  
  if (!WebSocket) {
    console.error('❌ WebSocket is not supported in this browser');
    return;
  }

  console.log('🧪 TEST STARTING...');
  console.log('📡 Connecting to: ws://localhost:3004/video/camera-1');
  
  const ws = new WebSocket('ws://localhost:3004/video/camera-1');
  let count = 0;
  let frames = 0;
  
  ws.onopen = () => {
    console.log('✅ CONNECTED!');
    console.log('⏳ Waiting for messages (10 second test)...');
  };
  
  ws.onmessage = (e) => {
    count++;
    console.log(`📨 Message #${count}:`, {
      type: typeof e.data,
      length: e.data?.length || 0,
      isBlob: e.data instanceof Blob,
      isString: typeof e.data === 'string'
    });
    
    try {
      const m = JSON.parse(e.data);
      console.log(`   ✅ Parsed JSON:`, {
        type: m.type,
        hasData: !!m.data,
        dataLength: m.data?.length || 0
      });
      
      if (m.type === 'frame') {
        frames++;
        console.log(`   📹 FRAME #${frames} RECEIVED!`);
      } else if (m.type === 'connected') {
        console.log(`   ✅ Connection confirmed: ${m.message || 'Connected'}`);
      }
    } catch (err) {
      console.log('   ❌ Not JSON:', err.message);
    }
  };
  
  ws.onerror = (e) => {
    console.error('❌ WebSocket ERROR:', e);
    console.error('   Check if Electron app is running');
    console.error('   Check if video stream server started on port 3004');
  };
  
  ws.onclose = (event) => {
    console.log('🔌 WebSocket CLOSED');
    console.log(`📊 Results: ${count} messages, ${frames} frames`);
    
    if (count === 0) {
      console.log('❌ No messages received - check Electron app');
    } else if (frames === 0) {
      console.log('⚠️ Messages received but no frames - check camera SDK');
    } else {
      console.log('✅ TEST PASSED! Frames are being received');
    }
  };
  
  // Auto-close after 10 seconds
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      console.log('⏱️ Test timeout, closing...');
      ws.close();
    }
  }, 10000);
})();
