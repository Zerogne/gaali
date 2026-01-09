# Bypass Mixed Content - Free Solution (No Separate Server)

Since you're on Vercel (serverless), you can't run WebSocket servers there. But you can use a **free tunnel service** that runs on your local machine/network to create a secure WebSocket endpoint.

## Option 1: Cloudflare Tunnel (Recommended - Free Forever)

**Cloudflare Tunnel** creates a secure tunnel from your network to the internet. It's free and doesn't require deploying anything.

### Setup:

1. **Install Cloudflare Tunnel:**
   ```bash
   # macOS
   brew install cloudflare/cloudflare/cloudflared
   
   # Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **Run the tunnel:**
   ```bash
   # This creates a secure tunnel to your proxy server
   cloudflared tunnel --url http://localhost:3001
   ```

3. **Get the tunnel URL:**
   Cloudflare will give you a URL like: `https://random-name.trycloudflare.com`
   
4. **Set environment variable in Vercel:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://random-name.trycloudflare.com/ws/camera
   ```

5. **Run your proxy server locally:**
   ```bash
   npx tsx camera-ws-proxy-server.ts
   ```

**Note:** The tunnel URL changes each time you restart. For production, you can set up a permanent tunnel with a custom domain (still free).

---

## Option 2: ngrok (Free Tier Available)

Similar to Cloudflare Tunnel, but with a free tier.

1. **Sign up:** https://ngrok.com (free account)

2. **Install:**
   ```bash
   brew install ngrok/ngrok/ngrok
   ```

3. **Run tunnel:**
   ```bash
   ngrok http 3001
   ```

4. **Get URL and set in Vercel:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://your-random-id.ngrok.io/ws/camera
   ```

---

## Option 3: Simple - Just Run Proxy Locally (For Testing)

If you're just testing and don't need production:

1. **Run proxy server on your machine:**
   ```bash
   npx tsx camera-ws-proxy-server.ts
   ```

2. **Use your public IP or domain:**
   ```
   NEXT_PUBLIC_WS_PROXY_URL=wss://your-domain.com/ws/camera
   ```

3. **Make sure:**
   - Port 3001 is open in your firewall
   - You have SSL certificate (Let's Encrypt is free)
   - Your router forwards port 3001 to your machine

---

## Recommended: Cloudflare Tunnel

**Why Cloudflare Tunnel:**
- ✅ Completely free
- ✅ Automatic SSL (HTTPS/WSS)
- ✅ No separate deployment needed
- ✅ Works from anywhere
- ✅ Can set up permanent tunnel with custom domain

**Quick Start:**
```bash
# 1. Install
brew install cloudflare/cloudflare/cloudflared

# 2. Run tunnel (in one terminal)
cloudflared tunnel --url http://localhost:3001

# 3. Run proxy server (in another terminal)
npx tsx camera-ws-proxy-server.ts

# 4. Copy the HTTPS URL from cloudflared output
# 5. Set in Vercel: NEXT_PUBLIC_WS_PROXY_URL=wss://that-url/ws/camera
```

That's it! No separate server deployment needed. 🎉
