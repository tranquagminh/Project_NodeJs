'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ThunderIcon, BalanceIcon, SpeedometerIcon, RulerIcon } from '@/components/icons';

const skillLevels = ['Professional', 'Intermediate', 'Beginner'];
const playStyles = ['Power (Head Heavy)', 'Speed (Head Light)', 'Control (Even Balance)'];
const series = ['Astrox', 'Nanoflare', 'Arcsaber'];
const weightGrips = ['3U G4', '4U G5', '4U G6', '5U G5'];

const mockProducts = [
  { id: 1, slug: 'astrox-100-zz', name: 'ASTROX 100 ZZ', series: 'Astrox Series', price: 295, playStyle: 'Head Heavy', flex: 'Extra Stiff', badge: 'New Series', badgeColor: 'bg-kinetic-blue', src:'/images/products/product1.png' },
  { id: 2, slug: 'nanoflare-800-pro', name: 'NANOFLARE 800 PRO', series: 'Nanoflare Series', price: 240, playStyle: 'Head Light', flex: 'Stiff', badge: null, badgeColor: '', src:'/images/products/product2.png' },
  { id: 3, slug: 'arcsaber-11-pro', name: 'ARCSABER 11 PRO', series: 'Arcsaber Series', price: 255, playStyle: 'Even Balance', flex: 'Stiff', badge: null, badgeColor: '', src:'/images/products/product3.png' },
  { id: 4, slug: 'astrox-88d-pro', name: 'ASTROX 88D PRO', series: 'Astrox Series', price: 235, playStyle: 'Head Heavy', flex: 'Stiff', badge: null, badgeColor: '', src:'/images/products/product4.png' },
  { id: 5, slug: 'nanoflare-700', name: 'NANOFLARE 700', series: 'Nanoflare Series', price: 210, playStyle: 'Head Light', flex: 'Medium', badge: null, badgeColor: '', src:'/images/products/product5.png' },
  { id: 6, slug: 'arcsaber-7-pro', name: 'ARCSABER 7 PRO', series: 'Arcsaber Series', price: 226, playStyle: 'Even Balance', flex: 'Medium', badge: null, badgeColor: '', src:'/images/products/product6.png' },
];

function PlayStyleBadge({ style }: { style: string }) {
  const icon =
    style === 'Head Heavy' ? <ThunderIcon /> :
    style === 'Head Light' ? <SpeedometerIcon /> :
    <BalanceIcon />;
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <span className="text-[10px] font-sans text-kinetic-text-muted uppercase tracking-[1px]">Balance</span>
        <span className="text-xs font-heading font-bold text-kinetic-text uppercase">{style}</span>
      </div>
    </div>
  );
}

