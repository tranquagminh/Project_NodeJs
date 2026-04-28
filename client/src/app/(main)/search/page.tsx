'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Heart, ArrowRight } from 'lucide-react';

const popularTags = [
  { label: 'Vector', query: 'vector' },
  { label: 'Pulse', query: 'pulse' },
  { label: 'Arc', query: 'arc' },
  { label: 'Head-heavy', query: 'head heavy' },
  { label: 'Stiff shaft', query: 'stiff' },
  { label: '4U · G5', query: '4U G5' },
];

const allProducts = [
  { slug: 'vector-x1-pro', name: 'Vector X1 Pro', series: 'Vector Series', style: 'Offensive · head-heavy', price: 265, tags: ['HEAD HEAVY', 'STIFF'], badge: 'NEW', keywords: 'vector head heavy stiff offensive 4U G5', img: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'pulse-800-pro', name: 'Pulse 800 Pro', series: 'Pulse Series', style: 'Speed · head-light', price: 240, tags: ['HEAD LIGHT', 'STIFF'], badge: null, keywords: 'pulse head light stiff speed 4U G5', img: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'arc-11-pro', name: 'Arc 11 Pro', series: 'Arc Series', style: 'Control · even balance', price: 255, tags: ['EVEN', 'STIFF'], badge: null, keywords: 'arc even balance control stiff 4U G5', img: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'vector-88d-pro', name: 'Vector 88D Pro', series: 'Vector Series', style: 'Offensive · rotational', price: 235, tags: ['HEAD HEAVY', 'STIFF'], badge: 'BEST SELLER', keywords: 'vector head heavy stiff offensive rotational 4U G5', img: 'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'pulse-600-tour', name: 'Pulse 600 Tour', series: 'Pulse Series', style: 'All-round · medium flex', price: 195, tags: ['EVEN', 'MEDIUM'], badge: null, keywords: 'pulse even medium flex all-round tour', img: 'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'arc-7-tour', name: 'Arc 7 Tour', series: 'Arc Series', style: 'Control · head-light', price: 210, tags: ['HEAD LIGHT', 'MEDIUM'], badge: null, keywords: 'arc head light medium control tour', img: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'vector-90-ltd', name: 'Vector 90 LTD', series: 'Vector Series', style: 'Power · extra stiff', price: 310, tags: ['HEAD HEAVY', 'X-STIFF'], badge: 'LIMITED', keywords: 'vector head heavy extra stiff power limited 3U', img: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
  { slug: 'pulse-900-ace', name: 'Pulse 900 Ace', series: 'Pulse Series', style: 'Speed · flexible', price: 225, tags: ['HEAD LIGHT', 'FLEXIBLE'], badge: null, keywords: 'pulse head light flexible speed ace', img: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
];

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [sort, setSort] = useState<SortOption>('relevance');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = q
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.series.toLowerCase().includes(q) ||
            p.style.toLowerCase().includes(q) ||
            p.keywords.toLowerCase().includes(q),
        )
      : allProducts;

    if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

    return filtered;
  }, [query, sort]);

  return (
    <main className="bg-volta-bg min-h-screen">
      {/* Search Hero */}
      <section className="pt-12 pb-6">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-volta-ink transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-volta-ink">Search</span>
          </nav>

          {/* Search Input */}
          <div className="relative max-w-[820px] mx-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-volta-ink-3 pointer-events-none"
            >
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

          {/* Search Meta */}
          <div className="flex justify-between items-center max-w-[820px] mx-auto mt-4 font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3">
            <div>
              {query.trim() ? (
                <>
                  <span>{results.length}</span> results for &ldquo;
                  <span className="text-volta-ink">{query}</span>&rdquo;
                </>
              ) : (
                <span>Type to search the catalogue</span>
              )}
            </div>
            <div className="hidden sm:block">Press ⏎ to refine · ESC to clear</div>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap gap-1.5 max-w-[820px] mx-auto mt-5 items-center">
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3 mr-1">
              Popular —
            </span>
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
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3">
            Showing {results.length} results
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink-3">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-transparent font-mono text-[11px] tracking-[0.08em] uppercase text-volta-ink pr-5 cursor-pointer outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price · low to high</option>
                <option value="price-desc">Price · high to low</option>
                <option value="newest">Newest</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-volta-ink-3 pointer-events-none"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Grid or Empty */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map((product) => (
              <div key={product.slug} className="group relative">
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
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-heading font-bold text-[24px] text-volta-ink mb-2">
              No matches.
            </h2>
            <p className="text-volta-ink-3 text-[14px]">
              Try a different query — or browse the full collection.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-5 px-6 py-3 border border-volta-line text-volta-ink font-heading font-medium text-[13px] tracking-[0.08em] uppercase rounded hover:bg-volta-bg-2 transition-colors"
            >
              Browse all rackets
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
