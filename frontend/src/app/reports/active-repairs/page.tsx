'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { api, formatPKR } from '@/lib/api';
import {
  ArrowLeft,
  Wrench,
  DollarSign,
  Search,
  RefreshCw,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Tag,
  Loader2,
} from 'lucide-react';

export default function ActiveRepairsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/active-repairs');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load active repairs:', err);
      setError(err?.response?.data?.message || 'Failed to load active repair tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const tickets: any[] = data?.tickets || [];

  const filteredTickets = tickets.filter((t: any) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (t.ticketNumber || '').toLowerCase().includes(q) ||
      (t.deviceModel || '').toLowerCase().includes(q) ||
      (t.deviceBrand || '').toLowerCase().includes(q) ||
      (t.imeiOrSerial || '').toLowerCase().includes(q) ||
      (t.customer?.name || '').toLowerCase().includes(q) ||
      (t.customer?.phone || '').includes(q);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'UNDER_INSPECTION':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'WAITING_FOR_PARTS':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'WAITING_FOR_APPROVAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'READY_FOR_DELIVERY':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const statusOptions = [
    { key: 'ALL', label: 'All Active' },
    { key: 'RECEIVED', label: 'Received' },
    { key: 'UNDER_INSPECTION', label: 'Inspection' },
    { key: 'WAITING_FOR_PARTS', label: 'Parts Wait' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'READY_FOR_DELIVERY', label: 'Ready' },
  ];

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
                <Wrench className="w-6 h-6 text-teal-600" />
                Active Repair Lab Tickets
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Live workshop jobs, device inspection statuses, and repair billing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRepairs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/repairs"
              className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
            >
              Repair Management
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Active Jobs
              </span>
              <div className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-lg">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-teal-600">
              {Number(data?.totalActive ?? 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Devices currently in service lab
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estimated Service Total
              </span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {formatPKR(data?.totalEstimated ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Expected gross billing for open jobs
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Advance Deposits Paid
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-600">
              {formatPKR(data?.totalPaid ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Deposits collected in advance
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pending Balance Due
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-600">
              {formatPKR(data?.totalBalance ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              To be collected upon device handover
            </div>
          </div>
        </div>

        {/* Tickets Table & Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Tickets Queue</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredTickets.length} ticket(s)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Status pills */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto max-w-full">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusFilter(opt.key)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                      statusFilter === opt.key
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {opt.label}{' '}
                    {opt.key !== 'ALL' && data?.statusCounts?.[opt.key] !== undefined
                      ? `(${data.statusCounts[opt.key]})`
                      : ''}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ticket #, device, IMEI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3">Ticket #</th>
                  <th className="px-6 py-3">Device & IMEI</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Problem / Fault</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Estimate</th>
                  <th className="px-6 py-3 text-right">Advance Paid</th>
                  <th className="px-6 py-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                        <span>Loading repair tickets...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No active repair tickets matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t: any) => {
                    const balance = Number(t.balanceAmount ?? 0);
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-teal-600 dark:text-teal-400">
                          {t.ticketNumber}
                          <div className="text-[11px] text-gray-400 font-normal">
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                            {t.deviceBrand} {t.deviceModel}
                          </div>
                          {t.imeiOrSerial && (
                            <div className="text-xs font-mono text-gray-400">
                              IMEI: {t.imeiOrSerial}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {t.customer?.name || 'Walk-in Customer'}
                          </div>
                          {t.customer?.phone && (
                            <div className="text-xs text-gray-400">{t.customer.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-600 dark:text-gray-300">
                          {t.reportedProblem || '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusBadge(
                              t.status
                            )}`}
                          >
                            {(t.status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatPKR(t.estimatedCost ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                          {formatPKR(t.paidAmount ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-amber-600 dark:text-amber-400">
                          {formatPKR(balance)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
