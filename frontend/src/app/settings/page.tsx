'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings, Store, Save, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('PRO SHOP Mobile & Electronics');
  const [currency, setCurrency] = useState('PKR');
  const [phone, setPhone] = useState('+92 300 0000000');
  const [address, setAddress] = useState('Shop # 12, Mobile Plaza, Pakistan');

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Shop Settings & Configuration</h2>
          <p className="text-sm text-slate-500">Business identity, thermal receipt headers, and timezone configuration</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Business Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Shop / Business Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Currency Code</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-3 py-2 bg-slate-100 border rounded-xl text-sm font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Shop Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
              <Save className="w-4 h-4" />
              <span>Save Business Settings</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

