'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ScanBarcode,
  Wrench,
  Menu,
  ShieldAlert,
  Loader2,
  Smartphone
} from 'lucide-react';
import { api } from '@/lib/api';
import { getStoredToken, getStoredUser, clearAuthSession, isAdmin, hasPermission, UserSession } from '@/lib/auth';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredPermission?: string;
  adminOnly?: boolean;
}

// Mapping of pathname to permission keys
const routePermissions: Record<string, string> = {
  '/pos': 'pos',
  '/scanner': 'scanner',
  '/repairs': 'repairs',
  '/products': 'products',
  '/inventory': 'inventory',
  '/categories': 'categories',
  '/stock-movements': 'stock-movements',
  '/customers': 'customers',
  '/suppliers': 'suppliers',
  '/purchases': 'purchases',
  '/accounts': 'accounts',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/settings': 'settings',
  '/employees': 'employees',
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  requiredPermission,
  adminOnly = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      const token = getStoredToken();
      const localUser = getStoredUser();

      if (!token || !localUser) {
        clearAuthSession();
        router.replace('/login');
        return;
      }

      if (isMounted) {
        setUser(localUser);
      }

      // Verify token with backend
      try {
        const res = await api.get('/auth/me');
        if (res.data && isMounted) {
          setUser(res.data);
          localStorage.setItem('pro_shop_user', JSON.stringify(res.data));
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          clearAuthSession();
          router.replace('/login');
          return;
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  // Auth checking state with sleek brand splash
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">PRO SHOP</h1>
            <p className="text-xs text-slate-400 mt-1">Verifying secure authentication...</p>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mt-2" />
        </div>
      </div>
    );
  }

  // Permission check for current route
  const currentRequiredPerm = requiredPermission || routePermissions[pathname];
  const isPageAdminOnly = adminOnly || pathname === '/employees' || pathname === '/settings';

  const userIsAdmin = isAdmin(user);
  const userHasPerm = currentRequiredPerm ? hasPermission(user, currentRequiredPerm) : true;
  const accessDenied = isPageAdminOnly ? !userIsAdmin : !userHasPerm;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col w-full overflow-x-hidden">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 w-full">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {accessDenied ? (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
              <p className="text-sm text-slate-500 mt-2">
                Your staff account does not have permission to access the{' '}
                <span className="font-semibold text-slate-700">{pathname}</span> module.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Please contact your shop administrator to request permission.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow"
                >
                  Return to Dashboard
                </Link>
                <Link
                  href="/pos"
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl transition"
                >
                  Go to POS
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
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

        {hasPermission(user, 'pos') && (
          <Link
            href="/pos"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              pathname === '/pos' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">POS</span>
          </Link>
        )}

        {/* Central Scan Floating Pill */}
        {hasPermission(user, 'scanner') && (
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
        )}

        {hasPermission(user, 'repairs') && (
          <Link
            href="/repairs"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              pathname === '/repairs' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Repairs</span>
          </Link>
        )}

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
