'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ChevronRight, Minus, Plus } from 'lucide-react';
import { useCart } from '@/store/cart';

const stringOptions = [
  { name: 'BG80', sub: 'Power · repulsion' },
  { name: 'Nano 99', sub: 'Control · feel' },
  { name: 'XB 65', sub: 'Durability · spin' },
  { name: 'Aerobite', sub: 'Hybrid · touch' },
];

const gripOptions = [
  { name: 'G4', sub: 'Large' },
  { name: 'G5', sub: 'Standard' },
  { name: 'G6', sub: 'Small' },
  { name: 'G7', sub: 'Junior' },
];

const mockProduct = {
  name: 'Vector X1 Pro',
  series: 'Vector Series',
  subtitle: 'Offensive',
  price: 265,
  inStock: true,
  description:
    'The X1 Pro is weighted toward the head to convert a shorter swing into maximum carry. Best paired with a stiff string and 26+ lbs tension.',
  relatedProducts: [
    {
      id: 1,
      name: 'Power Cushion 65 Z3',
      category: 'Footwear',
      price: 165,
      slug: 'power-cushion-65-z3',
      img: 'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
    },
    {
      id: 2,
      name: 'Pro Tournament Bag',
      category: 'Equipment',
      price: 95,
      slug: 'pro-tournament-bag',
      img: 'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
    },
    {
      id: 3,
      name: 'Aerosensa 50 (12pk)',
      category: 'Essentials',
      price: 42,
      slug: 'aerosensa-50',
      img: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
    },
  ],
};

const specBars = [
  { label: 'Head balance', desc: 'Head-heavy', value: 82 },
  { label: 'Shaft flex', desc: 'Stiff', value: 78 },
  { label: 'Repulsion', desc: 'Very high', value: 88 },
  { label: 'Control', desc: 'High', value: 68 },
];

const specCards = [
  { label: 'Flex', value: 'Stiff', sub: 'Energy stored in the shaft' },
  { label: 'Frame material', value: 'HM Graphite · Volume Cut Resin', sub: 'Tungsten inserts at 3 & 9' },
  { label: 'Shaft material', value: 'HM Graphite · Nanoresin', sub: '6.5mm diameter' },
  { label: 'Joint', value: 'Single-piece T-joint', sub: 'No conventional sleeve' },
  { label: 'Weight · grip', value: '4U · G5', sub: 'Avg 83g · 3U option 88g' },
  { label: 'Tension range', value: '4U · 20–28 lbs', sub: '3U · 21–29 lbs' },
  { label: 'Length', value: '675mm', sub: 'Standard' },
  { label: 'Country', value: 'Handmade · Taiwan', sub: 'Serial-numbered frame' },
];

