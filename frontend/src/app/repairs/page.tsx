'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Wrench,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  Smartphone,
  Layers,
  ChevronRight,
  Filter,
  X,
  FileText
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

interface RepairJob {
  id: string;
  ticketNumber: string;
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerial: string | null;
  reportedProblem: string;
  deviceCondition: string | null;
  accessoriesReceived: string | null;
  status: string;
  labourCharge: number;
  partsCost: number;
  finalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  createdAt: string;
  customer: { id: string; name: string; phone: string };
  assignedTechnician?: { id: string; name: string };
  partsUsed: { id: string; quantity: number; unitPrice: number; product: { name: string } }[];
}

const statusOptions = [
  'ALL',
  'RECEIVED',
  'UNDER_INSPECTION',
  'WAITING_FOR_PARTS',
  'IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RepairJob | null>(null);

  // New repair form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    imeiOrSerial: '',
    reportedProblem: '',
    deviceCondition: 'Scratched / Normal Wear',
    accessoriesReceived: 'Device only (Without SIM & Memory Card)',
    estimatedCost: '',
    labourCharge: '1000',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      const res = await api.get('/repairs', { params });
      setRepairs(res.data || []);
    } catch (err) {
      console.error('Error fetching repairs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, [selectedStatus]);

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      await api.post('/repairs', {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        labourCharge: parseFloat(formData.labourCharge) || 0,
      });

      setShowAddModal(false);
      setFormData({
        customerName: '',
        customerPhone: '',
        deviceBrand: '',
        deviceModel: '',
        imeiOrSerial: '',
        reportedProblem: '',
        deviceCondition: 'Scratched / Normal Wear',
        accessoriesReceived: 'Device only (Without SIM & Memory Card)',
        estimatedCost: '',
        labourCharge: '1000',
      });
      fetchRepairs();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create repair ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.put(`/repairs/${ticketId}/status`, { status: newStatus });
      fetchRepairs();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredRepairs = repairs.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.ticketNumber.toLowerCase().includes(s) ||
      r.customer.name.toLowerCase().includes(s) ||
      r.customer.phone.includes(s) ||
      r.deviceBrand.toLowerCase().includes(s) ||
      r.deviceModel.toLowerCase().includes(s) ||
      (r.imeiOrSerial && r.imeiOrSerial.includes(s))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Mobile Repairing Management
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Customer tickets, device inspection, parts usage, labour charges & delivery
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-sm shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Repair Ticket</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Ticket #, Customer, Phone, IMEI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statusOptions.slice(0, 5).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedStatus === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Repairs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Ticket #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Device & Issue</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Labour + Parts</th>
                  <th className="px-5 py-3.5 text-right">Balance</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Loading repair tickets...
                    </td>
                  </tr>
                ) : filteredRepairs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No repair tickets found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "New Repair Ticket" to intake a device for inspection or repair.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRepairs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-mono font-bold text-blue-600">
                        {r.ticketNumber}
                        <span className="block text-[11px] font-normal text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{r.customer.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{r.customer.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {r.deviceBrand} {r.deviceModel}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">{r.reportedProblem}</div>
                        {r.imeiOrSerial && (
                          <span className="text-[10px] font-mono text-slate-400 block">
                            IMEI: {r.imeiOrSerial}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                            r.status === 'READY_FOR_DELIVERY' || r.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="RECEIVED">RECEIVED</option>
                          <option value="UNDER_INSPECTION">UNDER INSPECTION</option>
                          <option value="WAITING_FOR_PARTS">WAITING FOR PARTS</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="READY_FOR_DELIVERY">READY FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="font-bold text-slate-900">{formatPKR(r.finalAmount)}</div>
                        <span className="text-[11px] text-slate-400">
                          Parts: {formatPKR(r.partsCost)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-rose-600">
                        {formatPKR(r.balanceAmount)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setSelectedTicket(r)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          View Ticket
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add New Repair Ticket */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">New Repair Job Ticket</h3>
                    <p className="text-xs text-slate-500">Record customer phone, fault, condition & estimated charges</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateRepair} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asad Ali"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Customer Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Device Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple, Samsung, Vivo"
                      value={formData.deviceBrand}
                      onChange={(e) => setFormData({ ...formData, deviceBrand: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Device Model *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 13 / Galaxy S22"
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Device IMEI or Serial (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Scan or type 15-digit IMEI"
                      value={formData.imeiOrSerial}
                      onChange={(e) => setFormData({ ...formData, imeiOrSerial: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Reported Problem / Fault *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Broken LCD screen touch not working, charging port loose"
                      value={formData.reportedProblem}
                      onChange={(e) => setFormData({ ...formData, reportedProblem: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Initial Labour Charge (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.labourCharge}
                      onChange={(e) => setFormData({ ...formData, labourCharge: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Estimated Cost (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 4500"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {saving ? 'Creating Ticket...' : 'Create Repair Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Repair Ticket Details */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono font-bold text-lg text-blue-600">
                    {selectedTicket.ticketNumber}
                  </span>
                  <p className="text-xs text-slate-400">
                    Received on {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Customer:</span>
                  <span className="font-bold text-slate-800">{selectedTicket.customer.name}</span>
                  <span className="font-mono text-slate-500 block">{selectedTicket.customer.phone}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Device:</span>
                  <span className="font-bold text-slate-800">
                    {selectedTicket.deviceBrand} {selectedTicket.deviceModel}
                  </span>
                  <span className="font-mono text-slate-500 block">
                    {selectedTicket.imeiOrSerial || 'No IMEI logged'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Reported Issue:</span>
                <p className="font-medium text-slate-800">{selectedTicket.reportedProblem}</p>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-500">Current Balance Due:</span>
                  <div className="text-lg font-bold text-rose-600">
                    {formatPKR(selectedTicket.balanceAmount)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Total Charges:</span>
                  <div className="text-base font-bold text-slate-900">
                    {formatPKR(selectedTicket.finalAmount)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

