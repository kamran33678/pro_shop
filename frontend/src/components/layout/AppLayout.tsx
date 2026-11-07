'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ScanBarcode,
  Wrench,
  Menu
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('pro_shop_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ name: 'Muhammad Kamran', role: 'OWNER' });
        }
      } else {
        setUser({ name: 'Muhammad Kamran', role: 'OWNER' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col w-full overflow-x-hidden">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role}
        userName={user?.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 w-full">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Retail POS Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around lg:hidden shadow-lg shadow-slate-900/10">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          href="/pos"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            pathname === '/pos' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">POS</span>
        </Link>

        {/* Central Scan Floating Pill */}
        <Link
          href="/scanner"
          className={`flex flex-col items-center justify-center -mt-4 p-2.5 rounded-2xl shadow-md transition ${
            pathname === '/scanner'
              ? 'bg-blue-600 text-white shadow-blue-500/30'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/30'
          }`}
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Scan</span>
        </Link>

        <Link
          href="/repairs"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            pathname === '/repairs' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Repairs</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>
    </div>
  );
};
