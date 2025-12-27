# Direct Camera Connection (Without Bridge)

This guide explains how to connect your camera directly to Vercel without using the camera-bridge service.

## When to Use Direct Connection

**Use direct connection if:**
- ✅ Your camera has a **public IP address** or is accessible from the internet
- ✅ Your camera **supports HTTPS/SSL** (this is REQUIRED - Vercel only accepts HTTPS)
- ✅ Your camera can make **HTTPS requests** to external servers
- ✅ You want to **simplify your setup** (no bridge service needed)
- ✅ You're okay with the camera having internet access

**⚠️ Important:** SSL/TLS support is **mandatory** - if your camera doesn't support HTTPS, you must use the camera-bridge service instead.

**📋 Camera-Bridge Alternative:**
If your camera only supports HTTP (not HTTPS), use the [camera-bridge service](../camera-bridge/README.md) instead:
- Camera sends HTTP requests to bridge (local network)
- Bridge forwards to Vercel over HTTPS
- Camera stays on local network (more secure)

**Use camera-bridge if:**
- ❌ Camera is on a **private/local network** only
- ❌ Camera cannot access the internet
- ❌ You want to keep camera traffic on local network
- ❌ You need additional processing/transformation of camera data

## Architecture

```
Camera (with public IP)
    ↓ HTTPS POST
Vercel API (/api/lpr/camera-direct)
    ↓
MongoDB
    ↓
Frontend (polls /api/lpr/latest)
```

## Setup Instructions

### 1. Configure Vercel Environment Variable

Make sure `LPR_INGEST_SECRET` is set in your Vercel environment variables:

```bash
LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars
```

**Important:** Use a strong, random secret (at least 16 characters).

### 2. Configure Camera HTTP Push Settings

1. **Access Camera Web Interface**
   - Open your camera's web interface (e.g., `http://192.168.1.100/main.htm`)
   - Login with your credentials

2. **Navigate to HTTP Push Configuration**
   - Click **"Advanced settings"** tab
   - In the left sidebar, click **"Advanced Networks"**
   - Click the **"HTTP push"** sub-tab

3. **Configure Push Settings**
   - **Master server priority**: Check "Enable"
   - **Server address**: Enter your Vercel domain (e.g., `your-app.vercel.app`)
     - ⚠️ **Important:** Do NOT include `http://` or `https://` - just the domain name
     - Example: `gaali.vercel.app` or `your-custom-domain.com`
   - **port**: Enter `443` (HTTPS) or leave blank for default HTTPS port
   - **SSL connection**: **✅ MUST BE CHECKED/ENABLED** (Required - Vercel only accepts HTTPS connections)
     - ⚠️ **This is mandatory** - without SSL, the connection will fail
     - If your camera shows an "SSL connection" checkbox, enable it
   - **SSL port**: Usually `443` (this is the HTTPS port)
   - **Verification method**: Select "Anonymous" (or "Basic" if camera supports custom headers)
   - **Timeout (s)**: Set to `10` (internet requests may be slower than local network)

4. **Configure Push License Plate Recognition**
   - **Push license plate recognition results**: 
     - Check "Enable"
     - **address**: Set to `/api/lpr/camera-direct?token=YOUR_LPR_INGEST_SECRET`
       - Replace `YOUR_LPR_INGEST_SECRET` with your actual secret from Vercel
       - Example: `/api/lpr/camera-direct?token=my-secret-token-12345`
       - ⚠️ Make sure the token matches exactly what you set in Vercel environment variables
     - **Content detail level**: Select "all"
     - **Send pictures**: Optional (enable if you want images)

**Example Configuration:**
- Server address: `gaali.vercel.app`
- Port: `443`
- SSL connection: ✅ **Enabled** (checked)
- SSL port: `443`
- Address: `/api/lpr/camera-direct?token=your-actual-secret-here`

5. **Save Configuration**
   - Click the orange **"Sure"** button at the bottom
   - Wait for confirmation

### 3. Test Connection

1. **Test from Camera Interface**
   - Click the **"Push test"** tab in camera settings
   - Click **"Confirm"** to test the connection
   - Verify connection status shows success

2. **Verify Data Reception**
   - Check your Vercel logs for incoming requests
   - Check MongoDB for new plate recognition events
   - Use the frontend to verify plates are being received

## Authentication Methods

The `/api/lpr/camera-direct` endpoint supports two authentication methods:

### Method 1: Query Parameter (Recommended for Cameras)

Include the token in the URL:
```
POST https://your-app.vercel.app/api/lpr/camera-direct?token=YOUR_SECRET
```

**Pros:**
- ✅ Works with cameras that can't send custom headers
- ✅ Easy to configure in camera settings

**Cons:**
- ⚠️ Token appears in logs (less secure)
- ⚠️ Token visible in camera configuration

### Method 2: Authorization Header

Send token in HTTP header (if your camera supports custom headers):
```
POST https://your-app.vercel.app/api/lpr/camera-direct
Authorization: Bearer YOUR_SECRET
```

**Pros:**
- ✅ More secure (token not in URL)
- ✅ Standard HTTP authentication method

**Cons:**
- ❌ Many cameras don't support custom headers
- ❌ More complex to configure

## Camera Configuration Examples

### Example 1: Query Parameter Authentication

