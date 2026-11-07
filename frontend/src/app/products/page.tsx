'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Package,
  Plus,
  Search,
  ScanBarcode,
  Smartphone,
  Layers,
  AlertCircle,
  CheckCircle,
  Tag,
  Boxes,
  X,
  Filter
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  brand: string | null;
  model: string | null;
  purchaseCost: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  isTrackedByImei: boolean;
  category: { id: string; name: string };
  imeiRecords?: { id: string; imei: string; status: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brand: '',
    model: '',
    barcode: '',
    sku: '',
    purchaseCost: '',
    sellingPrice: '',
    currentStock: '1',
    minStockLevel: '2',
    isTrackedByImei: false,
    imeisText: '',
    warrantyDetails: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;

      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params }),
        api.get('/products/categories'),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      if (!formData.categoryId && catRes.data && catRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.categoryId) {
      setFormError('Please select a category.');
      return;
    }

    const imeisArray = formData.isTrackedByImei
      ? formData.imeisText
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (formData.isTrackedByImei && imeisArray.length === 0) {
      setFormError('Please enter at least one IMEI number for this tracked device.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/products', {
        name: formData.name,
        categoryId: formData.categoryId,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        barcode: formData.barcode || undefined,
        sku: formData.sku || undefined,
        purchaseCost: parseFloat(formData.purchaseCost) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        currentStock: formData.isTrackedByImei ? imeisArray.length : parseInt(formData.currentStock) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 2,
        isTrackedByImei: formData.isTrackedByImei,
        imeis: imeisArray,
        warrantyDetails: formData.warrantyDetails || undefined,
        description: formData.description || undefined,
      });

      setFormSuccess('Product saved successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
        setFormData({
          name: '',
          categoryId: categories[0]?.id || '',
          brand: '',
          model: '',
          barcode: '',
          sku: '',
          purchaseCost: '',
          sellingPrice: '',
          currentStock: '1',
          minStockLevel: '2',
          isTrackedByImei: false,
          imeisText: '',
          warrantyDetails: '',
          description: '',
        });
        fetchProducts();
      }, 1000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Products & Inventory</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage stock, IMEIs, accessories, barcodes, and pricing in PKR
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              <ScanBarcode className="w-4 h-4 text-blue-600" />
              <span>Barcode / IMEI Scanner</span>
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-sm shadow-blue-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, barcode, SKU, IMEI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Barcode / SKU</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-right">Cost Price</th>
                  <th className="px-5 py-3.5 text-right">Selling Price</th>
                  <th className="px-5 py-3.5 text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Loading products from database...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No products registered yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "Add New Product" to register mobile phones with IMEI or accessories with barcode.
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {prod.name}
                        {prod.brand && <span className="block text-xs font-normal text-slate-400">{prod.brand} {prod.model}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                          {prod.category?.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {prod.barcode || prod.sku}
                      </td>
                      <td className="px-5 py-4">
                        {prod.isTrackedByImei ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Smartphone className="w-3 h-3" /> IMEI Tracked ({prod.imeiRecords?.length || 0})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Layers className="w-3 h-3" /> Qty Based
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-500">{formatPKR(prod.purchaseCost)}</td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900">{formatPKR(prod.sellingPrice)}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            prod.currentStock <= prod.minStockLevel
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {prod.currentStock} in stock
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
                    <p className="text-xs text-slate-500">Register mobile phone, smartwatch, accessory, or part</p>
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
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. iPhone 15 Pro Max / Fast Charger 25W"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Barcode / UPC
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="barcode"
                        placeholder="Scan or type barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ScanBarcode className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      placeholder="e.g. Apple, Samsung, Xiaomi"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Model / Variant
                    </label>
                    <input
                      type="text"
                      name="model"
                      placeholder="e.g. 256GB Natural Titanium"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Purchase Cost (PKR) *
                    </label>
                    <input
                      type="number"
                      name="purchaseCost"
                      required
                      min="0"
                      placeholder="e.g. 280000"
                      value={formData.purchaseCost}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Selling Price (PKR) *
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      required
                      min="0"
                      placeholder="e.g. 310000"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Track by IMEI Toggle */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isTrackedByImei"
                      checked={formData.isTrackedByImei}
                      onChange={handleInputChange}
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        Track individually by IMEI / Serial (Mobile Phones & Watches)
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enable this for devices that have unique 15-digit IMEI numbers. Stock quantity will match registered IMEIs.
                      </p>
                    </div>
                  </label>

                  {formData.isTrackedByImei ? (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        Enter Opening Stock IMEIs (One per line or comma-separated)
                      </label>
                      <textarea
                        rows={3}
                        name="imeisText"
                        placeholder="356987123456781&#10;356987123456782"
                        value={formData.imeisText}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          Opening Stock Quantity
                        </label>
                        <input
                          type="number"
                          name="currentStock"
                          min="0"
                          value={formData.currentStock}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          Low Stock Alert Level
                        </label>
                        <input
                          type="number"
                          name="minStockLevel"
                          min="1"
                          value={formData.minStockLevel}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  )}
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
                    {saving ? 'Saving Product...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

