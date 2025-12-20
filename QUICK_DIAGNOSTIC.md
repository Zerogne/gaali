# Quick Diagnostic: Other Site Not Pulling

## Step 1: Check What They're Sending

### Browser Console (at gaali.vercel.app):
```javascript
// See all recent requests
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=10')
  .then(r => r.json())
  .then(data => {
    console.log('=== Recent Requests ===');
    data.logs.forEach((log, i) => {
      console.log(`\n${i + 1}. ${log.method} - Status: ${log.responseStatus}`);
      console.log('   URL:', log.url);
      console.log('   Body:', log.body);
      console.log('   Content-Type:', log.contentType);
      console.log('   Error:', log.error || 'None');
      console.log('   Time:', new Date(log.timestamp).toLocaleString());
      
      // Check what parameter they used
      if (log.body) {
        try {
          const body = typeof log.body === 'string' ? JSON.parse(log.body) : log.body;
          const params = Object.keys(body);
          console.log('   Parameters:', params);
          
          if (params.includes('number')) {
            console.log('   ✅ Using "number" (correct)');
          } else if (params.includes('code') || params.includes('akt')) {
            console.log('   ⚠️  Using "code" or "akt" (works but should use "number")');
          } else {
            console.log('   ❌ Not using number/code/akt!');
          }
        } catch(e) {
          console.log('   ⚠️  Could not parse body');
        }
      }
    });
  });
```

### Or Terminal:
```bash
./check-other-site-requests.sh
```

---

## Step 2: Common Problems & Solutions

### Problem 1: They're using GET instead of POST
**Check:** Look at `log.method` - should be "POST"

**Solution:** Tell them to use POST:
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',  // ← Must be POST
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: 'CODE' })
})
```

---

### Problem 2: They're using wrong parameter name
**Check:** Look at `log.body` - should have `number` field

**Solution:** Tell them to use `number`:
```json
{"number": "31100120251220000002"}
```

Not:
- ❌ `{"code": "..."}`
- ❌ `{"akt": "..."}`
- ❌ `{"id": "..."}`

---

### Problem 3: Wrong Content-Type
**Check:** Look at `log.contentType` - should be `application/json`

**Solution:** Tell them to set header:
```javascript
headers: { 'Content-Type': 'application/json' }
```

---

### Problem 4: Code doesn't exist
**Check:** Look at `log.responseStatus` - if 404, code doesn't exist

**Solution:** 
1. Verify code exists: `fetch('https://gaali.vercel.app/api/third-party/debug')`
2. Check code format (no spaces)
3. Make sure code is from your database

---

### Problem 5: CORS blocking
**Check:** Look for CORS errors in browser console

**Solution:** Our endpoint has CORS headers, but check if they're sending from browser:
- If browser → Should work (CORS enabled)
- If server-side → No CORS needed

---

## Step 3: Test Their Exact Request

If you know what they're sending, test it:

```javascript
// Test their exact format
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',  // Change if they use GET
  headers: { 
    'Content-Type': 'application/json'  // Change if they use different
  },
  body: JSON.stringify({ 
    number: '31100120251220000002'  // Change parameter name if needed
  })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('Response:', data);
    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ Would work for them');
    } else {
      console.log('❌ Would fail for them');
      console.log('Response:', data);
    }
  });
```

---

## Step 4: What to Tell Them

### Correct Configuration:
```
URL: https://gaali.vercel.app/api/v1/api/service
Method: POST
Headers: Content-Type: application/json
Body: {"number": "YOUR_CODE_HERE"}
```

### Example (JavaScript):
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: '31100120251220000002' })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

### Example (cURL):
```bash
curl -X POST "https://gaali.vercel.app/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d '{"number": "31100120251220000002"}'
```

---

## Quick Check Command

Run this to see everything:
```bash
./check-other-site-requests.sh
```

Or in browser:
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=5')
  .then(r => r.json())
  .then(data => {
    console.table(data.logs.map(log => ({
      Method: log.method,
      Status: log.responseStatus,
      Body: JSON.stringify(log.body || {}),
      Error: log.error || 'None'
    })));
  });
```

