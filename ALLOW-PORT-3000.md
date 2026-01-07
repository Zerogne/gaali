# Allow Port 3000 Through Windows Firewall

## Method 1: PowerShell as Administrator (Easiest)

1. **Close your current PowerShell window**

2. **Open PowerShell as Administrator:**
   - Press `Windows Key + X`
   - Click **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
   - Click **"Yes"** when prompted by UAC

3. **Run the command:**
   ```powershell
   New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

4. **You should see:** No error, command completes successfully

## Method 2: Windows Firewall GUI (No Admin Needed)

1. **Open Windows Defender Firewall:**
   - Press `Windows Key + R`
   - Type: `wf.msc`
   - Press Enter

2. **Click "Inbound Rules"** in the left sidebar

3. **Click "New Rule..."** in the right sidebar

4. **Rule Type:**
   - Select **"Port"**
   - Click **Next**

5. **Protocol and Ports:**
   - Select **TCP**
   - Select **"Specific local ports"**
   - Enter: `3000`
   - Click **Next**

6. **Action:**
   - Select **"Allow the connection"**
   - Click **Next**

7. **Profile:**
   - Check all three: **Domain**, **Private**, **Public**
   - Click **Next**

8. **Name:**
   - Name: `Next.js Dev Server`
   - Click **Finish**

## Method 3: Check if Port is Already Open

Sometimes the port might already be allowed. Test if the camera can connect:

1. Make sure Next.js is running (`npm run dev`)
2. Configure camera with:
   - Server: `192.168.1.50`
   - Port: `3000`
   - Address: `/api/lpr/ingest` (via bridge service)
3. Test from camera web interface

If it works, you don't need to change firewall settings!

## Verify Firewall Rule

After adding the rule, verify it exists:

```powershell
Get-NetFirewallRule -DisplayName "Next.js Dev Server"
```

You should see the rule listed.
