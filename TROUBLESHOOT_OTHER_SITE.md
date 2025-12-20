# Troubleshooting: Other Site Not Pulling Data

## Step 1: Check What Requests They're Making

### Browser Console (at gaali.vercel.app):
```javascript
// Check recent requests from other site
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=10')
  .then(r => r.json())
  .then(data => {
    console.log('Recent requests:', data.count);
    data.logs.forEach((log, i) => {
      console.log(`\n${i + 1}. ${log.method} ${log.pathname}`);
      console.log('   Status:', log.responseStatus);
      console.log('   Body:', log.body);
      console.log('   Headers:', log.headers);
      console.log('   Error:', log.error || 'None');
      console.log('   Time:', new Date(log.timestamp).toLocaleString());
    });
  });
```

### Or visit:
`https://gaali.vercel.app/api-requests-debug`

---

## Step 2: Common Issues

### Issue 1: Wrong Parameter Name
**Problem:** Other site might be using `code` or `akt` instead of `number`

**Check:**
```javascript
// See what parameter they're using
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=5')
  .then(r => r.json())
  .then(data => {
    data.logs.forEach(log => {
      if (log.body) {
        const body = typeof log.body === 'string' ? JSON.parse(log.body) : log.body;
        console.log('Parameters used:', Object.keys(body));
      }
    });
  });
```

**Solution:** Our endpoint supports all three: `number`, `code`, `akt` - but tell them to use `number` as per spec.

---

### Issue 2: Wrong Request Format
**Problem:** Other site might be sending GET instead of POST, or wrong Content-Type

**Check:**
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=5')
  .then(r => r.json())
  .then(data => {
    data.logs.forEach(log => {
      console.log('Method:', log.method);
      console.log('Content-Type:', log.contentType);
      console.log('URL:', log.url);
    });
  });
```

**Solution:** 
- Should be POST request
- Content-Type should be `application/json`
- Body should be JSON: `{"number": "CODE"}`

---

### Issue 3: Code Format Issues
**Problem:** Code might have extra spaces or wrong format

**Check:**
```javascript
// Test with their exact code
const theirCode = 'THEIR_CODE_HERE';

// Test with number parameter
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: theirCode })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => {
    if (r.status === 404) {
      console.log('❌ Code not found');
      console.log('Error:', data);
    } else if (Array.isArray(data) && data.length > 0) {
      console.log('✅ Code works!');
    }
  });
```

---

### Issue 4: CORS Issues
**Problem:** Browser blocking the request due to CORS

**Check:**
```javascript
// Test CORS preflight
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://example.com',
    'Access-Control-Request-Method': 'POST'
  }
})
  .then(r => {
    console.log('CORS Status:', r.status);
    console.log('CORS Headers:', {
      'Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
      'Allow-Methods': r.headers.get('Access-Control-Allow-Methods'),
      'Allow-Headers': r.headers.get('Access-Control-Allow-Headers')
    });
  });
```

---

## Step 3: Test All Possible Formats

### Format 1: POST with 'number' (Required by spec)
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: '31100120251220000002' })
})
  .then(r => r.json())
  .then(data => console.log('Format 1 (number):', Array.isArray(data) ? '✅' : '❌'));
```

### Format 2: POST with 'code'
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: '31100120251220000002' })
})
  .then(r => r.json())
  .then(data => console.log('Format 2 (code):', Array.isArray(data) ? '✅' : '❌'));
```

### Format 3: GET with 'number'
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service?number=31100120251220000002')
  .then(r => r.json())
  .then(data => console.log('Format 3 (GET number):', Array.isArray(data) ? '✅' : '❌'));
```

---

## Step 4: What to Tell the Other Site

### Correct Configuration:
```
URL: https://gaali.vercel.app/api/v1/api/service
Method: POST
Content-Type: application/json
Body: {"number": "YOUR_CODE_HERE"}
```

### Example Request:
```bash
curl -X POST "https://gaali.vercel.app/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d '{"number": "31100120251220000002"}'
```

### Expected Response:
```json
[
  {
    "AKT": "31100120251220000002",
    "CAR": "...",
    "CON": "...",
    "DRN": "...",
    "LPC": "...",
    "PRM": "...",
    "SLN": "...",
    "TRL": "...",
    "UPC": "...",
    "NET": 27360,
    "WGT": 19333,
    "VNO": "...",
    "TID": "...",
    "CMN": "..."
  }
]
```

---

## Step 5: Debug Checklist

- [ ] Check request logs: `https://gaali.vercel.app/api-requests-debug`
- [ ] Verify they're using POST (not GET)
- [ ] Verify they're using `number` parameter (or `code`/`akt` as fallback)
- [ ] Verify Content-Type is `application/json`
- [ ] Verify code exists in database
- [ ] Verify code has no extra spaces
- [ ] Check CORS headers are present
- [ ] Test the exact request they're making manually

---

## Quick Debug Command

Run this to see what's happening:

```javascript
// Complete diagnostic
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=10')
  .then(r => r.json())
  .then(data => {
    console.log('=== Recent Requests ===');
    const recent = data.logs.slice(0, 3);
    recent.forEach((log, i) => {
      console.log(`\nRequest ${i + 1}:`);
      console.log('  Method:', log.method);
      console.log('  Status:', log.responseStatus);
      console.log('  Body:', log.body);
      console.log('  Error:', log.error || 'None');
      console.log('  IP:', log.ipAddress);
      console.log('  Time:', new Date(log.timestamp).toLocaleString());
    });
  });
```

