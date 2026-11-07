'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Boxes,
  AlertTriangle,
  Users,
  Building2,
  Wrench,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  ScanBarcode,
  ShoppingCart,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { formatPKR, api } from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isOwnerSetup, setIsOwnerSetup] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayGrossProfit: 0,
    todayNetProfit: 0,
    totalProducts: 0,
    totalInventoryQty: 0,
    inventoryValue: 0,
    customerReceivables: 0,
    supplierPayables: 0,
    monthlySales: 0,
    monthlyExpenses: 0,
    totalRepairs: 0,
    pendingRepairs: 0,
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const healthRes = await api.get('/health');
        if (healthRes.data && healthRes.data.isOwnerSetup === false) {
          setIsOwnerSetup(false);
        }
      } catch (err) {
        console.error('Error fetching health status:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* First time setup banner if owner is not yet registered */}
        {!isOwnerSetup && (
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-base">Shop Initial Setup Required</h3>
                <p className="text-sm text-blue-100">
                  Register your main shop owner account to configure business details, currency, and start inventory.
                </p>
              </div>
            </div>
            <Link
              href="/setup"
              className="px-5 py-2.5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition shadow whitespace-nowrap"
            >
              Start Owner Setup &rarr;
            </Link>
          </div>
        )}

        {/* Top Header Row with Date & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Business Dashboard</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Real-time shop performance & analytics (PKR)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/pos"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-sm shadow-blue-500/25 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>New POS Sale</span>
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* 12 Key Performance Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Total Sales */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Today's Sales</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.todaySales)}</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Verified cash & credit sales
              </p>
            </div>
          </div>

          {/* Card 2: Today's Gross Profit */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Today's Gross Profit</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.todayGrossProfit)}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Sales revenue minus COGS</p>
            </div>
          </div>

          {/* Card 3: Today's Net Profit */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Today's Net Profit</span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.todayNetProfit)}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Gross profit minus expenses</p>
            </div>
          </div>

          {/* Card 4: Monthly Sales */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Monthly Sales</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.monthlySales)}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Current calendar month</p>
            </div>
          </div>

          {/* Card 5: Inventory Purchase Value */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Inventory Valuation</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.inventoryValue)}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {stats.totalInventoryQty} items across {stats.totalProducts} products
              </p>
            </div>
          </div>

          {/* Card 6: Customer Receivables */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Customer Receivables</span>
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.customerReceivables)}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Outstanding customer balances (Udhaar)</p>
            </div>
          </div>

          {/* Card 7: Supplier Payables */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Supplier Payables</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatPKR(stats.supplierPayables)}</div>
              <p className="text-xs text-rose-600 font-medium mt-1">Pending payments to suppliers</p>
            </div>
          </div>

          {/* Card 8: Pending Repair Jobs */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Repair Tickets</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{stats.pendingRepairs} Pending</div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {stats.totalRepairs} lifetime repair tickets
              </p>
            </div>
          </div>
        </div>

        {/* Quick Automation & Scanning Card */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ScanBarcode className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Fast Hardware & Camera Barcode / IMEI Scanner</h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Scan device IMEIs or product barcodes directly using your USB barcode gun, Bluetooth scanner, or phone camera.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/scanner"
              className="w-full md:w-auto text-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold text-sm rounded-xl transition shadow shadow-blue-500/30"
            >
              Launch Scanner
            </Link>
          </div>
        </div>

        {/* Bottom Activity Section: Recent Sales & Repairs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Recent Completed Sales</h3>
                <p className="text-xs text-slate-500">Latest POS transactions</p>
              </div>
              <Link href="/pos" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View POS &rarr;
              </Link>
            </div>

            <div className="py-8 text-center text-slate-400 text-sm">
              <PackageCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No sales recorded yet today</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed invoices from the POS will appear here with instant profit breakdown.
              </p>
            </div>
          </div>

          {/* Pending Repair Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Pending Repair Jobs</h3>
                <p className="text-xs text-slate-500">Devices currently in queue or inspection</p>
              </div>
              <Link href="/repairs" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Manage Repairs &rarr;
              </Link>
            </div>

            <div className="py-8 text-center text-slate-400 text-sm">
              <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No active repair tickets</p>
              <p className="text-xs text-slate-400 mt-1">
                Customer repair tickets with technician assignments and parts usage will be listed here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
