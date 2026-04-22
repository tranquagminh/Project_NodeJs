'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FooterMinimal } from '@/components/layout/Footer';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'create'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with auth API
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side — Form */}
      <div className="py-20 px-8 sm:px-16 flex flex-col justify-center">
        <div className="max-w-[520px] ml-auto w-full">
          {/* Eyebrow */}
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">
            Welcome back
          </p>

          {/* Heading */}
          <h1 className="font-heading font-bold text-[clamp(44px,5vw,64px)] tracking-[-0.03em] leading-none mb-4">
            Sign in to VOLTA
          </h1>

          {/* Lede */}
          <p className="text-volta-ink-2 text-base leading-relaxed mb-8">
            Access your account to track orders, manage preferences, and get early access to new drops.
          </p>

          {/* Auth Tabs */}
          <div className="flex gap-1 bg-volta-bg rounded-[10px] p-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 rounded-lg font-mono text-[11px] tracking-[0.12em] uppercase text-center cursor-pointer transition-all ${
                activeTab === 'signin'
                  ? 'bg-white text-volta-ink shadow-sm'
                  : 'text-volta-ink-3'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 rounded-lg font-mono text-[11px] tracking-[0.12em] uppercase text-center cursor-pointer transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-volta-ink shadow-sm'
                  : 'text-volta-ink-3'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-volta-ink-3 hover:text-volta-ink transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Auth Meta */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-volta-line accent-volta-accent-ink"
                  />
                  <span className="text-[13px] text-volta-ink-2">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-volta-accent-ink text-[13px] font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors flex items-center justify-center gap-2"
              >
                Sign in
                <ArrowRight size={16} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-1">
                <div className="flex-1 h-px bg-volta-line" />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-volta-line" />
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="py-3 border border-volta-line rounded-[10px] bg-white font-medium text-[13px] flex items-center justify-center gap-2 hover:border-volta-ink-3 hover:bg-[#fafafa] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="py-3 border border-volta-line rounded-[10px] bg-white font-medium text-[13px] flex items-center justify-center gap-2 hover:border-volta-ink-3 hover:bg-[#fafafa] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </button>
              </div>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-volta-ink-3 hover:text-volta-ink transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors flex items-center justify-center gap-2"
              >
                Create account
                <ArrowRight size={16} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-1">
                <div className="flex-1 h-px bg-volta-line" />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-volta-line" />
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="py-3 border border-volta-line rounded-[10px] bg-white font-medium text-[13px] flex items-center justify-center gap-2 hover:border-volta-ink-3 hover:bg-[#fafafa] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="py-3 border border-volta-line rounded-[10px] bg-white font-medium text-[13px] flex items-center justify-center gap-2 hover:border-volta-ink-3 hover:bg-[#fafafa] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right side — Branding panel */}
      <div className="bg-volta-ink text-white py-20 px-16 hidden lg:flex flex-col justify-center relative overflow-hidden">
        {/* Giant watermark V */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading font-bold text-[clamp(220px,28vw,420px)] tracking-[-0.05em] leading-[0.85] text-white/[0.04] pointer-events-none whitespace-nowrap select-none">
          V
        </div>

        <div className="relative z-10 max-w-[440px]">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent">
            VOLTA account
          </p>
          <h2 className="font-heading font-bold text-[clamp(32px,3.5vw,48px)] tracking-[-0.025em] leading-[1.05] mt-3 mb-5">
            Your gear, your way.
          </h2>
          <p className="text-white/75 text-[15px] leading-relaxed mb-6">
            Create an account for a personalized experience — from custom stringing profiles to exclusive member-only releases.
          </p>

          <ul className="flex flex-col gap-4">
            {[
              'Order tracking and history',
              'Saved stringing preferences',
              'Early access to new drops',
              'Free returns on every order',
            ].map((perk) => (
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
