'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Reports & Business Analytics</h2>
            <p className="text-sm text-slate-500">Sales, Gross Profit, Net Profit, Inventory Movements & Repair Income</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold text-sm rounded-xl transition shadow">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Sales Report</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">Daily & Monthly Sales</h4>
            <p className="text-xs text-slate-500 mt-1">Categorized by Cash, Credit, JazzCash, Easypaisa</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Profit Report</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">Gross & Net Profit</h4>
            <p className="text-xs text-slate-500 mt-1">Actual revenue minus COGS and operating expenses</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Repairing Report</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">Service & Parts Profit</h4>
            <p className="text-xs text-slate-500 mt-1">Technician performance & parts cost</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Udhaar Ledger</span>
            <h4 className="font-bold text-slate-900 text-base mt-1">Customer Receivables</h4>
            <p className="text-xs text-slate-500 mt-1">Outstanding balances and payment recovery</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

