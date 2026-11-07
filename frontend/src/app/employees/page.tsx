'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserCheck, Plus, Shield } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Employees & Role Permissions</h2>
            <p className="text-sm text-slate-500">Manage individual credentials for Managers, Salespersons & Technicians</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow">
            <Plus className="w-4 h-4" />
            <span>Create Employee Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase text-blue-600">Active Roles</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Owner:</span>
                <span className="text-emerald-600">Full Access</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Manager:</span>
                <span>Operations & Reports</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Salesperson:</span>
                <span>POS & Products Only</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Technician:</span>
                <span>Repairs & Parts Usage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

