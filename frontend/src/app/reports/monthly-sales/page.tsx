'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { api, formatPKR } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
  FileText,
  Clock,
  RefreshCw,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

export default function MonthlySalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-indexed for JS Date
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMonthlySales = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/dashboard/monthly-sales?year=${selectedYear}&month=${selectedMonth}`);
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load monthly sales data:', err);
      setError(err?.response?.data?.message || 'Failed to load monthly sales details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlySales();
  }, [selectedYear, selectedMonth]);

  const sales: any[] = data?.sales || [];

  const filteredOrders = sales.filter((order: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (order.invoiceNumber || '').toLowerCase().includes(q) ||
      (order.customer?.name || '').toLowerCase().includes(q) ||
      (order.customer?.phone || '').includes(q)
    );
  });

  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  const dailyTrend: any[] = data?.dailyTrend || [];
  const maxDaily = Math.max(...dailyTrend.map((d: any) => Number(d.amount || 0)), 1);

  const monthlyTotal = Number(data?.monthlyTotal ?? 0);
  const monthlyOrders = Number(data?.monthlyOrders ?? 0);
  const cashSales = Number(data?.cashSales ?? 0);
  const creditSales = Number(data?.creditSales ?? 0);
  const growthPercent = Number(data?.growthPercent ?? 0);

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
                <Calendar className="w-6 h-6 text-indigo-600" />
                Monthly Sales Report
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed monthly revenue trends, order history, and daily turnover
              </p>
            </div>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              onClick={fetchMonthlySales}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Month Sales
              </span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {formatPKR(monthlyTotal)}
            </div>
            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              <span>
                Growth:{' '}
                <strong className={growthPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {growthPercent}%
                </strong>{' '}
                vs last month
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Invoices
              </span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {monthlyOrders.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Average ticket:{' '}
              <strong className="text-gray-700 dark:text-gray-300">
                {formatPKR(monthlyOrders > 0 ? Math.round(monthlyTotal / monthlyOrders) : 0)}
              </strong>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cash Sales
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-600">
              {formatPKR(cashSales)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {monthlyTotal > 0 ? Math.round((cashSales / monthlyTotal) * 100) : 0}% of monthly volume
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Credit (Udhaar) Sales
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-600">
              {formatPKR(creditSales)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {monthlyTotal > 0 ? Math.round((creditSales / monthlyTotal) * 100) : 0}% of monthly volume
            </div>
          </div>
        </div>

        {/* Daily Breakdown Visualizer */}
        {dailyTrend.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Sales Trend</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Turnover per day in {data?.monthName || ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1 items-end h-44 pt-6 border-b border-gray-100 dark:border-gray-800">
              {dailyTrend.map((d: any, idx: number) => {
                const amount = Number(d.amount || 0);
                const heightPercent = maxDaily > 0 ? (amount / maxDaily) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
                      <div className="bg-gray-900 text-white text-[11px] rounded px-2 py-1 shadow-lg whitespace-nowrap">
                        {d.day}: {formatPKR(amount)} ({d.count} orders)
                      </div>
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${
                        amount > 0
                          ? 'bg-indigo-500 hover:bg-indigo-600 cursor-pointer'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-400 mt-1">{d.dayNumber || idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Invoices</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredOrders.length} transaction(s)
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Payment Method</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>Loading invoices...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No sales recorded for this month</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {order.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.customer?.name || 'Walk-in Customer'}
                        </div>
                        {order.customer?.phone && (
                          <div className="text-xs text-gray-400">{order.customer.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                          {order.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {order.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {formatPKR(order.netAmount ?? 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
