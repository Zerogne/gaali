# Vehicle Identification Smart Camera - Complete Setup Guide

This guide provides step-by-step instructions for integrating your Vehicle Identification Smart Camera (IP: 192.168.1.100) with your Vercel-deployed web application.

## Camera Specifications

- **IP Address**: 192.168.1.100
- **HTTP Port**: 80
- **RTSP Port**: 8557
- **WebSocket Port**: 9080
- **Software Version**: 8.10.1.202505161
- **Web Interface**: `http://192.168.1.100/main.htm`

## Integration Methods

You have two options for integrating the camera:

### Option 1: HTTP Push (Recommended)
The camera pushes plate recognition events directly to your server. This requires a bridge service on your local network.

### Option 2: Polling
A bridge service polls the camera API periodically to fetch new plate recognition events.

## Method 1: HTTP Push Configuration

### Step 1: Configure Camera HTTP Push Settings

1. **Access Camera Web Interface**
   - Open `http://192.168.1.100/main.htm` in your browser
   - Login with your camera credentials

2. **Navigate to HTTP Push Configuration**
   - Click **"Advanced settings"** tab
   - In the left sidebar, click **"Advanced Networks"**
   - Click the **"HTTP push"** sub-tab

3. **Configure Basic Settings**
   - **Master server priority**: Check "Enable"
   - **Server address**: Enter your bridge service IP (e.g., `192.168.1.50`)
   - **port**: Enter `3000` (or your bridge service port)
   - **SSL connection**: Uncheck (unless using HTTPS)
   - **Verification method**: Select "Anonymous"
   - **Timeout (s)**: Set to `5`

4. **Configure Push Settings**
   - **Equipment registration**: Select "Cancel heartbeat" (or "normal heartbeat" if you want keepalive)
   - **address**: Set to `/devicemanagement/php/receivedeviceinfo.p`
   
   - **Push license plate recognition results**: 
     - Check "Enable"
     - **address**: Set to `/plate`
     - **Content detail level**: Select "all"
     - **Send pictures**: 
       - Check "Send large images" (optional)
       - Check "Send small pictures" (optional)
   
   - **Push fast license plate recognition results**: 
     - Check "Enable" (optional)
     - **address**: Set to `/devicemanagement/php/quickplateresult.ph`
   
   - **Push port trigger information**: 
     - Check "Enable" (optional)
     - **address**: Set to `/devicemanagement/php/gio.php`
   
   - **Push serial port data**: 
     - Check "Enable" (optional)
     - **address**: Set to `/devicemanagement/php/serial.php`
   
   - **Push gate status**: 
     - Check "Enable" (optional)
     - **address**: Set to `/devicemanagement/php/gate.php`

5. **Save Configuration**
   - Click the orange **"Sure"** button at the bottom
   - Wait for confirmation

6. **Test Connection**
   - Click the **"Push test"** tab
   - Click **"Confirm"** to test the connection
   - Verify connection status shows success

### Step 2: Set Up Bridge Service for HTTP Push

The bridge service will receive HTTP POST requests from the camera and forward them to your Vercel API.

1. **Install Bridge Service**
   ```bash
   cd camera-bridge
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env` file:
   ```env
   # Bridge service will listen on this port
   BRIDGE_PORT=3000
   
   # Your Vercel deployment URL
   CLOUD_BASE_URL=https://your-app.vercel.app
   
   # Secret token (must match Vercel LPR_INGEST_SECRET)
   LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars
   ```

3. **Start Bridge Service**
   ```bash
   npm run build
   npm start
   ```

The bridge service will:
- Listen on port 3000 for camera HTTP push requests
- Forward plate recognition data to `/api/lpr/ingest` on Vercel
- Handle authentication and retries

## Method 2: Polling Configuration

If you prefer polling over HTTP push, configure the bridge service to poll the camera API.

### Step 1: Configure Bridge Service for Polling

1. **Configure Environment Variables**
   Create `.env` file in `camera-bridge`:
   ```env
   # Camera configuration
   CAMERA_BASE_URL=http://192.168.1.100
   CAMERA_RESULT_ID=6
   POLL_MS=700
   
   # Cloud configuration
   CLOUD_BASE_URL=https://your-app.vercel.app
   LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars
   
   # Optional: Fetch images
   FETCH_IMAGE=false
   ```

2. **Start Bridge Service**
   ```bash
   npm run build
   npm start
   ```

The bridge service will:
- Poll `/ivs_result.php?result_id=6` every 700ms
- Extract plate numbers from the response
- Push to Vercel API with deduplication

## Camera Network Configuration

### Basic Network Settings

1. **Access Network Settings**
   - Go to **"Advanced settings"** → **"Basic Network"**

2. **LAN1 Configuration** (Primary)
   - **model**: Manual
   - **IP address**: 192.168.1.100
   - **Subnet mask**: 255.255.255.0
   - **Default gateway**: 192.168.1.1
   - **DNS server**: 114.114.114.114
   - **DNS server 2**: 8.8.8.8

3. **Port Configuration**
   - **HTTP port**: 80
   - **RTSP port**: 8557
   - **WebSocket port**: 9080

