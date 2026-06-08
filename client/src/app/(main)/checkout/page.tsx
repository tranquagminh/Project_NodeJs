'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, ShieldCheck, Shield, AlertCircle } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { api } from '@/services/api';
import { createOrder } from '@/services/orders';
import { resolveProductImage } from '@/lib/images';

function Field({
  label, type = 'text', placeholder, value, onChange, className = '', required = false,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  className?: string; required?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block mb-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-volta-ink-3">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full py-3 px-3.5 border border-volta-line rounded text-[14px] bg-white outline-none transition-colors focus:border-volta-ink focus:ring-1 focus:ring-volta-ink/10"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [shippingMethod, setShippingMethod] = useState<'STANDARD_DELIVERY' | 'EXPRESS_VELOCITY'>('STANDARD_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Shipping form
  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') ?? '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const shippingFee = shippingMethod === 'EXPRESS_VELOCITY' ? 25 : 0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shippingFee + tax;

  // Sync localStorage cart to server cart (required since server reads from DB cart)
  const syncCartToServer = async () => {
    if (!user || items.length === 0) return;
    setSyncing(true);
    try {
      // Clear server cart first
      await api.delete('/cart/clear').catch(() => {});
      // Add each item
      for (const item of items) {
        await api.post('/cart/items', {
          productId: item.productId,
          quantity: item.quantity,
        }).catch(() => {});
      }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    syncCartToServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!user) { router.push('/login?redirect=/checkout'); return; }
    setError('');
    setSubmitting(true);

    try {
      await syncCartToServer();
      const order = await createOrder({
        items: [],
        shippingAddress: { firstName, lastName, addressLine1: address, city, postalCode, country: 'US' },
        shippingMethod,
        paymentMethod: paymentMethod === 'card' ? 'CREDIT_CARD' : paymentMethod === 'paypal' ? 'BANK_TRANSFER' : 'E_WALLET',
      });
      clearCart();
      router.push(`/order-success?order=${order.orderCode}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    return null;
  }

  return (
    <div className="bg-volta-bg min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 py-16 md:py-24">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">Secure checkout</p>
        <h1 className="font-heading font-bold text-[clamp(48px,7vw,88px)] tracking-[-0.03em] leading-[0.95] mb-12">
          Checkout.
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
            {/* Left — Form */}
            <div>
              {/* Step 1 — Shipping */}
              <div className="bg-white border border-volta-line rounded-lg p-7 mb-4">
                <div className="flex items-center gap-3.5 mb-5">
                  <span className="w-7 h-7 bg-volta-ink text-white font-mono text-[11px] rounded flex items-center justify-center">1</span>
                  <h2 className="font-heading font-bold text-[18px] tracking-[0.02em] uppercase">Shipping address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="First name" placeholder="John" value={firstName} onChange={setFirstName} required />
                  <Field label="Last name" placeholder="Doe" value={lastName} onChange={setLastName} required />
                </div>
                <Field label="Address" placeholder="123 Main St" value={address} onChange={setAddress} className="mb-4" required />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" placeholder="New York" value={city} onChange={setCity} required />
                  <Field label="Postal code" placeholder="10001" value={postalCode} onChange={setPostalCode} required />
                </div>
              </div>

              {/* Step 2 — Shipping Method */}
              <div className="bg-white border border-volta-line rounded-lg p-7 mb-4">
                <div className="flex items-center gap-3.5 mb-5">
                  <span className="w-7 h-7 bg-volta-ink text-white font-mono text-[11px] rounded flex items-center justify-center">2</span>
                  <h2 className="font-heading font-bold text-[18px] tracking-[0.02em] uppercase">Shipping method</h2>
                </div>
                <div className="space-y-3">
                  {([
                    { value: 'STANDARD_DELIVERY', label: 'Standard', sub: '5–7 business days', price: 'Free' },
                    { value: 'EXPRESS_VELOCITY', label: 'Express Velocity', sub: '1–2 business days', price: '$25' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setShippingMethod(opt.value)}
                      className={`w-full text-left grid grid-cols-[20px_1fr_auto] gap-3.5 py-4 px-4 border rounded transition-colors ${
                        shippingMethod === opt.value ? 'border-volta-ink bg-volta-ink/[0.03]' : 'border-volta-line'
                      }`}
                    >
                      <span className="pt-0.5">
                        <span className={`block w-[18px] h-[18px] border-[1.5px] rounded-full relative ${shippingMethod === opt.value ? 'border-volta-ink' : 'border-volta-ink-4'}`}>
                          {shippingMethod === opt.value && <span className="absolute inset-[3px] bg-volta-ink rounded-full" />}
                        </span>
                      </span>
                      <span>
                        <span className="block text-[14px] font-medium">{opt.label}</span>
                        <span className="block text-[12px] text-volta-ink-3 mt-0.5">{opt.sub}</span>
                      </span>
                      <span className={`text-[14px] font-medium ${opt.value === 'STANDARD_DELIVERY' ? 'text-volta-accent-ink' : ''}`}>{opt.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 — Payment */}
              <div className="bg-white border border-volta-line rounded-lg p-7">
                <div className="flex items-center gap-3.5 mb-5">
                  <span className="w-7 h-7 bg-volta-ink text-white font-mono text-[11px] rounded flex items-center justify-center">3</span>
                  <h2 className="font-heading font-bold text-[18px] tracking-[0.02em] uppercase">Payment</h2>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {(['card', 'paypal', 'apple'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className={`flex items-center justify-center gap-2 py-3.5 border rounded font-mono text-[11px] tracking-[0.08em] uppercase transition-colors ${
                        paymentMethod === key
                          ? 'border-volta-ink text-volta-ink bg-volta-bg-2 shadow-[0_0_0_1px_var(--color-volta-ink)_inset]'
                          : 'border-volta-line text-volta-ink-2 hover:border-volta-ink-4 hover:text-volta-ink'
                      }`}
                    >
                      {key === 'card' && <CreditCard size={16} />}
                      {key === 'paypal' && <span className="font-bold text-[13px]">P</span>}
                      {key === 'apple' && <span className="font-bold text-[13px]"></span>}
                      {key === 'card' ? 'Card' : key === 'paypal' ? 'PayPal' : 'Apple Pay'}
                    </button>
                  ))}
                </div>
                {paymentMethod === 'card' && (
                  <div>
                    <Field label="Card number" placeholder="4242 4242 4242 4242" value="" onChange={() => {}} className="mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry" placeholder="MM / YY" value="" onChange={() => {}} />
                      <Field label="CVC" placeholder="123" value="" onChange={() => {}} />
                    </div>
                  </div>
                )}
                {paymentMethod !== 'card' && (
                  <p className="text-[14px] text-volta-ink-3">
                    {paymentMethod === 'paypal' ? 'You will be redirected to PayPal to complete payment.' : 'Confirm with Apple Pay on the next screen.'}
                  </p>
                )}
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="bg-white border border-volta-line rounded-lg p-6 sticky top-24">
              <h2 className="font-heading font-bold text-[18px] pb-4 mb-4 border-b border-volta-line">Order summary</h2>

              <div className="flex flex-col gap-0 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[48px_1fr_auto] gap-2.5 py-2.5 border-b border-volta-line-2">
                    <div className="relative w-12 h-12 bg-volta-bg-2 rounded overflow-hidden flex-shrink-0">
                      {item.image && (
                        <Image src={resolveProductImage(item.image, item.slug)} alt={item.name} fill className="object-contain p-1" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{item.name}</p>
                      <p className="font-mono text-[10px] tracking-[0.06em] text-volta-ink-3 mt-0.5">
                        {item.attrs.map((a) => a.label).join(' · ')}
                      </p>
                      <p className="text-[12px] text-volta-ink-3">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-[14px] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mb-4 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-volta-ink-3">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-volta-ink-3">Shipping</span>
                  <span className={shippingFee === 0 ? 'text-volta-accent-ink font-medium' : 'font-medium'}>
                    {shippingFee === 0 ? 'Free' : `$${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-volta-ink-3">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-volta-line mt-1">
                  <span className="font-heading font-bold text-[16px]">Total</span>
                  <span className="font-heading font-bold text-[20px]">${total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-[12px]">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || syncing || !user}
                className="w-full py-4 bg-volta-ink text-white rounded font-heading font-medium text-[14px] tracking-[0.06em] uppercase hover:bg-volta-ink-2 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
              >
                <Lock size={14} />
                {submitting ? 'Placing order…' : syncing ? 'Syncing cart…' : 'Place order'}
              </button>

              {!user && (
                <p className="text-[12px] text-volta-ink-3 text-center mb-3">
                  <Link href="/login?redirect=/checkout" className="text-volta-accent-ink hover:underline">Sign in</Link> to place your order.
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-volta-ink-4">
                <span className="flex items-center gap-1 text-[11px]"><ShieldCheck size={13} /> SSL Secure</span>
                <span className="flex items-center gap-1 text-[11px]"><Shield size={13} /> Encrypted</span>
                <span className="flex items-center gap-1 text-[11px]"><Lock size={13} /> Certified</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
