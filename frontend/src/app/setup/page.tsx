'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Lock,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  Store,
  Eye,
  EyeOff,
  CheckCircle2,
  LayoutDashboard,
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shopName: 'PRO SHOP Mobile & Electronics',
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAlreadySetup, setIsAlreadySetup] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOwnerStatus() {
      try {
        const res = await api.get('/health');
        if (res.data && res.data.isOwnerSetup === true) {
          setIsAlreadySetup(true);
        } else {
          setIsAlreadySetup(false);
        }
      } catch (e) {
        console.error('Error checking health status:', e);
        setIsAlreadySetup(false);
      } finally {
        setChecking(false);
      }
    }
    checkOwnerStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register-owner', {
        shopName: formData.shopName,
        name: formData.name,
        email: formData.email,
        username: formData.username || undefined,
        phone: formData.phone,
        password: formData.password,
      });

      if (res.data) {
        if (res.data.accessToken) {
          localStorage.setItem('pro_shop_token', res.data.accessToken);
          localStorage.setItem('pro_shop_user', JSON.stringify(res.data.user));
        }
        setSuccess('Shop Owner account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (err: any) {
      if (err.response?.data?.message?.includes('already registered')) {
        setIsAlreadySetup(true);
      }
      setError(err.response?.data?.message || 'Failed to setup owner account. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        Checking shop configuration...
      </div>
    );
  }

  // If Owner is already registered, show clear options to go to Dashboard or Login!
  if (isAlreadySetup) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
            Owner Account is Active!
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            A main administrator account is already registered for this shop.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs text-center">
              Your shop setup is complete. Additional staff or technician accounts can be added from the Employees module.
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Open Business Dashboard</span>
              </a>

              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-700/60 text-sm font-semibold text-slate-200 transition"
              >
                <LogIn className="w-5 h-5 text-slate-400" />
                <span>Go to Sign In Page</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-xl shadow-blue-500/30">
            <Smartphone className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          Initial Shop Owner Setup
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Set up the primary administrative account for <span className="text-blue-400 font-semibold">PRO SHOP</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Shop / Business Name
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="shopName"
                  required
                  value={formData.shopName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g. Al-Madina Mobile Centre"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Owner Full Name
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g. Muhammad Usman"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="owner@proshop.pk"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Phone Number
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="0300 1234567"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none z-10 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Confirm Password
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Re-type password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none z-10 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                {loading ? 'Creating Owner Account...' : 'Complete Owner Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                  Already registered? Go to Sign In &rarr;
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
