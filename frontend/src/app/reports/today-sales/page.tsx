'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
  Calendar,
  Clock,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Receipt
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

export default function TodaySalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchSales = async (dateStr?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = dateStr ? `/dashboard/today-sales?date=${dateStr}` : '/dashboard/today-sales';
      const res = await api.get(url);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    fetchSales(e.target.value);
  };

  const filteredSales = (data?.sales || []).filter((s: any) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customer?.name || 'Walking Customer').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customer?.phone || '').includes(searchTerm);

    const matchesPayment =
      paymentFilter === 'ALL' ||
      (paymentFilter === 'CASH' && s.paymentMethod === 'CASH') ||
      (paymentFilter === 'CREDIT' && Number(s.balanceAmount) > 0) ||
      (paymentFilter === 'OTHER' && s.paymentMethod !== 'CASH');

    return matchesSearch && matchesPayment;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Title Header */}
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
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Today's Sales Breakdown</h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Live Transactions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete audit of counter receipts, payment methods, and cash collections
              </p>
            </div>
          </div>

          {/* Date Picker & Refresh */}
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
                fetchSales();
              }}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition"
              title="Refresh / Reset to Today"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Financial Summary KPI Cards */}
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
                {data ? formatPKR(data.totalSales) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {data ? data.totalTransactions : 0} completed invoices today
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cash Collected</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-emerald-600">
                {data ? formatPKR(data.cashSales) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Direct cash received at counter</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Credit Sales (Udhaar)</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-amber-600">
                {data ? formatPKR(data.creditSales) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Balance added to customer ledger</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Average Sale Value</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-purple-700">
                {data ? formatPKR(data.averageOrderValue) : 'Rs. 0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Discounts given: {data ? formatPKR(data.totalDiscount) : 'Rs. 0'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoice number, customer name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Payments' },
              { id: 'CASH', label: 'Cash Only' },
              { id: 'CREDIT', label: 'With Balance (Udhaar)' },
              { id: 'OTHER', label: 'Digital / Bank' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPaymentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  paymentFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">
              Today's Completed Invoices ({filteredSales.length})
            </h2>
            <Link href="/pos" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Open POS Counter &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm">Loading today's transactions...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No matching sales records found</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed POS sales will show here with instant invoice details.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Sold</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Net Bill</th>
                    <th className="py-3 px-4 text-right">Paid Amount</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(sale.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {sale.customer?.name || 'Walking Customer'}
                        </div>
                        {sale.customer?.phone && (
                          <div className="text-[10px] text-slate-400">{sale.customer.phone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {sale.items?.map((item: any) => (
                            <div key={item.id} className="text-slate-700 truncate">
                              <span className="font-semibold">{item.quantity}x</span>{' '}
                              {item.product?.name}
                              {item.imeiRecord?.imei && (
                                <span className="text-[10px] font-mono text-slate-400 ml-1">
                                  ({item.imeiRecord.imei})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatPKR(sale.netAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold">
                        {formatPKR(sale.paidAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        {Number(sale.balanceAmount) > 0 ? (
                          <span className="text-amber-600">{formatPKR(sale.balanceAmount)}</span>
                        ) : (
                          <span className="text-slate-400">Rs. 0</span>
                        )}
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

