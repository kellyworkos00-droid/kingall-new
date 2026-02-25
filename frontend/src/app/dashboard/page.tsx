'use client';

import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiAlertCircle,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivities({ limit: 10 }),
      ]);

      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue || 0),
      icon: FiDollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Sales',
      value: stats?.salesCount || 0,
      icon: FiShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Stock Value',
      value: formatCurrency(stats?.stockValue || 0),
      icon: FiPackage,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      icon: FiAlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      title: 'Profit',
      value: formatCurrency(stats?.profit || 0),
      icon: FiTrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: FiUsers,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action} - {activity.entity}
                  </p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user.name} •{' '}
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/dashboard/sales"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <FiShoppingCart className="mx-auto mb-2 text-primary-600" size={32} />
            <h3 className="font-semibold text-gray-900">New Sale</h3>
            <p className="text-sm text-gray-600 mt-1">Create a sales order</p>
          </div>
        </a>
        <a
          href="/dashboard/inventory"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <FiPackage className="mx-auto mb-2 text-primary-600" size={32} />
            <h3 className="font-semibold text-gray-900">Manage Stock</h3>
            <p className="text-sm text-gray-600 mt-1">Update inventory</p>
          </div>
        </a>
        <a
          href="/dashboard/customers"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <FiUsers className="mx-auto mb-2 text-primary-600" size={32} />
            <h3 className="font-semibold text-gray-900">Add Customer</h3>
            <p className="text-sm text-gray-600 mt-1">Register new customer</p>
          </div>
        </a>
        <a
          href="/dashboard/reports"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <FiDollarSign className="mx-auto mb-2 text-primary-600" size={32} />
            <h3 className="font-semibold text-gray-900">View Reports</h3>
            <p className="text-sm text-gray-600 mt-1">Financial reports</p>
          </div>
        </a>
      </div>
    </div>
  );
}
