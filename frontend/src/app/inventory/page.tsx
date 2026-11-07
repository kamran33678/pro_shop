'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Boxes, Smartphone, Layers, AlertTriangle, ArrowUpRight, Search } from 'lucide-react';
import { api, formatPKR } from '@/lib/api';
import Link from 'next/link';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        const res = await api.get('/products');
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.currentStock * Number(p.purchaseCost), 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockLevel).length;

  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Status & Valuation</h2>
            <p className="text-sm text-slate-500">Live stock levels, low-stock warnings & inventory purchase values</p>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow"
          >
            Manage Products &rarr;
          </Link>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-400">Total Available Units</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalStock} Items</div>
            <p className="text-xs text-slate-500 mt-1">Across {products.length} registered products</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-400">Inventory Valuation</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-2">{formatPKR(totalValue)}</div>
            <p className="text-xs text-slate-500 mt-1">Current acquisition cost</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-400">Low Stock Alerts</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-2">{lowStockCount} Products</div>
            <p className="text-xs text-rose-500 mt-1">Re-order required</p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-3 py-2 bg-slate-50 border rounded-xl text-sm"
            />
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 text-center">Tracking Mode</th>
                <th className="px-5 py-3.5 text-right">Unit Cost</th>
                <th className="px-5 py-3.5 text-right">Selling Price</th>
                <th className="px-5 py-3.5 text-center">Available Stock</th>
                <th className="px-5 py-3.5 text-right">Asset Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-5 py-4">{p.category?.name}</td>
                  <td className="px-5 py-4 text-center">
                    {p.isTrackedByImei ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                        IMEI Tracked ({p.imeiRecords?.length || 0})
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                        Quantity Based
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">{formatPKR(p.purchaseCost)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900">{formatPKR(p.sellingPrice)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.currentStock <= p.minStockLevel ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                      {p.currentStock} units
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-slate-800">
                    {formatPKR(p.currentStock * Number(p.purchaseCost))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

