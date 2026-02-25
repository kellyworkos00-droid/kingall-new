# Vercel Frontend Deployment - Quick Fix

## The Error You're Seeing

```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```

## Solution: Set Root Directory

The issue is that Vercel needs to know where your frontend code is located.

### Fix in Vercel Dashboard:

1. Go to your Vercel project settings
2. Click **Settings** → **General**
3. Scroll to **Root Directory**
4. Set it to: `frontend`
5. Click **Save**
6. Go to **Deployments** and click **Redeploy**

## OR Deploy New Project Correctly

If you haven't deployed yet, here's the correct setup:

### Step 1: Import Project
1. Go to https://vercel.com/new
2. Import: `kellyworkos00-droid/project-elegant`

### Step 2: Configure Project Settings
**IMPORTANT**: Before clicking Deploy, configure:

- **Project Name**: `elegant-steel-frontend`
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: Click **Edit** and enter `frontend` ✅
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)  
- **Install Command**: `npm install` (auto-filled)

### Step 3: Environment Variables
Add this variable:

**Name**: `NEXT_PUBLIC_API_URL`  
**Value**: `https://your-backend-url.vercel.app/api`

(Replace with your actual backend URL after deploying backend)

### Step 4: Deploy
Click **Deploy** button

---

## For Backend Deployment

### Step 1: Import Same Repository
1. Go to https://vercel.com/new (new project)
2. Import: `kellyworkos00-droid/project-elegant`

### Step 2: Configure Project Settings
- **Project Name**: `elegant-steel-backend`
- **Framework Preset**: Other
- **Root Directory**: `backend` ✅
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add these:

```
DATABASE_URL = postgresql://neondb_owner:npg_K1Wkfr7cFjCV@ep-divine-fire-ai5f63b2-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET = elegant-steel-hardware-secret-key-2026-production

JWT_EXPIRES_IN = 7d

NODE_ENV = production
```

### Step 4: Deploy
Click **Deploy**

---

## After Deployment

### Update Frontend with Backend URL

1. Copy your backend URL (e.g., `https://elegant-steel-backend.vercel.app`)
2. Go to Frontend project → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to: `https://elegant-steel-backend.vercel.app/api`
4. Go to **Deployments** → Click on your deployment → **Redeploy**

### Update Backend CORS

1. After getting frontend URL, update backend to allow it
2. You'll need to modify the CORS settings if needed

---

## Troubleshooting

### "No Next.js version detected"
✅ **Fix**: Set Root Directory to `frontend` in Vercel settings

### "Cannot find module '@prisma/client'"
✅ **Fix**: Already configured with `postinstall` script in backend/package.json

### "Build failed" on backend
✅ **Fix**: Make sure all environment variables are set correctly

### CORS errors after deployment
✅ **Fix**: Update backend CORS to include your Vercel frontend URL

---

## Quick Checklist

**Frontend Deployment:**
- [ ] Root Directory = `frontend`
- [ ] Framework = Next.js
- [ ] Environment variable `NEXT_PUBLIC_API_URL` added
- [ ] Deployed successfully

**Backend Deployment:**
- [ ] Root Directory = `backend`
- [ ] All 4 environment variables added
- [ ] Build command = `npm run vercel-build`
- [ ] Deployed successfully

**Post-Deployment:**
- [ ] Frontend updated with backend URL
- [ ] Tested login at frontend URL
- [ ] Both applications accessible

---

**Need Help?**
Email: pkingori14@gmail.com
