'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Smartphone,
  Lock,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token.trim()) {
      setError('Password reset token is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });

      if (res.data) {
        setSuccess(res.data.message || 'Password successfully reset!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
      {error && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Password Updated!</h3>
          <p className="text-xs text-slate-300">
            Your new password has been safely stored. You can now access your shop using your updated credentials.
          </p>
          <div className="pt-3">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleReset}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Authorization Token
            </label>
            <div className="mt-1.5 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste reset token here"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              New Password
            </label>
            <div className="mt-1.5 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-10 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none z-10 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Confirm New Password
            </label>
            <div className="mt-1.5 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none z-10 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Set New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
        <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
          Return to Sign In &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-xl shadow-blue-500/30">
            <Smartphone className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Create New Password
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Enter your reset authorization token and new security password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="text-white text-center text-sm py-8">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

