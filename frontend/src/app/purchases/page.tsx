'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Truck, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Purchases & Stock Intake</h2>
            <p className="text-sm text-slate-500">Record supplier purchase bills, scan incoming IMEIs & auto-update stock</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow">
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          <Truck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No purchase invoices yet</p>
          <p className="text-xs text-slate-400 mt-1">Purchases automatically update product quantities and add IMEI records.</p>
        </div>
      </div>
    </AppLayout>
  );
}

