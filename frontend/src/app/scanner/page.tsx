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
  Minus,
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
  X,
  CreditCard,
  Banknote,
  DollarSign,
  Tag,
  PackageCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';
import Link from 'next/link';

export default function ScannerPage() {
  // Main Scanner Mode: 'SALE_PRODUCT' or 'ADD_STOCK'
  const [mode, setMode] = useState<'SALE_PRODUCT' | 'ADD_STOCK'>('SALE_PRODUCT');

  // Scanner inputs & camera state
  const [scanInput, setScanInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraWarning, setCameraWarning] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Require manual "OK" confirmation before proceeding (default: true as requested by user)
  const [requireConfirmation, setRequireConfirmation] = useState(true);

  // Scanned Product Details for Review / Confirmation Modal
  const [scannedItem, setScannedItem] = useState<{
    code: string;
    type: 'IMEI' | 'PRODUCT';
    product: any;
    imeiRecord?: any;
  } | null>(null);

  // Action Form state inside the confirmation modal
  const [actionQuantity, setActionQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE' | 'CREDIT'>('CASH');

  // Success Receipt State (shown after OK is clicked)
  const [completedAction, setCompletedAction] = useState<any>(null);

  // Scan Session History
  const [scanHistory, setScanHistory] = useState<any[]>([]);

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

  // Fetch categories on mount for quick product registration
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
  const playSound = (type: 'beep' | 'success' | 'sale' | 'error') => {
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
        // Cashier 2-tone chime
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'beep') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
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

  // Keyboard shortcut listener for USB/Bluetooth scanner guns & Enter key
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // If user presses Enter while Review Modal is open, automatically trigger "OK" confirm!
      if (e.key === 'Enter' && scannedItem && !actionLoading) {
        e.preventDefault();
        handleConfirmAction();
        return;
      }

      // If user presses Escape while Review Modal is open, cancel it
      if (e.key === 'Escape' && scannedItem) {
        setScannedItem(null);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }

      // If typing in another input (like Quick Register form), ignore global scanner gun buffer
      if (showQuickRegister) return;
      if (target.tagName === 'INPUT' && target !== inputRef.current) return;
      if (target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      const char = e.key;

      if (char === 'Enter') {
        if (buffer.length >= 2) {
          executeScanLookup(buffer.trim());
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
  }, [scannedItem, actionLoading, showQuickRegister, actionQuantity, paymentMethod, mode]);

  // Step 1: Scan Barcode / IMEI and Lookup Product Details
  const executeScanLookup = async (code: string) => {
    if (!code) return;
    const cleanCode = code.trim();
    setLoading(true);
    setError('');
    setCompletedAction(null);

    try {
      const res = await api.get(`/products/lookup/universal/${encodeURIComponent(cleanCode)}`);

      if (!res.data?.found) {
        playSound('error');
        if (mode === 'ADD_STOCK') {
          // Open Quick Register form with barcode pre-filled
          setRegisterBarcode(cleanCode);
          setNewProductForm((prev) => ({
            ...prev,
            name: '',
            purchaseCost: '',
            sellingPrice: '',
            brand: '',
            model: '',
            currentStock: '1',
          }));
          setShowQuickRegister(true);
        } else {
          setError(`Product not found for Barcode/IMEI: "${cleanCode}". Please switch to "Add Product" mode to add it to inventory.`);
        }
        return;
      }

      playSound('beep');
      const itemData = {
        code: cleanCode,
        type: res.data.type as 'IMEI' | 'PRODUCT',
        product: res.data.product,
        imeiRecord: res.data.imeiRecord,
      };

      // Set default action quantity
      setActionQuantity(1);
      setPaymentMethod('CASH');

      if (!requireConfirmation) {
        // Auto-confirm mode without showing the review step
        await executeDirectAction(itemData, 1, 'CASH');
      } else {
        // Show Review & Confirmation Dialog so user sees EXACTLY what was scanned and can click OK!
        setScannedItem(itemData);
      }
      setScanInput('');
    } catch (err: any) {
      playSound('error');
      setError(err.response?.data?.message || 'Error looking up barcode.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User Reviews Details & Clicks "OK / Confirm"
  const handleConfirmAction = async () => {
    if (!scannedItem) return;
    await executeDirectAction(scannedItem, actionQuantity, paymentMethod);
  };

  const executeDirectAction = async (
    itemData: { code: string; type: string; product: any; imeiRecord?: any },
    qty: number,
    pm: string
  ) => {
    setActionLoading(true);
    setError('');

    try {
      if (mode === 'SALE_PRODUCT') {
        // Execute Quick Sale
        const res = await api.post('/sales/scan-quick-sale', {
          code: itemData.code,
          quantity: qty,
          paymentMethod: pm,
        });

        const sale = res.data;
        const item = sale.items?.[0];
        const prod = item?.product || itemData.product;

        playSound('sale');
        const actionResult = {
          type: 'SALE',
          timestamp: new Date().toLocaleTimeString(),
          invoiceNumber: sale.invoiceNumber,
          productName: prod?.name || itemData.product.name,
          sku: prod?.sku || itemData.product.sku,
          brand: prod?.brand || itemData.product.brand,
          model: prod?.model || itemData.product.model,
          quantity: qty,
          unitPrice: Number(item?.unitPrice || itemData.product.sellingPrice),
          totalAmount: Number(sale.netAmount || 0),
          remainingStock: Math.max(0, itemData.product.currentStock - qty),
          code: itemData.code,
          paymentMethod: pm,
        };

        setCompletedAction(actionResult);
        setScanHistory((prev) => [actionResult, ...prev.slice(0, 14)]);
        setScannedItem(null); // Close confirmation modal
      } else {
        // Execute Add Stock
        const res = await api.post('/products/scan-stock-in', {
          code: itemData.code,
          quantity: qty,
        });

        if (res.data?.requiresImei) {
          playSound('error');
          setError(res.data.message || 'Product is IMEI-tracked. Please register specific IMEIs.');
          setScannedItem(null);
          return;
        }

        playSound('success');
        const updatedProd = res.data.product || itemData.product;
        const actionResult = {
          type: 'STOCK_IN',
          timestamp: new Date().toLocaleTimeString(),
          productName: updatedProd.name,
          sku: updatedProd.sku,
          brand: updatedProd.brand,
          model: updatedProd.model,
          quantity: res.data.addedQuantity || qty,
          previousStock: itemData.product.currentStock,
          newStock: res.data.newStock ?? itemData.product.currentStock + qty,
          code: itemData.code,
        };

        setCompletedAction(actionResult);
        setScanHistory((prev) => [actionResult, ...prev.slice(0, 14)]);
        setScannedItem(null); // Close confirmation modal
      }
    } catch (err: any) {
      playSound('error');
      setError(err.response?.data?.message || 'Failed to complete transaction.');
    } finally {
      setActionLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanInput.trim()) {
      executeScanLookup(scanInput.trim());
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
        await executeScanLookup(decodedText);
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
              executeScanLookup(decodedText);
              qrCodeScanner.pause();
              setTimeout(() => {
                try {
                  qrCodeScanner.resume();
                } catch {}
              }, 2000);
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
        currentStock: Number(newProductForm.currentStock || 1),
        minStockLevel: 2,
        isTrackedByImei: false,
      };

      const res = await api.post('/products', payload);
      playSound('success');
      setShowQuickRegister(false);

      const actionResult = {
        type: 'STOCK_IN',
        timestamp: new Date().toLocaleTimeString(),
        productName: res.data.name,
        sku: res.data.sku || '',
        quantity: payload.currentStock,
        previousStock: 0,
        newStock: res.data.currentStock,
        code: registerBarcode,
      };
      setCompletedAction(actionResult);
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

        {/* Header & Settings Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ScanBarcode className="w-6 h-6 text-blue-600 flex-shrink-0" />
              Smart Barcode & IMEI Scanner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant product identification with review & 1-click OK confirmation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Require OK confirmation toggle */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-sm hover:bg-slate-50">
              <input
                type="checkbox"
                checked={requireConfirmation}
                onChange={(e) => setRequireConfirmation(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Review Details & Click OK</span>
            </label>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors shadow-sm bg-white"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2 MAIN SCANNER MODES (Toggle between Sale Product & Add Stock) */}
        {/* ============================================================== */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-2">
          {/* Option 1: Sale Product */}
          <button
            type="button"
            onClick={() => {
              setMode('SALE_PRODUCT');
              setError('');
              setScannedItem(null);
              setCompletedAction(null);
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
                Scan barcode/IMEI → Review details → Click OK to sell & deduct stock.
              </p>
            </div>
          </button>

          {/* Option 2: Add Product (Stock In) */}
          <button
            type="button"
            onClick={() => {
              setMode('ADD_STOCK');
              setError('');
              setScannedItem(null);
              setCompletedAction(null);
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
                Scan box barcode → Review details → Click OK to add stock.
              </p>
            </div>
          </button>
        </div>

        {/* Scanner Input Card */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
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
                  ? 'Active Mode: Sale Product — Scan barcode or IMEI to review item and confirm sale.'
                  : 'Active Mode: Add Product — Scan box barcode to review and increment stock.'}
              </span>
            </div>
          </div>

          {/* Barcode Input & USB Gun Field */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <div className="relative">
              <ScanBarcode
                className={`w-5 h-5 absolute left-3.5 top-3.5 ${
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
                    ? 'Scan Barcode or 15-digit IMEI to Sell...'
                    : 'Scan Box Barcode to Add to Stock...'
                }
                className="w-full pl-11 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
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
                {loading ? 'Scanning...' : 'Scan / Lookup'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Point USB barcode gun, mobile camera, or type code and press Enter. Details will appear for your confirmation.
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
                Point your camera lens directly at the product box barcode or device IMEI.
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900 text-xs sm:text-sm animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Scan Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: SCANNED PRODUCT CONFIRMATION MODAL (REVIEW & CLICK OK) */}
        {/* ============================================================== */}
        {scannedItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div
                className={`px-6 py-4 flex items-center justify-between text-white ${
                  mode === 'SALE_PRODUCT' ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {mode === 'SALE_PRODUCT' ? (
                      <ShoppingCart className="w-5 h-5 text-white" />
                    ) : (
                      <PackagePlus className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg">
                      {mode === 'SALE_PRODUCT'
                        ? 'Confirm Sale Transaction'
                        : 'Confirm Stock Addition'}
                    </h3>
                    <p className="text-xs text-white/80">
                      Please verify item details and click OK to proceed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setScannedItem(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Scanned Product Details */}
              <div className="p-6 space-y-4 text-xs">
                {/* Product Name & Brand */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="uppercase font-semibold tracking-wider">Scanned Item</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {scannedItem.type === 'IMEI' ? 'IMEI: ' : 'Barcode: '}
                      {scannedItem.code}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{scannedItem.product?.name}</h4>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>Category: <strong>{scannedItem.product?.category?.name || 'General'}</strong></span>
                    {scannedItem.product?.brand && <span>• Brand: <strong>{scannedItem.product.brand}</strong></span>}
                    {scannedItem.product?.model && <span>• Model: <strong>{scannedItem.product.model}</strong></span>}
                  </div>
                </div>

                {/* Stock & Pricing Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Selling Price</span>
                    <span className="text-xl font-extrabold text-blue-600">
                      {formatPKR(scannedItem.product?.sellingPrice)}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Current Stock</span>
                    <span
                      className={`text-xl font-extrabold ${
                        scannedItem.product?.currentStock <= 0
                          ? 'text-red-600'
                          : scannedItem.product?.currentStock <= 3
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {scannedItem.product?.currentStock} units
                    </span>
                  </div>
                </div>

                {/* Specific Options for SALE PRODUCT */}
                {mode === 'SALE_PRODUCT' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {scannedItem.product?.currentStock <= 0 && !scannedItem.imeiRecord ? (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Cannot sell: This product is currently out of stock (0 units).</span>
                      </div>
                    ) : (
                      <>
                        {/* Quantity Counter */}
                        {!scannedItem.product?.isTrackedByImei && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="font-semibold text-slate-700">Quantity to Sell:</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActionQuantity(Math.max(1, actionQuantity - 1))}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-base text-slate-900">
                                {actionQuantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionQuantity(
                                    Math.min(scannedItem.product?.currentStock || 99, actionQuantity + 1)
                                  )
                                }
                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Payment Method Selector */}
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1.5">
                            Payment Method
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['CASH', 'CARD', 'CREDIT'] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border ${
                                  paymentMethod === method
                                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {method === 'CASH' ? 'Cash' : method === 'CARD' ? 'Card / Bank' : 'Credit (Udhaar)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Total Bill Summary */}
                        <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
                          <span className="font-bold text-rose-900 text-sm">Total Sale Amount:</span>
                          <span className="text-xl font-extrabold text-rose-600">
                            {formatPKR(Number(scannedItem.product?.sellingPrice || 0) * actionQuantity)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Specific Options for ADD PRODUCT */}
                {mode === 'ADD_STOCK' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="font-semibold text-slate-700">Add Units to Stock:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActionQuantity(Math.max(1, actionQuantity - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-base text-slate-900">
                          +{actionQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActionQuantity(actionQuantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Quick:</span>
                      {[1, 5, 10, 20].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setActionQuantity(q)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${
                            actionQuantity === q
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          +{q}
                        </button>
                      ))}
                    </div>

                    {/* Projected Stock Preview */}
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <span className="font-bold text-emerald-900 text-sm">New Total Stock Level:</span>
                      <span className="text-xl font-extrabold text-emerald-600">
                        {(scannedItem.product?.currentStock || 0) + actionQuantity} units
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with OK / Cancel Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setScannedItem(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors"
                >
                  Cancel (Esc)
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={
                    actionLoading ||
                    (mode === 'SALE_PRODUCT' &&
                      scannedItem.product?.currentStock <= 0 &&
                      !scannedItem.imeiRecord)
                  }
                  className={`px-6 py-2.5 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 ${
                    mode === 'SALE_PRODUCT'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  }`}
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {actionLoading
                      ? 'Processing...'
                      : mode === 'SALE_PRODUCT'
                      ? 'OK – Confirm Sale (Enter)'
                      : 'OK – Add to Stock (Enter)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* COMPLETED TRANSACTION CONFIRMATION RECEIPT */}
        {/* ============================================================== */}
        {completedAction && (
          <div
            className={`p-5 rounded-3xl border shadow-lg space-y-4 animate-in fade-in duration-200 ${
              completedAction.type === 'SALE'
                ? 'bg-rose-50/80 border-rose-300'
                : 'bg-emerald-50/80 border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-base">
                <CheckCircle2
                  className={`w-6 h-6 ${
                    completedAction.type === 'SALE' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                />
                <span className={completedAction.type === 'SALE' ? 'text-rose-900' : 'text-emerald-900'}>
                  {completedAction.type === 'SALE'
                    ? '🎉 Sale Successfully Recorded & Stock Decremented!'
                    : '✅ Stock Successfully Added to Inventory!'}
                </span>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-white rounded-lg border font-bold text-slate-700 shadow-sm">
                {completedAction.timestamp}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{completedAction.productName}</h4>
                  <p className="text-xs text-slate-500">
                    {completedAction.brand && `${completedAction.brand} • `}
                    SKU: <strong className="font-mono text-slate-700">{completedAction.sku}</strong> • Scanned: <strong className="font-mono text-slate-700">{completedAction.code}</strong>
                  </p>
                </div>
                {completedAction.totalAmount !== undefined && (
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-rose-600">
                      {formatPKR(completedAction.totalAmount)}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 block">
                      Invoice #{completedAction.invoiceNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">
                    {completedAction.type === 'SALE' ? 'Remaining Stock in Shop: ' : 'New Stock Level: '}
                  </span>
                  <strong className="text-base text-slate-900 font-extrabold">
                    {completedAction.type === 'SALE'
                      ? completedAction.remainingStock
                      : completedAction.newStock}{' '}
                    units
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {completedAction.type === 'SALE' ? (
                    <Link
                      href="/reports/today-sales"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition shadow"
                    >
                      View in Sales History &rarr;
                    </Link>
                  ) : (
                    <Link
                      href="/inventory"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow"
                    >
                      View in Inventory &rarr;
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedAction(null);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                  >
                    Scan Next Item
                  </button>
                </div>
              </div>
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
                Live Session History ({scanHistory.length} actions)
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
                      {item.type === 'SALE' ? formatPKR(item.totalAmount) : `+${item.quantity} units`}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUICK REGISTER MODAL (When a brand-new box barcode is scanned) */}
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
                    Barcode <strong className="font-mono text-slate-800">{registerBarcode}</strong> is not in your catalog yet. Fill details to save and stock.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
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
                        Initial Stock Quantity
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

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
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
