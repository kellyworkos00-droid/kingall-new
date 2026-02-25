# Deployment Guide - Elegant Steel Hardware ERP

This guide covers multiple deployment options for the ERP system.

## Table of Contents
1. [Quick Start (Local Development)](#quick-start)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (or use the provided Neon database)
- Git

### Step 1: Install Backend

```powershell
cd backend
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend runs on: `http://localhost:5000`

### Step 2: Install Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Step 3: Access the System

Open your browser and navigate to `http://localhost:3000`

Login with:
- Email: `admin@kellyos.com`
- Password: `Admin@123`

---

## Docker Deployment

### Option 1: Docker Compose (Recommended)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=erp_user
      - POSTGRES_PASSWORD=your_secure_password
      - POSTGRES_DB=erp_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

### Deploy with Docker Compose

```powershell
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## Production Deployment

### Option 1: VPS / Cloud Server (DigitalOcean, AWS, etc.)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Clone and Setup Application

```bash
# Clone repository
git clone <your-repo-url>
cd elegant-steel-erp

# Setup backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
cd ..

# Setup frontend
cd frontend
npm install
npm run build
cd ..
```

#### 3. Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'erp-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'erp-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/erp`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

#### Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

Follow the prompts to deploy.

#### Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

---

## Environment Configuration

### Production Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://neondb_owner:npg_K1Wkfr7cFjCV@ep-divine-fire-ai5f63b2-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret (Generate a strong secret)
JWT_SECRET="your-super-secure-random-string-min-32-chars"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="production"

# Frontend URL (update with your domain)
FRONTEND_URL="https://your-domain.com"
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Generate Secure JWT Secret

```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## Database Setup

### Using Neon (Provided Database)

The project is pre-configured to use Neon PostgreSQL. No additional database setup required.

```env
DATABASE_URL="postgresql://neondb_owner:npg_K1Wkfr7cFjCV@ep-divine-fire-ai5f63b2-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Using Your Own PostgreSQL

1. Create a new database:

```sql
CREATE DATABASE erp_db;
CREATE USER erp_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE erp_db TO erp_user;
```

2. Update DATABASE_URL:

```env
DATABASE_URL="postgresql://erp_user:your_password@localhost:5432/erp_db"
```

3. Run migrations:

```bash
cd backend
npx prisma migrate deploy
npm run db:seed
```

### Database Backup

```bash
# Backup
pg_dump -h your-host -U your-user -d erp_db > backup.sql

# Restore
psql -h your-host -U your-user -d erp_db < backup.sql
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to database"

**Solution**: Check DATABASE_URL is correct and database is running

```bash
# Test connection
npx prisma db pull
```

#### 2. "Port already in use"

**Solution**: Kill process on port

```powershell
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### 3. "Prisma Client not generated"

**Solution**: Generate Prisma client

```bash
cd backend
npx prisma generate
```

#### 4. "Migration failed"

**Solution**: Reset database and re-migrate

```bash
npx prisma migrate reset
npx prisma migrate deploy
npm run db:seed
```

#### 5. "CORS errors on frontend"

**Solution**: Update FRONTEND_URL in backend .env

```env
FRONTEND_URL="http://localhost:3000"
```

### Performance Optimization

1. **Enable caching**:
   - Add Redis for session management
   - Enable Next.js caching

2. **Database indexing**:
   - Already optimized in schema
   - Monitor slow queries

3. **CDN for static assets**:
   - Use Cloudflare or similar
   - Enable Next.js image optimization

### Monitoring

```bash
# View PM2 logs
pm2 logs

# Monitor processes
pm2 monit

# View specific app logs
pm2 logs erp-backend
pm2 logs erp-frontend
```

---

## Support

For deployment assistance, contact: pkingori14@gmail.com

---

**Deployment Checklist:**

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Database seeded with initial data
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Domain DNS configured
- [ ] Test all functionality
- [ ] Change default passwords

---

**Production Ready! 🚀**
