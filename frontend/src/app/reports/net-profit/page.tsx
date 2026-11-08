'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  Percent,
  Plus,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  Wallet,
  Clock,
  Landmark
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

export default function NetProfitPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchNetProfit = async (dateStr?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = dateStr ? `/dashboard/net-profit?date=${dateStr}` : '/dashboard/net-profit';
      const res = await api.get(url);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load net profit report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetProfit();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    fetchNetProfit(e.target.value);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition text-slate-600 hover:text-slate-900 shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Today's Net Profit Report</h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  After Operational Deductions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                True bottom-line business profit after deducting store expenses and overheads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <Link
              href="/expenses"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </Link>

            <button
              onClick={() => {
                setSelectedDate('');
                fetchNetProfit();
              }}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition"
              title="Refresh / Reset to Today"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formula Explanation Alert */}
        <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-teal-950">Net Profit Accounting Rule:</span>
              <p className="text-slate-600 mt-0.5">
                <code className="font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded text-teal-800">
                  Net Profit = Gross Profit - Operating Shop Expenses
                </code>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold bg-white px-2.5 py-1 rounded-xl shadow-sm border border-teal-200">
            Double-Entry Compliant
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Trading Profit</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900">
                {data ? formatPKR(data.grossProfit) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Trading surplus before overheads</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Operating Expenses</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-rose-600">
                {data ? formatPKR(data.operatingExpenses) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {data?.expenses?.length || 0} expense vouchers logged today
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Net Bottom-Line Profit</span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-extrabold ${
                data && data.netProfit < 0 ? 'text-rose-600' : 'text-teal-600'
              }`}>
                {data ? formatPKR(data.netProfit) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Net earnings retained by shop</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Net Profit Margin</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-purple-700">
                {data ? `${data.netProfitMargin}%` : '0%'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Net profit as % of sales revenue</p>
            </div>
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        {data?.expenseBreakdown && data.expenseBreakdown.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-sm mb-3">Expenses Breakdown by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.expenseBreakdown.map((cat: any) => (
                <div key={cat.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-xs font-medium text-slate-500 block truncate">{cat.name}</span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {formatPKR(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Today's Expense Records</h2>
              <p className="text-xs text-slate-500">Every operational disbursement logged today</p>
            </div>
            <Link href="/expenses" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All Expenses &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-sm">Calculating net profit figures...</p>
            </div>
          ) : !data?.expenses || data.expenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Wallet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No shop expenses recorded today</p>
              <p className="text-xs text-slate-400 mt-1">
                Any operational expenses (electricity, rent, tea, salaries) logged will deduct from gross profit here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Title / Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Account</th>
                    <th className="py-3 px-4">Logged By</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.expenses.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{e.title}</div>
                        {e.description && (
                          <div className="text-[10px] text-slate-500">{e.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {e.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-slate-400" />
                          <span>{e.paymentAccount?.name || 'Cash in Hand'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {e.user?.name || 'Staff'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        {formatPKR(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

