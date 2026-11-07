'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Building2, Plus, Search } from 'lucide-react';
import { formatPKR } from '@/lib/api';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Suppliers & Payables</h2>
            <p className="text-sm text-slate-500">Manage distributors, purchase invoices & outstanding balances</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow">
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No suppliers registered yet</p>
          <p className="text-xs text-slate-400 mt-1">Register suppliers to track incoming stock and payables.</p>
        </div>
      </div>
    </AppLayout>
  );
}

