# Elegant Steel Hardware - ERP System

A complete, production-ready ERP (Enterprise Resource Planning) system built for Elegant Steel Hardware. This modern, full-stack application handles inventory management, sales, purchases, accounting, CRM, and reporting.

## 🚀 Features

### Core Modules

- **Authentication & User Management**
  - Secure JWT-based authentication
  - Role-based access control (Admin, Manager, Accountant, Sales, Storekeeper)
  - Password hashing with bcrypt
  - User management dashboard

- **Inventory Management**
  - Products with categories, SKU, pricing, and stock levels
  - Multiple warehouse support
  - Stock movements (in, out, adjustments, transfers)
  - Low stock alerts
  - Barcode support

- **Sales & POS**
  - Fast sales order creation
  - Customer management with credit limits
  - Multiple payment methods (Cash, Bank, Mobile Money, Credit)
  - Real-time stock updates
  - Sales reports and analytics

- **Purchases & Suppliers**
  - Supplier management
  - Purchase order creation
  - Goods received notes
  - Supplier balances tracking

- **Accounting & Finance**
  - Complete chart of accounts
  - Double-entry bookkeeping system
  - Automated journal entries for transactions
  - Financial reports:
    - Profit & Loss Statement
    - Balance Sheet
    - Trial Balance

- **Customer Relationship Management (CRM)**
  - Customer profiles and history
  - Transaction tracking
  - Customer statements
  - Credit management

- **Dashboard & Analytics**
  - Real-time KPIs
  - Revenue and profit tracking
  - Stock value calculations
  - Recent activity logs
  - Sales trends

- **Comprehensive Reporting**
  - Sales reports
  - Purchase reports
  - Inventory valuation
  - Customer statements
  - Supplier statements
  - Financial statements

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: react-icons

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use the provided Neon database URL)
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd "c:\Users\zachn\OneDrive\Desktop\new ele"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
# The .env file is already configured with the Neon database

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npm run db:seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔑 Default Credentials

After seeding the database, you can log in with:

**Admin Account:**
- Email: `admin@kellyos.com`
- Password: `Admin@123`

**Owner Account:**
- Email: `pkingori14@gmail.com`
- Password: `owner@2026`

## 📁 Project Structure

```
elegant-steel-erp/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # Prisma client config
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts     # Authentication routes
│   │   │   ├── user.routes.ts     # User management
│   │   │   ├── product.routes.ts  # Products
│   │   │   ├── sales.routes.ts    # Sales orders
│   │   │   ├── purchase.routes.ts # Purchase orders
│   │   │   ├── account.routes.ts  # Chart of accounts
│   │   │   ├── journal.routes.ts  # Journal entries
│   │   │   ├── dashboard.routes.ts# Dashboard stats
│   │   │   └── report.routes.ts   # Reports
│   │   ├── seed.ts                # Database seeder
│   │   └── server.ts              # Express server
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── login/             # Login page
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── globals.css        # Global styles
│   │   ├── lib/
│   │   │   ├── api.ts             # API client
│   │   │   └── utils.ts           # Utility functions
│   │   └── store/
│   │       └── authStore.ts       # Auth state management
│   ├── .env.local                 # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/alerts/low-stock` - Get low stock alerts

### Sales
- `GET /api/sales` - Get all sales orders
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Purchases
- `GET /api/purchases` - Get all purchase orders
- `POST /api/purchases` - Create purchase order
- `POST /api/purchases/:id/receive` - Receive goods

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales-trend` - Get sales trend
- `GET /api/dashboard/top-products` - Get top products
- `GET /api/dashboard/recent-activities` - Get recent activities

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/purchases` - Purchase report
- `GET /api/reports/inventory-valuation` - Inventory valuation
- `GET /api/reports/profit-loss` - Profit & Loss statement
- `GET /api/reports/balance-sheet` - Balance Sheet
- `GET /api/reports/trial-balance` - Trial Balance

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control
- Protected API routes
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema including:
- Users with role-based permissions
- Products and categories
- Warehouses and stock tracking
- Customers and suppliers
- Sales and purchase orders
- Chart of accounts
- Journal entries (double-entry bookkeeping)
- Activity logs for auditing

## 🚢 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Docker deployment
- Environment configuration
- Database migrations
- SSL/HTTPS setup
- Scaling considerations

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📝 License

This project is proprietary software for Elegant Steel Hardware.

## 👥 Support

For support, email: pkingori14@gmail.com

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Multi-branch support
- [ ] Backup & restore functionality
- [ ] Dark mode
- [ ] Mobile PWA
- [ ] Advanced reporting with Excel export
- [ ] Barcode scanning
- [ ] Payment gateway integration

---

**Built with ❤️ for Elegant Steel Hardware**
