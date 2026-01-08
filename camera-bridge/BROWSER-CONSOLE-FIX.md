# Fix: WebSocket is not defined

## The Problem

You're getting `WebSocket is not defined` error. This usually means:

1. **You're in Node.js terminal, not browser console** ❌
2. **Browser doesn't support WebSocket** (very rare)

## Solution

### Make Sure You're in Browser Console

1. **Open your web app in browser** (Chrome, Firefox, Edge, etc.)
2. **Press F12** (or Right-click → Inspect)
3. **Click "Console" tab** (not Network, not Elements)
4. **Paste the test code there**

### Use This Fixed Version

Copy and paste this into **browser console**:

```javascript
(function testVideoStream() {
  if (typeof window === 'undefined') {
    console.error('❌ Must run in BROWSER console! Press F12');
    return;
  }
  
  const WebSocket = window.WebSocket;
  console.log('🧪 TEST STARTING...');
  
  const ws = new WebSocket('ws://localhost:3004/video/camera-1');
  let count = 0;
  
  ws.onopen = () => console.log('✅ CONNECTED!');
  ws.onmessage = (e) => {
    count++;
    console.log(`📨 #${count}`, typeof e.data, e.data.length || 0);
    try {
      const m = JSON.parse(e.data);
      console.log(`   Type: ${m.type}`);
      if (m.type === 'frame') console.log(`   📹 FRAME!`);
    } catch (err) {
      console.log('   ❌ Not JSON');
    }
  };
  ws.onerror = (e) => console.error('❌ ERROR:', e);
  ws.onclose = () => console.log(`🔌 CLOSED. Got ${count} messages`);
  setTimeout(() => ws.close(), 10000);
})();
```

## How to Know You're in Browser Console

✅ **Browser Console:**
- Shows URL bar at top
- Has tabs: Console, Network, Elements, etc.
- Can see your web page

❌ **Node.js Terminal:**
- Shows command prompt (`$` or `>`)
- No browser window
- Running `node` command

## Alternative: Use Browser Test Page

Instead of console, use the HTML test page:

1. Open `test-video-stream-browser.html` in browser
2. Click "Connect"
3. See results visually

This avoids console issues entirely.

## Still Not Working?

If WebSocket still not defined in browser:

1. **Check browser version** - Update to latest
2. **Try different browser** - Chrome, Firefox, Edge
3. **Check browser console settings** - Make sure JavaScript is enabled
4. **Check if you're in iframe** - Some contexts block WebSocket

## Quick Check

Run this first to verify you're in browser:

```javascript
console.log('Window:', typeof window);
console.log('WebSocket:', typeof WebSocket);
console.log('Location:', window.location.href);
```

You should see:
```
Window: object
WebSocket: function
Location: http://...
```

If you see `undefined` for any, you're not in browser console!