export default function ProductDetailPage() {
  const [selectedString, setSelectedString] = useState(stringOptions[0].name);
  const [selectedGrip, setSelectedGrip] = useState(gripOptions[1].name);
  const [tension, setTension] = useState(26);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(
      {
        id: `vector-x1-pro-${selectedString}-${selectedGrip}-${tension}`,
        name: mockProduct.name,
        series: mockProduct.series,
        slug: 'vector-x1-pro',
        price: mockProduct.price,
        attrs: [
          { label: `${tension} lbs`, accent: true },
          { label: selectedString, accent: false },
          { label: selectedGrip, accent: false },
          { label: '4U', accent: false },
        ],
      },
      quantity,
    );
  };

  return (
    <div className="bg-volta-bg min-h-screen">
      {/* ── Breadcrumb ── */}
      <nav className="max-w-[1360px] mx-auto px-8 pt-6 pb-2">
        <ol className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] uppercase text-volta-ink-3">
          <li>
            <Link href="/" className="hover:text-volta-ink transition-colors">
              Home
            </Link>
          </li>
          <li className="text-volta-ink-4">/</li>
          <li>
            <Link href="/products" className="hover:text-volta-ink transition-colors">
              Rackets
            </Link>
          </li>
          <li className="text-volta-ink-4">/</li>
          <li className="text-volta-ink-4">Vector Series</li>
          <li className="text-volta-ink-4">/</li>
          <li className="text-volta-ink">{mockProduct.name}</li>
        </ol>
      </nav>

      {/* ── Product Top Section ── */}
      <section className="max-w-[1360px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[72px_1fr_420px] gap-6 items-start">
          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => setSelectedThumb(i)}
                className={`w-[72px] h-[72px] rounded bg-volta-bg-2 border flex items-center justify-center transition-colors ${
                  selectedThumb === i
                    ? 'border-volta-ink'
                    : 'border-volta-line hover:border-volta-ink-4'
                }`}
              >
                <span className="font-mono text-[9px] text-volta-ink-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative aspect-square rounded-lg bg-volta-bg-2 overflow-hidden flex items-center justify-center">
            <span className="font-heading font-bold text-[clamp(120px,18vw,220px)] leading-none tracking-[-0.04em] text-volta-line select-none">
              X1
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[11px] tracking-[0.04em] text-volta-ink-3">
                Product · Vector X1 Pro · Studio
              </span>
            </div>
            <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.06em] uppercase text-volta-ink-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded">
              360° view available
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            {/* Series label */}
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">
              {mockProduct.series} · {mockProduct.subtitle}
            </p>

            {/* Title */}
            <h1 className="font-heading font-bold text-[clamp(28px,3vw,42px)] tracking-[-0.02em] leading-[0.95] text-volta-ink">
              {mockProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 text-volta-accent">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="font-mono text-[11px] tracking-[0.04em] text-volta-ink-3">
                4.8 · 214 reviews
              </span>
            </div>

            {/* Price + stock */}
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-[36px] tracking-[-0.02em] text-volta-ink">
                ${mockProduct.price}
              </span>
              {mockProduct.inStock && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink bg-volta-accent-soft px-2 py-1 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-volta-accent" />
                  In stock · ships today
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-volta-line" />

            {/* String options */}
            <div>
              <div className="flex justify-between mb-2.5">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3">
                  Select performance string
                </p>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">
                  Recommended · BG80
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stringOptions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedString(s.name)}
                    className={`px-3.5 py-3 rounded text-left flex justify-between items-center transition-all ${
                      s.name === selectedString
                        ? 'bg-volta-ink text-white border border-volta-ink'
                        : 'bg-white border border-volta-line hover:border-volta-ink-4'
                    }`}
                  >
                    <div>
                      <div className="font-heading font-bold text-[13px]">{s.name}</div>
                      <div
                        className={`font-mono text-[10px] mt-0.5 ${
                          s.name === selectedString ? 'text-white/70' : 'text-volta-ink-3'
                        }`}
                      >
                        {s.sub}
                      </div>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      width={16}
                      height={16}
                      className={`transition-opacity ${
                        s.name === selectedString ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <path d="M5 12l5 5 9-11" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Grip options */}
            <div>
              <div className="flex justify-between mb-2.5">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3">
                  Grip size
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {gripOptions.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => setSelectedGrip(g.name)}
                    className={`px-3.5 py-3 rounded text-left transition-all ${
                      g.name === selectedGrip
                        ? 'bg-volta-ink text-white border border-volta-ink'
                        : 'bg-white border border-volta-line hover:border-volta-ink-4'
                    }`}
                  >
                    <div className="font-heading font-bold text-[13px]">{g.name}</div>
                    <div
                      className={`font-mono text-[10px] mt-0.5 ${
                        g.name === selectedGrip ? 'text-white/70' : 'text-volta-ink-3'
                      }`}
                    >
                      {g.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tension */}
            <div>
              <div className="flex justify-between mb-2.5">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3">
                  String tension
                </p>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">
                  Recommended · 26 lbs
                </p>
              </div>
              <div className="bg-volta-bg-2 rounded-lg p-4">
                <div className="font-heading font-bold text-[32px] tracking-[-0.02em] text-volta-ink">
                  {tension}
                  <span className="font-mono text-[13px] font-normal text-volta-ink-3 ml-1.5 tracking-[0.08em] uppercase">
                    lbs
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={31}
                  value={tension}
                  onChange={(e) => setTension(Number(e.target.value))}
                  className="w-full accent-volta-ink mt-3.5 mb-1"
                />
                <div className="flex justify-between font-mono text-[10px] text-volta-ink-3 tracking-[0.06em]">
                  <span>20</span>
                  <span>23</span>
                  <span>26</span>
                  <span>28</span>
                  <span>31</span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-volta-line text-[12px] text-volta-ink-3">
                  Recommended for intermediate power players. Strung in our Richmond workshop
                  before ship.
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-volta-line" />

            {/* CTA row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 mt-2">
              <button
                onClick={handleAddToCart}
                className="bg-volta-ink text-white font-heading font-medium text-[13px] tracking-[0.08em] uppercase px-6 py-3.5 rounded hover:bg-volta-ink-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                  <path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 7z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
                Add to cart
              </button>

              {/* Quantity selector */}
              <div className="flex items-center border border-volta-line rounded overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-12 flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-2 transition-colors text-[16px]"
                >
                  −
                </button>
                <span className="min-w-[36px] text-center font-mono font-medium text-[13px] text-volta-ink">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-12 flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-2 transition-colors text-[16px]"
                >
                  +
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWishlist((w) => !w)}
                className={`w-12 h-12 rounded border flex items-center justify-center transition-colors ${
                  wishlist
                    ? 'border-red-400 text-red-500 bg-red-50'
                    : 'border-volta-line text-volta-ink-2 bg-white hover:border-volta-ink hover:text-volta-ink'
                }`}
              >
                <Heart size={18} fill={wishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Perks grid */}
            <div className="grid grid-cols-2 border border-volta-line rounded overflow-hidden mt-5">
              <div className="px-3.5 py-3 flex gap-2.5 items-start bg-white border-r border-b border-volta-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18} className="text-volta-ink-2 shrink-0 mt-0.5">
                  <path d="M3 7h13l4 5v4h-2M3 7v10h14M3 7L8 4h8l3 3" />
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-volta-ink">Free shipping</p>
                  <p className="text-[11px] text-volta-ink-3 mt-0.5">Orders over $100</p>
                </div>
              </div>
              <div className="px-3.5 py-3 flex gap-2.5 items-start bg-white border-b border-volta-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18} className="text-volta-ink-2 shrink-0 mt-0.5">
                  <path d="M12 8v4l2.5 2.5" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-volta-ink">48-hour stringing</p>
                  <p className="text-[11px] text-volta-ink-3 mt-0.5">By certified stringers</p>
                </div>
              </div>
              <div className="px-3.5 py-3 flex gap-2.5 items-start bg-white border-r border-volta-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18} className="text-volta-ink-2 shrink-0 mt-0.5">
                  <path d="M12 3l9 4v5c0 5-4 8-9 9-5-1-9-4-9-9V7l9-4z" />
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-volta-ink">2-year warranty</p>
                  <p className="text-[11px] text-volta-ink-3 mt-0.5">Frame breakage</p>
                </div>
              </div>
              <div className="px-3.5 py-3 flex gap-2.5 items-start bg-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18} className="text-volta-ink-2 shrink-0 mt-0.5">
                  <path d="M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9" />
                  <path d="M21 3l-9 9-3-3" />
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-volta-ink">30-day returns</p>
                  <p className="text-[11px] text-volta-ink-3 mt-0.5">On-court trial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Frame Specs ── */}
      <section className="border-t border-volta-line">
        <div className="max-w-[1360px] mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: heading + description + spec bars */}
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">
                Engineered specs
              </p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-[1] text-volta-ink">
                Built for the back-court attacker.
              </h2>
              <p className="text-volta-ink-2 text-[15px] leading-[1.6] mt-5 max-w-[480px]">
                {mockProduct.description}
              </p>

              <div className="mt-10 space-y-6">
                {specBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-volta-ink-3">
                        {bar.label}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.04em] text-volta-ink">
                        {bar.desc}
                      </span>
                    </div>
                    <div className="h-1 bg-volta-bg-3 rounded-full">
                      <div
                        className="h-1 bg-volta-ink rounded-full transition-all"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: spec cards 2x4 grid */}
            <div className="grid grid-cols-2 gap-px bg-volta-line rounded-lg overflow-hidden">
              {specCards.map((card) => (
                <div key={card.label} className="bg-white p-6 flex flex-col gap-1">
                  <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-volta-ink-3">
                    {card.label}
                  </p>
                  <p className="font-heading font-bold text-[15px] tracking-[-0.01em] text-volta-ink leading-snug">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-volta-ink-3 mt-0.5">
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Complete your setup ── */}
      <section className="border-t border-volta-line bg-white">
        <div className="max-w-[1360px] mx-auto px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">
                Complete your loadout
              </p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-[1] text-volta-ink">
                Frequently played together.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-1.5 font-heading font-medium text-[12px] tracking-[0.08em] uppercase text-volta-ink-2 pb-1 border-b border-volta-line hover:text-volta-ink hover:border-volta-ink transition-colors"
            >
              View collection
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockProduct.relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group border border-volta-line rounded-lg overflow-hidden hover:border-volta-ink-4 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[1/1.1] bg-volta-bg-2 overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-accent-ink">
                    {item.category}
                  </p>
                  <h4 className="font-heading font-bold text-[17px] tracking-[-0.01em] text-volta-ink">
                    {item.name}
                  </h4>
                  <p className="font-heading font-bold text-[17px] text-volta-ink mt-1">
                    ${item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}