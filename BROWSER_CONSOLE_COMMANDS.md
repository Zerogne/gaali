# Browser Console Commands for Testing

## Where to Run These Commands

**Run these commands in your browser's Developer Console:**
1. Open your browser (Chrome, Firefox, Safari, Edge)
2. Go to: `https://gaali.vercel.app` (or your local site)
3. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows) to open Developer Tools
4. Click on the "Console" tab
5. Type `allow pasting` and press Enter (if needed)
6. Paste and run the commands below

---

## Command 1: Check Available Codes

```javascript
fetch('https://gaali.vercel.app/api/third-party/debug')
  .then(r => r.json())
  .then(data => {
    console.log('Total codes:', data.total);
    console.log('Available codes:', data.codes.map(c => c.code));
    return data.codes.length > 0 ? data.codes[0].code : null;
  })
  .then(code => {
    if (code) {
      console.log('First code to test:', code);
    } else {
      console.log('No codes found');
    }
  })
  .catch(err => console.error('Error:', err));
```

---

## Command 2: Test with 'number' Parameter (GET)

```javascript
const code = 'YOUR_CODE_HERE'; // Replace with actual code from Command 1

fetch(`https://gaali.vercel.app/api/v1/api/service?number=${encodeURIComponent(code)}`)
  .then(r => {
    console.log('HTTP Status:', r.status);
    console.log('Status OK:', r.ok);
    return r.json();
  })
  .then(data => {
    console.log('Response:', data);
    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ SUCCESS: Data found!');
      console.log('Data fields:', Object.keys(data[0]));
      console.log('First item:', data[0]);
    } else {
      console.log('❌ No data or wrong format');
      console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);
    }
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
```

---

## Command 3: Test with 'number' Parameter (POST) - Recommended

```javascript
const code = 'YOUR_CODE_HERE'; // Replace with actual code from Command 1

fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ number: code })
})
  .then(r => {
    console.log('HTTP Status:', r.status);
    console.log('Status OK:', r.ok);
    if (!r.ok) {
      return r.json().then(err => {
        throw new Error(`HTTP ${r.status}: ${JSON.stringify(err)}`);
      });
    }
    return r.json();
  })
  .then(data => {
    console.log('Response:', data);
    if (Array.isArray(data)) {
      console.log('✅ SUCCESS: Data is an array');
      console.log('Array length:', data.length);
      if (data.length > 0) {
        console.log('✅ Data found!');
        console.log('Fields in first item:', Object.keys(data[0]));
        console.log('First item:', data[0]);
        
        // Check required fields
        const required = ['CAR', 'CON', 'DRN', 'LPC', 'PRM', 'SLN', 'TRL', 'UPC', 'AKT', 'NET', 'WGT', 'VNO'];
        const missing = required.filter(field => !(field in data[0]));
        if (missing.length === 0) {
          console.log('✅ All required fields present');
        } else {
          console.log('❌ Missing fields:', missing);
        }
      } else {
        console.log('⚠️ Array is empty');
      }
    } else {
      console.log('❌ Response is not an array');
      console.log('Response type:', typeof data);
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message || err);
  });
```

---

## Command 4: Complete Test (Get Code + Test)

```javascript
// Step 1: Get available codes
fetch('https://gaali.vercel.app/api/third-party/debug')
  .then(r => r.json())
  .then(data => {
    console.log('=== Available Codes ===');
    console.log('Total:', data.total);
    const codes = data.codes.map(c => c.code);
    console.log('Codes:', codes);
    
    if (codes.length === 0) {
      console.log('❌ No codes available');
      return null;
    }
    
    // Use first code
    const testCode = codes[0];
    console.log('\n=== Testing with code ===');
    console.log('Code:', testCode);
    
    // Step 2: Test with this code
    return fetch('https://gaali.vercel.app/api/v1/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: testCode })
    });
  })
  .then(response => {
    if (!response) return;
    console.log('\n=== Response ===');
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    if (!data) return;
    console.log('Response:', data);
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n✅ SUCCESS! Data pulled successfully');
      console.log('Fields:', Object.keys(data[0]));
    } else {
      console.log('\n❌ FAILED: No data or wrong format');
    }
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message || err);
  });
```

---

## Command 5: Test All Parameter Formats

```javascript
const code = 'YOUR_CODE_HERE'; // Replace with actual code

console.log('Testing code:', code);
console.log('========================\n');

// Test 1: 'number' parameter (required by spec)
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: code })
})
  .then(r => r.json())
  .then(data => {
    console.log('1. With "number":', Array.isArray(data) && data.length > 0 ? '✅' : '❌');
    return fetch('https://gaali.vercel.app/api/v1/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('2. With "code":', Array.isArray(data) && data.length > 0 ? '✅' : '❌');
    return fetch('https://gaali.vercel.app/api/v1/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ akt: code })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('3. With "akt":', Array.isArray(data) && data.length > 0 ? '✅' : '❌');
  })
  .catch(err => console.error('Error:', err));
```

---

## Command 6: Check Request Logs

```javascript
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=5')
  .then(r => r.json())
  .then(data => {
    console.log('Recent requests:', data.count);
    if (data.logs && data.logs.length > 0) {
      console.log('\nLatest request:');
      const latest = data.logs[0];
      console.log('Method:', latest.method);
      console.log('URL:', latest.url);
      console.log('Status:', latest.responseStatus);
      console.log('Body:', latest.body);
      console.log('Error:', latest.error || 'None');
    }
  })
  .catch(err => console.error('Error:', err));
```

---

## Quick Reference

**Where to run:** Browser Developer Console (F12 → Console tab)

**Site:** `https://gaali.vercel.app` (production) or `http://localhost:3000` (local)

**Steps:**
1. Open browser
2. Go to the site
3. Press F12
4. Click "Console" tab
5. Type `allow pasting` (if needed)
6. Paste command
7. Press Enter

**Common Issues:**
- If you see CORS errors → Check if endpoint has CORS headers
- If you see 404 → Code doesn't exist in database
- If you see 500 → Server error, check logs
- If response is not array → Data format issue

