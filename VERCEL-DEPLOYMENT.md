# Vercel Deployment Guide - Camera Bridge Integration

## Architecture

```
Camera (LAN) → Bridge Server (VPS/Cloud) → WebSocket → Vercel Frontend
```

- **Vercel**: Hosts your Next.js frontend (serverless)
- **Bridge Server**: Separate server that must be on the same network as your camera

## Step 1: Deploy Bridge Server

The bridge server **cannot** run on Vercel. You need a separate server:

### Option A: VPS/Cloud Server (Recommended)

Deploy to:
- **DigitalOcean Droplet**
- **AWS EC2**
- **Google Cloud Compute**
- **Azure VM**
- **Linode**
- **Any VPS provider**

**Requirements:**
- Node.js installed
- Ports 3001 (WebSocket) and 3002 (HTTP) open
- Public IP address

**Quick Deploy:**
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Clone your repo
git clone https://github.com/your-repo/gaali.git
cd gaali/camera-bridge

# Install PM2
npm install -g pm2

# Install dependencies
npm install --production

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: Local Server/PC

If you have a PC/server on the same network as the camera:

1. Install Node.js
2. Run the bridge server (PM2, Docker, or systemd)
3. Configure port forwarding on your router (port 3001 → your server)
4. Use your router's public IP or a dynamic DNS service

## Step 2: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:

```env
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=ws://YOUR_BRIDGE_SERVER_IP:3001
```

**Or with domain:**
```env
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=wss://camera-bridge.yourdomain.com
```

**Important:**
- Use `ws://` for HTTP or `wss://` for HTTPS
- Replace `YOUR_BRIDGE_SERVER_IP` with your bridge server's **public IP**
- If using a domain, ensure DNS points to your bridge server
- Port 3001 must be accessible from the internet

5. **Redeploy** your Vercel app after adding the variable

## Step 3: Configure Camera

Configure your camera to send data to the bridge server:

1. Open camera web interface: `http://192.168.1.100/main.htm`
2. Go to **Advanced settings** → **Advanced Networks** → **HTTP push**
3. Configure:
   - **Server address**: `YOUR_BRIDGE_SERVER_LAN_IP` (LAN IP, not public IP)
   - **Port**: `3002`
   - **Path**: `/plate`
   - **Enable**: "Push license plate recognition results"
4. Save and test

**Note**: Camera uses LAN IP because it's on the same network. Vercel uses public IP because it's on the internet.

## Step 4: Firewall Configuration

### On Bridge Server

Open ports 3001 and 3002:

```bash
# Linux (UFW)
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp

# Linux (iptables)
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3002 -j ACCEPT
```

### On Router (if bridge server is on LAN)

Port forward:
- **Port 3001** → Bridge server LAN IP
- **Port 3002** → Bridge server LAN IP

## Step 5: Verify Setup

### 1. Check Bridge Server

```bash
# On bridge server
curl http://localhost:3002/health
# Should return: {"status":"ok"}
```

### 2. Check Vercel Connection

1. Open your Vercel site
2. Open browser console
3. Look for: `✅✅✅ Camera bridge WebSocket CONNECTED!`

### 3. Test End-to-End

1. Trigger camera to read a plate
2. Check bridge server logs: `pm2 logs camera-bridge`
3. Check browser console for plate autofill

## Troubleshooting

### Vercel Can't Connect to Bridge Server

**Symptoms:**
- WebSocket connection fails
- Console shows connection errors

**Solutions:**
1. **Verify public IP**: Ensure bridge server has a public IP
2. **Check firewall**: Port 3001 must be open
3. **Test manually**: 
   ```bash
   curl http://YOUR_BRIDGE_SERVER_IP:3002/health
   ```
4. **Check Vercel env var**: Verify `NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL` is correct
5. **Use domain instead**: Sometimes IPs are blocked, use a domain name

### Camera Can't Reach Bridge Server

**Symptoms:**
- Camera push fails
- No data in bridge server logs

**Solutions:**
1. **Verify LAN IP**: Camera must use bridge server's LAN IP (not public IP)
2. **Check network**: Camera and bridge server must be on same network
3. **Test connectivity**: From camera network, ping bridge server LAN IP
4. **Check firewall**: Port 3002 must be open on bridge server

### Mixed Network Setup

If your bridge server is on a different network than the camera:

**Option 1: VPN**
- Connect bridge server to camera network via VPN
- Use bridge server's VPN IP for camera configuration

**Option 2: Port Forwarding**
- Forward camera's network to bridge server's network
- Configure router/firewall rules

**Option 3: Cloud Bridge**
- Deploy bridge server in cloud
- Use VPN or secure tunnel to connect camera to bridge

## Security Recommendations

1. **Use WSS (WebSocket Secure)**:
   - Set up nginx reverse proxy with SSL
   - Use `wss://` instead of `ws://` in Vercel env var

2. **Restrict Access**:
   - Use firewall rules to limit access to ports 3001/3002
   - Consider IP whitelisting for Vercel IPs

3. **Authentication**:
   - Add authentication to bridge server endpoints
   - Use tokens/API keys for WebSocket connections

4. **Monitor**:
   - Set up monitoring for bridge server
   - Use PM2 monitoring or Docker health checks

## Example Configurations

### DigitalOcean Droplet

```bash
# 1. Create droplet (Ubuntu 22.04, $6/month minimum)
# 2. SSH in
ssh root@your-droplet-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Deploy bridge server
git clone https://github.com/your-repo/gaali.git
cd gaali/camera-bridge
npm install --production
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Configure firewall
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp
sudo ufw enable
```

### Vercel Environment Variable

```
NEXT_PUBLIC_CAMERA_BRIDGE_WS_URL=ws://your-droplet-ip:3001
```

### Camera Configuration

```
Server address: 192.168.1.XXX (bridge server's LAN IP if on same network)
Port: 3002
Path: /plate
```

## Cost Estimate

- **Vercel**: Free tier (Hobby) or $20/month (Pro)
- **Bridge Server VPS**: $6-12/month (DigitalOcean, Linode, etc.)
- **Total**: ~$6-32/month depending on Vercel plan

## Next Steps

1. Deploy bridge server to VPS
2. Configure Vercel environment variable
3. Configure camera HTTP push
4. Test end-to-end
5. Set up monitoring and alerts
