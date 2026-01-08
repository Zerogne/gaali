// ROBUST BROWSER CONSOLE TEST
// This version checks for WebSocket in multiple ways

(function testVideoStream() {
  console.log('🧪 Starting test...');
  console.log('='.repeat(60));
  
  // Check environment
  console.log('📋 Environment Check:');
  console.log('   window:', typeof window);
  console.log('   document:', typeof document);
  console.log('   location:', typeof location);
  
  // Try to find WebSocket
  let WebSocket = null;
  
  if (typeof window !== 'undefined' && window.WebSocket) {
    WebSocket = window.WebSocket;
    console.log('   ✅ Found: window.WebSocket');
  } else if (typeof WebSocket !== 'undefined') {
    WebSocket = WebSocket;
    console.log('   ✅ Found: global WebSocket');
  } else if (typeof self !== 'undefined' && self.WebSocket) {
    WebSocket = self.WebSocket;
    console.log('   ✅ Found: self.WebSocket');
  } else {
    console.error('   ❌ WebSocket not found!');
    console.error('');
    console.error('💡 Possible issues:');
    console.error('   1. You might be in Node.js terminal (not browser console)');
    console.error('   2. Browser does not support WebSocket');
    console.error('   3. WebSocket is blocked by browser settings');
    console.error('');
    console.error('✅ Solution:');
    console.error('   1. Open your web app in browser (Chrome/Firefox/Edge)');
    console.error('   2. Press F12 to open DevTools');
    console.error('   3. Click "Console" tab');
    console.error('   4. Paste this code there');
    return;
  }
  
  console.log('='.repeat(60));
  console.log('📡 Connecting to: ws://localhost:3004/video/camera-1');
  console.log('');
  
  try {
    const ws = new WebSocket('ws://localhost:3004/video/camera-1');
    let count = 0;
    let frames = 0;
    let startTime = null;
    
    ws.onopen = () => {
      startTime = Date.now();
      console.log('✅ CONNECTED!');
      console.log('⏳ Waiting for messages (10 second test)...');
      console.log('');
    };
    
    ws.onmessage = (e) => {
      count++;
      const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : 0;
      
      console.log(`📨 Message #${count} (${elapsed}s):`, {
        type: typeof e.data,
        length: e.data?.length || 0,
        isBlob: e.data instanceof Blob,
        isString: typeof e.data === 'string'
      });
      
      try {
        const m = JSON.parse(e.data);
        console.log(`   ✅ Parsed: type="${m.type}"`);
        
        if (m.type === 'frame') {
          frames++;
          const sizeKB = m.data ? (m.data.length / 1024).toFixed(1) : 0;
          console.log(`   📹 FRAME #${frames} RECEIVED! (${sizeKB} KB)`);
        } else if (m.type === 'connected') {
          console.log(`   ✅ Connection confirmed: ${m.message || 'Connected'}`);
        }
      } catch (err) {
        console.log(`   ❌ Not JSON: ${err.message}`);
      }
    };
    
    ws.onerror = (e) => {
      console.error('❌ WebSocket ERROR:', e);
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('   1. Is Electron app running?');
      console.error('   2. Did video stream server start? (check Electron console)');
      console.error('   3. Is port 3004 correct?');
      console.error('   4. Try: curl http://localhost:3004/health');
    };
    
    ws.onclose = (event) => {
      const duration = startTime ? ((Date.now() - startTime) / 1000).toFixed(2) : 0;
      
      console.log('');
      console.log('='.repeat(60));
      console.log('📊 Test Results:');
      console.log('='.repeat(60));
      console.log(`Duration: ${duration} seconds`);
      console.log(`Total Messages: ${count}`);
      console.log(`Frames Received: ${frames}`);
      console.log(`Close Code: ${event.code}`);
      console.log(`Close Reason: ${event.reason || 'none'}`);
      console.log('='.repeat(60));
      
      if (count === 0) {
        console.log('❌ TEST FAILED: No messages received');
        console.log('   → Check if Electron app is running');
        console.log('   → Check if video stream server started');
      } else if (frames === 0) {
        console.log('⚠️  TEST PARTIAL: Messages received but no frames');
        console.log('   → Check if camera SDK is sending frames');
        console.log('   → Check Electron console for "FRAME CALLBACK CALLED"');
      } else {
        const fps = (frames / duration).toFixed(1);
        console.log(`✅ TEST PASSED! Received ${frames} frames (~${fps} FPS)`);
      }
    };
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log('');
        console.log('⏱️  Test timeout (10 seconds), closing connection...');
        ws.close();
      }
    }, 10000);
    
  } catch (error) {
    console.error('❌ Failed to create WebSocket:', error);
    console.error('   Error:', error.message);
  }
})();
