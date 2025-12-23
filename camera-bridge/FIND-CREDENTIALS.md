# How to Find Your Camera Credentials

## Step 1: Open Camera Web Interface

1. Open your browser
2. Go to: `http://192.168.1.100/main.htm`
3. You should see a login page

## Step 2: Try to Log In

Try these common default credentials:

### Common Defaults:

- **Username:** `admin` **Password:** `admin`
- **Username:** `admin` **Password:** `password`
- **Username:** `admin` **Password:** `12345`
- **Username:** `admin` **Password:** (empty - just press Enter)
- **Username:** `root` **Password:** `root`
- **Username:** `admin` **Password:** `123456`

### If You Already Know the Password:

- Use the same username/password you use to access the camera web interface

## Step 3: Update .env File

Once you find the correct credentials:

1. Edit `camera-bridge/.env`
2. Update this line:
   ```env
   CAMERA_AUTH=your-username:your-password
   ```
3. Save the file
4. Rebuild and restart:
   ```bash
   npm run build
   npm start
   ```

## Step 4: Test the Credentials

After updating, test with:

```bash
node test-auth.mjs
```

If you see "✅ Authentication SUCCESS!", the credentials are correct!

## Still Can't Find It?

1. **Check camera documentation** - usually has default credentials
2. **Check camera label/sticker** - sometimes has default password printed
3. **Reset camera to factory defaults** - check camera manual for reset procedure
4. **Contact camera manufacturer** - they can provide default credentials