**Server address:** `your-app.vercel.app`  
**Port:** `443` (or leave blank)  
**SSL:** ✅ Enabled  
**Address:** `/api/lpr/camera-direct?token=your-secret-token-here`

### Example 2: Using Custom Domain

If you have a custom domain:
- **Server address:** `gaali.yourdomain.com`
- **Port:** `443`
- **SSL:** ✅ Enabled
- **Address:** `/api/lpr/camera-direct?token=your-secret-token-here`

## Troubleshooting

### Camera Cannot Connect

**Check:**
1. ✅ **SSL/TLS is enabled** in camera settings (REQUIRED - check this first!)
2. ✅ Camera has internet access (test: `ping google.com` from camera)
3. ✅ Camera can resolve DNS (test: `nslookup your-app.vercel.app`)
4. ✅ Firewall allows outbound HTTPS (port 443)
5. ✅ Port is set to 443 (or left blank for default HTTPS port)
6. ✅ Vercel URL is correct (no typos, no `http://` or `https://` prefix)
7. ✅ Camera's system date/time is correct (required for SSL certificate validation)

**Test manually:**
```bash
# Test if endpoint is accessible
curl -X POST "https://your-app.vercel.app/api/lpr/camera-direct?token=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"AlarmInfoPlate":{"result":{"PlateResult":{"license":"TEST123","trigger_time":"2025-01-20 10:30:00"}}}}'
```

### Authentication Errors

**401 Unauthorized:**
- ✅ Verify `LPR_INGEST_SECRET` matches in Vercel and camera URL
- ✅ Check token in URL is correct (no extra spaces)
- ✅ Verify token is at least 16 characters

### Data Not Appearing in Frontend

**Check:**
1. ✅ Check Vercel logs for successful POST requests
2. ✅ Verify MongoDB connection is working
3. ✅ Check frontend is polling `/api/lpr/latest`
4. ✅ Verify data format matches expected schema

### SSL/TLS Certificate Errors

**If camera complains about SSL/TLS:**

**Common Issues:**
- ⚠️ **SSL not enabled**: SSL/TLS MUST be enabled in camera settings (required, not optional)
- ⚠️ **Wrong port**: Use port 443 for HTTPS (or leave blank for default)
- ⚠️ **Invalid certificate**: Vercel uses valid SSL certificates, but camera might not trust them
  - ✅ Verify Vercel domain has valid SSL certificate (check in browser)
  - ✅ Try using Vercel's default domain (ends in `.vercel.app`) instead of custom domain
  - ✅ Check camera's system date/time is correct (SSL validation requires correct time)
  - ✅ Some cameras have option to "Accept all certificates" or "Ignore certificate errors" - enable this if available

**Why SSL is Required:**
- Vercel **only accepts HTTPS connections** (no HTTP)
- All Vercel deployments automatically have SSL certificates
- Without SSL enabled, camera cannot connect to Vercel

## Security Considerations

1. **Token Security:**
   - ⚠️ Token in URL may appear in server logs
   - ✅ Use a strong, random token (minimum 16 characters)
   - ✅ Rotate token periodically
   - ✅ Don't share token publicly

2. **Network Security:**
   - ⚠️ Camera needs internet access (potential security risk)
   - ✅ Consider VPN for additional security
   - ✅ Monitor for unusual traffic patterns

3. **Rate Limiting:**
   - Vercel has built-in rate limiting
   - Consider implementing additional rate limiting if needed

## Comparison: Direct vs Bridge

| Feature | Direct Connection | Camera Bridge |
|---------|------------------|---------------|
| **Setup Complexity** | Simple (camera only) | Medium (camera + bridge) |
| **Internet Required** | ✅ Yes (camera) | ❌ No (camera stays local) |
| **Latency** | Lower (direct) | Slightly higher (via bridge) |
| **Security** | Camera exposed to internet | Camera isolated on local network |
| **Reliability** | Depends on camera internet | Bridge can handle retries |
| **Cost** | No additional server | Requires server for bridge |
| **Scalability** | Good for single camera | Better for multiple cameras |

## Migration from Bridge to Direct

If you're currently using camera-bridge and want to switch to direct connection:

1. **Update camera configuration:**
   - Change server address to Vercel URL
   - Enable SSL/TLS
   - Update address to `/api/lpr/camera-direct?token=SECRET`

2. **Verify connection:**
   - Test from camera interface
   - Check Vercel logs
   - Verify data in MongoDB

3. **Stop bridge service:**
   - Only after confirming direct connection works
   - `pm2 stop camera-bridge`

4. **Update frontend settings:**
   - Remove bridge IP/port configuration
   - Frontend will automatically use `/api/lpr/latest` polling

## API Endpoint Details

**Endpoint:** `POST /api/lpr/camera-direct`

**Authentication:**
- Query parameter: `?token=YOUR_SECRET`
- OR Header: `Authorization: Bearer YOUR_SECRET`

**Request Format:**
Camera sends standard HTTP push format:
```json
{
  "AlarmInfoPlate": {
    "result": {
      "PlateResult": {
        "license": "ABC123",
        "trigger_time": "2025-01-20 10:30:00",
        "image_path": "/path/to/image.jpg"
      }
    }
  }
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Plate data received"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Missing plate number in request
- `500 Internal Server Error` - Server error

