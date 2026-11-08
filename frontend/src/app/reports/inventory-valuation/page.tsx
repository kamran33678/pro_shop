'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { api, formatPKR } from '@/lib/api';
import {
  ArrowLeft,
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  RefreshCw,
  PackageCheck,
  TrendingUp,
  History,
  Loader2,
} from 'lucide-react';

export default function InventoryValuationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const fetchValuation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/inventory-valuation');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load inventory valuation:', err);
      setError(err?.response?.data?.message || 'Failed to load inventory valuation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValuation();
  }, []);

  const products: any[] = data?.products || [];

  const filteredProducts = products.filter((p: any) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-6 h-6 text-purple-600" />
                Inventory Valuation & Stock Health
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Asset valuation, stock quantities, and inventory risk monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchValuation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/products"
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Valuation KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Purchase Cost
              </span>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-purple-600">
              {formatPKR(data?.totalInventoryValue ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Across <strong>{Number(data?.totalStockQty ?? 0).toLocaleString()}</strong> units in stock
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Retail Value
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-600">
              {formatPKR(data?.totalRetailValue ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Expected gross turnover at retail price
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Projected Profit
              </span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-blue-600">
              {formatPKR(data?.potentialProfit ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Potential profit upon selling all stock
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stock Alerts
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div>
                <span className="text-xl font-bold text-amber-600">
                  {Number(data?.lowStockCount ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 block">Low Stock</span>
              </div>
              <div className="h-8 border-r border-gray-200 dark:border-gray-700" />
              <div>
                <span className="text-xl font-bold text-red-600">
                  {Number(data?.outOfStockCount ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 block">Out of Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Valuation Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Product-Wise Valuation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredProducts.length} product(s)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setStatusFilter('LOW_STOCK')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    statusFilter === 'LOW_STOCK'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Low Stock ({Number(data?.lowStockCount ?? 0)})
                </button>
                <button
                  onClick={() => setStatusFilter('OUT_OF_STOCK')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    statusFilter === 'OUT_OF_STOCK'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Out of Stock ({Number(data?.outOfStockCount ?? 0)})
                </button>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">SKU / Barcode</th>
                  <th className="px-6 py-3">Stock Units</th>
                  <th className="px-6 py-3 text-right">Cost Price</th>
                  <th className="px-6 py-3 text-right">Retail Price</th>
                  <th className="px-6 py-3 text-right">Total Cost Value</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span>Loading inventory records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No products match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                        {p.categoryName && (
                          <span className="text-xs text-gray-400">{p.categoryName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        <div>{p.sku}</div>
                        {p.barcode && <div className="text-[11px] text-gray-400">{p.barcode}</div>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {p.currentStock}
                        {p.minStockLevel > 0 && (
                          <span className="text-xs text-gray-400 font-normal ml-1">
                            (min: {p.minStockLevel})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatPKR(p.purchaseCost ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatPKR(p.sellingPrice ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-purple-600 dark:text-purple-400">
                        {formatPKR(p.totalCostValue ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {p.status === 'IN_STOCK' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        ) : p.status === 'LOW_STOCK' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-medium">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movements Log */}
        {data?.recentMovements && data.recentMovements.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              Recent Inventory Adjustments & Movements
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.recentMovements.map((m: any) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {m.product?.name}
                    </span>{' '}
                    <span className="text-gray-400">({m.product?.sku})</span>
                    {m.notes && <p className="text-gray-500 mt-0.5">{m.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units ({m.type})
                    </span>
                    <span className="text-gray-400 block mt-0.5">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
