# CosmoHub - Vercel Deployment Guide

## Files Structure for Vercel

```
cosmohub/
├── api/                    ← Serverless API functions
│   ├── stats.js
│   ├── announcements.js
│   ├── events.js
│   ├── communities.js
│   ├── profile.js
│   ├── schedule.js
│   ├── tasks.js
│   ├── online.js
│   ├── badges.js
│   ├── messages.js
│   └── send-message.js
├── frontend/               ← Your HTML/CSS/JS files
│   ├── DashboardUI.html
│   ├── DashboardUI.css
│   ├── DashboardUI.js
│   ├── AnnouncementsUI.html
│   ├── AnnouncementsUI.css
│   ├── AnnouncementsUI.js
│   ├── ChatUI.html
│   ├── ChatUI.css
│   ├── ChatUI.js
│   └── assets/
├── vercel.json             ← Vercel routing config
└── package.json            ← Dependencies
```

## How to Deploy

### 1. Prepare Your Repo

Make sure your GitHub repo has this structure:
- `api/` folder with all `.js` API files
- `frontend/` folder with all HTML/CSS/JS
- `vercel.json` and `package.json` in root

### 2. Sign Up on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access your repos

### 3. Deploy

1. Click **Add New...** → **Project**
2. Find and select your `CosmoHub` repo
3. Vercel will auto-detect settings:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave default)
4. Click **Deploy**

### 4. Wait & Done!

- Build takes ~30 seconds
- Your site will be live at `https://cosmohub-yourusername.vercel.app`

## API Endpoints

All endpoints are available at your Vercel domain:

```
https://cosmohub-yourusername.vercel.app/api/stats
https://cosmohub-yourusername.vercel.app/api/announcements
https://cosmohub-yourusername.vercel.app/api/events
https://cosmohub-yourusername.vercel.app/api/communities
https://cosmohub-yourusername.vercel.app/api/profile
https://cosmohub-yourusername.vercel.app/api/schedule
https://cosmohub-yourusername.vercel.app/api/tasks
https://cosmohub-yourusername.vercel.app/api/online
https://cosmohub-yourusername.vercel.app/api/badges
https://cosmohub-yourusername.vercel.app/api/messages
https://cosmohub-yourusername.vercel.app/api/send-message
```

## What's Different from Full Backend?

| Feature | Full Backend (Node.js) | Vercel Version |
|---------|------------------------|----------------|
| Real-time chat | ✅ WebSocket | ⚠️ Polling (5 sec) |
| Database | ✅ SQLite | ❌ In-memory (resets on deploy) |
| Data persistence | ✅ Saved to file | ❌ Lost on redeploy |
| Free forever | ❌ Needs server | ✅ Yes |
| Credit card | ❌ Required on Render | ✅ Not needed |

## Limitations

- Chat messages are stored in memory and reset when Vercel redeploys
- For a school project, this is fine
- For production, you'd need a real database (Supabase, MongoDB Atlas free tier)

## Next Steps

1. Copy the `api/` folder files into your repo
2. Copy the Vercel JS files into `frontend/`
3. Push to GitHub
4. Deploy on Vercel
