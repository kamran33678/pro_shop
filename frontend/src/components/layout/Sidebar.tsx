'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Package,
  FolderTree,
  ArrowLeftRight,
  ScanBarcode,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  Wrench,
  Landmark,
  Receipt,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Smartphone,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Sales / POS', href: '/pos', icon: ShoppingCart },
  { label: 'Barcode & IMEI Scanner', href: '/scanner', icon: ScanBarcode },
  { label: 'Repairing Hub', href: '/repairs', icon: Wrench },
  { label: 'Products Catalogue', href: '/products', icon: Package },
  { label: 'Inventory Status', href: '/inventory', icon: Boxes },
  { label: 'Categories', href: '/categories', icon: FolderTree },
  { label: 'Stock Movements', href: '/stock-movements', icon: ArrowLeftRight },
  { label: 'Customers & Udhaar', href: '/customers', icon: Users },
  { label: 'Suppliers & Payables', href: '/suppliers', icon: Building2 },
  { label: 'Purchases', href: '/purchases', icon: Truck },
  { label: 'Accounts & Ledger', href: '/accounts', icon: Landmark },
  { label: 'Shop Expenses', href: '/expenses', icon: Receipt },
  { label: 'Employees & Roles', href: '/employees', icon: UserCheck },
  { label: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Shop Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole = 'OWNER', userName = 'Shop Owner' }) => {
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pro_shop_token');
      localStorage.removeItem('pro_shop_user');
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[82vw] max-w-xs sm:w-72 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-2xl`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex-shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white font-bold shadow-lg shadow-blue-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                PRO SHOP
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Mobile Management</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-2.5 mx-3 my-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow">
            {userName ? userName.substring(0, 2).toUpperCase() : 'PS'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 capitalize">
              {userRole.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-200 flex-shrink-0" />}
              </Link>
            );
          })}
        </div>

        {/* Footer with logout */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-2.5 px-3 py-2.5 text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
