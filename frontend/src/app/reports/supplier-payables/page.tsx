'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Truck,
  DollarSign,
  FileText,
  Search,
  RefreshCw,
  Phone,
  Clock,
  Building2,
} from 'lucide-react';

interface SupplierPayablesData {
  summary: {
    totalPayables: number;
    creditorsCount: number;
  };
  suppliers: Array<{
    id: string;
    name: string;
    phone: string;
    balance: number;
    pendingPurchasesCount: number;
  }>;
  pendingPurchases: Array<{
    id: string;
    invoiceNumber: string;
    createdAt: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    supplier: {
      id: string;
      name: string;
      phone: string;
    };
  }>;
}

export default function SupplierPayablesPage() {
  const [data, setData] = useState<SupplierPayablesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'SUPPLIERS' | 'PURCHASES'>('SUPPLIERS');

  const fetchPayables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/supplier-payables');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load supplier payables:', err);
      setError(err?.response?.data?.message || 'Failed to load supplier payables details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  const filteredSuppliers = (data?.suppliers || []).filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
  });

  const filteredPurchases = (data?.pendingPurchases || []).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.invoiceNumber.toLowerCase().includes(q) ||
      (p.supplier?.name || '').toLowerCase().includes(q) ||
      (p.supplier?.phone || '').includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="w-6 h-6 text-rose-600" />
                Supplier Payables (Khaata / Due to Vendors)
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Outstanding liabilities, pending supplier orders, and payment commitments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPayables}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/suppliers"
              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
            >
              Manage Suppliers
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Outstanding Payables
              </span>
              <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-rose-600">
              PKR {(data?.summary.totalPayables || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total liability due to vendors & distributors
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vendors with Balance
              </span>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {(data?.summary.creditorsCount || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Suppliers with outstanding credit
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Purchase Invoices
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-amber-600">
              {(data?.pendingPurchases?.length || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Purchases with pending balances
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewTab('SUPPLIERS')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  viewTab === 'SUPPLIERS'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Supplier Accounts ({filteredSuppliers.length})
              </button>
              <button
                onClick={() => setViewTab('PURCHASES')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  viewTab === 'PURCHASES'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Pending Purchase Bills ({filteredPurchases.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {viewTab === 'SUPPLIERS' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3">Supplier / Vendor</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3 text-center">Pending Purchases</th>
                    <th className="px-6 py-3 text-right">Outstanding Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No outstanding supplier payables recorded. All vendor accounts are settled!
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((sup) => (
                      <tr key={sup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {sup.name}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {sup.phone ? (
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {sup.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                            {sup.pendingPurchasesCount} pending
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400">
                          PKR {sup.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3">Purchase Invoice #</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Supplier</th>
                    <th className="px-6 py-3 text-right">Total Bill</th>
                    <th className="px-6 py-3 text-right">Paid Amount</th>
                    <th className="px-6 py-3 text-right">Pending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading pending purchases...
                      </td>
                    </tr>
                  ) : filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No pending purchase invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {pur.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(pur.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {pur.supplier?.name}
                          </div>
                          {pur.supplier?.phone && (
                            <div className="text-xs text-gray-400">{pur.supplier.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          PKR {pur.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                          PKR {pur.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400">
                          PKR {pur.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
