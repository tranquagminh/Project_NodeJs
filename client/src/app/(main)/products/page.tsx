'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Vector X1 Pro',
    series: 'Vector Series',
    price: 265,
    balance: 'HEAD HEAVY',
    flex: 'STIFF',
    badge: 'NEW',
    badgeStyle: 'bg-volta-accent text-volta-accent-ink',
    slug: 'vector-x1-pro',
    image: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 2,
    name: 'Pulse 800 Pro',
    series: 'Pulse Series',
    price: 240,
    balance: 'HEAD LIGHT',
    flex: 'STIFF',
    badge: null,
    badgeStyle: '',
    slug: 'pulse-800-pro',
    image: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 3,
    name: 'Arc 11 Pro',
    series: 'Arc Series',
    price: 255,
    balance: 'EVEN',
    flex: 'STIFF',
    badge: null,
    badgeStyle: '',
    slug: 'arcsaber-11-pro',
    image: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 4,
    name: 'Vector 88D Pro',
    series: 'Vector Series',
    price: 235,
    balance: 'HEAD HEAVY',
    flex: 'STIFF',
    badge: 'BEST SELLER',
    badgeStyle: 'bg-volta-ink text-white',
    slug: 'vector-88d-pro',
    image: 'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 5,
    name: 'Pulse 500',
    series: 'Pulse Series',
    price: 185,
    balance: 'HEAD LIGHT',
    flex: 'MEDIUM',
    badge: null,
    badgeStyle: '',
    slug: 'pulse-500',
    image: 'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 6,
    name: 'Arc 7 Tour',
    series: 'Arc Series',
    price: 226,
    balance: 'EVEN',
    flex: 'MEDIUM',
    badge: null,
    badgeStyle: '',
    slug: 'arc-7-tour',
    image: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 7,
    name: 'Vector X3',
    series: 'Vector Series',
    price: 195,
    balance: 'HEAD HEAVY',
    flex: 'MEDIUM',
    badge: null,
    badgeStyle: '',
    slug: 'vector-x3',
    image: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
  {
    id: 8,
    name: 'Pulse 600 Tour',
    series: 'Pulse Series',
    price: 215,
    balance: 'HEAD LIGHT',
    flex: 'STIFF',
    badge: null,
    badgeStyle: '',
    slug: 'pulse-600-tour',
    image: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop',
  },
];

const skillLevels = ['Professional', 'Intermediate', 'Beginner'];
const playStyles = [
  'Power · head heavy',
  'Speed · head light',
  'Control · even',
];
const seriesOptions = ['Vector', 'Pulse', 'Arc'];
const weightGripOptions = ['3U·G4', '4U·G5', '4U·G6', '5U·G5'];
const sortOptions = ['Newest', 'Price low–high', 'Price high–low', 'Best rated'];

