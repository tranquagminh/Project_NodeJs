'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/products';
import { getProductMainImage } from '@/lib/images';
import { playStyleLabel, flexLabel } from '@/lib/enums';

const sortOptions = [
  { label: 'Newest', value: '' },
  { label: 'Price low–high', value: 'price-asc' },
  { label: 'Price high–low', value: 'price-desc' },
  { label: 'Best rated', value: 'rating' },
  { label: 'Most popular', value: 'popular' },
];

const playStyles = [
  { label: 'Power · head heavy', value: 'POWER_HEAD_HEAVY' },
  { label: 'Speed · head light', value: 'SPEED_HEAD_LIGHT' },
  { label: 'Control · even', value: 'CONTROL_EVEN_BALANCE' },
];

const flexOptions = [
  { label: 'Stiff', value: 'STIFF' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Flexible', value: 'FLEXIBLE' },
];

const skillLevels = [
  { label: 'Professional', value: 'PROFESSIONAL' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Beginner', value: 'BEGINNER' },
];

const LIMIT = 9;

export default function ProductsPage() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedFlex, setSelectedFlex] = useState('');
  const [maxPrice, setMaxPrice] = useState(300);
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = {
    page: currentPage,
    limit: LIMIT,
    sort: sortBy || undefined,
    skillLevel: selectedSkill || undefined,
    playStyle: selectedStyle || undefined,
    maxPrice: maxPrice < 300 ? maxPrice : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    placeholderData: (prev) => prev,
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const clearAll = () => {
    setSelectedSkill('');
    setSelectedStyle('');
    setSelectedFlex('');
    setMaxPrice(300);
    setCurrentPage(1);
  };

  const hasFilters = selectedSkill || selectedStyle || selectedFlex || maxPrice < 300;

  const CheckItem = ({
    label,
    value,
    selected,
    onToggle,
  }: {
    label: string;
    value: string;
    selected: string;
    onToggle: (v: string) => void;
  }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <span
        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
          selected === value ? 'bg-volta-ink border-volta-ink' : 'border-volta-line group-hover:border-volta-ink-4'
        }`}
        onClick={() => onToggle(selected === value ? '' : value)}
      >
        {selected === value && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        className="text-[13px] text-volta-ink-2 group-hover:text-volta-ink transition-colors"
        onClick={() => onToggle(selected === value ? '' : value)}
      >
        {label}
      </span>
    </label>
  );

  return (
    <main className="min-h-screen bg-volta-bg">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[13px]">
          <Link href="/" className="text-volta-ink-3 hover:text-volta-ink transition-colors">Home</Link>
          <span className="text-volta-ink-4">/</span>
          <span className="text-volta-ink">Rackets</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 pt-8 pb-12">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">Engineered for precision</p>
        <h1 className="font-heading font-bold text-[clamp(48px,7vw,88px)] tracking-[-0.03em] leading-[0.95] text-volta-ink mb-4">Rackets.</h1>
        <p className="text-volta-ink-2 text-[15px] leading-relaxed max-w-lg">
          Explore our full range of badminton rackets — from lightning-fast doubles weapons to heavy-hitting singles machines.
        </p>
      </section>

      {/* Sort bar */}
      <div className="max-w-[1400px] mx-auto px-6 pb-6">
        <div className="flex items-center justify-between border-b border-volta-line pb-4">
          <p className="text-[13px] text-volta-ink-3">
            Showing <span className="font-medium text-volta-ink">{isLoading ? '—' : total}</span> results
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
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="appearance-none font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink bg-white border border-volta-line rounded px-3 py-2 pr-7 outline-none focus:border-volta-ink cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M1 3l4 4 4-4' fill='none' stroke='%23333' stroke-width='1.5'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
          <aside className={`w-[240px] shrink-0 space-y-8 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
            {/* Skill Level */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">Skill Level</h3>
              <div className="space-y-2">
                {skillLevels.map((s) => (
                  <CheckItem key={s.value} label={s.label} value={s.value} selected={selectedSkill} onToggle={(v) => { setSelectedSkill(v); setCurrentPage(1); }} />
                ))}
              </div>
            </div>

            {/* Play Style */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">Play Style</h3>
              <div className="space-y-2">
                {playStyles.map((s) => (
                  <CheckItem key={s.value} label={s.label} value={s.value} selected={selectedStyle} onToggle={(v) => { setSelectedStyle(v); setCurrentPage(1); }} />
                ))}
              </div>
            </div>

            {/* Shaft Flex */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">Shaft Flex</h3>
              <div className="space-y-2">
                {flexOptions.map((s) => (
                  <CheckItem key={s.value} label={s.label} value={s.value} selected={selectedFlex} onToggle={(v) => { setSelectedFlex(v); setCurrentPage(1); }} />
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-heading font-bold text-[13px] tracking-[0.02em] uppercase text-volta-ink mb-3">Price Range</h3>
              <input
                type="range"
                min={100}
                max={300}
                value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full accent-volta-ink"
              />
              <div className="flex justify-between mt-1 text-[12px] text-volta-ink-3 font-mono">
                <span>$100</span>
                <span>${maxPrice}</span>
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearAll} className="text-[12px] text-volta-ink-3 hover:text-volta-ink underline underline-offset-2 transition-colors">
                Clear all
              </button>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <div key={i} className="bg-white border border-volta-line rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-[1/1.1] bg-volta-bg-3" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-volta-bg-3 rounded w-1/2" />
                      <div className="h-5 bg-volta-bg-3 rounded w-3/4" />
                      <div className="h-3 bg-volta-bg-3 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-heading font-bold text-[20px] text-volta-ink">No products found.</p>
                <p className="text-volta-ink-3 text-[14px] mt-2">Try adjusting your filters.</p>
                <button onClick={clearAll} className="mt-4 px-6 py-3 border border-volta-line text-volta-ink font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded hover:bg-volta-bg-2 transition-colors">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => {
                  const img = getProductMainImage(product.images, product.slug);
                  const balance = playStyleLabel(product.spec?.playStyle);
                  const flex = flexLabel(product.spec?.flex);
                  const price = Number(product.salePrice ?? product.basePrice);
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group bg-white border border-volta-line rounded-lg overflow-hidden hover:border-volta-ink-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="relative aspect-[1/1.1] bg-volta-bg-2 overflow-hidden">
                        <Image src={img} alt={product.name} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                        <button
                          onClick={(e) => e.preventDefault()}
                          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-volta-line flex items-center justify-center text-volta-ink-3 hover:text-volta-ink transition-colors"
                          aria-label={`Save ${product.name}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.2l-1.7-1.6a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1z"/></svg>
                        </button>
                        <span className="absolute left-3 right-3 bottom-3 z-10 bg-volta-ink text-white font-heading font-medium text-[12px] tracking-[0.1em] uppercase py-3 rounded flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                          Quick view <ArrowRight size={12} />
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-accent-ink">
                          {product.spec?.series ?? product.brand?.name ?? ''}
                        </p>
                        <h3 className="font-heading font-bold text-[17px] tracking-[-0.01em] text-volta-ink">{product.name}</h3>
                        <p className="text-[13px] text-volta-ink-3">{[balance, flex].filter(Boolean).join(' · ')}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-heading font-bold text-[18px] text-volta-ink">${price}</span>
                          <div className="flex gap-1">
                            {balance && <span className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 bg-volta-bg-2 text-volta-ink-2 rounded-sm">{balance}</span>}
                            {flex && <span className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 bg-volta-bg-2 text-volta-ink-2 rounded-sm">{flex}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-12">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded text-volta-ink-2 hover:text-volta-ink hover:bg-volta-bg-3 transition-colors disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 flex items-center justify-center rounded font-heading font-medium text-[11px] tracking-[0.08em] uppercase transition-colors ${
                      currentPage === page ? 'bg-volta-ink text-white' : 'text-volta-ink-2 hover:text-volta-ink hover:bg-volta-bg-3'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded text-volta-ink-2 hover:text-volta-ink hover:bg-volta-bg-3 transition-colors disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
