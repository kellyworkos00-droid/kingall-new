# Quick Start Guide - Elegant Steel Hardware ERP

## 🚀 Get Started in 5 Minutes

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Setup Database

```powershell
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with initial data (creates admin users and chart of accounts)
npm run db:seed
```

### Step 3: Start Backend Server

```powershell
npm run dev
```

✅ Backend running at `http://localhost:5000`

### Step 4: Install Frontend Dependencies

Open a **new terminal window**:

```powershell
cd frontend
npm install
```

### Step 5: Start Frontend

```powershell
npm run dev
```

✅ Frontend running at `http://localhost:3000`

### Step 6: Login

1. Open your browser to `http://localhost:3000`
2. Login with default credentials:
   - **Email**: `admin@kellyos.com`
   - **Password**: `Admin@123`

---

## 🎯 What's Next?

### Explore the System

1. **Dashboard** - View business analytics and KPIs
2. **Inventory** - Add products and manage stock
3. **Sales** - Create sales orders
4. **Customers** - Add customer information
5. **Reports** - View financial statements

### Add Your First Product

1. Go to **Inventory** → Click **Add Product**
2. Fill in product details:
   - SKU, Name, Category
   - Cost Price, Selling Price
   - Reorder Level
3. Click **Create Product**

### Make Your First Sale

1. Go to **Sales** → Click **New Sale**
2. Select customer and warehouse
3. Add products and quantities
4. Choose payment method
5. Click **Create Sale**

### View Financial Reports

1. Go to **Reports**
2. View:
   - Profit & Loss Statement
   - Balance Sheet
   - Sales Reports

---

## ⚙️ Configuration

### Database Connection

The system uses Neon PostgreSQL (cloud database). Connection string is already configured in `backend/.env`

To use your own database:

1. Edit `backend/.env`
2. Update `DATABASE_URL` with your PostgreSQL connection string
3. Run migrations: `npx prisma migrate dev`

### Change Default Passwords

**Important for production!**

1. Login as admin
2. Go to **Settings**
3. Change your password
4. Update other user passwords

---

## 🐛 Troubleshooting

### "Cannot connect to database"

```powershell
# Test database connection
cd backend
npx prisma db pull
```

### "Port 5000 already in use"

```powershell
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "Prisma client not found"

```powershell
cd backend
npx prisma generate
```

### Frontend won't connect to backend

1. Check backend is running on port 5000
2. Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Clear browser cache

---

## 📚 Additional Resources

- [Full README](./README.md) - Complete documentation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [API Documentation](./API_DOCUMENTATION.md) - REST API reference

---

## 🆘 Need Help?

**Email**: pkingori14@gmail.com

**Common Commands**:

```powershell
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:seed      # Seed database

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

---

**You're all set! 🎉**

Start managing your hardware business with Elegant Steel ERP!
