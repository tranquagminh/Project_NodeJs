'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PRODUCT_IMAGES: Record<string, string> = {
  'vector-x1-pro':   'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'pulse-800-pro':   'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'arcsaber-11-pro': 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'vector-88d-pro':  'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'pulse-500':       'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'arc-7-tour':      'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'vector-x3':       'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'pulse-600-tour':  'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
};
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Shield,
  Wrench,
  ArrowLeft,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useCart } from '@/store/cart';

/* Recommended products shown in both empty state and "Complete the loadout" */
const recommendedProducts = [
  {
    slug: 'vector-x1-pro',
    name: 'Vector X1 Pro',
    series: 'Vector Series',
    style: 'Offensive · head-heavy',
    price: 265,
    tags: ['HEAD HEAVY', 'STIFF'],
    badge: 'NEW',
  },
  {
    slug: 'pulse-800-pro',
    name: 'Pulse 800 Pro',
    series: 'Pulse Series',
    style: 'Speed · head-light',
    price: 240,
    tags: ['HEAD LIGHT', 'STIFF'],
    badge: null,
  },
  {
    slug: 'arc-11-pro',
    name: 'Arc 11 Pro',
    series: 'Arc Series',
    style: 'Control · even balance',
    price: 255,
    tags: ['EVEN', 'STIFF'],
    badge: null,
  },
  {
    slug: 'vector-88d-pro',
    name: 'Vector 88D Pro',
    series: 'Vector Series',
    style: 'Offensive · rotational',
    price: 235,
    tags: ['HEAD HEAVY', 'STIFF'],
    badge: 'BEST SELLER',
  },
];

