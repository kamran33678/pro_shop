'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  ShoppingCart,
  ScanBarcode,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Printer,
  X,
  Boxes,
  AlertCircle
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';

interface CartItem {
  productId: string;
  name: string;
  barcode: string | null;
  sellingPrice: number;
  purchaseCost: number;
  quantity: number;
  maxStock: number;
  isTrackedByImei: boolean;
  imeiRecordId?: string;
  selectedImei?: string;
  availableImeis?: { id: string; imei: string }[];
}

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [scanQuery, setScanQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, custRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
        ]);
        setProducts(prodRes.data || []);
        setCustomers(custRes.data || []);
      } catch (err) {
        console.error('Failed to load POS data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Quick scanner handler
  const handleScanLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanQuery.trim()) return;
    setError('');

    const query = scanQuery.trim();
    try {
      // 1. Check if IMEI
      if (/^\d{15}$/.test(query)) {
        const res = await api.get(`/products/lookup/imei/${query}`);
        if (res.data?.found && res.data.imeiRecord?.status === 'AVAILABLE') {
          addToCart(res.data.product, res.data.imeiRecord);
          setScanQuery('');
          return;
        }
      }

      // 2. Check Barcode
      const res = await api.get(`/products/lookup/barcode/${query}`);
      if (res.data?.found) {
        addToCart(res.data.product);
        setScanQuery('');
        return;
      }

      setError(`No available product or device found for code: ${query}`);
    } catch {
      setError('Error scanning product.');
    }
  };

  const addToCart = (product: any, specificImei?: any) => {
    setError('');

    if (product.isTrackedByImei) {
      const availableImeis = product.imeiRecords || [];
      if (availableImeis.length === 0) {
        setError(`No available IMEI stock for "${product.name}".`);
        return;
      }

      const imeiToUse = specificImei || availableImeis[0];

      // Check if this specific IMEI is already in cart
      const exists = cart.find((i) => i.imeiRecordId === imeiToUse.id);
      if (exists) {
        setError(`IMEI ${imeiToUse.imei} is already added to the cart.`);
        return;
      }

      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          barcode: product.barcode,
          sellingPrice: Number(product.sellingPrice),
          purchaseCost: Number(product.purchaseCost),
          quantity: 1,
          maxStock: 1,
          isTrackedByImei: true,
          imeiRecordId: imeiToUse.id,
          selectedImei: imeiToUse.imei,
          availableImeis,
        },
      ]);
    } else {
      // Quantity based accessory
      if (product.currentStock <= 0) {
        setError(`"${product.name}" is out of stock.`);
        return;
      }

      const existingIndex = cart.findIndex((i) => i.productId === product.id && !i.isTrackedByImei);
      if (existingIndex > -1) {
        const currentQty = cart[existingIndex].quantity;
        if (currentQty + 1 > product.currentStock) {
          setError(`Cannot add more. Available stock is only ${product.currentStock}.`);
          return;
        }
        const updated = [...cart];
        updated[existingIndex].quantity += 1;
        setCart(updated);
      } else {
        setCart([
          ...cart,
          {
            productId: product.id,
            name: product.name,
            barcode: product.barcode,
            sellingPrice: Number(product.sellingPrice),
            purchaseCost: Number(product.purchaseCost),
            quantity: 1,
            maxStock: product.currentStock,
            isTrackedByImei: false,
          },
        ]);
      }
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const item = cart[index];
    if (item.isTrackedByImei) return; // single unit per IMEI

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    if (newQty > item.maxStock) {
      setError(`Cannot exceed available stock (${item.maxStock}).`);
      return;
    }

    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const discount = Math.max(0, parseFloat(discountAmount) || 0);
  const netTotal = Math.max(0, subtotal - discount);
  const paid = parseFloat(paidAmount) || 0;
  const balance = Math.max(0, netTotal - paid);
  const change = Math.max(0, paid - netTotal);

  // Set default paid amount when netTotal changes and paid is empty
  useEffect(() => {
    if (!paidAmount && netTotal > 0) {
      setPaidAmount(netTotal.toString());
    }
  }, [netTotal]);

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError('Please add at least one item to cart.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/sales', {
        customerId: selectedCustomerId || undefined,
        items: cart.map((i) => ({
          productId: i.productId,
          imeiRecordId: i.imeiRecordId || undefined,
          quantity: i.quantity,
          unitPrice: i.sellingPrice,
        })),
        discountAmount: discount,
        paidAmount: paid,
        paymentMethod,
      });

      setCompletedSale(res.data);
      setCart([]);
      setDiscountAmount('0');
      setPaidAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete sale transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      (p.barcode && p.barcode.toLowerCase().includes(s)) ||
      (p.brand && p.brand.toLowerCase().includes(s))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Sales & POS Terminal
            </h2>
            <p className="text-xs text-slate-500">Fast barcode/IMEI scanning, checkout & instant invoice</p>
          </div>

          {/* Quick Barcode Scanner Form */}
          <form onSubmit={handleScanLookup} className="relative w-full sm:w-80">
            <ScanBarcode className="w-5 h-5 text-blue-600 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Instant Scan Barcode / IMEI..."
              value={scanQuery}
              onChange={(e) => setScanQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-2 bg-white border border-blue-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
            >
              Add
            </button>
          </form>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Product Catalog Grid (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by title, model, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-3 py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">No products found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Add items from the Products module first.</p>
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="p-3.5 bg-white hover:border-blue-400 border border-slate-200 rounded-2xl text-left shadow-sm hover:shadow transition flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {prod.category?.name}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-2 group-hover:text-blue-600">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600">
                        {formatPKR(prod.sellingPrice)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          prod.currentStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {prod.isTrackedByImei ? `${prod.imeiRecords?.length || 0} IMEI` : `${prod.currentStock} Qty`}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Active Cart & Checkout (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  Cart ({cart.length} items)
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Customer (Optional for Cash)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Walk-in Cash Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {Number(c.currentBalance) > 0 ? `[Udhaar: Rs. ${c.currentBalance}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Cart is empty. Click products or scan barcodes to begin sale.
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        {item.isTrackedByImei ? (
                          <span className="text-[10px] font-mono text-blue-600 block">
                            IMEI: {item.selectedImei}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {formatPKR(item.sellingPrice)} each
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.isTrackedByImei && (
                          <div className="flex items-center border border-slate-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(idx, -1)}
                              className="p-1 hover:bg-slate-100 text-slate-500"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(idx, 1)}
                              className="p-1 hover:bg-slate-100 text-slate-500"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <span className="font-bold text-slate-900 w-20 text-right">
                          {formatPKR(item.sellingPrice * item.quantity)}
                        </span>

                        <button
                          onClick={() => removeFromCart(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Billing Breakdown & Payment */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount (PKR):</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-24 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Net Payable:</span>
                  <span className="text-blue-600">{formatPKR(netTotal)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CASH', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CARD', 'CREDIT'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {method.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Paid & Balance */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Amount Paid (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Enter received amount"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">
                    {change > 0 ? 'Change Due:' : 'Remaining Balance:'}
                  </label>
                  <div
                    className={`py-2 px-3 rounded-xl font-bold text-sm ${
                      change > 0 ? 'bg-emerald-50 text-emerald-700' : balance > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {change > 0 ? formatPKR(change) : formatPKR(balance)}
                  </div>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                disabled={submitting || cart.length === 0}
                onClick={handleCompleteSale}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
              >
                {submitting ? 'Processing Transaction...' : `Complete Sale • ${formatPKR(netTotal)}`}
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Completed Invoice Receipt */}
        {completedSale && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-1" />
                <h3 className="text-lg font-bold text-slate-900">Sale Completed!</h3>
                <p className="text-xs font-mono text-blue-600 font-bold">{completedSale.invoiceNumber}</p>
                <p className="text-[11px] text-slate-400">PRO SHOP Mobile & Electronics</p>
              </div>

              <div className="divide-y divide-slate-100 text-xs max-h-48 overflow-y-auto">
                {completedSale.items?.map((it: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{it.product?.name}</p>
                      {it.imeiRecord && (
                        <span className="text-[10px] font-mono text-blue-600">IMEI: {it.imeiRecord.imei}</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">{formatPKR(it.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-bold text-sm text-slate-900">
                  <span>Net Paid:</span>
                  <span className="text-blue-600">{formatPKR(completedSale.paidAmount)}</span>
                </div>
                {Number(completedSale.balanceAmount) > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Balance Due (Udhaar):</span>
                    <span>{formatPKR(completedSale.balanceAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Payment Method:</span>
                  <span>{completedSale.paymentMethod}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setCompletedSale(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

