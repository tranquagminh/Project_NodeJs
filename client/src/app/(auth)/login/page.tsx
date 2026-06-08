'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { FooterMinimal } from '@/components/layout/Footer';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');
  const { login, register } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'signin' | 'create'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      success('Welcome back!');
      const dest = explicitRedirect
        ?? ((loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'SUPER_ADMIN') ? '/admin' : '/account');
      router.push(dest);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      success('Account created! Welcome to VOLTA.');
      router.push(explicitRedirect ?? '/account');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side — Form */}
      <div className="py-20 px-8 sm:px-16 flex flex-col justify-center">
        <div className="max-w-[520px] ml-auto w-full">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">
            {activeTab === 'signin' ? 'Welcome back' : 'Join VOLTA'}
          </p>
          <h1 className="font-heading font-bold text-[clamp(44px,5vw,64px)] tracking-[-0.03em] leading-none mb-4">
            {activeTab === 'signin' ? 'Sign in to VOLTA' : 'Create account'}
          </h1>
          <p className="text-volta-ink-2 text-base leading-relaxed mb-8">
            {activeTab === 'signin'
              ? 'Access your account to track orders, manage preferences, and get early access to new drops.'
              : 'Join the VOLTA community for exclusive member access, order tracking, and personalized recommendations.'}
          </p>

          {/* Auth Tabs */}
          <div className="flex gap-1 bg-volta-bg rounded-[10px] p-1 mb-6">
            {(['signin', 'create'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setError(''); }}
                className={`flex-1 py-3 rounded-lg font-mono text-[11px] tracking-[0.12em] uppercase text-center cursor-pointer transition-all ${
                  activeTab === tab ? 'bg-white text-volta-ink shadow-sm' : 'text-volta-ink-3'
                }`}
              >
                {tab === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px]">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-5">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-volta-ink-3 hover:text-volta-ink transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-volta-ink-2">Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => setActiveTab('create')} className="text-volta-accent-ink font-medium hover:underline">Sign up</button>
                </span>
                <Link href="/forgot-password" className="text-volta-accent-ink text-[13px] font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-volta-ink-3 hover:text-volta-ink transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-volta-ink-3">
                By creating an account you agree to our{' '}
                <Link href="/policy" className="text-volta-accent-ink hover:underline">Terms & Privacy Policy</Link>.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create account'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right side — Branding panel */}
      <div className="bg-volta-ink text-white py-20 px-16 hidden lg:flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading font-bold text-[clamp(220px,28vw,420px)] tracking-[-0.05em] leading-[0.85] text-white/[0.04] pointer-events-none whitespace-nowrap select-none">
          V
        </div>
        <div className="relative z-10 max-w-[440px]">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent">VOLTA account</p>
          <h2 className="font-heading font-bold text-[clamp(32px,3.5vw,48px)] tracking-[-0.025em] leading-[1.05] mt-3 mb-5">
            Your gear, your way.
          </h2>
          <p className="text-white/75 text-[15px] leading-relaxed mb-6">
            Create an account for a personalized experience — from custom stringing profiles to exclusive member-only releases.
          </p>
          <ul className="flex flex-col gap-4">
            {['Order tracking and history', 'Saved stringing preferences', 'Early access to new drops', 'Free returns on every order'].map((perk) => (
              <li key={perk} className="text-white/85 text-[14px] flex items-start gap-3">
                <span className="w-[18px] h-[18px] rounded-full bg-volta-accent flex-shrink-0 mt-0.5" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
