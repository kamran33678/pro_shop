'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeftRight, Boxes } from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Stock Movement Audit Trail</h2>
          <p className="text-sm text-slate-500">Immutable ledger of every inventory increment, sale deduction, adjustment and repair part</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">
          <ArrowLeftRight className="w-12 h-12 mx-auto text-blue-500 mb-2 opacity-80" />
          <h3 className="font-bold text-slate-800">Automated Movement Tracking Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Every verified purchase, POS sale, customer return, supplier return, or repair part consumed automatically writes a permanent stock movement record.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

