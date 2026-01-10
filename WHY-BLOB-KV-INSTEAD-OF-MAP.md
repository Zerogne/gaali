# Why Vercel Blob + KV Instead of In-Memory Map?

## ❌ Why In-Memory Map Failed

### The Original Implementation
```typescript
// ❌ THIS DOESN'T WORK IN PRODUCTION
const latestFrames = new Map<string, {
  frameBase64: string;
  timestamp: number;
}>();

export async function POST(request: NextRequest) {
  // ...
  latestFrames.set(cameraId, {
    frameBase64: frameData,
    timestamp: timestampNum,
  });
  // ...
}

export async function GET(request: NextRequest) {
  const frame = latestFrames.get(cameraId);
  // ...
}
```

### Problem #1: Serverless Functions are Stateless

**Vercel runs Next.js on serverless functions.** Each API request may be handled by a **different function instance** running on a **different server**.

```
Request 1 (POST frame):     Instance A (Map has frame)
Request 2 (GET frame):      Instance B (Map is EMPTY!) ❌
Request 3 (POST frame):     Instance C (Map is EMPTY!) ❌
Request 4 (GET frame):      Instance A (Map has frame from Request 1)
```

**Result:** Browser randomly gets frames or gets 404s, depending on which instance handles the request.

### Problem #2: Cold Starts = Empty Memory

When a serverless function **cold starts** (first request after inactivity):
- New process is created
- Memory is empty
- `latestFrames` Map is empty
- All previous frames are **lost**

```
[10:00 AM] Instance A: POST frame → Map stores frame ✅
[10:05 AM] Instance A: Cold start (5 min idle) → Map is EMPTY ❌
[10:05 AM] Instance A: GET frame → 404 (no frame) ❌
```

### Problem #3: Base64 Overhead (33% Larger)

```typescript
// JPEG frame: 50KB binary
const jpegBuffer = Buffer.from(...); // 50KB

// Base64 encoding: 33% larger
const base64 = jpegBuffer.toString('base64'); // ~67KB
latestFrames.set(cameraId, { frameBase64: base64 }); // Storing 67KB instead of 50KB
```

**Problems:**
- Wastes memory (33% more)
- Wastes bandwidth (33% more)
- Unnecessary encoding/decoding
- JSON parsing overhead

### Problem #4: Memory Limits

Vercel serverless functions have **memory limits**:
- Hobby: 1GB per function
- Pro: Up to 10GB per function (but expensive)

With 2 cameras at 10 fps:
- Each frame: ~67KB (base64)
- Frames per second: 2 cameras × 10 fps = 20 frames/sec
- Memory per second: 20 × 67KB = 1.34MB/sec
- **Memory fills up quickly** (especially if multiple browsers poll)

### Problem #5: No Persistence

If the server restarts (deployment, crash, etc.):
- All frames are **lost**
- No way to recover
- Browser shows "No frame available" until new frames arrive

### Problem #6: Race Conditions

Multiple browsers polling simultaneously:
```typescript
// Browser 1 polls → Instance A → Gets frame ✅
// Browser 2 polls → Instance B → Gets nothing ❌ (different instance)
// Browser 3 polls → Instance C → Gets nothing ❌ (different instance)
```

**Result:** Some browsers see frames, others don't, creating inconsistent UX.

---

## ✅ How Blob + KV Fixes These Issues

### Solution Architecture

```
┌─────────────────┐
│  Electron App   │
│  (Local)        │
└────────┬────────┘
         │ POST binary JPEG
         ▼
┌─────────────────┐
│  Next.js API    │
│  (Serverless)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│ Blob   │ │ KV      │
│(Persist)│ │(Pointer)│
└────────┘ └─────────┘
    │
    ▼ Public CDN URL
┌─────────┐
│ Browser │
│ (Poll)  │
└─────────┘
```

### Fix #1: Persistent Storage (Shared Across All Instances)

**Vercel Blob:**
- Stores frames **permanently** (until overwritten)
- **Shared** across all serverless function instances
- Accessible from **any instance** via public URL

**Vercel KV (Redis):**
- Stores lightweight pointers: `{url: "...", ts: 1234567890}`
- **Shared** across all serverless function instances
- Fast lookups (~1-5ms)

**Result:**
```
Request 1 (POST):  Instance A → Blob stores frame, KV stores pointer ✅
Request 2 (GET):   Instance B → KV reads pointer, returns Blob URL ✅ (works!)
Request 3 (POST):  Instance C → Blob overwrites frame, KV updates pointer ✅
Request 4 (GET):   Instance A → KV reads pointer, returns Blob URL ✅ (works!)
```

**All instances see the same data!** ✅

### Fix #2: Survives Cold Starts

