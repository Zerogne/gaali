# Browser Console - Check Issues

Run these in browser console at `https://gaali.vercel.app` (F12 → Console tab)

---

## Check 1: Code Exists in Database

```javascript
fetch('https://gaali.vercel.app/api/third-party/debug')
  .then(r => r.json())
  .then(data => {
    console.log('=== Database Check ===');
    console.log('Total codes:', data.total);
    console.log('Codes:', data.codes.map(c => c.code));
    
    if (data.total === 0) {
      console.log('❌ Database is EMPTY - no codes found');
    } else {
      console.log('✅ Database has', data.total, 'codes');
    }
  })
  .catch(err => console.error('Error:', err));
```

---

## Check 2: Code Format (No Extra Spaces)

```javascript
const code = 'YOUR_CODE_HERE'; // Replace with your code

console.log('=== Format Check ===');
console.log('Original:', `'${code}'`);
console.log('Length:', code.length);
console.log('Has spaces:', code.includes(' '));
console.log('Trimmed:', `'${code.trim()}'`);
console.log('Trimmed length:', code.trim().length);

if (code.length !== code.trim().length) {
  console.log('❌ CODE HAS EXTRA SPACES!');
  console.log('Use trimmed version:', code.trim());
} else {
  console.log('✅ No extra spaces');
}

// Check if it's numeric (expected format)
if (/^\d+$/.test(code)) {
  console.log('✅ Code is numeric (expected)');
} else {
  console.log('⚠️ Code contains non-numeric characters');
}
```

---

## Check 3: Server Logs for Errors

```javascript
fetch('https://gaali.vercel.app/api/v1/api/service/debug?limit=5')
  .then(r => r.json())
  .then(data => {
    console.log('=== Server Logs ===');
    console.log('Recent requests:', data.count);
    
    if (data.logs && data.logs.length > 0) {
      const latest = data.logs[0];
      console.log('\nLatest Request:');
      console.log('Method:', latest.method);
      console.log('URL:', latest.url);
      console.log('Status:', latest.responseStatus);
      console.log('Response Time:', latest.responseTime, 'ms');
      
      if (latest.error) {
        console.log('❌ Error:', latest.error);
      } else if (latest.responseStatus === 200) {
        console.log('✅ Success');
      } else if (latest.responseStatus === 404) {
        console.log('❌ Not Found');
      } else if (latest.responseStatus === 500) {
        console.log('❌ Server Error');
      }
      
      console.log('\nRequest Body:', latest.body);
      console.log('\nAll recent requests:');
      data.logs.forEach((log, i) => {
        console.log(`${i + 1}. ${log.method} ${log.pathname} - Status: ${log.responseStatus}`);
      });
    } else {
      console.log('No recent requests found');
    }
  })
  .catch(err => console.error('Error:', err));
```

**Or visit:** `https://gaali.vercel.app/api-requests-debug`

---

## Check 4: CORS Headers

```javascript
// Test OPTIONS (preflight)
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://example.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
  .then(r => {
    console.log('=== CORS Check ===');
    console.log('Status:', r.status);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': r.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': r.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Max-Age': r.headers.get('Access-Control-Max-Age')
    };
    
    console.log('CORS Headers:', corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS headers present');
    } else {
      console.log('❌ CORS headers MISSING!');
    }
  })
  .catch(err => console.error('Error:', err));
```

---

## Complete Check (All 4 Points)

```javascript
const code = 'YOUR_CODE_HERE'; // Replace with your code

console.log('=== Complete Issue Check ===\n');

// Check 1: Code exists
fetch('https://gaali.vercel.app/api/third-party/debug')
  .then(r => r.json())
  .then(data => {
    const codes = data.codes.map(c => c.code);
    console.log('1. Database Check:');
    if (codes.includes(code)) {
      console.log('   ✅ Code exists in database');
    } else {
      console.log('   ❌ Code NOT in database');
      console.log('   Available codes:', codes);
    }
    
    // Check 2: Format
    console.log('\n2. Format Check:');
    if (code.length === code.trim().length) {
      console.log('   ✅ No extra spaces');
    } else {
      console.log('   ❌ Has extra spaces! Use:', code.trim());
    }
    
    // Check 3: Test request
    console.log('\n3. Testing Request:');
    return fetch('https://gaali.vercel.app/api/v1/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: code })
    });
  })
  .then(r => {
    console.log('   Status:', r.status);
    return r.json();
  })
  .then(data => {
    if (Array.isArray(data) && data.length > 0) {
      console.log('   ✅ Request successful - data found');
    } else {
      console.log('   ❌ Request failed - no data');
      console.log('   Response:', data);
    }
    
    // Check 4: CORS
    console.log('\n4. CORS Check:');
    return fetch('https://gaali.vercel.app/api/v1/api/service', {
      method: 'OPTIONS'
    });
  })
  .then(r => {
    const cors = r.headers.get('Access-Control-Allow-Origin');
    if (cors) {
      console.log('   ✅ CORS headers present');
    } else {
      console.log('   ❌ CORS headers missing');
    }
  })
  .catch(err => console.error('Error:', err));
```

