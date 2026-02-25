# Vercel Deployment Guide - Elegant Steel Hardware ERP

This guide will help you deploy the ERP system to Vercel in minutes.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. GitHub repository (already set up at https://github.com/kellyworkos00-droid/project-elegant)

---

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Deploy Frontend

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository: `kellyworkos00-droid/project-elegant`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: (Will be your backend URL, add after deploying backend)

6. Click **"Deploy"**

### Step 2: Deploy Backend

1. In Vercel Dashboard, click **"Add New Project"** again
2. Import the same repository: `kellyworkos00-droid/project-elegant`
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_K1Wkfr7cFjCV@ep-divine-fire-ai5f63b2-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
   
   - **Key**: `JWT_SECRET`
   - **Value**: `elegant-steel-hardware-secret-key-2026-production`
   
   - **Key**: `JWT_EXPIRES_IN`
   - **Value**: `7d`
   
   - **Key**: `NODE_ENV`
   - **Value**: `production`

5. Click **"Deploy"**

### Step 3: Update Frontend Environment

1. Copy your backend deployment URL (e.g., `https://your-backend.vercel.app`)
2. Go to your Frontend project in Vercel
3. Settings → Environment Variables
4. Update `NEXT_PUBLIC_API_URL` to: `https://your-backend.vercel.app/api`
5. Redeploy the frontend

### Step 4: Initialize Database

After backend is deployed, you need to run migrations:

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login to Vercel
vercel login

# Link to your backend project
cd backend
vercel link

# Run database migrations
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

---

## Option 2: Deploy via CLI (Advanced)

### Deploy Backend

```bash
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# When prompted:
# - Set up and deploy? Y
# - Which scope? (Select your account)
# - Link to existing project? N
# - What's your project's name? elegant-steel-backend
# - In which directory is your code located? ./
# - Want to modify settings? N

# Add environment variables
vercel env add DATABASE_URL production
# Paste: postgresql://neondb_owner:npg_K1Wkfr7cFjCV@ep-divine-fire-ai5f63b2-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

vercel env add JWT_SECRET production
# Paste: elegant-steel-hardware-secret-key-2026-production

# Production deploy
vercel --prod
```

### Deploy Frontend

```bash
cd ../frontend

# Deploy
vercel

# When prompted:
# - Set up and deploy? Y
# - Link to existing project? N
# - What's your project's name? elegant-steel-frontend
# - In which directory is your code located? ./

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Paste your backend URL: https://your-backend.vercel.app/api

# Production deploy
vercel --prod
```

---

## Option 3: Deploy Monorepo (Single Project)

If you want both frontend and backend in one Vercel project:

1. Update your GitHub repository structure
2. Use Vercel's monorepo support
3. Create `vercel.json` in root:

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/next" },
    { "src": "backend/src/server.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/src/server.ts" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```

---

## Post-Deployment Steps

### 1. Run Database Migrations

```bash
# Using Vercel CLI
cd backend
vercel env pull .env.production
npx prisma migrate deploy
```

### 2. Seed Database

```bash
npm run db:seed
```

### 3. Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Login with:
   - Email: `admin@kellyos.com`
   - Password: `Admin@123`

### 4. Update CORS Settings

Update `backend/src/server.ts` to allow your Vercel frontend domain:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

Commit and push changes to trigger auto-deployment.

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL URL | Database connection string |
| `JWT_SECRET` | Secret key | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |
| `NODE_ENV` | `production` | Environment mode |
| `FRONTEND_URL` | Your frontend URL | For CORS configuration |

### Frontend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your backend URL + `/api` | Backend API endpoint |

---

## Automatic Deployments

Once set up, Vercel will automatically deploy when you push to GitHub:

- **Push to main**: Deploys to production
- **Push to other branches**: Creates preview deployments

---

## Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Go to Vercel Dashboard → Your Frontend Project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `erp.elegantsteelhardware.com`)
4. Follow DNS configuration instructions

### Add Custom Domain to Backend

1. Go to Vercel Dashboard → Your Backend Project
2. Click **"Settings"** → **"Domains"**
3. Add API subdomain (e.g., `api.elegantsteelhardware.com`)
4. Update frontend's `NEXT_PUBLIC_API_URL` to use custom domain

---

## Monitoring & Logs

### View Logs

```bash
# Real-time logs
vercel logs --follow

# View specific deployment logs
vercel logs [deployment-url]
```

### Monitoring Dashboard

- Go to Vercel Dashboard → Your Project → **"Analytics"**
- Monitor requests, errors, and performance

---

## Troubleshooting

### Build Fails

**Error**: "Cannot find module 'express'"
- **Fix**: Ensure `package.json` dependencies are correct
- Run: `vercel env pull` and check environment variables

**Error**: "Prisma Client not generated"
- **Fix**: Add postinstall script to `backend/package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Issues

**Error**: "Can't reach database server"
- **Fix**: Verify `DATABASE_URL` is correctly set in Vercel
- Ensure Neon database accepts connections from `0.0.0.0/0`

### CORS Errors

**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Fix**: Update backend CORS configuration to include Vercel frontend URL
- Redeploy backend after changes

### API Returns 404

**Error**: Frontend can't connect to backend
- **Fix**: Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure it includes `/api` at the end
- Example: `https://your-backend.vercel.app/api`

---

## Performance Optimization

### Enable Edge Caching

Update `frontend/next.config.js`:

```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-backend.vercel.app'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
}
```

### Backend Performance

- Use Vercel Edge Functions for better performance
- Enable connection pooling in Neon database
- Add Redis for session management (optional)

---

## Costs

### Vercel Pricing

- **Hobby Plan**: Free
  - 100GB bandwidth
  - Unlimited deployments
  - Automatic HTTPS
  
- **Pro Plan**: $20/month
  - 1TB bandwidth
  - Advanced analytics
  - Password protection

### Database (Neon)

- Already using Neon Free Tier
- Consider upgrading for production workloads

---

## Backup & Rollback

### Rollback Deployment

```bash
# List deployments
vercel ls

# Promote a previous deployment to production
vercel promote [deployment-url]
```

### Database Backup

```bash
# Export database
pg_dump [DATABASE_URL] > backup.sql

# Restore from backup
psql [DATABASE_URL] < backup.sql
```

---

## Security Checklist

- [ ] Change default admin passwords
- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Enable Vercel's password protection (Pro plan)
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting (implement in backend)
- [ ] Use environment variables for all secrets
- [ ] Enable Vercel's DDoS protection

---

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Run database migrations
4. ✅ Test the application
5. ✅ Add custom domain (optional)
6. ✅ Set up monitoring
7. ✅ Change default passwords

---

**Your ERP system will be live at:**
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.vercel.app`

**Support**: pkingori14@gmail.com

---

**Deployment Complete! 🚀**
