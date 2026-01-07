# Camera Authentication Troubleshooting

## Current Issue

The camera is returning login pages even though credentials are configured. The login POST request is returning "FAILED".

## How to Find the Correct Login Format

### Step 1: Open Camera Web Interface

1. Open Chrome browser
2. Go to `http://192.168.1.100/main.htm` or `http://192.168.1.100/login.htm`
3. Open DevTools (F12)
4. Go to **Network** tab
5. Check "Preserve log"

### Step 2: Log In Manually

1. Enter username: `admin`
2. Enter password: `admin`
3. Click Login
4. **Watch the Network tab** - look for the login request

### Step 3: Inspect the Login Request

Find the login request in the Network tab (usually named `login.htm` or similar):

1. **Click on the request**
2. **Check "Headers" tab:**
   - Look at "Request URL" - note the exact endpoint
   - Look at "Request Method" - should be POST
   - Look at "Form Data" or "Payload" - note the exact field names
   - Look at "Request Headers" - note any special headers

3. **Check "Payload" or "Form Data" tab:**
   - Note the exact field names (might be `user`, `usr`, `account`, etc.)
   - Note the exact format

### Step 4: Update the Code

Once you find the correct format, we can update the `loginToCamera()` function in `src/polling-service.ts` to match.

## Common Login Formats

Based on camera models, login might use:

```javascript
// Format 1: username/password
body: `username=admin&password=admin`

// Format 2: user/pass  
body: `user=admin&pass=admin`

// Format 3: With action parameter
body: `action=login&username=admin&password=admin`

// Format 4: JSON format
body: JSON.stringify({username: 'admin', password: 'admin'})
```

## Alternative: Use HTTP Push Instead

If polling authentication continues to be problematic, consider using **HTTP Push mode** instead:

1. Configure camera to push to bridge service (see `docs/camera-setup-guide.md`)
2. Set `MODE=push` in `.env`
3. Camera will push events directly - no authentication needed for polling

## Quick Test

To test if credentials work in browser:

```bash
# Open in browser while logged into camera
# Then check Network tab for API calls to /ivs_result.php
# See what headers/cookies those requests use
```

## Next Steps

1. Check browser Network tab during login
2. Share the login request details (URL, method, form fields, headers)
3. We'll update the code to match the exact format