### Whitelist Configuration (Optional)

1. **Access Whitelist Settings**
   - Go to **"Advanced settings"** → **"Whitelist"**

2. **Configure Whitelist**
   - **Whitelist activation conditions**: Select "Enable" or "Automatic offline start"
   - **Fuzzy matching**: Choose matching mode:
     - "Exact match" (recommended)
     - "Similar character matching" (for OCR errors)
     - "Fuzzy matching of ordinary characters"
   - **Allowable misidentification length**: Set to 1, 2, or 3

## License Plate Recognition Settings

### Identity Verification Settings

1. **Access Settings**
   - Go to **"Advanced settings"** → **"Identification Installation"** → **"Identity verification settings"**

2. **Trigger Mode**
   - **Video trigger**: Check "Enable"
     - **Virtual coil**: Check (for motion detection)
     - **Stable recognition**: Check (optional)
   - **External trigger**: Configure if using physical triggers

3. **Identification Parameters**
   - **Image resolution**: 2592*1944 (or your preferred resolution)
   - **Image quality**: 100%
   - **Continuous capture mode**: "closure"
   - **License plate pixel limit**: 80-600 pixels
   - **Interval between identical license plates**: 10 seconds
   - **Non-motorized vehicle filtration**: Check "Enable"
   - **Criteria for determining vehicle direction**: "Vehicle trajectory"

## Vercel Environment Variables

Add these to your Vercel project settings:

```env
# LPR Integration
LPR_INGEST_SECRET=your-long-random-secret-here-minimum-16-chars

# MongoDB
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=gaali
MONGODB_COLLECTION=lpr_events

# Optional: Cloudinary for image storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Testing the Integration

### Test Camera Connection

1. **Test Bridge Service**
   ```bash
   # Check if bridge is running
   curl http://localhost:3000/health
   ```

2. **Test Camera API** (for polling method)
   ```bash
   curl "http://192.168.1.100/ivs_result.php?{\"result_id\":6}&_=$(date +%s)"
   ```

3. **Test Vercel API**
   ```bash
   curl -X POST https://your-app.vercel.app/api/lpr/ingest \
     -H "Authorization: Bearer your-secret" \
     -H "Content-Type: application/json" \
     -d '{
       "plateNumber": "TEST123",
       "recognizedAt": "2025-12-23 19:00:00",
       "cameraIp": "192.168.1.100"
     }'
   ```

### Test Frontend Integration

1. **Open Session Form**
   - Navigate to `/in-session` or `/out-session`
   - Enable "Камераас автоматаар" (Auto-fill from camera) toggle

2. **Verify Status**
   - Check camera status indicator
   - Should show "Камера: холбогдож байна..." when connected
   - Should auto-fill plate number when detected

## Troubleshooting

### Camera Not Pushing Events

1. **Check HTTP Push Configuration**
   - Verify server address is correct
   - Check port is accessible
   - Test connection using "Push test" tab

2. **Check Bridge Service**
   - Verify bridge is running
   - Check logs for errors
   - Ensure port 3000 is not blocked by firewall

3. **Check Network**
   - Ensure camera and bridge are on same network
   - Test connectivity: `ping 192.168.1.100`

### Events Not Appearing in Frontend

1. **Check Vercel API**
   - Verify `LPR_INGEST_SECRET` matches in bridge and Vercel
   - Check Vercel function logs
   - Verify MongoDB connection

2. **Check Frontend**
   - Open browser console
   - Check for API errors
   - Verify `/api/lpr/latest` returns data

### Plate Recognition Not Working

1. **Check Camera Settings**
   - Verify "Video trigger" is enabled
   - Check "Virtual coil" is configured
   - Ensure camera has clear view of license plates

2. **Check Recognition Parameters**
   - Adjust "License plate pixel limit" if plates too small/large
   - Increase "Image quality" if recognition is poor
   - Check "Interval between identical license plates" setting

## Advanced Configuration

### MQTT Configuration (Alternative)

The camera also supports MQTT. To use MQTT:

1. **Access MQTT Settings**
   - Go to **"Advanced settings"** → **"Advanced Networks"** → **"MQTT configuration"**

2. **Configure MQTT Server**
   - Select MQTT server (e.g., "VZMQTT")
   - Configure image upload settings if needed

### RTSP Stream Access

To access the RTSP video stream:

```
rtsp://192.168.1.100:8557/stream
```

### WebSocket Connection

The camera supports WebSocket on port 9080. You can connect for real-time updates:

```
ws://192.168.1.100:9080
```

## Security Considerations

1. **Change Default Passwords**
   - Update camera admin password
   - Use strong passwords

2. **Network Security**
   - Keep camera on private network
   - Use firewall rules to restrict access
   - Consider VPN for remote access

3. **API Security**
   - Use long, random `LPR_INGEST_SECRET` (minimum 16 characters)
   - Never commit secrets to version control
   - Use different secrets for dev/staging/production

## Support

For issues:
1. Check camera logs: **"Equipment maintenance"** → **"Log detection"**
2. Check bridge service logs
3. Check Vercel function logs
4. Review browser console for frontend errors
