'use client';

import { useEffect, useState } from 'react';
import { salesAPI, customersAPI, productsAPI, warehousesAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    warehouseId: '',
    items: [{ productId: '', quantity: 1 }],
    discount: 0,
    tax: 0,
    paymentMethod: 'CASH',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesRes, customersRes, productsRes, warehousesRes] = await Promise.all([
        salesAPI.getAll(),
        customersAPI.getAll(),
        productsAPI.getAll({ limit: 100 }),
        warehousesAPI.getAll(),
      ]);

      setSales(salesRes.data.salesOrders);
      setCustomers(customersRes.data.customers);
      setProducts(productsRes.data.products);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salesAPI.create(formData);
      toast.success('Sale created successfully');
      setShowModal(false);
      setFormData({
        customerId: '',
        warehouseId: '',
        items: [{ productId: '', quantity: 1 }],
        discount: 0,
        tax: 0,
        paymentMethod: 'CASH',
        notes: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create sale');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage your sales orders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Sale</span>
        </button>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(sale.orderDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sale.grandTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Warehouse</label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) =>
                      setFormData({ ...formData, warehouseId: e.target.value })
                    }
                    className="input"
                    required
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Item
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, 'productId', e.target.value)
                      }
                      className="input flex-1"
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.sellingPrice)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', parseInt(e.target.value))
                      }
                      className="input w-24"
                      placeholder="Qty"
                      required
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Tax</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({ ...formData, tax: parseFloat(e.target.value) })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="input"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
