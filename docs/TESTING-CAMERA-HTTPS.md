# Testing If Your Camera Supports HTTPS

If your camera has an "SSL connection" checkbox in the HTTP push settings, you can test if it actually supports HTTPS to determine whether you can use direct connection or need the bridge.

## Quick Test

### Step 1: Check Camera Settings

In your camera's HTTP push settings, look for:
- ✅ **SSL connection** checkbox/button (if present, camera might support HTTPS)
- ✅ **SSL port** field (usually 443)
- ✅ **Verification method** (Anonymous, CA Certificate, etc.)

### Step 2: Test HTTPS Connection

Try enabling SSL and connecting directly to Vercel:

1. **Configure Camera for Direct Connection:**
   - Server address: `your-app.vercel.app` (your Vercel domain)
   - Port: `443`
   - SSL connection: ✅ **Enable/Check**
   - SSL port: `443`
   - Address: `/api/lpr/camera-direct?token=YOUR_SECRET`

2. **Test Connection:**
   - Use the camera's "Push test" feature
   - Check if connection succeeds or fails

3. **Check Results:**
   - ✅ **Success**: Camera supports HTTPS! You can use direct connection
   - ❌ **Fails with SSL/HTTPS error**: Camera doesn't fully support HTTPS → Use bridge
   - ❌ **Connection timeout**: Camera might not have internet access

## Common Outcomes

### ✅ Camera Supports HTTPS Properly

**Symptoms:**
- Push test succeeds
- Camera can connect to Vercel
- No SSL certificate errors
- Data flows to `/api/lpr/latest`

**Result:** Use direct connection - simpler setup, no bridge needed!

**Configuration:**
```
Server address: your-app.vercel.app
Port: 443
SSL: Enabled
Address: /api/lpr/camera-direct?token=YOUR_SECRET
```

### ❌ Camera Has SSL Option But Doesn't Work

**Symptoms:**
- Push test fails
- SSL certificate errors
- Connection refused
- Certificate validation errors

**Common Issues:**
- Camera's SSL implementation is incomplete
- Camera doesn't trust Vercel's SSL certificate
- Camera's date/time is wrong (SSL requires correct time)
- Camera's SSL library is outdated

**Result:** Use camera-bridge (camera stays on HTTP, bridge handles HTTPS)

### ❌ No SSL Option Available

**Symptoms:**
- No "SSL connection" checkbox in settings
- Only HTTP port configuration

**Result:** Must use camera-bridge (no choice)

## Testing Checklist

Before deciding on direct vs bridge:

- [ ] Camera has "SSL connection" option
- [ ] Enable SSL and set port to 443
- [ ] Set server address to Vercel domain (not IP)
- [ ] Test connection from camera interface
- [ ] Check Vercel logs for incoming requests
- [ ] Verify data appears in frontend
- [ ] Check for SSL/certificate errors in camera logs

## Troubleshooting HTTPS Connection

### SSL Certificate Errors

If camera shows certificate errors:
1. **Check camera date/time** - SSL validation requires correct system time
2. **Try Anonymous verification** - Some cameras work better with "Anonymous" vs "CA Certificate"
3. **Use Vercel's default domain** - `.vercel.app` domains have standard certificates
4. **Check camera firmware** - Older firmware might have SSL issues

### Connection Timeout

If connection times out:
1. **Camera internet access** - Verify camera can reach internet
2. **DNS resolution** - Camera must resolve `your-app.vercel.app` domain name
3. **Firewall** - Allow outbound HTTPS (port 443)
4. **Timeout value** - Increase timeout to 10-15 seconds

### Connection Refused

If connection is refused:
1. **Check port** - Must be 443 for HTTPS
2. **Verify SSL enabled** - SSL connection must be checked
3. **Check Vercel URL** - Ensure domain is correct
4. **Test manually** - Use curl to test endpoint manually

## Recommendation

**Try direct connection first if your camera has SSL option:**

1. Enable SSL in camera settings
2. Configure for direct connection to Vercel
3. Test connection
4. If it works → Great! Use direct connection
5. If it fails → Use camera-bridge (camera HTTP → bridge HTTPS → Vercel)

**Benefits of Direct Connection (if it works):**
- ✅ Simpler setup (no bridge server needed)
- ✅ One less service to maintain
- ✅ Lower latency (direct connection)
- ✅ One less point of failure

**When to Use Bridge:**
- ❌ Direct HTTPS connection doesn't work
- ❌ Camera has SSL issues
- ❌ You want camera isolated on local network
- ❌ You need additional processing/transformation

## Next Steps

1. **If HTTPS works:** Follow [DIRECT-CAMERA-CONNECTION.md](./DIRECT-CAMERA-CONNECTION.md)
2. **If HTTPS doesn't work:** Follow [CAMERA-HTTP-ONLY-SETUP.md](./CAMERA-HTTP-ONLY-SETUP.md)

