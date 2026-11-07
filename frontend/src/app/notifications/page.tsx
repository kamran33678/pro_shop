'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications & Alerts</h2>
          <p className="text-sm text-slate-500">Low stock alerts, pending customer payments & repair jobs ready for delivery</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
          <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No new alerts</p>
          <p className="text-xs text-slate-400 mt-1">Real-time alerts for low inventory and repair updates will appear here.</p>
        </div>
      </div>
    </AppLayout>
  );
}

