# Camera Configuration Fix

## Problem

The camera shows "Server address error" because the IP address is incomplete: `192.168.176` instead of `192.168.1.176`

## Solution

### Option 1: Clear and Re-enter the IP (Recommended)

1. **Clear the Server address field completely:**

   - Click in the "Server address" field
   - Select all text (Ctrl+A or Cmd+A)
   - Delete it
   - Type: `192.168.1.176` (make sure to include the `.1`)

2. **Verify the settings:**

   - Server address: `192.168.1.176`
   - Port: `3000`
   - Push license plate recognition results: ✅ Enable
   - Address: `/plate`

3. **Click the orange "Sure" button** to save

### Option 2: If the field is disabled/read-only

If you can't edit the field, try:

1. **Refresh the page** (F5 or Cmd+R)
2. **Try a different browser** (Firefox, Safari, Edge)
3. **Check if there's a "Reset" or "Default" button** on the page
4. **Try accessing via different URL:**
   - `http://192.168.1.100/main.htm`
   - `http://192.168.1.100/`
   - `http://192.168.1.100/config.htm`

### Option 3: Use Alternative Server Field

If the main "Server address" field won't accept the value, try:

1. Use the **"Alternative Servers"** field instead
2. Enter: `192.168.1.176:3000`
3. Make sure the main server address is cleared or set to a valid format

## Correct Configuration

```
Master server priority: ✅ Enable
Server address: 192.168.1.176
Port: 3000
SSL connection: ❌ Disable
Verification method: Anonymous

Push license plate recognition results: ✅ Enable
Address: /plate
Content detail level: all
```

## Verification

After saving, you should:

1. **See no error message**
2. **Go to "Push test" tab** and click "Confirm" to test the connection
3. **Check bridge service logs** - you should see incoming requests

## Troubleshooting

If you still can't change it:

- The camera web interface might have a bug
- Try logging out and back in
- Try resetting the camera to factory defaults (if possible)
- Contact camera manufacturer support