function ProductCard({
  product,
}: {
  product: (typeof recommendedProducts)[number];
}) {
  return (
    <div className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square bg-white border border-volta-line rounded-lg overflow-hidden mb-3"
      >
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-volta-ink text-white font-mono text-[9px] tracking-[0.08em] uppercase px-2 py-1 rounded-sm">
            {product.badge}
          </span>
        )}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-volta-line bg-white/80 text-volta-ink-3 hover:text-volta-ink hover:border-volta-ink transition-colors"
          onClick={(e) => e.preventDefault()}
          aria-label="Wishlist"
        >
          <Heart size={14} strokeWidth={1.8} />
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-4">
            {product.name}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <span className="flex items-center justify-center gap-2 py-3 bg-volta-ink text-white font-mono text-[10px] tracking-[0.08em] uppercase">
            Quick View <ArrowRight size={12} />
          </span>
        </div>
      </Link>
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">
        {product.series}
      </span>
      <h3 className="font-heading font-bold text-[16px] tracking-[-0.01em] text-volta-ink mt-0.5">
        {product.name}
      </h3>
      <p className="text-[12px] text-volta-ink-3 mt-0.5">{product.style}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="font-heading font-bold text-[16px] text-volta-ink">
          ${product.price}
        </span>
        <div className="flex gap-1.5">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] tracking-[0.06em] uppercase text-volta-ink-3 bg-volta-bg-2 px-1.5 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');

  const taxRate = 0.08;
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = subtotal + tax;

  /* ============ EMPTY STATE ============ */
  if (items.length === 0) {
    return (
      <main className="bg-volta-bg min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Empty hero */}
          <div className="text-center pt-[100px] pb-[60px]">
            <div className="w-24 h-24 border-2 border-dashed border-volta-line rounded-full mx-auto mb-7 flex items-center justify-center text-volta-ink-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-10 h-10"
              >
                <path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 7z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            </div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">
              Empty loadout
            </p>
            <h1 className="font-heading font-bold text-[clamp(36px,5vw,56px)] tracking-[-0.02em] text-volta-ink mb-3">
              Nothing in the cart yet.
            </h1>
            <p className="text-[15px] text-volta-ink-2 max-w-[420px] mx-auto mb-6 leading-relaxed">
              Pick out a frame or a pair of shoes and we&apos;ll set it up
              exactly how you like — with your tension, grip and string baked in
              before it ships.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 py-4 px-8 bg-volta-ink text-white font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded hover:bg-volta-ink-2 transition-colors"
              >
                Browse rackets <ArrowRight size={14} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 py-4 px-8 border border-volta-line text-volta-ink font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded hover:bg-volta-bg-2 transition-colors"
              >
                Search the catalogue
              </Link>
            </div>
          </div>

          {/* Recommended for you */}
          <div className="py-10 pb-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">
                  Pro selection
                </p>
                <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] text-volta-ink">
                  Recommended for you.
                </h2>
              </div>
              <Link
                href="/products"
                className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-2 hover:text-volta-ink border-b border-volta-line hover:border-volta-ink pb-0.5 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============ CART WITH ITEMS ============ */
  return (
    <main className="bg-volta-bg">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <nav className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-volta-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-volta-ink">Cart</span>
        </nav>

        {/* Heading */}
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">
          Your loadout
        </p>
        <h1 className="font-heading font-bold text-[clamp(48px,7vw,88px)] tracking-[-0.03em] leading-[0.95] text-volta-ink">
          Cart.
        </h1>

        {/* Continue shopping / Empty cart bar */}
        <div className="flex justify-between items-center py-5 border-t border-volta-line mt-8 mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-2 hover:text-volta-ink transition-colors"
          >
            <ArrowLeft size={14} />
            Continue shopping
          </Link>
          <button
            onClick={clearCart}
            className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-2 hover:text-volta-ink transition-colors"
          >
            Empty cart
          </button>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          {/* Left column */}
          <div>
            {/* Cart items */}
            {items.map((item) => (
              <div
                key={item.id}
                className="relative bg-white border border-volta-line rounded-lg p-6 mb-3"
              >
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-full text-volta-ink-3 hover:text-red-500 hover:bg-volta-bg-3 transition-colors"
                  aria-label="Remove item"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-[120px_1fr_auto] gap-6">
                  <Link
                    href={`/products/${item.slug}`}
                    className="aspect-square bg-volta-bg-2 border border-volta-line rounded flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      src={PRODUCT_IMAGES[item.slug] ?? FALLBACK_IMAGE}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-contain mix-blend-multiply"
                    />
                  </Link>

                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">
                        {item.series}
                      </span>
                      <Link href={`/products/${item.slug}`}>
                        <h2 className="font-heading font-bold text-[18px] tracking-[-0.01em] text-volta-ink mt-0.5">
                          {item.name}
                        </h2>
                      </Link>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.attrs.map((attr) => (
                          <span
                            key={attr.label}
                            className={`font-mono text-[10px] tracking-[0.08em] uppercase py-1 px-2 rounded-sm ${
                              attr.accent
                                ? 'bg-volta-accent-soft text-volta-accent-ink'
                                : 'bg-volta-bg-2 text-volta-ink-2'
                            }`}
                          >
                            {attr.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-volta-line rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-volta-ink-3 hover:text-volta-ink transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-[12px] text-volta-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-volta-ink-3 hover:text-volta-ink transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="font-mono text-[10px] tracking-[0.06em] uppercase text-volta-ink-3 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right pt-6">
                    <span className="font-heading font-bold text-[20px] text-volta-ink">
                      ${(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            
          </div>

          {/* Order Summary Sidebar */}
          <aside className="bg-white border border-volta-line rounded-lg p-6 sticky top-24">
            <h3 className="font-heading font-bold text-[18px] tracking-[-0.01em] text-volta-ink pb-4 mb-4 border-b border-volta-line">
              Order summary
            </h3>

            <div className="flex justify-between text-[13px] text-volta-ink-2 py-1.5">
              <span>
                Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-volta-ink-2 py-1.5">
              <span>Shipping</span>
              <span className="text-volta-accent-ink font-mono text-[11px] tracking-[0.08em] uppercase">
                Free
              </span>
            </div>
            <div className="flex justify-between text-[13px] text-volta-ink-2 py-1.5">
              <span>Expert stringing</span>
              <span className="text-volta-accent-ink font-mono text-[11px] tracking-[0.08em] uppercase">
                Included
              </span>
            </div>
            <div className="flex justify-between text-[13px] text-volta-ink-2 py-1.5">
              <span>Estimated tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {/* Promo code */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="flex-1 min-w-0 bg-volta-bg-2 border border-volta-line rounded px-3 py-2 text-[13px] text-volta-ink placeholder:text-volta-ink-4 outline-none focus:border-volta-ink transition-colors"
              />
              <button className="bg-volta-ink text-white font-mono text-[10px] tracking-[0.08em] uppercase px-4 rounded hover:bg-volta-ink-2 transition-colors">
                Apply
              </button>
            </div>

            <div className="flex justify-between font-heading font-bold text-[22px] border-t border-volta-line pt-4 mt-4 text-volta-ink">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-3 w-full py-4 bg-volta-ink text-white font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded flex items-center justify-center gap-2 hover:bg-volta-ink-2 transition-colors"
            >
              Proceed to checkout
              <ArrowRight size={14} />
            </Link>

            {/* Trust badges */}
            <div className="mt-6 pt-5 border-t border-volta-line space-y-3">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-volta-accent-ink shrink-0 mt-0.5" />
                <span className="text-[12px] text-volta-ink-3">
                  2-year warranty on every frame. 30-day on-court trial.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-volta-accent-ink shrink-0 mt-0.5" />
                <span className="text-[12px] text-volta-ink-3">
                  Free express delivery on orders over $200.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Wrench className="w-4 h-4 text-volta-accent-ink shrink-0 mt-0.5" />
                <span className="text-[12px] text-volta-ink-3">
                  Secured checkout. We never store your card details.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
