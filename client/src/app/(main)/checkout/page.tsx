'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Lock, ShieldCheck, Shield } from 'lucide-react';

const items = [
  { name: 'Vector X1 Pro', variant: 'BG80 · G5 · 28 lbs', price: 265 },
  { name: 'Pulse 800 Pro', variant: 'Nano 99 · G6 · 26 lbs', price: 240 },
];

function Field({
  label,
  type = 'text',
  placeholder,
  className = '',
}: {
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-volta-ink-3">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full py-3 px-3.5 border border-volta-line rounded text-[14px] bg-white outline-none transition-colors focus:border-volta-ink focus:ring-1 focus:ring-volta-ink/10"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  className = '',
}: {
  label: string;
  options: string[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-volta-ink-3">
        {label}
      </span>
      <select className="w-full py-3 px-3.5 border border-volta-line rounded text-[14px] bg-white outline-none transition-colors focus:border-volta-ink focus:ring-1 focus:ring-volta-ink/10 appearance-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-volta-line rounded-lg p-7 mb-4">
      <div className="flex items-center gap-3.5 mb-5">
        <span className="w-7 h-7 bg-volta-ink text-white font-mono text-[11px] rounded flex items-center justify-center">
          {step}
        </span>
        <h2 className="font-heading font-bold text-[18px] tracking-[0.02em] uppercase">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const shipping = shippingMethod === 'express' ? 18 : 0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-volta-bg min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">
          Secure checkout
        </p>
        <h1 className="font-heading font-bold text-[clamp(48px,7vw,88px)] tracking-[-0.03em] leading-[0.95] mb-12">
          Checkout.
        </h1>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* Left — Form Steps */}
          <div>
            {/* Step 1 — Contact */}
            <StepCard step={1} title="Contact">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" type="email" placeholder="you@example.com" />
                <Field label="Phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </StepCard>

            {/* Step 2 — Shipping Address */}
            <StepCard step={2} title="Shipping address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="First name" placeholder="John" />
                <Field label="Last name" placeholder="Doe" />
              </div>
              <Field label="Address" placeholder="123 Main St" className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Field label="City" placeholder="New York" />
                <Field label="State / Province" placeholder="NY" />
                <Field label="Postal code" placeholder="10001" />
              </div>
              <SelectField
                label="Country"
                options={['United States', 'Canada', 'United Kingdom', 'Australia', 'Japan']}
              />
            </StepCard>

            {/* Step 3 — Shipping Method */}
            <StepCard step={3} title="Shipping method">
              <div className="space-y-3">
                {/* Standard */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('standard')}
                  className={`w-full text-left grid grid-cols-[20px_1fr_auto] gap-3.5 py-4 px-4 border rounded cursor-pointer transition-colors ${
                    shippingMethod === 'standard'
                      ? 'border-volta-ink bg-volta-ink/[0.03]'
                      : 'border-volta-line'
                  }`}
                >
                  <span className="pt-0.5">
                    <span
                      className={`block w-[18px] h-[18px] border-[1.5px] rounded-full relative ${
                        shippingMethod === 'standard' ? 'border-volta-ink' : 'border-volta-ink-4'
                      }`}
                    >
                      {shippingMethod === 'standard' && (
                        <span className="absolute inset-[3px] bg-volta-ink rounded-full" />
                      )}
                    </span>
                  </span>
                  <span>
                    <span className="block text-[14px] font-medium">Standard</span>
                    <span className="block text-[12px] text-volta-ink-3 mt-0.5">
                      5–7 business days
                    </span>
                  </span>
                  <span className="text-[14px] font-medium text-volta-accent-ink">Free</span>
                </button>

                {/* Express */}
                <button
                  type="button"
                  onClick={() => setShippingMethod('express')}
                  className={`w-full text-left grid grid-cols-[20px_1fr_auto] gap-3.5 py-4 px-4 border rounded cursor-pointer transition-colors ${
                    shippingMethod === 'express'
                      ? 'border-volta-ink bg-volta-ink/[0.03]'
                      : 'border-volta-line'
                  }`}
                >
                  <span className="pt-0.5">
                    <span
                      className={`block w-[18px] h-[18px] border-[1.5px] rounded-full relative ${
                        shippingMethod === 'express' ? 'border-volta-ink' : 'border-volta-ink-4'
                      }`}
                    >
                      {shippingMethod === 'express' && (
                        <span className="absolute inset-[3px] bg-volta-ink rounded-full" />
                      )}
                    </span>
                  </span>
                  <span>
                    <span className="block text-[14px] font-medium">Express</span>
                    <span className="block text-[12px] text-volta-ink-3 mt-0.5">
                      1–2 business days
                    </span>
                  </span>
                  <span className="text-[14px] font-medium">$18</span>
                </button>
              </div>
            </StepCard>

            {/* Step 4 — Payment */}
            <StepCard step={4} title="Payment">
              {/* Payment tabs */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(
                  [
                    {
                      key: 'card',
                      label: 'Card',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <path d="M2 10h20" />
                        </svg>
                      ),
                    },
                    {
                      key: 'paypal',
                      label: 'PayPal',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                          <path d="M7 18l2-12h6a3 3 0 0 1 0 6h-3l-1 6z" />
                        </svg>
                      ),
                    },
                    {
                      key: 'apple',
                      label: 'Apple Pay',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                          <path d="M16 3c0 1.4-.6 2.6-1.5 3.5-1 1-2.2 1.8-3.5 1.7-.2-1.3.4-2.7 1.3-3.5.9-1 2.4-1.7 3.7-1.7zM20 17c-.6 1.5-1 2.2-1.8 3.5-1.2 1.8-2.8 4-4.8 4-1.8 0-2.3-1.2-4.7-1.1-2.4 0-3 1.2-4.8 1.1-2 0-3.5-2-4.7-3.8-3.4-5.1-3.7-11.1-1.6-14.3 1.5-2.3 3.8-3.6 6-3.6 2.2 0 3.6 1.2 5.4 1.2 1.8 0 2.9-1.2 5.4-1.2 1.9 0 3.9 1 5.4 2.8-4.8 2.6-4 9.4 0 11.4z" />
                        </svg>
                      ),
                    },
                  ] as const
                ).map(({ key, label, icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentMethod(key)}
                    className={`flex items-center justify-center gap-2 py-3.5 border rounded font-mono text-[11px] tracking-[0.08em] uppercase transition-colors cursor-pointer ${
                      paymentMethod === key
                        ? 'border-volta-ink text-volta-ink bg-volta-bg-2 shadow-[0_0_0_1px_var(--color-volta-ink)_inset]'
                        : 'border-volta-line text-volta-ink-2 hover:border-volta-ink-4 hover:text-volta-ink'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div>
                  <Field label="Card number" placeholder="4242 4242 4242 4242" className="mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" placeholder="MM / YY" />
                    <Field label="CVC" placeholder="123" />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <p className="text-[14px] text-volta-ink-3">
                  You will be redirected to PayPal to complete your payment.
                </p>
              )}

              {paymentMethod === 'apple' && (
                <p className="text-[14px] text-volta-ink-3">
                  Confirm payment with Apple Pay on the next step.
                </p>
              )}
            </StepCard>
          </div>

          {/* Right — Order Summary */}
          <div className="bg-white border border-volta-line rounded-lg p-6 sticky top-24">
            <h2 className="font-heading font-bold text-[18px] pb-4 mb-4 border-b border-volta-line">
              Order summary
            </h2>

            {/* Line items */}
            <div className="space-y-0">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[48px_1fr_auto] gap-2.5 py-2.5 border-b border-volta-line-2"
                >
                  <div className="w-12 h-12 bg-volta-bg-2 rounded" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium truncate">{item.name}</p>
                    <p className="font-mono text-[10px] tracking-[0.06em] text-volta-ink-3 mt-0.5">
                      {item.variant}
                    </p>
                  </div>
                  <span className="text-[14px] font-medium">${item.price}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-volta-ink-3">Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-volta-ink-3">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-volta-ink-3">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-3 mt-3 border-t border-volta-line">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place order */}
            <button
              type="button"
              className="w-full py-4 mt-6 bg-volta-ink text-white font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded cursor-pointer transition-opacity hover:opacity-90"
            >
              Place order
            </button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-5 mt-5">
              <span className="flex items-center gap-1.5 text-volta-ink-3 text-[11px] font-mono">
                <Lock size={14} /> Encrypted
              </span>
              <span className="flex items-center gap-1.5 text-volta-ink-3 text-[11px] font-mono">
                <ShieldCheck size={14} /> Verified
              </span>
              <span className="flex items-center gap-1.5 text-volta-ink-3 text-[11px] font-mono">
                <Shield size={14} /> Secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
