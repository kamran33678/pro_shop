'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Plus, Search, Phone, Mail, MapPin, DollarSign, X } from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers & Receivables</h2>
            <p className="text-sm text-slate-500">Manage client directory, purchase history & credit balances (Udhaar)</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        <div className="flex items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by customer name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Phone Number</th>
                <th className="px-5 py-3.5 text-right">Total Purchases</th>
                <th className="px-5 py-3.5 text-right">Total Payments</th>
                <th className="px-5 py-3.5 text-right">Outstanding (Udhaar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No customer accounts yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">{c.phone}</td>
                    <td className="px-5 py-4 text-right">{formatPKR(c.totalPurchases)}</td>
                    <td className="px-5 py-4 text-right text-emerald-600 font-medium">{formatPKR(c.totalPayments)}</td>
                    <td className="px-5 py-4 text-right font-bold text-rose-600">{formatPKR(c.currentBalance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-slate-900">Add Customer</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && <div className="text-red-500 text-xs">{error}</div>}

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

