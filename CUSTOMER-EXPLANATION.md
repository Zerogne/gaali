# Camera Integration - Customer Guide

## What You Need to Know

Your license plate recognition (LPR) camera needs to connect to our web application. Here's how it works and what you need to do.

## Simple Overview

Your camera is on your local network (like your office WiFi), and our web application is on the internet. To connect them, you need a small bridge service running on a computer in your office.

```
Your Camera → Office Computer (Bridge) → Internet → Our Web App
```

## Why Do You Need This?

### Your Camera's Limitations

1. **Local Network Only**: Your camera is on your office network (like 192.168.1.100) and can't directly reach the internet
2. **HTTP Only**: Most cameras only support HTTP (not secure HTTPS), but our web app requires secure connections
3. **Security**: It's safer to keep your camera on your local network rather than exposing it to the internet

### The Solution

A small bridge service runs on any computer in your office that:
- ✅ Receives data from your camera (on your local network)
- ✅ Securely forwards it to our web application (on the internet)
- ✅ Works automatically in the background

## What You Need

### Option 1: Use Your Existing Computer (Recommended)

**Requirements:**
- Any Windows/Mac/Linux computer in your office
- Connected to the same network as your camera
- Can stay on during business hours (or 24/7 for best results)

**Setup Time:** 10-15 minutes

**Cost:** Free (uses your existing computer)

### Option 2: Dedicated Mini Computer

**Requirements:**
- Small computer like Raspberry Pi or mini PC
- Stays on 24/7
- One-time setup

**Setup Time:** 30-45 minutes

**Cost:** ~$50-100 (one-time purchase)

## How It Works

### Step 1: Install Bridge Service (One Time)

We provide a simple program that you install on your office computer. It runs automatically in the background.

**What it does:**
- Listens for your camera's data
- Forwards it securely to our web application
- Requires no daily maintenance

### Step 2: Configure Your Camera (One Time)

In your camera's settings, you tell it to send data to your office computer instead of trying to reach the internet directly.

**Settings needed:**
- Server address: Your office computer's IP address (we'll help you find this)
- Port: 3000
- Enable "Push license plate recognition results"

**Time:** 5 minutes

### Step 3: That's It!

Once set up:
- ✅ Camera automatically sends plate data
- ✅ Data appears in real-time in our web application
- ✅ No daily maintenance required
- ✅ Works 24/7 (if computer stays on)

## Benefits

### ✅ Security
- Your camera stays on your local network
- No need to expose it to the internet
- Data is encrypted when sent to our servers

### ✅ Reliability
- Works even if your internet connection is temporarily down (data queues locally)
- No dependency on camera's internet capabilities
- Simple, proven technology

### ✅ Cost-Effective
- Uses your existing computer
- No monthly fees
- No special hardware required

### ✅ Easy Maintenance
- Set it and forget it
- Automatic updates available
- Remote monitoring and support

## Common Questions

### Q: Do I need to keep my computer on 24/7?

**A:** For best results, yes. But if the computer is off, data will queue on the camera and sync when it's back on. For critical operations, we recommend a dedicated mini computer that stays on.

### Q: What if my computer restarts?

**A:** The bridge service can be configured to start automatically when your computer boots. We'll set this up for you.

### Q: Can I use multiple cameras?

**A:** Yes! The same bridge service can handle multiple cameras. Just configure each camera to send to the same office computer.

### Q: What if I don't have a computer available?

**A:** We can help you set up a small dedicated device (like Raspberry Pi) for about $50-100. It's a one-time cost and runs 24/7 with minimal power usage.

### Q: Is this secure?

**A:** Yes! Your camera stays on your local network (not exposed to internet). Data is encrypted when sent to our servers. This is actually more secure than exposing your camera directly to the internet.

### Q: What if my camera supports HTTPS?

**A:** If your camera can send HTTPS directly to the internet, you might not need the bridge. We can test this during setup. However, most cameras on local networks still benefit from the bridge for reliability and security.

### Q: Can you set this up for me?

**A:** Yes! We offer setup assistance. We can:
- Help you install the bridge service
- Configure your camera settings
- Test the connection
- Set up automatic startup

## Alternative: Cloud Bridge Service

**Coming Soon:** We're working on a cloud-hosted bridge service that eliminates the need for a local computer. This will be available as a premium option.

**Benefits:**
- No local computer needed
- Always available 24/7
- Managed by us
- Automatic updates

**Cost:** Monthly subscription (contact us for pricing)

## Summary

**What you need:**
- One computer in your office (or a small dedicated device)
- 15-30 minutes for initial setup
- Camera configuration (we'll guide you)

**What you get:**
- Real-time license plate recognition
- Secure, reliable connection
- No ongoing maintenance
- Professional support

**Next Steps:**
1. Choose which computer/device to use
2. We'll help you install the bridge service
3. We'll configure your camera
4. Test and verify everything works
5. You're done!

---

## Technical Details (For IT Staff)

If your IT team needs technical details:

- **Bridge Service:** Node.js application, runs on port 3000 (HTTP) and 3001 (WebSocket)
- **Protocol:** HTTP POST from camera → Bridge → HTTPS to cloud → WebSocket to frontend
- **Security:** TLS encryption for cloud communication, local network isolation for camera
- **Requirements:** Node.js 18+, minimal resources (~50MB RAM, <1% CPU)
- **Deployment:** Can run as Windows service, Linux systemd service, or Docker container

For detailed technical documentation, see our developer documentation.

