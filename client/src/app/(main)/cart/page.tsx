'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, Minus, Plus, Truck, ShieldCheck } from 'lucide-react';

const initialCartItems = [
  {
    id: 1,
    name: 'ASTROX 88 D PRO',
    subtitle: 'Elite Power Series',
    specs: [
      { label: 'Tension: 28lbs', highlight: true },
      { label: 'Grip: G5', highlight: false },
      { label: 'Weight: 4U', highlight: false },
    ],
    price: 229,
    quantity: 1,
    slug: 'astrox-88d-pro',
  },
  {
    id: 2,
    name: 'POWER CUSHION 65 Z3',
    subtitle: 'Speed & Stability',
    specs: [
      { label: 'Size: 10.5 US', highlight: false },
      { label: 'Color: White/Lime', highlight: false },
    ],
    price: 145,
    quantity: 1,
    slug: 'power-cushion-65-z3',
  },
];

const suggestedProducts = [
  { id: 1, name: 'AEROSENSA 50', price: 42, slug: 'aerosensa-50' },
  { id: 2, name: 'EXBOLT 65', price: 15, slug: 'exbolt-65' },
  { id: 3, name: 'SUPER GRAP (3PK)', price: 12, slug: 'super-grap' },
  { id: 4, name: 'PRO RACQUET BAG', price: 95, slug: 'pro-racquet-bag' },
];

export default function CartPage() {
  const [items, setItems] = useState(initialCartItems);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="bg-kinetic-bg min-h-screen">
      <div className="max-w-[1280px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="font-heading font-bold text-xs text-kinetic-green tracking-[2.4px] uppercase">
            Your Performance Loadout
          </p>
          <h1 className="font-heading font-bold text-5xl text-kinetic-text tracking-tighter uppercase mt-2">
            Shopping Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 flex gap-6 relative">
                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 text-kinetic-text-muted hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <X size={20} />
                </button>

                {/* Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-kinetic-bg-alt flex-shrink-0 rounded" />

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-kinetic-text uppercase tracking-tight">
                      {item.name}
                    </h3>
                    <p className="font-sans text-sm text-kinetic-text-muted mt-0.5">{item.subtitle}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.specs.map((spec) => (
                        <span
                          key={spec.label}
                          className={`inline-block px-2 py-1 text-[10px] font-bold font-sans uppercase tracking-wider rounded ${
                            spec.highlight
                              ? 'bg-kinetic-blue text-white'
                              : 'bg-kinetic-bg-alt text-kinetic-text'
                          }`}
                        >
                          {spec.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-kinetic-text-muted hover:text-kinetic-text"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-sans font-bold text-base text-kinetic-text w-8 text-center">
                        {String(item.quantity).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-kinetic-text-muted hover:text-kinetic-text"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-heading font-bold text-2xl text-kinetic-text">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="bg-white p-12 text-center">
                <p className="font-sans text-kinetic-text-muted">Your cart is empty.</p>
                <Link
                  href="/products"
                  className="inline-block mt-4 font-heading font-bold text-sm text-kinetic-blue tracking-[1px] uppercase border-b-2 border-kinetic-blue pb-0.5"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 sticky top-28">
              <h2 className="font-heading font-bold text-2xl text-kinetic-text uppercase tracking-tight mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-kinetic-text-muted uppercase tracking-[0.5px]">
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span className="font-bold text-kinetic-text">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kinetic-text-muted uppercase tracking-[0.5px]">Shipping</span>
                  <span className="font-bold text-kinetic-green">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kinetic-text-muted uppercase tracking-[0.5px]">Tax</span>
                  <span className="font-bold text-kinetic-text">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-kinetic-border/20 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-heading font-bold text-base text-kinetic-text uppercase">Grand Total</span>
                <span className="font-heading font-bold text-3xl text-kinetic-green">${total.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="block mt-6 w-full py-4 text-center text-white font-heading font-bold text-sm tracking-[1.4px] uppercase"
                style={{ backgroundImage: 'linear-gradient(135deg, #006d31 0%, #009944 100%)' }}
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="block mt-3 w-full py-3 text-center border border-kinetic-border text-kinetic-blue font-heading font-bold text-sm tracking-[1.4px] uppercase hover:bg-kinetic-bg-alt transition-colors"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 space-y-3 text-xs font-sans">
                <div className="flex items-center gap-2 text-kinetic-text-muted">
                  <Truck size={14} className="text-kinetic-green" />
                  <span className="font-bold uppercase tracking-[0.5px]">Free Express Delivery on Orders Over $200</span>
                </div>
                <div className="flex items-center gap-2 text-kinetic-text-muted">
                  <ShieldCheck size={14} className="text-kinetic-green" />
                  <span className="font-bold uppercase tracking-[0.5px]">Authenticity Guaranteed & 2 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Your Loadout */}
        <section className="mt-20">
          <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase mb-10">
            Complete Your Loadout
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-kinetic-bg-alt aspect-square mb-3 rounded overflow-hidden group-hover:scale-[1.02] transition-transform" />
                <h4 className="font-heading font-bold text-sm text-kinetic-text uppercase tracking-tight">{product.name}</h4>
                <p className="font-heading font-bold text-sm text-kinetic-blue mt-1">${product.price.toFixed(2)}</p>
                <button className="mt-2 w-full py-2 border border-kinetic-blue text-kinetic-blue font-sans font-bold text-xs tracking-[1px] uppercase hover:bg-kinetic-blue hover:text-white transition-colors">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
