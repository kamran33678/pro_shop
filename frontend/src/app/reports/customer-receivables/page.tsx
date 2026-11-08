'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Users,
  DollarSign,
  AlertCircle,
  FileText,
  Search,
  RefreshCw,
  Phone,
  MessageSquare,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface CustomerReceivablesData {
  summary: {
    totalReceivables: number;
    debtorsCount: number;
  };
  customers: Array<{
    id: string;
    name: string;
    phone: string;
    balance: number;
    totalPurchases: number;
    unpaidInvoicesCount: number;
  }>;
  outstandingInvoices: Array<{
    id: string;
    invoiceNumber: string;
    createdAt: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    customer: {
      id: string;
      name: string;
      phone: string;
    };
  }>;
}

export default function CustomerReceivablesPage() {
  const [data, setData] = useState<CustomerReceivablesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'CUSTOMERS' | 'INVOICES'>('CUSTOMERS');

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/customer-receivables');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load customer receivables:', err);
      setError(err?.response?.data?.message || 'Failed to load customer receivables details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  const filteredCustomers = (data?.customers || []).filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const filteredInvoices = (data?.outstandingInvoices || []).filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.customer?.name || '').toLowerCase().includes(q) ||
      (inv.customer?.phone || '').includes(q)
    );
  });

  const sendWhatsAppReminder = (customer: { name: string; phone: string; balance: number }) => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Assalam-o-Alaikum ${customer.name}, this is a gentle reminder from PRO SHOP regarding your pending balance of PKR ${customer.balance.toLocaleString()}. Please clear it at your earliest convenience. Thank you!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

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
                <Users className="w-6 h-6 text-amber-600" />
                Customer Receivables (Udhaar Ledger)
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Outstanding customer balances, pending credit invoices, and collection status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReceivables}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/customers"
              className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
            >
              Manage Customers
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
                Total Receivables (Udhaar)
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-amber-600">
              PKR {(data?.summary.totalReceivables || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total pending recovery from customers
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customers with Balance
              </span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {(data?.summary.debtorsCount || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Active debtors with balance &gt; 0
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Unpaid Invoices
              </span>
              <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-red-600">
              {(data?.outstandingInvoices?.length || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Invoices with partial or pending payments
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewTab('CUSTOMERS')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  viewTab === 'CUSTOMERS'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Customer Balances ({filteredCustomers.length})
              </button>
              <button
                onClick={() => setViewTab('INVOICES')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  viewTab === 'INVOICES'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Outstanding Invoices ({filteredInvoices.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {viewTab === 'CUSTOMERS' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3">Customer Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3 text-right">Lifetime Purchases</th>
                    <th className="px-6 py-3 text-center">Pending Invoices</th>
                    <th className="px-6 py-3 text-right">Outstanding Balance</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No customers with outstanding balance found. All accounts are settled!
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {cust.name}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {cust.phone ? (
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {cust.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          PKR {cust.totalPurchases.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            {cust.unpaidInvoicesCount} unpaid
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-amber-600 dark:text-amber-400">
                          PKR {cust.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {cust.phone ? (
                            <button
                              onClick={() => sendWhatsAppReminder(cust)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No phone</span>
                          )}
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
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3 text-right">Total Amount</th>
                    <th className="px-6 py-3 text-right">Paid Amount</th>
                    <th className="px-6 py-3 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading outstanding invoices...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No outstanding invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-amber-600 dark:text-amber-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {inv.customer?.name}
                          </div>
                          {inv.customer?.phone && (
                            <div className="text-xs text-gray-400">{inv.customer.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          PKR {inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                          PKR {inv.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                          PKR {inv.balance.toLocaleString()}
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
