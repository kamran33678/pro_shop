'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Mail, ArrowRight, ShieldCheck, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetToken(null);
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if (res.data) {
        setSuccessMessage(res.data.message || 'Password reset request generated.');
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate password reset. Please check your network.');
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
          Reset Password
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Enter your registered email to receive a password reset authorization
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Reset Token Generated</span>
              </div>
              <p className="text-slate-300">{successMessage}</p>

              {resetToken && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Security Authorization Token (Valid for 1 hour):
                  </p>
                  <code className="block p-2 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[11px] break-all border border-slate-800 select-all">
                    {resetToken}
                  </code>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Proceed to Set New Password &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {!resetToken && (
            <form className="space-y-5" onSubmit={handleForgot}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Registered Email Address
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="user@proshop.pk"
                    autoComplete="email"
                  />
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
                      <span>Generating Authorization...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