export default function ProductListingPage() {
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);
  const [selectedPlayStyles, setSelectedPlayStyles] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedWeightGrip, setSelectedWeightGrip] = useState<string | null>('4U G5');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  return (
    <div className="bg-kinetic-bg min-h-screen">
      {/* Hero Header */}
      <section className="bg-kinetic-bg-alt overflow-hidden px-8 py-20">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4 pb-8">
            <p className="font-heading text-xs text-kinetic-green tracking-[3.6px] uppercase">
              Engineered for Precision
            </p>
            <h1 className="font-heading font-bold text-[64px] lg:text-[96px] leading-none text-kinetic-blue tracking-tighter uppercase">
              PRO-GRADE<br />
              <span className="text-kinetic-green">RACKETS</span>
            </h1>
            <p className="text-kinetic-text-secondary text-base max-w-md leading-relaxed mt-2">
              Experience the ultimate fusion of aerodynamics and structural integrity. Our 2024
              collection features enhanced graphite frames for explosive power and surgical control.
            </p>
          </div>
          <div className="lg:col-span-5 hidden lg:flex justify-center items-center">
            <Image
              src="/images/rackets/banner-racket.png"
              alt="Pro-Grade Racket"
              width={520}
              height={520}
              className="object-contain -rotate-12 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Main Product Area */}
      <div className="max-w-[1920px] mx-auto px-8 py-12 flex gap-12">
        {/* Mobile filter toggle */}
        <button
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-kinetic-blue text-white p-4 rounded-full shadow-lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} />
        </button>

        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-8 overflow-y-auto' : 'hidden'} lg:block lg:relative lg:z-auto w-full lg:w-72 flex-shrink-0`}>
          {showFilters && (
            <button className="lg:hidden mb-6 font-heading font-bold text-sm" onClick={() => setShowFilters(false)}>
              ✕ Close Filters
            </button>
          )}
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-sm text-kinetic-blue tracking-[1.4px] uppercase border-b-2 border-kinetic-green pb-1.5 w-fit">
              Filters
            </h3>

            {/* Skill Level */}
            <FilterSection title="Skill Level">
              {skillLevels.map((level) => (
                <FilterCheckbox
                  key={level}
                  label={level}
                  checked={selectedSkillLevels.includes(level)}
                  onChange={() => toggleFilter(selectedSkillLevels, setSelectedSkillLevels, level)}
                />
              ))}
            </FilterSection>

            {/* Play Style */}
            <FilterSection title="Play Style">
              {playStyles.map((style) => (
                <FilterCheckbox
                  key={style}
                  label={style}
                  checked={selectedPlayStyles.includes(style)}
                  onChange={() => toggleFilter(selectedPlayStyles, setSelectedPlayStyles, style)}
                />
              ))}
            </FilterSection>

            {/* Series */}
            <FilterSection title="Series">
              {series.map((s) => (
                <FilterCheckbox
                  key={s}
                  label={s}
                  checked={selectedSeries.includes(s)}
                  onChange={() => toggleFilter(selectedSeries, setSelectedSeries, s)}
                  bold
                />
              ))}
            </FilterSection>

            {/* Weight & Grip */}
            <FilterSection title="Weight & Grip">
              <div className="grid grid-cols-2 gap-2">
                {weightGrips.map((wg) => (
                  <button
                    key={wg}
                    onClick={() => setSelectedWeightGrip(wg === selectedWeightGrip ? null : wg)}
                    className={`py-2 px-4 text-[10px] font-sans tracking-[1px] uppercase border text-center transition-colors ${
                      wg === selectedWeightGrip
                        ? 'border-kinetic-green bg-kinetic-green/5 text-kinetic-green font-bold'
                        : 'border-kinetic-border text-kinetic-text'
                    }`}
                  >
                    {wg}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range">
              <div className="w-full">
                <input type="range" min="50" max="300" className="w-full accent-kinetic-green" />
                <div className="flex justify-between mt-2">
                  <span className="font-sans text-xs text-kinetic-text-muted">$50</span>
                  <span className="font-sans text-xs text-kinetic-text-muted">$300+</span>
                </div>
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-8">
            <p className="font-sans text-sm text-kinetic-text-muted">
              Showing <span className="font-bold text-kinetic-text">24</span> results
            </p>
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs text-kinetic-text-muted uppercase tracking-[1.4px]">Sort By:</span>
              <div className="relative">
                <select className="appearance-none font-heading font-bold text-sm text-kinetic-text uppercase tracking-[1px] bg-transparent border-none focus:outline-none cursor-pointer pr-6">
                  <option>Newest Arrivals</option>
                  <option>Price - Low to High</option>
                  <option>Price - High to Low</option>
                  <option>Best Sellers</option>
                </select>
                <ChevronRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-kinetic-text-muted pointer-events-none rotate-90" />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <div className="bg-white relative overflow-hidden aspect-square mb-4">
                  {product.badge && (
                    <span className={`absolute top-3 left-3 z-10 ${product.badgeColor} text-white font-sans font-bold text-[10px] tracking-[1px] uppercase px-2 py-1 tracking-tighter`}>
                      {product.badge}
                    </span>
                  )}
                  <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={product.src}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-sans font-bold text-[10px] text-kinetic-green tracking-[1px] uppercase">
                    {product.series}
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="font-heading font-bold text-2xl text-kinetic-blue uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <span className="font-heading font-bold text-lg text-kinetic-blue">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <PlayStyleBadge style={product.playStyle} />
                    <div className="flex items-center gap-2">
                      <RulerIcon />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-sans text-kinetic-text-muted uppercase tracking-[1px]">Stiffness</span>
                        <span className="text-xs font-heading font-bold text-kinetic-text uppercase">{product.flex}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-16">
            <button className="p-2 text-kinetic-text-muted hover:text-kinetic-blue">
              <ChevronLeft size={18} />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center font-sans text-sm transition-colors ${
                  page === currentPage
                    ? 'bg-kinetic-blue text-white font-bold'
                    : 'text-kinetic-text hover:bg-kinetic-bg-alt'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 text-kinetic-text-muted hover:text-kinetic-blue">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-heading font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">
        {title}
      </h4>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange, bold }: { label: string; checked: boolean; onChange: () => void; bold?: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 border border-kinetic-border rounded-sm accent-kinetic-green"
      />
      <span className={`font-sans text-xs text-kinetic-text tracking-[0.3px] uppercase ${bold ? 'font-bold' : ''}`}>
        {label}
      </span>
    </label>
  );
}
