'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { FooterMinimal } from '@/components/layout/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay — real endpoint would be POST /api/auth/forgot-password
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — form */}
      <div className="py-20 px-8 sm:px-16 flex flex-col justify-center">
        <div className="max-w-[520px] ml-auto w-full">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3 hover:text-volta-ink mb-8 transition-colors">
            <ArrowLeft size={13} />
            Back to sign in
          </Link>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-volta-accent-soft flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={26} className="text-volta-accent-ink" />
              </div>
              <h1 className="font-heading font-bold text-[32px] tracking-[-0.02em] text-volta-ink mb-3">Check your inbox</h1>
              <p className="text-volta-ink-2 text-[15px] leading-relaxed mb-6">
                If <strong>{email}</strong> is registered, you'll receive a reset link within a few minutes.
              </p>
              <p className="text-[13px] text-volta-ink-3 mb-6">
                Didn't get it? Check your spam folder, or{' '}
                <button onClick={() => setSubmitted(false)} className="text-volta-accent-ink hover:underline font-medium">try again</button>.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 py-3 px-6 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">
                Password recovery
              </p>
              <h1 className="font-heading font-bold text-[clamp(36px,5vw,56px)] tracking-[-0.03em] leading-none mb-4">
                Forgot your password?
              </h1>
              <p className="text-volta-ink-2 text-[15px] leading-relaxed mb-8">
                Enter the email address linked to your account and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right — branding */}
      <div className="bg-volta-ink text-white py-20 px-16 hidden lg:flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading font-bold text-[clamp(220px,28vw,420px)] tracking-[-0.05em] leading-[0.85] text-white/[0.04] pointer-events-none whitespace-nowrap select-none">
          V
        </div>
        <div className="relative z-10 max-w-[440px]">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent">Account recovery</p>
          <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.025em] leading-[1.05] mt-3 mb-5">
            We'll get you back in.
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed">
            Your VOLTA account and preferences are safely stored. A quick reset and you're back to your gear.
          </p>
        </div>
      </div>

      <FooterMinimal />
    </div>
  );
}
