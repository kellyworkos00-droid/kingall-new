'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiShoppingBag,
  FiUsers,
  FiTruck,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
    { icon: FiPackage, label: 'Inventory', href: '/dashboard/inventory' },
    { icon: FiShoppingCart, label: 'Sales', href: '/dashboard/sales' },
    { icon: FiShoppingBag, label: 'Purchases', href: '/dashboard/purchases' },
    { icon: FiUsers, label: 'Customers', href: '/dashboard/customers' },
    { icon: FiTruck, label: 'Suppliers', href: '/dashboard/suppliers' },
    { icon: FiDollarSign, label: 'Accounting', href: '/dashboard/accounting' },
    { icon: FiFileText, label: 'Reports', href: '/dashboard/reports' },
    { icon: FiSettings, label: 'Settings', href: '/dashboard/settings' },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Elegant Steel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <FiMenu size={24} />
            </button>

            <div className="flex-1 lg:ml-0 ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome back, {user.name}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
