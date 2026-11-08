'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  UserCheck,
  Plus,
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  AlertCircle,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { api } from '@/lib/api';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'MANAGER' | 'SALESPERSON' | 'TECHNICIAN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions: string[];
  createdAt: string;
}

const availableModules = [
  { key: 'pos', label: 'POS & Counter Sales' },
  { key: 'scanner', label: 'Barcode & IMEI Scanner' },
  { key: 'repairs', label: 'Repairing Hub' },
  { key: 'products', label: 'Products Catalogue' },
  { key: 'inventory', label: 'Inventory & IMEI Status' },
  { key: 'categories', label: 'Categories' },
  { key: 'stock-movements', label: 'Stock Movements' },
  { key: 'customers', label: 'Customers & Udhaar' },
  { key: 'suppliers', label: 'Suppliers & Invoices' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'accounts', label: 'Accounts & Ledger' },
  { key: 'expenses', label: 'Shop Expenses' },
  { key: 'reports', label: 'Reports & Analytics' },
];

export default function EmployeesPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'STAFF' as any,
    permissions: ['pos', 'repairs', 'inventory'] as string[],
  });

  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/auth/staff');
      if (res.data) {
        setStaffList(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/staff', newStaff);
      setSuccess(`Staff account for ${newStaff.name} created successfully.`);
      setIsCreateModalOpen(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'STAFF',
        permissions: ['pos', 'repairs', 'inventory'],
      });
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    if (user.role === 'OWNER' || user.role === 'ADMIN') return;
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await api.patch(`/auth/staff/${user.id}`, { status: newStatus });
      setSuccess(`Account status for ${user.name} changed to ${newStatus}.`);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const openEditModal = (user: StaffUser) => {
    setSelectedStaff(user);
    setEditPermissions(user.permissions || []);
    setIsEditModalOpen(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    setError('');

    try {
      await api.patch(`/auth/staff/${selectedStaff.id}`, {
        permissions: editPermissions,
      });
      setSuccess(`Permissions updated for ${selectedStaff.name}.`);
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (user: StaffUser) => {
    if (user.role === 'OWNER' || user.role === 'ADMIN') return;
    if (!confirm(`Are you sure you want to delete staff account ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/auth/staff/${user.id}`);
      setSuccess(`Staff member ${user.name} removed successfully.`);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete staff member.');
    }
  };

  const togglePermission = (key: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(key)) {
      setter(current.filter((k) => k !== key));
    } else {
      setter([...current, key]);
    }
  };

  return (
    <AppLayout adminOnly={true}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Employees & Role Permissions</h2>
            <p className="text-sm text-slate-500">
              Manage shop staff credentials, assign role permissions, and control access.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-xl transition shadow shadow-blue-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="p-1 text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Roles Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-blue-600">
              <Shield className="w-4 h-4" />
              <span>Administrator / Owner</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-2">Full Access</p>
            <p className="text-xs text-slate-500 mt-1">
              Unrestricted access to all modules, financial ledgers, settings, and staff management.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-teal-600">
              <UserCheck className="w-4 h-4" />
              <span>Manager</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-2">Operations & Stock</p>
            <p className="text-xs text-slate-500 mt-1">
              Sales, inventory, customer ledger, and repair approvals based on assigned permissions.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-indigo-600">
              <User className="w-4 h-4" />
              <span>Salesperson</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-2">POS & Barcode</p>
            <p className="text-xs text-slate-500 mt-1">
              Access to counter billing, barcode lookup, invoice generation, and customer accounts.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-amber-600">
              <ShieldAlert className="w-4 h-4" />
              <span>Technician</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-2">Repairs & Parts</p>
            <p className="text-xs text-slate-500 mt-1">
              Managing repair tickets, status updates, diagnosis, and logging spare parts usage.
            </p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registered Staff Accounts</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {staffList.length} user accounts in PRO SHOP
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm">Loading staff directory...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No staff accounts registered</p>
              <p className="text-xs text-slate-400 mt-1">Click Create Staff Account to add your first employee.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Name & Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Assigned Permissions</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {staffList.map((staff) => {
                    const isSystemOwner = staff.role === 'OWNER' || staff.role === 'ADMIN';

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                              isSystemOwner ? 'bg-blue-600' : 'bg-slate-700'
                            }`}>
                              {staff.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{staff.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{staff.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isSystemOwner
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {isSystemOwner && <Shield className="w-3 h-3 text-blue-600" />}
                            {staff.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            staff.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              staff.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}></span>
                            {staff.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {staff.phone || '—'}
                        </td>

                        <td className="py-3.5 px-4">
                          {isSystemOwner ? (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              Full Access (*)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {staff.permissions && staff.permissions.length > 0 ? (
                                staff.permissions.map((p) => (
                                  <span
                                    key={p}
                                    className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                                  >
                                    {p}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isSystemOwner ? (
                            <span className="text-xs text-slate-400 font-medium">Primary Admin</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(staff)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Permissions"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(staff)}
                                className={`p-1.5 rounded-lg transition ${
                                  staff.status === 'ACTIVE'
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={staff.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                              >
                                {staff.status === 'ACTIVE' ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteStaff(staff)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Delete Staff Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Staff Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg">Create New Staff Account</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Tariq Mehmood"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="tariq@proshop.pk"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0300 1234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Role *</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                      className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="STAFF">Staff (General)</option>
                      <option value="MANAGER">Manager</option>
                      <option value="SALESPERSON">Salesperson</option>
                      <option value="TECHNICIAN">Technician</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Temporary Password *</label>
                    <input
                      type="password"
                      required
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Module Access Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {availableModules.map((m) => {
                      const isChecked = newStaff.permissions.includes(m.key);
                      return (
                        <label
                          key={m.key}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-200/50"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              togglePermission(m.key, newStaff.permissions, (p) =>
                                setNewStaff({ ...newStaff, permissions: p })
                              )
                            }
                            className="w-4 h-4 text-blue-600 rounded border-slate-300"
                          />
                          <span>{m.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow"
                  >
                    {submitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Permissions Modal */}
        {isEditModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Module Permissions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Staff: {selectedStaff.name}</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Select which modules this staff member is authorized to access and operate:
                </p>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {availableModules.map((m) => {
                    const isChecked = editPermissions.includes(m.key);
                    return (
                      <label
                        key={m.key}
                        className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1.5 rounded hover:bg-slate-200/50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(m.key, editPermissions, setEditPermissions)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span className="font-medium">{m.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePermissions}
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow"
                  >
                    {submitting ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
