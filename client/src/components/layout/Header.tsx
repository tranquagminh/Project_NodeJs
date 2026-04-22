'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, User, ShoppingBag, Menu, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/cart';

const navLinks = [
  { href: '/products', label: 'Rackets' },
  { href: '/products?category=footwear', label: 'Footwear' },
  { href: '/products?category=apparel', label: 'Apparel' },
  { href: '/products?category=shuttles', label: 'Shuttles' },
  { href: '/products?category=strings', label: 'Strings' },
  { href: '/products?category=accessories', label: 'Accessories' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    items: cartItems,
    drawerOpen: cartOpen,
    openDrawer: setCartOpenTrue,
    closeDrawer: setCartOpenFalse,
    removeItem,
    updateQuantity,
    totalItems: cartItemCount,
    subtotal,
  } = useCart();

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-volta-ink text-white font-mono text-[11px] tracking-[0.08em] uppercase flex justify-center items-center gap-6 px-6 py-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-volta-accent shadow-[0_0_8px_var(--color-volta-accent)]" />
          Free expert stringing on orders over $180
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">30-day return window</span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">Ships globally</span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-volta-bg/88 backdrop-blur-[18px] border-b border-volta-line">
        <div className="max-w-[1360px] mx-auto px-8 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-volta-ink text-xl tracking-[0.08em] inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
              <path d="M4 4 L12 20 L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
            VOLTA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-heading font-medium text-[13px] tracking-[0.06em] uppercase text-volta-ink-2 hover:text-volta-ink border-b-2 border-transparent hover:border-volta-ink-4 py-1.5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center justify-end gap-1.5">
            <button className="w-9 h-9 rounded-full inline-flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-3 hover:text-volta-ink transition-colors" aria-label="Search">
              <Search size={18} strokeWidth={1.8} />
            </button>
            <Link href="/login" className="w-9 h-9 rounded-full inline-flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-3 hover:text-volta-ink transition-colors" aria-label="Account">
              <User size={18} strokeWidth={1.8} />
            </Link>
            <button
              onClick={setCartOpenTrue}
              className="relative w-9 h-9 rounded-full inline-flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-3 hover:text-volta-ink transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              {cartItemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-volta-accent text-[#002812] font-mono text-[9px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 border-2 border-volta-bg">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              className="lg:hidden w-9 h-9 rounded-full inline-flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-3 hover:text-volta-ink transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-volta-bg border-t border-volta-line px-8 py-6">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-heading font-medium text-sm tracking-[0.06em] uppercase text-volta-ink-2 hover:text-volta-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-[rgba(10,15,30,0.4)] z-[100] transition-opacity duration-250 ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={setCartOpenFalse}
      />

      {/* Cart Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[420px] max-w-full bg-volta-bg shadow-xl z-[101] flex flex-col transition-transform duration-300 ease-out ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-volta-line flex justify-between items-center">
          <h3 className="font-heading font-bold text-[18px] tracking-[-0.01em]">Your cart</h3>
          <button
            onClick={setCartOpenFalse}
            className="w-8 h-8 rounded-full flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-3 hover:text-volta-ink transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="py-10 text-center text-volta-ink-3 text-[13px]">
              <p>Your cart is empty.</p>
              <Link
                href="/products"
                onClick={setCartOpenFalse}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 border border-volta-ink text-volta-ink font-heading font-medium text-[12px] tracking-[0.08em] uppercase rounded hover:bg-volta-ink hover:text-white transition-colors"
              >
                Browse rackets
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-volta-line pb-4">
                  <div className="w-16 h-16 bg-volta-bg-2 border border-volta-line rounded flex items-center justify-center shrink-0">
                    <span className="font-mono text-[8px] text-volta-ink-4 text-center leading-tight">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-heading font-bold text-[14px] text-volta-ink">{item.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.attrs.map((a) => (
                            <span
                              key={a.label}
                              className={`font-mono text-[9px] tracking-[0.06em] uppercase py-0.5 px-1.5 rounded-sm ${
                                a.accent
                                  ? 'bg-volta-accent-soft text-volta-accent-ink'
                                  : 'bg-volta-bg-2 text-volta-ink-3'
                              }`}
                            >
                              {a.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="font-heading font-bold text-[14px] text-volta-ink shrink-0 ml-2">
                        ${(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-volta-line rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-volta-ink-3 hover:text-volta-ink"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-mono text-[11px] text-volta-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-volta-ink-3 hover:text-volta-ink"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="font-mono text-[9px] tracking-[0.06em] uppercase text-volta-ink-3 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pt-5 pb-6 border-t border-volta-line bg-white">
          <div className="flex justify-between text-[13px] text-volta-ink-2 py-1">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between text-[13px] text-volta-ink-2 py-1">
            <span>Expert stringing</span>
            <span className="text-volta-accent-ink font-mono text-[11px] tracking-[0.08em] uppercase">Included</span>
          </div>
          <div className="flex justify-between items-baseline font-heading font-bold text-[18px] text-volta-ink border-t border-volta-line pt-2.5 mt-2">
            <span>Total</span>
            <span>${subtotal}</span>
          </div>
          <Link
            href="/checkout"
            onClick={setCartOpenFalse}
            className="mt-3 w-full py-4 bg-volta-ink text-white font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded flex items-center justify-center gap-2 hover:bg-volta-ink-2 transition-colors"
          >
            Checkout <ArrowRight size={14} />
          </Link>
        </div>
      </aside>
    </>
  );
}
