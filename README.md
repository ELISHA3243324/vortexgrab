# VortexGrab

Universal Media Downloader - Download videos & audio from YouTube, TikTok, Twitter, Instagram, Reddit and more.

---

## 🚀 Deploy to Render

### Step 1: Upload to GitHub
1. Go to https://github.com/new
2. Name: `vortexgrab`
3. Click **Create repository**
4. Click **"uploading an existing file"**
5. Drag ALL files from this folder into GitHub
6. Click **Commit changes**

### Step 2: Deploy on Render
1. Go to https://render.com → Sign in with GitHub
2. Click **New +** → **Web Service**
3. Select your `vortexgrab` repo
4. Settings:
   - **Name:** `vortexgrab`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Create Web Service**
6. Wait 2-3 min for deployment

### Step 3: Done! 🎉
Your site is live at: `https://vortexgrab.onrender.com`

---

## ⏰ Keep It Awake (Optional)

To avoid the 30-second cold start on free tier:

1. Go to https://uptimerobot.com
2. Create free account
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://vortexgrab.onrender.com/health`
   - Interval: 5 minutes

---

## 📁 Files

```
vortexgrab/
├── server.js          # Backend (Cobalt API)
├── package.json       # Dependencies
├── .gitignore
├── public/
│   ├── index.html     # Frontend
│   ├── logo.png
│   ├── favicon.ico
│   └── ...favicons
└── README.md
```

---

Made with 🌀 by VortexGrab
