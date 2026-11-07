'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ScanBarcode, ShoppingCart, Bell, Wrench } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  shopName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  shopName = 'PRO SHOP',
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
      {/* Left side: Hamburger Button + Shop Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition lg:hidden focus:outline-none flex-shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
              {shopName}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PKR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate">
            Mobile Shop POS & Repair Portal
          </p>
        </div>
      </div>

      {/* Right side: Quick Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Scanner Shortcut */}
        <Link
          href="/scanner"
          className="p-2 sm:px-3 sm:py-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition flex items-center gap-1.5"
          title="Open Barcode & IMEI Scanner"
        >
          <ScanBarcode className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold hidden md:inline">Scanner</span>
        </Link>

        {/* Repairs Shortcut */}
        <Link
          href="/repairs"
          className="p-2 sm:px-3 sm:py-1.5 text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 active:scale-95 border border-teal-200 rounded-xl transition flex items-center gap-1.5"
          title="Repairs"
        >
          <Wrench className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold hidden md:inline">Repairs</span>
        </Link>

        {/* POS Button */}
        <Link
          href="/pos"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm shadow-blue-500/20 transition"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>POS</span>
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>
      </div>
    </header>
  );
};
