'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  ScanBarcode,
  Camera,
  Keyboard,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Boxes,
  RefreshCw,
  Plus,
  ArrowRight,
  Image as ImageIcon,
  Check,
  TrendingDown,
  TrendingUp,
  Receipt,
  PackagePlus,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';
import Link from 'next/link';

export default function ScannerPage() {
  // Main Scanner Mode: 'ADD_STOCK' or 'SALE_PRODUCT'
  const [mode, setMode] = useState<'ADD_STOCK' | 'SALE_PRODUCT'>('SALE_PRODUCT');

  const [scanInput, setScanInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [cameraWarning, setCameraWarning] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Add stock quantity multiplier (default 1)
  const [addQuantity, setAddQuantity] = useState(1);

  // Quick Register Modal state (when a new barcode is scanned in ADD_STOCK mode)
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [registerBarcode, setRegisterBarcode] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    categoryId: '',
    purchaseCost: '',
    sellingPrice: '',
    brand: '',
    model: '',
    currentStock: '1',
  });
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load categories for quick register
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/products/categories');
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setNewProductForm((prev) => ({ ...prev, categoryId: res.data[0].id }));
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    }
    fetchCategories();
  }, []);

  // Web Audio chime feedback
  const playSound = (type: 'success' | 'sale' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'sale') {
        // High cashier-like two-tone chime
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'success') {
        // Crisp positive beep
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        // Low error buzz
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
  };

  // USB/Bluetooth Barcode Scanner Hardware Listener (burst of keystrokes followed by Enter)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // If user is currently typing in an input inside a modal or quick-register form, ignore global intercept
      if (showQuickRegister) return;
      if (target.tagName === 'INPUT' && target !== inputRef.current) return;
      if (target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      const char = e.key;

      if (char === 'Enter') {
        if (buffer.length >= 2) {
          executeScan(buffer.trim());
          buffer = '';
        }
      } else if (char.length === 1) {
        if (currentTime - lastKeyTime > 150) {
          buffer = '';
        }
        buffer += char;
        lastKeyTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, addQuantity, showQuickRegister]);

  // Execute scan based on selected mode
  const executeScan = async (code: string) => {
    if (!code) return;
    const cleanCode = code.trim();
    setLoading(true);
    setError('');
    setSuccessMessage(null);

    try {
      if (mode === 'SALE_PRODUCT') {
        // -------------------------------------------------------------
        // MODE: SALE PRODUCT (Instant Sale & Stock Deduction)
        // -------------------------------------------------------------
        const res = await api.post('/sales/scan-quick-sale', {
          code: cleanCode,
          quantity: 1,
          paymentMethod: 'CASH',
        });

        const sale = res.data;
        const item = sale.items?.[0];
        const prod = item?.product;

        playSound('sale');
        setSuccessMessage(`Sold: ${prod?.name || 'Item'} (Invoice #${sale.invoiceNumber})`);
        const actionResult = {
          type: 'SALE',
          timestamp: new Date().toLocaleTimeString(),
          invoiceNumber: sale.invoiceNumber,
          productName: prod?.name || 'Item',
          sku: prod?.sku || '',
          price: Number(sale.netAmount || 0),
          remainingStock: prod ? Math.max(0, prod.currentStock - 1) : 0,
          code: cleanCode,
        };
        setLastAction(actionResult);
        setScanHistory((prev) => [actionResult, ...prev.slice(0, 14)]);
        setScanInput('');
      } else {
        // -------------------------------------------------------------
        // MODE: ADD PRODUCT / STOCK IN
        // -------------------------------------------------------------
        const res = await api.post('/products/scan-stock-in', {
          code: cleanCode,
          quantity: addQuantity,
        });

        if (res.data?.notFound) {
          // New barcode detected! Open Quick Register form
          playSound('error');
          setRegisterBarcode(cleanCode);
          setNewProductForm((prev) => ({
            ...prev,
            name: '',
            purchaseCost: '',
            sellingPrice: '',
            brand: '',
            model: '',
            currentStock: String(addQuantity),
          }));
          setShowQuickRegister(true);
        } else if (res.data?.requiresImei) {
          playSound('error');
          setError(res.data.message || 'IMEI tracked device requires IMEI registration in Products.');
        } else if (res.data?.success) {
          playSound('success');
          setSuccessMessage(res.data.message);
          const actionResult = {
            type: 'STOCK_IN',
            timestamp: new Date().toLocaleTimeString(),
            productName: res.data.product?.name || 'Item',
            sku: res.data.product?.sku || '',
            addedQty: res.data.addedQuantity || addQuantity,
            newStock: res.data.newStock,
            code: cleanCode,
          };
          setLastAction(actionResult);
          setScanHistory((prev) => [actionResult, ...prev.slice(0, 14)]);
          setScanInput('');
        }
      }
    } catch (err: any) {
      playSound('error');
      const msg = err.response?.data?.message || 'Error processing scan.';
      setError(msg);
    } finally {
      setLoading(false);
      // Re-focus input for next scan
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanInput.trim()) {
      executeScan(scanInput.trim());
    }
  };

  // Mobile Native Camera / Image File Scanner
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('camera-reader-hidden');
      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) {
        setScanInput(decodedText);
        await executeScan(decodedText);
      }
    } catch (err: any) {
      playSound('error');
      setError('Could not detect barcode from image. Ensure good lighting or type manually.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Live Camera Stream Toggle
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsCameraActive(false);
      setCameraWarning('');
    } else {
      setError('');
      setCameraWarning('');

      if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
        setCameraWarning('Live camera requires HTTPS. You can use "Snap Photo" below directly!');
        return;
      }

      setIsCameraActive(true);
      setTimeout(async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const qrCodeScanner = new Html5Qrcode('camera-reader');
          html5QrCodeRef.current = qrCodeScanner;

          let cameraIdOrConfig: any = { facingMode: 'environment' };
          try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              const backCamera = devices.find((d) =>
                d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
              );
              if (backCamera) {
                cameraIdOrConfig = backCamera.id;
              } else {
                cameraIdOrConfig = devices[0].id;
              }
            }
          } catch {}

          await qrCodeScanner.start(
            cameraIdOrConfig,
            {
              fps: 10,
              qrbox: { width: 280, height: 180 },
            },
            (decodedText) => {
              executeScan(decodedText);
              qrCodeScanner.pause();
              setTimeout(() => {
                try {
                  qrCodeScanner.resume();
                } catch {}
              }, 1800);
            },
            () => {}
          );
        } catch (err: any) {
          console.error('Camera access error:', err);
          setCameraWarning('Live camera permission was denied. Please use the "Snap Photo" button below!');
          setIsCameraActive(false);
        }
      }, 300);
    }
  };

  // Quick Register Submit (saves new product directly into database)
  const handleQuickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegistering(true);

    try {
      const payload: any = {
        name: newProductForm.name.trim(),
        barcode: registerBarcode.trim(),
        categoryId: newProductForm.categoryId,
        purchaseCost: Number(newProductForm.purchaseCost || 0),
        sellingPrice: Number(newProductForm.sellingPrice || 0),
        brand: newProductForm.brand.trim() || undefined,
        model: newProductForm.model.trim() || undefined,
        currentStock: Number(newProductForm.currentStock || addQuantity),
        minStockLevel: 2,
        isTrackedByImei: false,
      };

      const res = await api.post('/products', payload);
      playSound('success');
      setShowQuickRegister(false);
      setSuccessMessage(`Product "${res.data.name}" registered and added to stock (+${payload.currentStock} units)!`);

      const actionResult = {
        type: 'STOCK_IN',
        timestamp: new Date().toLocaleTimeString(),
        productName: res.data.name,
        sku: res.data.sku || '',
        addedQty: payload.currentStock,
        newStock: res.data.currentStock,
        code: registerBarcode,
      };
      setLastAction(actionResult);
      setScanHistory((prev) => [actionResult, ...prev.slice(0, 14)]);
      setScanInput('');
    } catch (err: any) {
      playSound('error');
      setRegisterError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-4xl mx-auto w-full pb-10">
        {/* Hidden element for file scanner */}
        <div id="camera-reader-hidden" style={{ display: 'none' }}></div>

        {/* Hidden file input for native camera snap */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileScan}
          className="hidden"
          id="mobile-barcode-capture"
        />

        {/* Header & Sound Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ScanBarcode className="w-6 h-6 text-blue-600 flex-shrink-0" />
              Smart Barcode & IMEI Scanner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              1-Scan Instant Inventory Addition & Instant POS Checkout
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2 MAIN SCANNER MODES (Toggle between Add Stock & Sale Product) */}
        {/* ============================================================== */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-2">
          {/* Option 1: Sale Product (Quick Checkout) */}
          <button
            type="button"
            onClick={() => {
              setMode('SALE_PRODUCT');
              setError('');
              setSuccessMessage(null);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className={`p-3 sm:p-4 rounded-xl font-bold text-left transition-all flex items-start gap-3 ${
              mode === 'SALE_PRODUCT'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                mode === 'SALE_PRODUCT' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                <span>Sale Product</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-white/20">
                  فروخت
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 hidden sm:block ${
                  mode === 'SALE_PRODUCT' ? 'text-rose-100' : 'text-slate-500'
                }`}
              >
                Scan to instantly sell item, deduct from stock & record in Sale History.
              </p>
            </div>
          </button>

          {/* Option 2: Add Product (Stock In) */}
          <button
            type="button"
            onClick={() => {
              setMode('ADD_STOCK');
              setError('');
              setSuccessMessage(null);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className={`p-3 sm:p-4 rounded-xl font-bold text-left transition-all flex items-start gap-3 ${
              mode === 'ADD_STOCK'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                mode === 'ADD_STOCK' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                <span>Add Product</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-white/20">
                  اسٹاک ان
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 hidden sm:block ${
                  mode === 'ADD_STOCK' ? 'text-emerald-100' : 'text-slate-500'
                }`}
              >
                Scan box barcode to add +1 to stock, or save new products with 1 click.
              </p>
            </div>
          </button>
        </div>

        {/* Scanner Input Card */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          {/* Active Mode Notice */}
          <div
            className={`px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              mode === 'SALE_PRODUCT'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>
                {mode === 'SALE_PRODUCT'
                  ? 'Active Mode: Quick Sale — Scans will automatically create a sale invoice and reduce stock.'
                  : `Active Mode: Add to Stock (+${addQuantity}) — Scans will increment inventory stock.`}
              </span>
            </div>

            {mode === 'ADD_STOCK' && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                <span className="text-[11px] text-slate-500">Qty to add:</span>
                {[1, 5, 10].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAddQuantity(q)}
                    className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      addQuantity === q
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    +{q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barcode Input & USB Gun Field */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <div className="relative">
              <ScanBarcode
                className={`w-5 h-5 absolute left-3.5 top-3 ${
                  mode === 'SALE_PRODUCT' ? 'text-rose-600' : 'text-emerald-600'
                }`}
              />
              <input
                ref={inputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder={
                  mode === 'SALE_PRODUCT'
                    ? 'Scan Barcode / 15-digit IMEI to Sell...'
                    : 'Scan Box Barcode to Add to Stock...'
                }
                className="w-full pl-11 pr-28 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !scanInput.trim()}
                className={`absolute right-1.5 top-1.5 px-4 py-2 text-white font-bold text-xs rounded-xl transition shadow disabled:opacity-50 ${
                  mode === 'SALE_PRODUCT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? 'Processing...' : mode === 'SALE_PRODUCT' ? 'Sell Now' : 'Add Stock'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Tip: Point USB/Bluetooth barcode gun or use camera below. Scans process automatically on Enter.
            </p>
          </form>

          {/* Camera Buttons */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={toggleCamera}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition shadow-sm ${
                isCameraActive
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isCameraActive ? 'Stop Live Camera' : 'Open Live Camera Viewfinder'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Snap Barcode Photo (Mobile)</span>
            </button>
          </div>

          {cameraWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="font-semibold">{cameraWarning}</p>
            </div>
          )}

          {isCameraActive && (
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-center">
              <div id="camera-reader" className="w-full max-h-72 rounded-xl overflow-hidden mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2">
                Point your lens directly at the product box barcode or IMEI label.
              </p>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SUCCESS NOTIFICATION & LAST ACTION CARD */}
        {/* ============================================================== */}
        {lastAction && (
          <div
            className={`p-5 rounded-3xl border shadow-md space-y-3 animate-in fade-in duration-200 ${
              lastAction.type === 'SALE'
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <CheckCircle2
                  className={`w-5 h-5 ${
                    lastAction.type === 'SALE' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                />
                <span>
                  {lastAction.type === 'SALE'
                    ? '🎉 Sale Successfully Recorded & Stock Decremented!'
                    : '✅ Stock Added Successfully!'}
                </span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-white rounded-lg border shadow-sm font-semibold text-slate-700">
                {lastAction.timestamp}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{lastAction.productName}</h4>
                  <p className="text-xs text-slate-500 font-mono">
                    SKU: {lastAction.sku || '—'} • Scanned: {lastAction.code}
                  </p>
                </div>
                {lastAction.price !== undefined && (
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-rose-600">
                      {formatPKR(lastAction.price)}
                    </span>
                    <span className="text-xs text-slate-400 block font-mono">
                      {lastAction.invoiceNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">
                    {lastAction.type === 'SALE' ? 'Remaining Stock: ' : 'New Stock Level: '}
                  </span>
                  <strong className="text-slate-900 text-sm">
                    {lastAction.type === 'SALE' ? lastAction.remainingStock : lastAction.newStock} units
                  </strong>
                </div>

                <div className="flex gap-2">
                  {lastAction.type === 'SALE' ? (
                    <Link
                      href="/reports/today-sales"
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition"
                    >
                      View in Sales History &rarr;
                    </Link>
                  ) : (
                    <Link
                      href="/inventory"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition"
                    >
                      View in Inventory &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RECENT SCANNED SESSION ACTIVITY */}
        {/* ============================================================== */}
        {scanHistory.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-blue-600" />
                Live Session History ({scanHistory.length} scans)
              </h3>
              <button
                type="button"
                onClick={() => setScanHistory([])}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {scanHistory.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.type === 'SALE'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.type === 'SALE' ? 'SOLD' : '+ADDED'}
                    </span>
                    <span className="font-semibold text-slate-900">{item.productName}</span>
                    <span className="text-slate-400 font-mono">({item.code})</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-800">
                      {item.type === 'SALE' ? formatPKR(item.price) : `+${item.addedQty} units`}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUICK REGISTER DRAWER (When a new box barcode is scanned) */}
        {/* ============================================================== */}
        {showQuickRegister && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] my-auto shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PackagePlus className="w-5 h-5 text-emerald-600" />
                    New Barcode Detected: Quick Register
                  </h3>
                  <p className="text-xs text-slate-500">
                    Barcode <strong className="font-mono text-slate-800">{registerBarcode}</strong> is not in your catalog yet. Fill in product details to save.
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickRegisterSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto px-6 py-4 space-y-3.5 flex-1 text-xs">
                  {registerError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                      {registerError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fast Charger 25W / Airpods Pro 2 Case"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={newProductForm.categoryId}
                      onChange={(e) => setNewProductForm({ ...newProductForm, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Purchase Cost (PKR) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 1500"
                        value={newProductForm.purchaseCost}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, purchaseCost: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Selling Price (PKR) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 2500"
                        value={newProductForm.sellingPrice}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, sellingPrice: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Anker, Samsung"
                        value={newProductForm.brand}
                        onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Opening Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newProductForm.currentStock}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, currentStock: e.target.value })
                        }
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowQuickRegister(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow disabled:opacity-50"
                  >
                    {registering ? 'Saving Product...' : 'Save & Add to Stock'}
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
