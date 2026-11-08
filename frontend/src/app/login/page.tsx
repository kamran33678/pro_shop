'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock, Mail, ArrowRight, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { setAuthSession, getStoredToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOwnerSetup, setIsOwnerSetup] = useState<boolean | null>(null);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const existingToken = getStoredToken();
    if (existingToken) {
      router.replace('/');
      return;
    }

    // Check if system has an owner registered
    async function checkSetup() {
      try {
        const res = await api.get('/health');
        if (res.data && res.data.isOwnerSetup === false) {
          setIsOwnerSetup(false);
        } else {
          setIsOwnerSetup(true);
        }
      } catch (e) {
        console.error('Health check failed:', e);
      }
    }
    checkSetup();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your email address or username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        identifier: cleanId,
        email: cleanId,
        password,
        rememberMe,
      });

      if (res.data && res.data.accessToken) {
        setAuthSession(res.data.accessToken, res.data.user);
        router.replace('/');
      } else {
        setError('Login failed: Token not returned.');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        const msg = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(', ')
          : err.response.data.message;
        setError(msg);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to API server. Please verify the server is running.');
      } else {
        setError('Invalid credentials. Please verify your email/username and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-xl shadow-blue-500/30">
            <Smartphone className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Sign In to PRO SHOP
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Mobile Shop POS, IMEI Inventory & Accounts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {/* Banner if no owner exists yet */}
          {isOwnerSetup === false && (
            <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Initial Shop Setup Required</span>
              </div>
              <p>
                No Owner account is registered yet. Please create your shop administrator account first.
              </p>
              <Link
                href="/setup"
                className="mt-1 inline-flex items-center justify-center py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition text-xs"
              >
                Register Shop Owner Now &rarr;
              </Link>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address or Username
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="owner@proshop.pk or username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition focus:outline-none z-10 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 rounded bg-slate-900 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-300 cursor-pointer">
                  Remember my session (30 days)
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Need a staff or shop account?{' '}
              <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
                Create Account
              </Link>
            </p>
            {isOwnerSetup === false && (
              <p className="text-xs text-slate-400">
                New system installation?{' '}
                <Link href="/setup" className="font-semibold text-amber-400 hover:text-amber-300">
                  Initial Setup Wizard
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
