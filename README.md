# VortexGrab - Universal Media Downloader

Download videos and audio from YouTube, TikTok, Twitter, Instagram, Reddit, and 1000+ more sites.

---

## 🚀 DEPLOY TO RENDER (Step-by-Step)

### Step 1: Create a GitHub Account (if you don't have one)
1. Go to https://github.com
2. Click **Sign up** and create an account

### Step 2: Upload Code to GitHub

**Option A: Easy Way (Drag & Drop)**
1. Go to https://github.com/new
2. Repository name: `vortexgrab`
3. Keep it **Public**
4. **DON'T** check any boxes
5. Click **Create repository**
6. On the next page, click **"uploading an existing file"**
7. Unzip this folder on your computer
8. Select ALL files inside the `vortexgrab-render` folder (not the folder itself)
9. Drag them into GitHub
10. Click **Commit changes**

**Option B: Using Git (if you know how)**
```bash
cd vortexgrab-render
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vortexgrab.git
git push -u origin main
```

### Step 3: Deploy on Render

1. Go to https://render.com
2. Click **Get Started for Free**
3. Sign up with **GitHub** (easiest)
4. Once logged in, click **New +** → **Web Service**
5. Connect your GitHub account if prompted
6. Find and select your `vortexgrab` repository
7. Configure the service:
   - **Name:** `vortexgrab`
   - **Region:** Pick closest to you
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`
8. Click **Create Web Service**
9. Wait 3-5 minutes for it to build and deploy

### Step 4: Get Your URL

Once deployed, Render gives you a URL like:
```
https://vortexgrab.onrender.com
```

Your site is now live! 🎉

---

## 🌐 Connect Your Custom Domain (vortexgrab.com)

1. In Render, go to your service → **Settings**
2. Scroll to **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `vortexgrab.com`
5. Render shows you DNS records to add

**At your domain registrar:**
- Add a **CNAME** record:
  - Name: `@` (or leave blank)
  - Value: `vortexgrab.onrender.com`

Wait 5-30 minutes for DNS to update.

---

## ⏰ Keep It Awake (Avoid Loading Screen)

Render's free tier sleeps after 15 min of no traffic. Use UptimeRobot to keep it awake:

1. Go to https://uptimerobot.com → Create free account
2. Click **Add New Monitor**
3. Settings:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** VortexGrab
   - **URL:** `https://vortexgrab.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
4. Click **Create Monitor**

Now your app stays awake 24/7 and users never see loading screens!

---

## 📁 Files Included

```
vortexgrab-render/
├── server.js                 # Backend server
├── package.json              # Dependencies
├── Dockerfile                # Render deployment
├── public/
│   ├── index.html           # Frontend
│   ├── logo.png             # Your logo
│   ├── favicon.ico          # Favicon
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── site.webmanifest
└── README.md
```

---

## 🛠️ Local Testing (Optional)

```bash
# You need Node.js and yt-dlp installed
npm install
npm start
# Open http://localhost:3000
```

---

## ❓ Troubleshooting

**Build fails on Render?**
- Make sure ALL files are in the root of your GitHub repo (not in a subfolder)
- Check Render logs for errors

**Domain not working?**
- Wait longer (DNS can take up to 48 hours)
- Check DNS at https://dnschecker.org

**Downloads not working?**
- Some sites block server IPs
- Try a different video

---

Made with 🌀 by VortexGrab
