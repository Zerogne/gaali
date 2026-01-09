# Production Deployment Options for WebSocket Proxy

## The Challenge

Your Next.js app is on **Vercel** (serverless), but your cameras are on a **local network** (192.168.1.x). To bypass mixed content on HTTPS, you need a WebSocket proxy that can reach the cameras.

## Option 1: Cloudflare Tunnel (Recommended for Production)

**What you need:**
- A machine that can reach your cameras (same network or VPN)
- This machine runs the tunnel + proxy server 24/7

**Setup:**

1. **On a machine that can reach cameras** (office server, VPS, Raspberry Pi, etc.):

   ```bash
   # Install Cloudflare Tunnel
   brew install cloudflare/cloudflare/cloudflared
   # Or on Linux: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   
   # Set up permanent tunnel (one-time setup)
   cloudflared tunnel create camera-proxy
   cloudflared tunnel route dns camera-proxy camera-ws.yourdomain.com
   
   # Create config file: ~/.cloudflared/config.yml
   tunnel: camera-proxy
   credentials-file: /path/to/credentials.json
   
   ingress:
     - hostname: camera-ws.yourdomain.com
       service: http://localhost:3001
     - service: http_status:404
   ```

2. **Run proxy server:**
   ```bash
   npx tsx camera-ws-proxy-server.ts
   ```

3. **Run tunnel as service:**
   ```bash
   # macOS (using launchd)
   cloudflared tunnel run camera-proxy
   
   # Linux (using systemd)
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

4. **Set in Vercel:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://camera-ws.yourdomain.com/ws/camera
   ```

**Pros:**
- ✅ Free forever
- ✅ Automatic SSL
- ✅ Custom domain
- ✅ Runs 24/7 as service
- ✅ No separate server deployment needed (just a machine on your network)

**Cons:**
- ⚠️ Need a machine that's always on (can be office server, VPS, Raspberry Pi)

---

## Option 2: VPS with Proxy Server

**What you need:**
- A VPS (DigitalOcean, Linode, AWS EC2, etc.) - $5-10/month
- VPN or network access to cameras

**Setup:**

1. **Deploy proxy server to VPS:**
   ```bash
   # On VPS
   git clone your-repo
   npm install
   npx tsx camera-ws-proxy-server.ts
   ```

2. **Use PM2 to keep it running:**
   ```bash
   npm install -g pm2
   pm2 start camera-ws-proxy-server.ts --interpreter tsx
   pm2 save
   pm2 startup  # Auto-start on reboot
   ```

3. **Set up SSL (Let's Encrypt):**
   ```bash
   # Using nginx as reverse proxy
   # Or use Caddy (automatic SSL)
   ```

4. **Set in Vercel:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://your-vps-domain.com/ws/camera
   ```

**Pros:**
- ✅ Full control
- ✅ Can add more features
- ✅ Reliable

**Cons:**
- ⚠️ Costs $5-10/month
- ⚠️ Need to manage server

---

## Option 3: Office Server / Always-On Machine

**What you need:**
- A machine at your office that's always on
- Can reach cameras on local network

**Setup:**

1. **On office machine:**
   ```bash
   # Install Node.js
   # Clone repo or copy files
   npm install
   npx tsx camera-ws-proxy-server.ts
   ```

2. **Use Cloudflare Tunnel (free) to expose it:**
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

3. **Or use ngrok (free tier):**
   ```bash
   ngrok http 3001
   ```

4. **Set in Vercel:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://tunnel-url/ws/camera
   ```

**Pros:**
- ✅ Free (if using tunnel)
- ✅ Uses existing office infrastructure
- ✅ Direct access to cameras

**Cons:**
- ⚠️ Depends on office internet/network
- ⚠️ Tunnel URL changes (unless permanent setup)

---

## Option 4: Raspberry Pi (Cheapest Hardware Solution)

**What you need:**
- Raspberry Pi 4 ($50-75 one-time)
- SD card, power supply

**Setup:**

1. **Install on Raspberry Pi:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repo
   git clone your-repo
   cd your-repo
   npm install
   ```

2. **Run as service:**
   ```bash
   # Create systemd service
   sudo nano /etc/systemd/system/camera-proxy.service
   ```

   ```ini
   [Unit]
   Description=Camera WebSocket Proxy
   After=network.target
   
   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/your-repo
   ExecStart=/usr/bin/npx tsx camera-ws-proxy-server.ts
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable camera-proxy
   sudo systemctl start camera-proxy
   ```

3. **Set up Cloudflare Tunnel:**
   ```bash
   cloudflared tunnel create camera-proxy
   cloudflared tunnel route dns camera-proxy camera-ws.yourdomain.com
   cloudflared tunnel run camera-proxy
   ```

4. **Set in Vercel:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://camera-ws.yourdomain.com/ws/camera
   ```

**Pros:**
- ✅ One-time cost (~$50)
- ✅ Low power consumption
- ✅ Can run 24/7
- ✅ Free Cloudflare Tunnel

**Cons:**
- ⚠️ Need to buy hardware
- ⚠️ Need to set up

---

## Recommendation

**For Production:** Use **Option 1 (Cloudflare Tunnel)** on an office server or VPS.

**Quick Start:**
1. Pick a machine that can reach cameras (office server, VPS, Raspberry Pi)
2. Install Cloudflare Tunnel
3. Set up permanent tunnel with custom domain
4. Run proxy server on that machine
5. Set `NEXT_PUBLIC_WS_PROXY_URL` in Vercel

**Cost:** $0/month (if using office server) or $5-10/month (if using VPS)

---

## Summary

| Option | Cost | Setup Complexity | Best For |
|--------|------|------------------|----------|
| Cloudflare Tunnel (Office Server) | Free | Medium | Office with always-on server |
| Cloudflare Tunnel (VPS) | $5-10/mo | Medium | No office server available |
| VPS with Proxy | $5-10/mo | High | Full control needed |
| Raspberry Pi | $50 one-time | Medium | Budget solution, always-on |

**All options work in production** - you just need a machine that can reach your cameras and run the proxy server 24/7.