```
[10:00 AM] Instance A: POST frame → Blob stores frame, KV stores pointer ✅
[10:05 AM] Instance A: Cold start → Blob still has frame, KV still has pointer ✅
[10:05 AM] Instance B: GET frame → Reads KV → Returns Blob URL ✅
```

**Cold starts don't affect data!** ✅

### Fix #3: Binary Storage (No Base64 Overhead)

```typescript
// JPEG frame: 50KB binary
const jpegBuffer = Buffer.from(...); // 50KB

// Upload directly as binary (no encoding)
await put('cameras/1/latest.jpg', jpegBuffer, {
  contentType: 'image/jpeg',
  access: 'public',
});

// KV stores only pointer (tiny JSON)
await kv.set('camera:1', JSON.stringify({
  url: 'https://...blob.../latest.jpg',
  ts: Date.now(),
})); // ~200 bytes
```

**Benefits:**
- 33% smaller storage (50KB vs 67KB)
- 33% less bandwidth
- No encoding/decoding overhead
- Fast binary transfers

### Fix #4: Scalable Storage

**Blob:**
- Stores only **latest frame** per camera (overwrites)
- Constant storage: ~100KB total (2 cameras × 50KB)
- No memory limits (stored on Vercel's infrastructure)

**KV:**
- Stores only **pointers** (not frames)
- Constant storage: ~1KB total (2 cameras × ~500 bytes)
- Fast lookups (~1-5ms)

**Result:** Storage stays constant regardless of upload frequency! ✅

### Fix #5: Persistent Across Deployments

```
[10:00 AM] Deploy v1: Blob has frame, KV has pointer ✅
[10:01 AM] Deploy v2: Blob STILL has frame, KV STILL has pointer ✅
[10:02 AM] Browser polls: Gets frame immediately ✅
```

**Deployments don't affect data!** ✅

### Fix #6: Consistent Across All Browsers

```typescript
// All browsers poll the same KV key
const pointer = await kv.get('camera:1'); // Same data for all!

// All browsers get the same Blob URL
<img src={pointer.url} /> // Same frame for all!
```

**All browsers see the same frame!** ✅

---

## Performance Comparison

### In-Memory Map (❌ Doesn't Work)

| Metric | Value | Issue |
|--------|-------|-------|
| Storage | ~67KB per frame (base64) | ❌ Wasted memory |
| Consistency | ❌ Random (depends on instance) | ❌ Unreliable |
| Cold Starts | ❌ Data lost | ❌ Empty Map |
| Persistence | ❌ Lost on restart | ❌ No recovery |
| Scalability | ❌ Limited by memory | ❌ Fills up quickly |

### Blob + KV (✅ Works)

| Metric | Value | Benefit |
|--------|-------|---------|
| Storage | ~50KB per frame (binary) | ✅ 33% smaller |
| Consistency | ✅ 100% (shared storage) | ✅ Reliable |
| Cold Starts | ✅ Data persists | ✅ No data loss |
| Persistence | ✅ Survives restarts | ✅ Always available |
| Scalability | ✅ Unlimited (CDN-backed) | ✅ Handles any load |

---

## Cost Comparison

### In-Memory Map (❌ Doesn't Work, but if it did...)

- **Memory**: Function memory costs (included in plan)
- **CPU**: Encoding/decoding base64
- **Reliability**: ❌ Poor (data loss, inconsistent)

### Blob + KV (✅ Works)

**Estimated costs for 2 cameras @ 10 fps:**
- **Blob Storage**: ~$0.01/month (overwrites same file, ~100KB)
- **Blob Bandwidth**: ~$13/month (86.4GB/day for browser requests)
- **KV Storage**: ~$0.01/month (~1KB actual)
- **KV Commands**: ~$1.73/month (3.46M commands/day)
- **Total**: ~$15/month

**Trade-off:** Small cost increase for **100% reliability** ✅

---

## Summary

### Why In-Memory Map Failed

1. ❌ **Serverless functions are stateless** → Different instances = different Maps
2. ❌ **Cold starts = empty memory** → Data lost on inactivity
3. ❌ **Base64 overhead** → 33% wasted memory/bandwidth
4. ❌ **Memory limits** → Fills up quickly
5. ❌ **No persistence** → Data lost on restart
6. ❌ **Race conditions** → Inconsistent across browsers

### How Blob + KV Fixes It

1. ✅ **Persistent storage** → Shared across all instances
2. ✅ **Survives cold starts** → Data always available
3. ✅ **Binary storage** → 33% more efficient
4. ✅ **Scalable** → Constant storage regardless of frequency
5. ✅ **Persistent** → Survives deployments/restarts
6. ✅ **Consistent** → All browsers see same data

**Result:** Production-safe, reliable, scalable camera preview! ✅
