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
  Search,
  ShoppingCart,
  Boxes,
  RefreshCw,
  Plus,
  ArrowRight,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { api, formatPKR } from '@/lib/api';
import Link from 'next/link';

export default function ScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [scanType, setScanType] = useState<'AUTO' | 'BARCODE' | 'IMEI'>('AUTO');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [cameraWarning, setCameraWarning] = useState('');

  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // USB/Bluetooth Barcode Scanner Hardware Listener (keystroke burst)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      const char = e.key;

      if (char === 'Enter') {
        if (buffer.length >= 3) {
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
  }, []);

  const executeScan = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError('');
    setScanResult(null);

    const cleanCode = code.trim();

    try {
      const isImeiCandidate = /^\d{15}$/.test(cleanCode) || scanType === 'IMEI';
      let result: any = null;

      if (isImeiCandidate) {
        const res = await api.get(`/products/lookup/imei/${cleanCode}`);
        if (res.data?.found) {
          result = {
            type: 'IMEI',
            code: cleanCode,
            product: res.data.product,
            imeiRecord: res.data.imeiRecord,
          };
        }
      }

      if (!result && scanType !== 'IMEI') {
        const res = await api.get(`/products/lookup/barcode/${cleanCode}`);
        if (res.data?.found) {
          result = {
            type: 'BARCODE',
            code: cleanCode,
            product: res.data.product,
          };
        }
      }

      if (result) {
        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 9)]);
      } else {
        setError(`No product found registered for identifier: ${cleanCode}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error executing scan lookup.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanInput.trim()) {
      executeScan(scanInput.trim());
    }
  };

  // Mobile Native Camera / Image File Scanner (Works 100% on any mobile phone!)
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
      setError('Could not detect a clear barcode from image. Please ensure good lighting or type manually.');
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

      // Check if browser supports camera
      if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
        setCameraWarning('Live camera requires HTTPS or Chrome permissions. You can use the "Snap Barcode Photo" button below directly!');
        return;
      }

      setIsCameraActive(true);
      setTimeout(async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const qrCodeScanner = new Html5Qrcode('camera-reader');
          html5QrCodeRef.current = qrCodeScanner;

          // Attempt to find back camera
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
              qrbox: { width: 260, height: 160 },
            },
            (decodedText) => {
              executeScan(decodedText);
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
          setCameraWarning('Live camera permission was denied or not supported in this browser. Please use the "Snap Barcode Photo" button below!');
          setIsCameraActive(false);
        }
      }, 300);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 max-w-4xl mx-auto w-full">
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

        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ScanBarcode className="w-6 h-6 text-blue-600 flex-shrink-0" />
            Barcode & IMEI Scanner Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant mobile phone & accessories identification
          </p>
        </div>

        {/* Main Scanner Card */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          {/* Quick Manual / USB Input */}
          <form onSubmit={handleManualSearch} className="space-y-2">
            <div className="relative">
              <ScanBarcode className="w-5 h-5 text-blue-600 absolute left-3.5 top-3" />
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan or type Barcode / 15-digit IMEI..."
                className="w-full pl-11 pr-24 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !scanInput.trim()}
                className="absolute right-1.5 top-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition shadow disabled:opacity-50"
              >
                {loading ? '...' : 'Lookup'}
              </button>
            </div>

            {/* Scan Type Filter Pills */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="text-[11px] text-slate-400">Press Enter or click Lookup</span>
              <div className="flex gap-1.5">
                {(['AUTO', 'IMEI', 'BARCODE'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setScanType(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      scanType === mode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode === 'AUTO' ? 'Auto' : mode === 'IMEI' ? '15-digit IMEI' : 'Barcode'}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Mobile Camera Options */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Live Camera Stream */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition shadow-sm ${
                isCameraActive
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98'
              }`}
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isCameraActive ? 'Stop Live Camera' : 'Live Camera Viewfinder'}</span>
            </button>

            {/* Mobile Native Camera Snap (100% Reliable Fallback) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 active:scale-98 text-white transition shadow-sm"
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Snap Barcode Photo (Mobile)</span>
            </button>
          </div>

          {/* Camera Warning Banner if HTTPS missing */}
          {cameraWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{cameraWarning}</p>
              </div>
            </div>
          )}

          {/* Live Camera Viewfinder Box */}
          {isCameraActive && (
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-center">
              <div id="camera-reader" className="w-full max-h-72 rounded-xl overflow-hidden mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2">
                Point your lens directly at the product barcode or mobile IMEI label.
              </p>
            </div>
          )}
        </div>

        {/* Scan Result Card */}
        {scanResult && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Found: {scanResult.type}</span>
              </div>
              <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-slate-800">
                {scanResult.code}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">{scanResult.product?.name}</h4>
                  <p className="text-xs text-slate-500">
                    {scanResult.product?.brand} {scanResult.product?.model} • {scanResult.product?.category?.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base sm:text-xl font-extrabold text-blue-600">
                    {formatPKR(scanResult.product?.sellingPrice)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Cost: {formatPKR(scanResult.product?.purchaseCost)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Stock Status:</span>
                  <span className="font-bold text-slate-800">{scanResult.product?.currentStock} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tracking:</span>
                  <span className="font-bold text-slate-800">
                    {scanResult.product?.isTrackedByImei ? 'IMEI Device' : 'Quantity Based'}
                  </span>
                </div>
                {scanResult.imeiRecord && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[11px]">Device State:</span>
                    <span className="font-bold text-emerald-600 uppercase">
                      {scanResult.imeiRecord.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/pos"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to POS Terminal Sale</span>
                </Link>
                <Link
                  href="/products"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not Found Error */}
        {error && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Not Found in System</h4>
                <p className="text-xs text-amber-700 mt-0.5">{error}</p>
              </div>
            </div>
            <Link
              href="/products"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm whitespace-nowrap"
            >
              + Register Product
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
