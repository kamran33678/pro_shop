'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  Search,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  PackageCheck,
  CheckCircle2
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

export default function GrossProfitPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchProfit = async (dateStr?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = dateStr ? `/dashboard/gross-profit?date=${dateStr}` : '/dashboard/gross-profit';
      const res = await api.get(url);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load gross profit analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfit();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    fetchProfit(e.target.value);
  };

  const filteredProducts = (data?.productBreakdown || []).filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gross Profit Analytics</h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Revenue vs Cost of Goods
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact margin breakdown on products sold before operational expenses
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

            <button
              onClick={() => {
                setSelectedDate('');
                fetchProfit();
              }}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition"
              title="Refresh / Reset to Today"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial Formula Explanation Alert */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-emerald-950">Accounting Principle:</span>
              <p className="text-slate-600 mt-0.5">
                <code className="font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded text-emerald-800">
                  Gross Profit = Sales Revenue - Cost of Goods Sold (COGS)
                </code>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold bg-white px-2.5 py-1 rounded-xl shadow-sm border border-emerald-200">
            Formula Verified
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900">
                {data ? formatPKR(data.totalRevenue) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total value of goods sold</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-amber-600">
                {data ? formatPKR(data.totalCost) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Original purchase cost of sold items</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Profit</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-extrabold ${
                data && data.grossProfit < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {data ? formatPKR(data.grossProfit) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Trading surplus before expenses</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Profit Margin</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-purple-700">
                {data ? `${data.grossMarginPercent}%` : '0%'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Percentage of revenue retained</p>
            </div>
          </div>
        </div>

        {/* Product-wise Profit Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Product-Wise Profit Breakdown</h2>
              <p className="text-xs text-slate-500">Profitability by product and category</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search product or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm">Calculating product margins...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <PackageCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No sold products recorded today</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed sales invoices will display their item-level gross profit here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Qty Sold</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-right">Cost (COGS)</th>
                    <th className="py-3 px-4 text-right">Gross Profit</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.map((p: any) => (
                    <tr key={p.productId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {p.unitsSold}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatPKR(p.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatPKR(p.cost)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span className={p.grossProfit < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {formatPKR(p.grossProfit)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          p.marginPercent < 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : p.marginPercent > 15
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Item-level Transaction Audit Table */}
        {data?.itemRecords && data.itemRecords.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Line-Item Transaction Audit</h2>
              <p className="text-xs text-slate-500">Every individual item sold with device IMEI tracking</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product & IMEI</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Cost</th>
                    <th className="py-3 px-4 text-right">Gross Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.itemRecords.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {item.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.customerName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.productName}</div>
                        {item.imei && (
                          <div className="text-[10px] font-mono text-slate-400">
                            IMEI: {item.imei}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatPKR(item.totalPrice)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatPKR(item.unitCost * item.quantity)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {formatPKR(item.grossProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
