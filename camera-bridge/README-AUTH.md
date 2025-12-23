# Camera Authentication Setup

## Where to Configure

The camera authentication is configured in the **`.env` file** in the `camera-bridge/` directory.

## Configuration Steps

1. **Open the `.env` file:**

   ```bash
   cd camera-bridge
   nano .env
   # or use your preferred editor
   ```

2. **Find the `CAMERA_AUTH` line** (near the bottom of the file):

   ```env
   CAMERA_AUTH=admin:admin
   ```

3. **Replace with your actual camera credentials:**

   ```env
   CAMERA_AUTH=your-username:your-password
   ```

   **Format:** `username:password` (no spaces, separated by colon)

4. **Save the file**

5. **Restart the bridge service:**
   ```bash
   npm run build
   npm start
   ```

## Finding Your Camera Credentials

If you don't know your camera credentials:

1. **Try default credentials:**

   - `admin:admin`
   - `admin:password`
   - `admin:12345`
   - `root:root`

2. **Check camera documentation** - usually in the manual or on a sticker on the camera

3. **Check camera web interface:**

   - Open `http://192.168.1.100/main.htm` in browser
   - Try logging in with different credentials
   - Once logged in, you can see/change credentials in settings

4. **Reset camera to defaults** (if you have physical access):
   - Check camera manual for reset procedure
   - Usually involves holding a reset button

## Testing Authentication

You can test if your credentials work by manually making a request:

```bash
# Replace username:password with your credentials
curl -u admin:admin "http://192.168.1.100/ivs_result.php?{\"result_id\":6}&_=$(date +%s)"
```

If it returns JSON (not HTML login page), the credentials are correct.

## Troubleshooting

### Still getting "TimeOut" / login errors?

1. **Verify credentials are correct:**

   - Try logging into camera web interface with same credentials
   - If web login fails, credentials are wrong

2. **Check .env file format:**

   - No spaces around the `=` sign
   - No quotes around the value
   - Correct format: `CAMERA_AUTH=username:password`

3. **Verify .env file is being loaded:**

   ```bash
   cd camera-bridge
   node -e "require('dotenv').config(); console.log('CAMERA_AUTH:', process.env.CAMERA_AUTH)"
   ```

   Should print your credentials (be careful, this shows password!)

4. **Rebuild after changing .env:**

   ```bash
   npm run build
   npm start
   ```

5. **Check camera IP address:**
   - Verify `CAMERA_BASE_URL=http://192.168.1.100` is correct
   - Test: `ping 192.168.1.100`

## Example .env Configuration

```env
MODE=poll
CAMERA_BASE_URL=http://192.168.1.100
CAMERA_RESULT_ID=6
POLL_MS=700
CLOUD_BASE_URL=https://your-app.vercel.app
LPR_INGEST_SECRET=your-secret-here
CAMERA_AUTH=admin:your-password-here
FETCH_IMAGE=false
```
