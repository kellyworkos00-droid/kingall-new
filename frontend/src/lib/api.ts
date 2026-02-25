import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/alerts/low-stock'),
};

// Warehouses API
export const warehousesAPI = {
  getAll: () => api.get('/warehouses'),
  create: (data: any) => api.post('/warehouses', data),
  update: (id: string, data: any) => api.put(`/warehouses/${id}`, data),
  delete: (id: string) => api.delete(`/warehouses/${id}`),
};

// Stock API
export const stockAPI = {
  getAll: (params?: any) => api.get('/stock', { params }),
  getMovements: (params?: any) => api.get('/stock/movements', { params }),
  createMovement: (data: any) => api.post('/stock/movements', data),
};

// Customers API
export const customersAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Suppliers API
export const suppliersAPI = {
  getAll: (params?: any) => api.get('/suppliers', { params }),
  getById: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: (params?: any) => api.get('/sales', { params }),
  getById: (id: string) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  update: (id: string, data: any) => api.put(`/sales/${id}`, data),
  delete: (id: string) => api.delete(`/sales/${id}`),
};

// Purchases API
export const purchasesAPI = {
  getAll: (params?: any) => api.get('/purchases', { params }),
  getById: (id: string) => api.get(`/purchases/${id}`),
  create: (data: any) => api.post('/purchases', data),
  update: (id: string, data: any) => api.put(`/purchases/${id}`, data),
  delete: (id: string) => api.delete(`/purchases/${id}`),
  receive: (id: string, data: any) => api.post(`/purchases/${id}/receive`, data),
};

// Accounts API
export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id: string) => api.get(`/accounts/${id}`),
  create: (data: any) => api.post('/accounts', data),
  update: (id: string, data: any) => api.put(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};

// Journals API
export const journalsAPI = {
  getAll: (params?: any) => api.get('/journals', { params }),
  getById: (id: string) => api.get(`/journals/${id}`),
  create: (data: any) => api.post('/journals', data),
  delete: (id: string) => api.delete(`/journals/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (params?: any) => api.get('/dashboard/stats', { params }),
  getSalesTrend: (params?: any) => api.get('/dashboard/sales-trend', { params }),
  getTopProducts: (params?: any) => api.get('/dashboard/top-products', { params }),
  getRecentActivities: (params?: any) => api.get('/dashboard/recent-activities', { params }),
};

// Reports API
export const reportsAPI = {
  sales: (params?: any) => api.get('/reports/sales', { params }),
  purchases: (params?: any) => api.get('/reports/purchases', { params }),
  inventoryValuation: () => api.get('/reports/inventory-valuation'),
  customerStatement: (customerId: string, params?: any) =>
    api.get(`/reports/customer-statement/${customerId}`, { params }),
  supplierStatement: (supplierId: string, params?: any) =>
    api.get(`/reports/supplier-statement/${supplierId}`, { params }),
  profitLoss: (params?: any) => api.get('/reports/profit-loss', { params }),
  balanceSheet: () => api.get('/reports/balance-sheet'),
  trialBalance: () => api.get('/reports/trial-balance'),
};
