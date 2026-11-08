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
  ShoppingCart,
  Plus,
  ArrowRight,
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
        const [healthRes, statsRes] = await Promise.allSettled([
          api.get('/health'),
          api.get('/dashboard/stats'),
        ]);

        if (healthRes.status === 'fulfilled' && healthRes.value?.data?.isOwnerSetup === false) {
          setIsOwnerSetup(false);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
              Real-time shop performance & interactive analytics (PKR)
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

        {/* 8 Fully Interactive Performance Cards (Click to open dedicated report) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Total Sales */}
          <Link
            href="/reports/today-sales"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Today's Sales
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {formatPKR(stats.todaySales)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Cash & credit
                </p>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Today's Gross Profit */}
          <Link
            href="/reports/gross-profit"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                Today's Gross Profit
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {formatPKR(stats.todayGrossProfit)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500 font-medium">Revenue - COGS</p>
                <span className="text-xs text-slate-400 group-hover:text-emerald-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: Today's Net Profit */}
          <Link
            href="/reports/net-profit"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-teal-600 transition-colors">
                Today's Net Profit
              </span>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                {formatPKR(stats.todayNetProfit)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500 font-medium">Gross - Expenses</p>
                <span className="text-xs text-slate-400 group-hover:text-teal-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 4: Monthly Sales */}
          <Link
            href="/reports/monthly-sales"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                Monthly Sales
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                {formatPKR(stats.monthlySales)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500 font-medium">Current month trend</p>
                <span className="text-xs text-slate-400 group-hover:text-purple-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 5: Inventory Purchase Value */}
          <Link
            href="/reports/inventory-valuation"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                Inventory Valuation
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                {formatPKR(stats.inventoryValue)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500 font-medium">
                  {stats.totalInventoryQty} items ({stats.totalProducts} prods)
                </p>
                <span className="text-xs text-slate-400 group-hover:text-amber-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 6: Customer Receivables */}
          <Link
            href="/reports/customer-receivables"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-sky-600 transition-colors">
                Customer Receivables
              </span>
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                {formatPKR(stats.customerReceivables)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500 font-medium">Customer Udhaar</p>
                <span className="text-xs text-slate-400 group-hover:text-sky-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 7: Supplier Payables */}
          <Link
            href="/reports/supplier-payables"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-rose-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-rose-600 transition-colors">
                Supplier Payables
              </span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                {formatPKR(stats.supplierPayables)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-rose-600 font-medium">Pending vendor dues</p>
                <span className="text-xs text-slate-400 group-hover:text-rose-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 8: Pending Repair Jobs */}
          <Link
            href="/reports/active-repairs"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition block relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                Active Repair Tickets
              </span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {stats.pendingRepairs} Pending
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500 font-medium">
                  {stats.totalRepairs} total tickets
                </p>
                <span className="text-xs text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5 font-medium transition-colors">
                  Details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
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
              <Link href="/reports/today-sales" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View Full Sales Report &rarr;
              </Link>
            </div>

            <div className="py-8 text-center text-slate-400 text-sm">
              <PackageCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">Real-time daily POS sales logged</p>
              <p className="text-xs text-slate-400 mt-1">
                Click on "Today's Sales" or "Monthly Sales" above to view every customer invoice.
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
              <Link href="/reports/active-repairs" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                View Active Repairs Report &rarr;
              </Link>
            </div>

            <div className="py-8 text-center text-slate-400 text-sm">
              <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">Workshop & Service Lab</p>
              <p className="text-xs text-slate-400 mt-1">
                Track pending devices, technician status, and advance deposits in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
