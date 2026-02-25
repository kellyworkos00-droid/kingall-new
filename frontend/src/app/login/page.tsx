'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      setAuth(user, token);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_circle_at_10%_10%,#fde68a33,transparent_60%),radial-gradient(900px_circle_at_90%_20%,#38bdf833,transparent_55%)]">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl animate-float [animation-delay:1.5s]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-in-up rounded-3xl bg-slate-950 p-10 text-slate-100 shadow-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-[0.3em]">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Secure ERP Access
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-tight font-display">
              Elegant Steel Hardware
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Run finance, inventory, sales, and purchasing from a single, confident workspace.
            </p>
            <div className="mt-10 grid gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 text-center leading-8">1</span>
                <span>Live stock visibility across warehouses.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 text-center leading-8">2</span>
                <span>Cash, credit, and margin performance in one view.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 text-center leading-8">3</span>
                <span>Role-based access for every team.</span>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up rounded-3xl border border-white/60 bg-white/80 p-10 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sign in</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 font-display">Welcome back</h2>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 md:flex">
                <span className="text-lg">EH</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="label text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input border-slate-200 bg-white/70 focus:ring-sky-400/60"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input border-slate-200 bg-white/70 focus:ring-sky-400/60"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? 'Signing in' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Need access? Contact your system administrator for credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
