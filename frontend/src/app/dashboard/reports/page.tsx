'use client';

import { useEffect, useState } from 'react';
import { reportsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { FiDownload, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plRes, bsRes] = await Promise.all([
        reportsAPI.profitLoss(),
        reportsAPI.balanceSheet(),
      ]);

      setProfitLoss(plRes.data);
      setBalanceSheet(bsRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-1">View your financial statements</p>
      </div>

      {/* Profit & Loss */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profit & Loss Statement</h2>
          <button className="btn btn-secondary text-sm flex items-center space-x-2">
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Revenue</h3>
            <div className="pl-4 space-y-1">
              {profitLoss?.revenue.accounts.map((acc: any) => (
                <div key={acc.code} className="flex justify-between text-sm">
                  <span className="text-gray-600">{acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total Revenue</span>
                <span>{formatCurrency(profitLoss?.revenue.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Expenses</h3>
            <div className="pl-4 space-y-1">
              {profitLoss?.expenses.accounts.map((acc: any) => (
                <div key={acc.code} className="flex justify-between text-sm">
                  <span className="text-gray-600">{acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total Expenses</span>
                <span>{formatCurrency(profitLoss?.expenses.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold pt-4 border-t-2">
            <span>Net Profit</span>
            <span className={parseFloat(profitLoss?.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(profitLoss?.netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Balance Sheet</h2>
          <button className="btn btn-secondary text-sm flex items-center space-x-2">
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Assets</h3>
            <div className="pl-4 space-y-1">
              {balanceSheet?.assets.accounts.map((acc: any) => (
                <div key={acc.code} className="flex justify-between text-sm">
                  <span className="text-gray-600">{acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total Assets</span>
                <span>{formatCurrency(balanceSheet?.assets.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Liabilities</h3>
            <div className="pl-4 space-y-1">
              {balanceSheet?.liabilities.accounts.map((acc: any) => (
                <div key={acc.code} className="flex justify-between text-sm">
                  <span className="text-gray-600">{acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total Liabilities</span>
                <span>{formatCurrency(balanceSheet?.liabilities.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Equity</h3>
            <div className="pl-4 space-y-1">
              {balanceSheet?.equity.accounts.map((acc: any) => (
                <div key={acc.code} className="flex justify-between text-sm">
                  <span className="text-gray-600">{acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Total Equity</span>
                <span>{formatCurrency(balanceSheet?.equity.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
