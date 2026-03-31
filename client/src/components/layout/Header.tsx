'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/products?category=rackets', label: 'RACKETS' },
  { href: '/products?category=shoes', label: 'SHOES' },
  { href: '/products?category=apparel', label: 'APPAREL' },
  { href: '/products?category=shuttlecocks', label: 'SHUTTLECOCKS' },
  { href: '/products?category=strings', label: 'STRINGS' },
  { href: '/products?category=accessories', label: 'ACCESSORIES' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = 3; // placeholder

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading font-bold text-kinetic-blue text-xl tracking-tight">
          KINETIC
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sans text-xs font-bold tracking-[1.4px] text-kinetic-text hover:text-kinetic-blue transition-colors uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-5">
          <button className="hidden md:block text-kinetic-text hover:text-kinetic-blue transition-colors" aria-label="Search">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/login" className="text-kinetic-text hover:text-kinetic-blue transition-colors" aria-label="Account">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/cart" className="relative text-kinetic-text hover:text-kinetic-blue transition-colors" aria-label="Cart">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-kinetic-green text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden text-kinetic-text"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-8 py-6">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-sans text-sm font-bold tracking-[1.4px] text-kinetic-text hover:text-kinetic-blue uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
