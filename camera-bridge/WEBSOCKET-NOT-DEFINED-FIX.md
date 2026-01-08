# Fix: WebSocket is not defined

## The Problem

You're getting `WebSocket is not defined` even in browser console. This is unusual but can happen.

## Quick Fix

### Step 1: Verify You're in Browser

Run this first in your browser console:

```javascript
console.log('Window:', typeof window);
console.log('Document:', typeof document);
console.log('WebSocket:', typeof WebSocket);
console.log('Location:', window.location.href);
```

**Expected output:**
```
Window: object
Document: object
WebSocket: function
Location: http://localhost:3000/...
```

If any are `undefined`, you're not in the right place.

### Step 2: Use Explicit WebSocket

If WebSocket is undefined, try this:

```javascript
// Use window.WebSocket explicitly
const ws = new window.WebSocket('ws://localhost:3004/video/camera-1');
```

Or:

```javascript
// Try different ways to get WebSocket
const WebSocket = window.WebSocket || self.WebSocket || globalThis.WebSocket;
const ws = new WebSocket('ws://localhost:3004/video/camera-1');
```

### Step 3: Use the Robust Test

Use the `BROWSER-TEST-ROBUST.js` file which checks for WebSocket in multiple ways.

## Common Causes

### 1. Running in Node.js Terminal ❌

**Symptom:** Command prompt visible, no browser window

**Fix:** Open browser, press F12, use Console tab

### 2. Service Worker Context

**Symptom:** WebSocket might not be available in service workers

**Fix:** Run test in main page context, not service worker

### 3. Content Security Policy (CSP)

**Symptom:** WebSocket blocked by security policy

**Fix:** Check browser console for CSP errors

### 4. Old Browser

**Symptom:** Very old browser version

**Fix:** Update browser to latest version

## Alternative: Use HTML Test Page

Instead of console, use the HTML test page:

1. Open `test-video-stream-browser.html` in browser
2. No console needed
3. Visual interface

## Alternative: Use Node.js Test

If browser console doesn't work, use Node.js test:

```bash
node test-video-stream.js camera-1
```

This works from terminal and doesn't need browser console.

## Still Not Working?

If WebSocket is still not defined:

1. **Check browser version:**
   ```javascript
   navigator.userAgent
   ```

2. **Try different browser:**
   - Chrome
   - Firefox
   - Edge

3. **Check browser settings:**
   - JavaScript enabled?
   - WebSocket allowed?
   - Extensions blocking?

4. **Check if in iframe:**
   ```javascript
   window.self === window.top
   ```
   If `false`, you're in an iframe which might block WebSocket

## Quick Diagnostic

Run this complete diagnostic:

```javascript
(function() {
  console.log('=== WebSocket Diagnostic ===');
  console.log('Window:', typeof window);
  console.log('Document:', typeof document);
  console.log('WebSocket (global):', typeof WebSocket);
  console.log('WebSocket (window):', typeof window?.WebSocket);
  console.log('WebSocket (self):', typeof self?.WebSocket);
  console.log('Location:', window?.location?.href);
  console.log('User Agent:', navigator?.userAgent);
  console.log('In iframe:', window.self !== window.top);
  console.log('===========================');
})();
```

Share the output to identify the issue.
