'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Heart, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/services/products';
import { getProductMainImage } from '@/lib/images';
import { playStyleLabel, flexLabel } from '@/lib/enums';

const popularTags = [
  { label: 'Vector', query: 'vector' },
  { label: 'Pulse', query: 'pulse' },
  { label: 'Arc', query: 'arc' },
  { label: 'Head-heavy', query: 'head heavy' },
  { label: 'Stiff shaft', query: 'stiff' },
];

type SortOption = 'relevance' | 'price-asc' | 'price-desc';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [sort, setSort] = useState<SortOption>('relevance');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, sort],
    queryFn: () => searchProducts(debouncedQuery, 1, 24),
    enabled: true,
  });

  const rawProducts = data?.data ?? [];

  const results = sort === 'price-asc'
    ? [...rawProducts].sort((a, b) => Number(a.basePrice) - Number(b.basePrice))
    : sort === 'price-desc'
    ? [...rawProducts].sort((a, b) => Number(b.basePrice) - Number(a.basePrice))
    : rawProducts;

  return (
    <main className="bg-volta-bg min-h-screen">
      {/* Search Hero */}
      <section className="pt-12 pb-6">
        <div className="max-w-[1280px] mx-auto px-6">
          <nav className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-volta-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-volta-ink">Search</span>
          </nav>

          <div className="relative max-w-[820px] mx-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-volta-ink-3 pointer-events-none">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search frames, strings, shoes…"
              className="w-full border border-volta-line bg-white py-[22px] pl-14 pr-6 rounded-lg font-heading font-bold text-[28px] tracking-[-0.01em] text-volta-ink placeholder:text-volta-ink-4 placeholder:font-normal placeholder:text-[20px] outline-none transition-all focus:border-volta-ink focus:shadow-[0_0_0_3px_rgba(30,42,56,0.08)]"
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center max-w-[820px] mx-auto mt-4 font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3">
            <div>
              {debouncedQuery.trim() ? (
                <>{isLoading ? '—' : results.length} results for &ldquo;<span className="text-volta-ink">{debouncedQuery}</span>&rdquo;</>
              ) : (
                <span>Type to search the catalogue</span>
              )}
            </div>
            <div className="hidden sm:block">Press ⏎ to refine · ESC to clear</div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-w-[820px] mx-auto mt-5 items-center">
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3 mr-1">Popular —</span>
            {popularTags.map((tag) => (
              <button
                key={tag.query}
                onClick={() => setQuery(tag.query)}
                className={`px-3 py-1.5 border rounded-sm font-mono text-[11px] tracking-[0.06em] uppercase transition-all cursor-pointer ${
                  query.toLowerCase() === tag.query.toLowerCase()
                    ? 'bg-volta-ink text-white border-volta-ink'
                    : 'bg-volta-bg-2 border-volta-line text-volta-ink-2 hover:border-volta-ink hover:text-volta-ink'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-20">
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3">
            Showing {isLoading ? '—' : results.length} results
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3">Sort by:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-transparent font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink pr-5 cursor-pointer outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price · low to high</option>
                <option value="price-desc">Price · high to low</option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-volta-ink-3 pointer-events-none">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-volta-bg-3 rounded-lg mb-3" />
                <div className="h-3 bg-volta-bg-3 rounded w-1/2 mb-1.5" />
                <div className="h-4 bg-volta-bg-3 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map((product) => {
              const img = getProductMainImage(product.images, product.slug);
              const balance = playStyleLabel(product.spec?.playStyle);
              const flex = flexLabel(product.spec?.flex);
              const price = Number(product.salePrice ?? product.basePrice);
              return (
                <div key={product.id} className="group relative">
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative block aspect-square bg-white border border-volta-line rounded-lg overflow-hidden mb-3"
                  >
                    <button
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-volta-line bg-white/80 text-volta-ink-3 hover:text-volta-ink hover:border-volta-ink transition-colors"
                      onClick={(e) => e.preventDefault()}
                      aria-label="Wishlist"
                    >
                      <Heart size={14} strokeWidth={1.8} />
                    </button>
                    <Image src={img} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <span className="flex items-center justify-center gap-2 py-3 bg-volta-ink text-white font-mono text-[10px] tracking-[0.08em] uppercase">
                        Quick View <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">
                    {product.spec?.series ?? product.brand?.name ?? ''}
                  </span>
                  <h3 className="font-heading font-bold text-[16px] tracking-[-0.01em] text-volta-ink mt-0.5">{product.name}</h3>
                  <p className="text-[12px] text-volta-ink-3 mt-0.5">{[balance, flex].filter(Boolean).join(' · ')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-heading font-bold text-[16px] text-volta-ink">${price}</span>
                    <div className="flex gap-1.5">
                      {balance && <span className="font-mono text-[9px] tracking-[0.06em] uppercase text-volta-ink-3 bg-volta-bg-2 px-1.5 py-0.5 rounded-sm">{balance}</span>}
                      {flex && <span className="font-mono text-[9px] tracking-[0.06em] uppercase text-volta-ink-3 bg-volta-bg-2 px-1.5 py-0.5 rounded-sm">{flex}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-heading font-bold text-[24px] text-volta-ink mb-2">No matches.</h2>
            <p className="text-volta-ink-3 text-[14px]">Try a different query — or browse the full collection.</p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-5 px-6 py-3 border border-volta-line text-volta-ink font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded hover:bg-volta-bg-2 transition-colors">
              Browse all rackets
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
