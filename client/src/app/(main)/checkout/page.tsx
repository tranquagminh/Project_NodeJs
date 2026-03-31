'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, CreditCard, Smartphone, ShieldCheck, Lock, Award, Zap } from 'lucide-react';

const cartItems = [
  {
    id: 1,
    name: 'AERO-SPEED PRO 900',
    specs: 'Tension: 28 lbs   Weight: 4U (83G)',
    price: 245,
    quantity: 1,
  },
  {
    id: 2,
    name: 'V-DRIVE COURT ELITE',
    specs: 'Size: 10.5 US   Color: Racing Red',
    price: 160,
    quantity: 1,
  },
];

export default function CheckoutPage() {
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'wallet'>('card');
  const [form, setForm] = useState({
    firstName: 'ALEXANDER',
    lastName: 'STRICKLAND',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingMethod === 'express' ? 25 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-kinetic-bg min-h-screen">
      <div className="max-w-[1280px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="font-heading font-bold text-xs text-kinetic-green tracking-[2.4px] uppercase">
            Your Performance Kit
          </p>
          <h1 className="font-heading font-bold text-5xl text-kinetic-text tracking-tighter uppercase mt-2">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items */}
            <div>
              <h2 className="font-heading font-bold text-base text-kinetic-text uppercase tracking-[0.5px] mb-4">
                Cart Items ({String(cartItems.length).padStart(2, '0')})
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 flex gap-6">
                    <div className="w-20 h-20 bg-kinetic-bg-alt flex-shrink-0 rounded" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-heading font-bold text-base text-kinetic-text uppercase">{item.name}</h3>
                          <p className="font-sans text-xs text-kinetic-text-muted mt-1">
                            <span className="inline-block w-2 h-2 bg-kinetic-blue rounded-full mr-1 align-middle" />
                            {item.specs}
                          </p>
                        </div>
                        <span className="font-heading font-bold text-lg text-kinetic-blue">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3 border border-kinetic-border px-3 py-1">
                          <button className="text-kinetic-text-muted hover:text-kinetic-text"><Minus size={14} /></button>
                          <span className="font-sans font-bold text-sm w-6 text-center">{item.quantity}</span>
                          <button className="text-kinetic-text-muted hover:text-kinetic-text"><Plus size={14} /></button>
                        </div>
                        <button className="flex items-center gap-1.5 text-kinetic-text-muted hover:text-red-500 text-xs font-sans font-bold uppercase tracking-[0.5px]">
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 bg-kinetic-green text-white text-xs font-bold flex items-center justify-center rounded">01</span>
                <h2 className="font-heading font-bold text-base text-kinetic-text uppercase tracking-[0.5px]">
                  Shipping Destination
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleInputChange} className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text focus:outline-none focus:border-kinetic-blue" />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleInputChange} className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text focus:outline-none focus:border-kinetic-blue" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Address Line 1</label>
                  <input name="address" value={form.address} onChange={handleInputChange} placeholder="Street Address, P.O. Box" className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue" />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">City</label>
                  <input name="city" value={form.city} onChange={handleInputChange} className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text focus:outline-none focus:border-kinetic-blue" />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Postal Code</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleInputChange} className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text focus:outline-none focus:border-kinetic-blue" />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-7 bg-kinetic-green text-white text-xs font-bold flex items-center justify-center rounded">02</span>
                <h2 className="font-heading font-bold text-base text-kinetic-text uppercase tracking-[0.5px]">
                  Shipping Method
                </h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-4 border border-kinetic-border hover:border-kinetic-blue transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="w-4 h-4 accent-kinetic-green"
                    />
                    <div>
                      <p className="font-sans font-bold text-sm text-kinetic-text uppercase">Standard Delivery</p>
                      <p className="font-sans text-xs text-kinetic-text-muted">3-5 Business Days</p>
                    </div>
                  </div>
                  <span className="font-heading font-bold text-sm text-kinetic-green uppercase">Free</span>
                </label>
                <label className="flex items-center justify-between cursor-pointer p-4 border border-kinetic-border hover:border-kinetic-blue transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="w-4 h-4 accent-kinetic-green"
                    />
                    <div>
                      <p className="font-sans font-bold text-sm text-kinetic-text uppercase">Express Velocity</p>
                      <p className="font-sans text-xs text-kinetic-text-muted">Next Day Priority</p>
                    </div>
                  </div>
                  <span className="font-heading font-bold text-sm text-kinetic-text">$25.00</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 sticky top-28">
              <h2 className="font-heading font-bold text-2xl text-kinetic-text uppercase tracking-tight mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-kinetic-text-muted uppercase tracking-[0.5px]">Subtotal</span>
                  <span className="font-bold text-kinetic-text">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kinetic-text-muted uppercase tracking-[0.5px]">Estimated Shipping</span>
                  <span className="font-bold text-kinetic-green">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kinetic-text-muted uppercase tracking-[0.5px]">Estimated Tax</span>
                  <span className="font-bold text-kinetic-text">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-kinetic-border/20 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-heading font-bold text-base text-kinetic-text uppercase">Total</span>
                <span className="font-heading font-bold text-3xl text-kinetic-green">${total.toFixed(2)}</span>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <p className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-3">
                  Secure Payment
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { key: 'card' as const, icon: <CreditCard size={16} />, label: 'Card' },
                    { key: 'mobile' as const, icon: <Smartphone size={16} />, label: 'Mobile' },
                    { key: 'wallet' as const, icon: <CreditCard size={16} />, label: 'Wallet' },
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`py-3 flex items-center justify-center border transition-colors ${
                        paymentMethod === method.key
                          ? 'border-kinetic-blue bg-kinetic-blue/5'
                          : 'border-kinetic-border hover:border-kinetic-blue'
                      }`}
                    >
                      <span className="text-kinetic-text">{method.icon}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-1.5">Card Number</label>
                    <input name="cardNumber" value={form.cardNumber} onChange={handleInputChange} placeholder="**** **** **** ****" className="w-full bg-kinetic-bg-alt border border-kinetic-border/30 px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/40 focus:outline-none focus:border-kinetic-blue" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-1.5">Expiry</label>
                      <input name="expiry" value={form.expiry} onChange={handleInputChange} placeholder="MM / YY" className="w-full bg-kinetic-bg-alt border border-kinetic-border/30 px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/40 focus:outline-none focus:border-kinetic-blue" />
                    </div>
                    <div>
                      <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-1.5">CVC</label>
                      <input name="cvc" value={form.cvc} onChange={handleInputChange} placeholder="***" className="w-full bg-kinetic-bg-alt border border-kinetic-border/30 px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/40 focus:outline-none focus:border-kinetic-blue" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-white font-heading font-bold text-sm tracking-[1.4px] uppercase"
                style={{ backgroundImage: 'linear-gradient(135deg, #00538f 0%, #006cb7 100%)' }}
              >
                Execute Order <Zap size={14} />
              </button>

              <div className="flex items-center justify-center gap-6 mt-6">
                {[
                  { icon: <ShieldCheck size={16} />, label: 'SSL Secure' },
                  { icon: <Lock size={16} />, label: 'Encrypted' },
                  { icon: <Award size={16} />, label: 'Certified' },
                ].map((badge) => (
                  <div key={badge.label} className="flex flex-col items-center gap-1 text-kinetic-text-muted">
                    {badge.icon}
                    <span className="text-[9px] font-sans uppercase tracking-[0.5px]">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
