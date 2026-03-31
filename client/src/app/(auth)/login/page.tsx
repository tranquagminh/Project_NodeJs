'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FooterMinimal } from '@/components/layout/Footer';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with auth API
  };

  return (
    <div className="min-h-screen flex flex-col bg-kinetic-bg relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-kinetic-blue/5 to-kinetic-green/5" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-kinetic-blue/5 rounded-xl blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-kinetic-green/5 rounded-xl blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[640px] flex flex-col gap-12">
          {/* Brand Anchor */}
          <div className="text-center">
            <h1 className="font-heading font-bold text-4xl text-kinetic-blue tracking-tight">KINETIC</h1>
            <p className="mt-2 font-sans text-[10px] text-kinetic-text-muted tracking-[2px] uppercase">
              Engineered for Velocity
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-kinetic-border/10 shadow-sm">
            <form onSubmit={handleSubmit} className="px-10 pt-10 pb-6 flex flex-col gap-8">
              {/* Header */}
              <div>
                <h2 className="font-heading font-bold text-2xl text-kinetic-text tracking-tight uppercase">
                  Access Portal
                </h2>
                <p className="mt-1 font-sans text-sm text-kinetic-text-secondary">
                  Authenticate to synchronize performance data.
                </p>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">
                    Email / Username
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@kinetic.pro"
                    className="bg-kinetic-bg-alt border border-kinetic-border/30 px-4 py-3.5 font-sans text-base text-kinetic-text placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-end justify-between">
                    <label className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">
                      Password
                    </label>
                    <Link href="/forgot-password" className="font-sans font-bold text-[10px] text-kinetic-blue tracking-[1px] uppercase hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-kinetic-bg-alt border border-kinetic-border/30 px-4 py-3.5 font-sans text-base text-kinetic-text placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-kinetic-text-muted hover:text-kinetic-text"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border border-kinetic-border accent-kinetic-blue"
                  />
                  <span className="font-sans text-xs text-kinetic-text-secondary">
                    Maintain session for 30 days
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 flex items-center justify-center gap-2 text-white font-heading font-bold text-sm tracking-[1.4px] uppercase shadow-lg shadow-kinetic-blue/20"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #00538f 0%, #006cb7 100%)',
                  }}
                >
                  LOGIN
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center pt-2">
                <div className="flex-1 border-t border-kinetic-border/20" />
                <span className="px-4 font-sans text-[10px] text-kinetic-text-muted tracking-[3px] uppercase">
                  or authenticate via
                </span>
                <div className="flex-1 border-t border-kinetic-border/20" />
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-kinetic-bg-alt/70 px-6 py-4 hover:bg-kinetic-bg-alt transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span className="font-sans font-bold text-[10px] text-kinetic-text tracking-[1px] uppercase">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-kinetic-bg-alt/70 px-6 py-4 hover:bg-kinetic-bg-alt transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <span className="font-sans font-bold text-[10px] text-kinetic-text tracking-[1px] uppercase">
                    Apple
                  </span>
                </button>
              </div>

              {/* Register link */}
              <div className="border-t border-kinetic-border/10 pt-6 text-center">
                <p className="font-sans text-xs">
                  <span className="text-kinetic-text-secondary">New to the Kinetic ecosystem? </span>
                  <Link href="/register" className="font-bold text-kinetic-green hover:underline">
                    Request Access
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Technical Spec Blips */}
          <div className="flex justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-kinetic-green rounded-full" />
              <span className="font-sans text-[9px] text-kinetic-text-muted tracking-[0.9px] uppercase">
                Encrypted Channel: 256-bit AES
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[9px] text-kinetic-text-muted tracking-[0.9px] uppercase">
                System Status: Optimal
              </span>
              <div className="w-1.5 h-1.5 bg-kinetic-green rounded-full" />
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <FooterMinimal />
    </div>
  );
}
