# API Documentation - Elegant Steel Hardware ERP

Base URL: `http://localhost:5000/api` (Development)

All API endpoints require authentication unless specified otherwise.

## Authentication

All authenticated requests must include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Login

**POST** `/auth/login`

Login to get access token.

**Request Body:**
```json
{
  "email": "admin@kellyos.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@kellyos.com",
    "name": "System Admin",
    "role": "ADMIN"
  }
}
```

### Get Current User

**GET** `/auth/me`

Get currently authenticated user.

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@kellyos.com",
  "name": "System Admin",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Change Password

**POST** `/auth/change-password`

**Request Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewPassword@123"
}
```

---

## User Management

### Get All Users

**GET** `/users`

**Permissions:** Admin, Manager only

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SALES",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create User

**POST** `/users`

**Permissions:** Admin only

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "name": "New User",
  "role": "SALES"
}
```

**Roles:** ADMIN, MANAGER, ACCOUNTANT, SALES, STOREKEEPER

---

## Product Management

### Get All Products

**GET** `/products`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `search` (string): Search by name or SKU
- `categoryId` (UUID): Filter by category

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "sku": "SKU001",
      "name": "Steel Rod 10mm",
      "description": "High quality steel rod",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Steel Products"
      },
      "costPrice": "100.00",
      "sellingPrice": "150.00",
      "reorderLevel": 10,
      "barcode": "1234567890",
      "active": true,
      "stocks": [
        {
          "id": "uuid",
          "warehouseId": "uuid",
          "warehouse": {
            "name": "Main Warehouse"
          },
          "quantity": 50
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### Create Product

**POST** `/products`

**Request Body:**
```json
{
  "sku": "SKU002",
  "name": "Steel Pipe 2 inch",
  "description": "Galvanized steel pipe",
  "categoryId": "uuid",
  "costPrice": 500.00,
  "sellingPrice": 750.00,
  "reorderLevel": 20,
  "barcode": "9876543210"
}
```

### Get Low Stock Products

**GET** `/products/alerts/low-stock`

Returns products with stock at or below reorder level.

---

## Inventory Management

### Get Stock

**GET** `/stock`

**Query Parameters:**
- `warehouseId` (UUID): Filter by warehouse

**Response:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "product": {
      "name": "Steel Rod 10mm",
      "sku": "SKU001"
    },
    "warehouseId": "uuid",
    "warehouse": {
      "name": "Main Warehouse"
    },
    "quantity": 50
  }
]
```

### Create Stock Movement

**POST** `/stock/movements`

**Request Body:**
```json
{
  "productId": "uuid",
  "type": "IN",
  "quantity": 100,
  "toWarehouseId": "uuid",
  "notes": "Stock received from supplier"
}
```

**Types:**
- `IN`: Stock incoming to warehouse
- `OUT`: Stock outgoing from warehouse
- `TRANSFER`: Transfer between warehouses
- `ADJUSTMENT`: Stock adjustment

---

## Sales

### Get All Sales Orders

**GET** `/sales`

**Query Parameters:**
- `page`, `limit`: Pagination
- `customerId` (UUID): Filter by customer
- `startDate`, `endDate`: Date range filter

### Create Sales Order

**POST** `/sales`

**Request Body:**
```json
{
  "customerId": "uuid",
  "warehouseId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 5
    }
  ],
  "discount": 10.00,
  "tax": 15.00,
  "paymentMethod": "CASH",
  "notes": "Customer notes"
}
```

**Payment Methods:** CASH, BANK, MOBILE_MONEY, CREDIT

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "SO-000001",
  "customerId": "uuid",
  "orderDate": "2024-01-01T00:00:00.000Z",
  "totalAmount": "750.00",
  "discount": "10.00",
  "tax": "15.00",
  "grandTotal": "755.00",
  "paidAmount": "755.00",
  "balance": "0.00",
  "paymentMethod": "CASH",
  "status": "completed"
}
```

---

## Purchases

### Create Purchase Order

**POST** `/purchases`

**Request Body:**
```json
{
  "supplierId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 100,
      "unitPrice": 95.00
    }
  ],
  "discount": 50.00,
  "tax": 100.00,
  "notes": "Bulk order"
}
```

### Receive Goods

**POST** `/purchases/:id/receive`

**Request Body:**
```json
{
  "warehouseId": "uuid"
}
```

Updates stock and marks purchase order as received.

---

## Customer Management

### Get All Customers

**GET** `/customers`

### Create Customer

**POST** `/customers`

**Request Body:**
```json
{
  "name": "ABC Company",
  "email": "contact@abc.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "creditLimit": 10000.00
}
```

---

## Supplier Management

### Get All Suppliers

**GET** `/suppliers`

### Create Supplier

**POST** `/suppliers`

**Request Body:**
```json
{
  "name": "XYZ Suppliers Ltd",
  "email": "sales@xyz.com",
  "phone": "+9876543210",
  "address": "456 Industrial Ave"
}
```

---

## Accounting

### Get Chart of Accounts

**GET** `/accounts`

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "1100",
    "name": "Cash and Bank",
    "type": "ASSET",
    "balance": "50000.00",
    "active": true
  }
]
```

**Account Types:** ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE

### Create Journal Entry

**POST** `/journals`

**Request Body:**
```json
{
  "date": "2024-01-01",
  "description": "Manual journal entry",
  "type": "JOURNAL",
  "lines": [
    {
      "accountId": "uuid",
      "debit": 1000.00,
      "credit": 0,
      "description": "Debit entry"
    },
    {
      "accountId": "uuid",
      "debit": 0,
      "credit": 1000.00,
      "description": "Credit entry"
    }
  ]
}
```

**Note:** Total debits must equal total credits (double-entry accounting).

---

## Dashboard

### Get Dashboard Stats

**GET** `/dashboard/stats`

**Query Parameters:**
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "revenue": "150000.00",
  "purchases": "80000.00",
  "profit": "70000.00",
  "receivables": "25000.00",
  "payables": "15000.00",
  "stockValue": "200000.00",
  "lowStockCount": 5,
  "totalCustomers": 50,
  "totalSuppliers": 20,
  "totalProducts": 150,
  "salesCount": 200
}
```

### Get Sales Trend

**GET** `/dashboard/sales-trend`

**Query Parameters:**
- `period`: "month" or "day"

---

## Reports

### Sales Report

**GET** `/reports/sales`

**Query Parameters:**
- `startDate`, `endDate`: Date range
- `customerId`: Filter by customer

### Profit & Loss Statement

**GET** `/reports/profit-loss`

**Query Parameters:**
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "revenue": {
    "total": "150000.00",
    "accounts": [...]
  },
  "expenses": {
    "total": "80000.00",
    "accounts": [...]
  },
  "netProfit": "70000.00"
}
```

### Balance Sheet

**GET** `/reports/balance-sheet`

**Response:**
```json
{
  "assets": {
    "total": "500000.00",
    "accounts": [...]
  },
  "liabilities": {
    "total": "200000.00",
    "accounts": [...]
  },
  "equity": {
    "total": "300000.00",
    "accounts": [...]
  }
}
```

### Trial Balance

**GET** `/reports/trial-balance`

### Inventory Valuation

**GET** `/reports/inventory-valuation`

### Customer Statement

**GET** `/reports/customer-statement/:customerId`

### Supplier Statement

**GET** `/reports/supplier-statement/:supplierId`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kellyos.com","password":"Admin@123"}'

# Get products (with auth)
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the API base URL
2. Set Authorization type to "Bearer Token"
3. Add token from login response
4. Test endpoints

---

**API Version:** 1.0.0  
**Last Updated:** 2024
