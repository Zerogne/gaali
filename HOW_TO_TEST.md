# How to Test Data Pull

## Where to Run Commands

### Option 1: Browser Console (Easiest)
**Site:** `https://gaali.vercel.app` (or `http://localhost:3000` if testing locally)

**Steps:**
1. Open your browser (Chrome, Firefox, Safari, Edge)
2. Go to: `https://gaali.vercel.app`
3. Press `F12` (or `Cmd+Option+I` on Mac / `Ctrl+Shift+I` on Windows)
4. Click the **"Console"** tab
5. Type `allow pasting` and press Enter (if needed)
6. Copy and paste the commands from `BROWSER_CONSOLE_COMMANDS.md`
7. Press Enter to run

### Option 2: Terminal/Command Line
**Site:** Your local terminal (Mac/Linux/Windows)

**Steps:**
1. Open Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows)
2. Navigate to the project folder:
   ```bash
   cd /path/to/gaali
   ```
3. Run the test scripts:
   ```bash
   ./test-pull-data.sh          # Comprehensive test
   ./test-single-code.sh CODE   # Test specific code
   ./debug-code.sh CODE         # Debug specific code
   ```

---

## Quick Test Commands

### Browser Console - Get Codes
```javascript
fetch('https://gaali.vercel.app/api/third-party/debug')
  .then(r => r.json())
  .then(data => console.log('Codes:', data.codes.map(c => c.code)));
```

### Browser Console - Test Pull (Replace YOUR_CODE)
```javascript
fetch('https://gaali.vercel.app/api/v1/api/service', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: 'YOUR_CODE_HERE' })
})
  .then(r => r.json())
  .then(data => {
    console.log('Status:', r.status);
    console.log('Data:', data);
    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ SUCCESS!');
    } else {
      console.log('❌ FAILED');
    }
  });
```

### Terminal - Test Single Code
```bash
./test-single-code.sh YOUR_CODE_HERE
```

---

## Which Site to Use?

- **Production:** `https://gaali.vercel.app`
- **Local Development:** `http://localhost:3000` (if running `npm run dev`)

Use production URL unless you're testing locally.

