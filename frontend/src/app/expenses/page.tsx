'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Receipt, Plus } from 'lucide-react';

export default function ExpensesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Shop Operating Expenses</h2>
            <p className="text-sm text-slate-500">Shop Rent, Electricity, Internet, Salaries, Refreshments & Transport</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow">
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No expenses recorded today</p>
          <p className="text-xs text-slate-400 mt-1">Expenses directly deduct from gross profit to calculate accurate net profit.</p>
        </div>
      </div>
    </AppLayout>
  );
}

