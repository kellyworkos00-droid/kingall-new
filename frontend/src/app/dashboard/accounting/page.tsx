'use client';

import { useEffect, useState } from 'react';
import { accountsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AccountingPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  const groupedAccounts = {
    ASSET: accounts.filter(a => a.type === 'ASSET'),
    LIABILITY: accounts.filter(a => a.type === 'LIABILITY'),
    EQUITY: accounts.filter(a => a.type === 'EQUITY'),
    REVENUE: accounts.filter(a => a.type === 'REVENUE'),
    EXPENSE: accounts.filter(a => a.type === 'EXPENSE'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
        <p className="text-gray-600 mt-1">View your accounting structure</p>
      </div>

      {Object.entries(groupedAccounts).map(([type, accounts]) => (
        <div key={type} className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{type}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account: any) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(account.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