export default function ProductsPage() {
  const [selectedSkill, setSelectedSkill] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedWeight, setSelectedWeight] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(300);
  const [sortBy, setSortBy] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const clearAll = () => {
    setSelectedSkill([]);
    setSelectedStyle([]);
    setSelectedSeries([]);
    setSelectedWeight([]);
    setPriceRange(300);
  };

  const hasFilters =
    selectedSkill.length > 0 ||
    selectedStyle.length > 0 ||
    selectedSeries.length > 0 ||
    selectedWeight.length > 0 ||
    priceRange < 300;

  return (
    <main className="min-h-screen bg-volta-bg">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[13px]">
          <Link href="/" className="text-volta-ink-3 hover:text-volta-ink transition-colors">
            Home
          </Link>
          <span className="text-volta-ink-4">/</span>
          <span className="text-volta-ink">Rackets</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 pt-8 pb-12">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">
          Engineered for precision
        </p>
        <h1 className="font-heading font-bold text-[clamp(48px,7vw,88px)] tracking-[-0.03em] leading-[0.95] text-volta-ink mb-4">
          Rackets.
        </h1>
        <p className="text-volta-ink-2 text-[15px] leading-relaxed max-w-lg">
          Explore our full range of badminton rackets — from lightning-fast
          doubles weapons to heavy-hitting singles machines.
        </p>
      </section>

      {/* Sort bar */}
      <div className="max-w-[1400px] mx-auto px-6 pb-6">
        <div className="flex items-center justify-between border-b border-volta-line pb-4">
          <p className="text-[13px] text-volta-ink-3">
            Showing <span className="font-medium text-volta-ink">24</span>{' '}
            results
          </p>
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden flex items-center gap-2 text-[13px] text-volta-ink-2 hover:text-volta-ink transition-colors"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink bg-white border border-volta-line rounded px-3 py-2 pr-7 outline-none focus:border-volta-ink cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M1 3l4 4 4-4' fill='none' stroke='%23333' stroke-width='1.5'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {sortOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        <div className="flex gap-10">
          {/* Sidebar filters */}
          <aside
            className={`w-[240px] shrink-0 space-y-8 ${
              mobileFiltersOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            {/* Skill Level */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">
                Skill Level
              </h3>
              <div className="space-y-2">
                {skillLevels.map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <span
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        selectedSkill.includes(level)
                          ? 'bg-volta-ink border-volta-ink'
                          : 'border-volta-line group-hover:border-volta-ink-4'
                      }`}
                      onClick={() =>
                        toggleFilter(level, selectedSkill, setSelectedSkill)
                      }
                    >
                      {selectedSkill.includes(level) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-[13px] text-volta-ink-2 group-hover:text-volta-ink transition-colors"
                      onClick={() =>
                        toggleFilter(level, selectedSkill, setSelectedSkill)
                      }
                    >
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Play Style */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">
                Play Style
              </h3>
              <div className="space-y-2">
                {playStyles.map((style) => (
                  <label
                    key={style}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <span
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        selectedStyle.includes(style)
                          ? 'bg-volta-ink border-volta-ink'
                          : 'border-volta-line group-hover:border-volta-ink-4'
                      }`}
                      onClick={() =>
                        toggleFilter(style, selectedStyle, setSelectedStyle)
                      }
                    >
                      {selectedStyle.includes(style) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-[13px] text-volta-ink-2 group-hover:text-volta-ink transition-colors"
                      onClick={() =>
                        toggleFilter(style, selectedStyle, setSelectedStyle)
                      }
                    >
                      {style}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Series */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">
                Series
              </h3>
              <div className="space-y-2">
                {seriesOptions.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <span
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        selectedSeries.includes(s)
                          ? 'bg-volta-ink border-volta-ink'
                          : 'border-volta-line group-hover:border-volta-ink-4'
                      }`}
                      onClick={() =>
                        toggleFilter(s, selectedSeries, setSelectedSeries)
                      }
                    >
                      {selectedSeries.includes(s) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-[13px] text-volta-ink-2 group-hover:text-volta-ink transition-colors"
                      onClick={() =>
                        toggleFilter(s, selectedSeries, setSelectedSeries)
                      }
                    >
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight · Grip */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">
                Weight · Grip
              </h3>
              <div className="flex flex-wrap gap-2">
                {weightGripOptions.map((wg) => (
                  <button
                    key={wg}
                    onClick={() =>
                      toggleFilter(wg, selectedWeight, setSelectedWeight)
                    }
                    className={`font-mono text-[11px] tracking-[0.06em] px-3 py-1.5 rounded-sm transition-colors ${
                      selectedWeight.includes(wg)
                        ? 'bg-volta-ink text-white'
                        : 'bg-volta-bg-2 border border-volta-line text-volta-ink-2 hover:border-volta-ink-4'
                    }`}
                  >
                    {wg}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">
                Price Range
              </h3>
              <input
                type="range"
                min={100}
                max={300}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-volta-ink"
              />
              <div className="flex justify-between mt-1 text-[12px] text-volta-ink-3 font-mono">
                <span>$100</span>
                <span>${priceRange}</span>
              </div>
            </div>

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-[12px] text-volta-ink-3 hover:text-volta-ink underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white border border-volta-line rounded-lg overflow-hidden hover:border-volta-ink-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[1/1.1] bg-volta-bg-2 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span
                        className={`absolute top-3 left-3 z-10 font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-sm ${product.badgeStyle}`}
                      >
                        {product.badge}
                      </span>
                    )}
                    {/* Wishlist */}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-volta-line flex items-center justify-center text-volta-ink-3 hover:text-volta-ink transition-colors"
                      aria-label={`Save ${product.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.2l-1.7-1.6a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1z"/></svg>
                    </button>
                    {/* Quick view */}
                    <span className="absolute left-3 right-3 bottom-3 z-10 bg-volta-ink text-white font-heading font-medium text-[12px] tracking-[0.1em] uppercase py-3 rounded flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                      Quick view <ArrowRight size={12} />
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-accent-ink">
                      {product.series}
                    </p>
                    <h3 className="font-heading font-bold text-[17px] tracking-[-0.01em] text-volta-ink">
                      {product.name}
                    </h3>
                    <p className="text-[13px] text-volta-ink-3">
                      {product.balance} · {product.flex}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-heading font-bold text-[18px] text-volta-ink">
                        ${product.price}
                      </span>
                      <div className="flex gap-1">
                        <span className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 bg-volta-bg-2 text-volta-ink-2 rounded-sm">
                          {product.balance}
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 bg-volta-bg-2 text-volta-ink-2 rounded-sm">
                          {product.flex}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 mt-12">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="w-9 h-9 flex items-center justify-center rounded text-volta-ink-2 hover:text-volta-ink hover:bg-volta-bg-3 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[36px] h-9 flex items-center justify-center rounded font-heading font-medium text-[11px] tracking-[0.08em] uppercase transition-colors ${
                    currentPage === page
                      ? 'bg-volta-ink text-white'
                      : 'text-volta-ink-2 hover:text-volta-ink hover:bg-volta-bg-3'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}
                className="w-9 h-9 flex items-center justify-center rounded text-volta-ink-2 hover:text-volta-ink hover:bg-volta-bg-3 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
