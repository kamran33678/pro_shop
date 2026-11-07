'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatPKR } from '@/lib/api';

const systemAccounts = [
  { code: '1010', name: 'Cash in Hand (Counter)', type: 'ASSET', subType: 'CASH' },
  { code: '1020', name: 'Main Bank Account', type: 'ASSET', subType: 'BANK' },
  { code: '1030', name: 'JazzCash Merchant Account', type: 'ASSET', subType: 'MOBILE_WALLET' },
  { code: '1040', name: 'Easypaisa Merchant Account', type: 'ASSET', subType: 'MOBILE_WALLET' },
  { code: '1050', name: 'Accounts Receivable (Customers Credit)', type: 'ASSET', subType: 'RECEIVABLE' },
  { code: '1060', name: 'Merchandise Inventory Asset', type: 'ASSET', subType: 'INVENTORY' },
  { code: '2010', name: 'Accounts Payable (Suppliers)', type: 'LIABILITY', subType: 'PAYABLE' },
  { code: '4010', name: 'Product Sales Revenue', type: 'REVENUE', subType: 'SALES_REVENUE' },
  { code: '4020', name: 'Repair Service Revenue', type: 'REVENUE', subType: 'SERVICE_REVENUE' },
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', subType: 'COGS' },
  { code: '6010', name: 'General Operating Expenses', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
];

export default function AccountsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Chart of Accounts & Ledger</h2>
          <p className="text-sm text-slate-500">Automated double-entry accounting, Cashbook, JazzCash & Easypaisa wallets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemAccounts.map((acc) => (
            <div key={acc.code} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-blue-600">{acc.code}</span>
                <span className="font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {acc.type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 pt-1">{acc.name}</h3>
              <p className="text-xs text-slate-400 capitalize">{acc.subType.toLowerCase().replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

