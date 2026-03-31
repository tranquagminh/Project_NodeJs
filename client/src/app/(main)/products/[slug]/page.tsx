'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ChevronRight } from 'lucide-react';

const stringOptions = ['YONEX BG80', 'NANOGY 98', 'AEROBITE'];
const gripOptions = ['G4', 'G5'];

const mockProduct = {
  name: 'ASTROX 88 D PRO',
  series: 'Astrox Series',
  subtitle: 'Offensive Dominance',
  price: 235,
  inStock: true,
  description: 'The ASTROX 88 D PRO is designed for the back-court player, delivering decisive power for continuous attacks.',
  balanceType: 'Head Heavy',
  flex: 'Stiff',
  spec: {
    face: 'Stiff',
    material: 'HM Graphite / VOLUME CUT RESIN / Tungstene',
    frameMaterial: 'HM Graphite / Namd',
    jointType: 'New Built-in T-Joint',
    weightGrip: '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4, 5, 6',
    recTension: '4U: 20 - 28 lbs / 3U: 21 - 29 lbs',
  },
  technologies: [
    {
      name: 'Rotational Generator System',
      description: 'By applying the counterbalance theory, weight is distributed throughout the grip end, frame top and the joint for maximum control. The transition to the next shot can be performed smoothly, with rapid succession.',
    },
    {
      name: 'NAMD Carbon',
      description: 'A world-first, new dimension graphite material, Namd, greatly improves the adhesion of the graphite fibers and resin by attaching nanomaterials directly to the graphite fiber.',
    },
  ],
  relatedProducts: [
    { id: 1, name: 'POWER CUSHION 65 Z3', category: 'Footwear', price: 165, slug: 'power-cushion-65-z3', img: '/images/product-recommend/product_recommend1.png' },
    { id: 2, name: 'PRO TOURNAMENT BAG', category: 'Equipment', price: 95, slug: 'pro-tournament-bag', img: '/images/product-recommend/product_recommend2.png' },
    { id: 3, name: 'AEROSENSA 50 (12PK)', category: 'Essentials', price: 42, slug: 'aerosensa-50', img: '/images/product-recommend/product_recommend3.png' },
  ],
};

export default function ProductDetailPage() {
  const [selectedString, setSelectedString] = useState(stringOptions[0]);
  const [selectedGrip, setSelectedGrip] = useState(gripOptions[0]);
  const [tension, setTension] = useState(26);
  const [selectedThumb, setSelectedThumb] = useState(0);

  return (
    <div className="bg-kinetic-bg min-h-screen">
      {/* Product Top Section */}
      <section className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  className={`w-16 h-16 bg-kinetic-bg-alt border-2 transition-colors ${
                    selectedThumb === i ? 'border-kinetic-blue' : 'border-transparent hover:border-kinetic-border'
                  }`}
                />
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 bg-kinetic-bg-alt aspect-square" />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-sans text-xs text-kinetic-green uppercase tracking-[1px]">
                {mockProduct.series} | {mockProduct.subtitle}
              </p>
              <h1 className="mt-2 font-heading font-bold text-4xl text-kinetic-text tracking-tight uppercase">
                {mockProduct.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="font-heading font-bold text-3xl text-kinetic-blue">${mockProduct.price.toFixed(2)}</span>
                {mockProduct.inStock && (
                  <span className="font-sans bg-kinetic-green-light font-bold text-xs text-kinetic-green-dark uppercase tracking-[1px] py-1 px-2">In Stock</span>
                )}
              </div>
            </div>

            {/* String Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">
                  Select Performance Strings
                </p>
                <Link href="#" className="font-sans font-bold text-[10px] text-kinetic-green tracking-[1px] uppercase hover:underline">
                  Recommended: #108
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {stringOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedString(s)}
                    className={`py-3 px-4 text-xs font-bold font-heading uppercase tracking-wider border transition-colors ${
                      s === selectedString
                        ? 'border-kinetic-blue bg-kinetic-blue text-white'
                        : 'border-kinetic-border text-kinetic-text hover:border-kinetic-blue'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Grip Selection */}
            <div>
              <p className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-3">
                Grip Size
              </p>
              <div className="grid grid-cols-2 gap-3">
                {gripOptions.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrip(g)}
                    className={`py-3 px-4 text-xs font-bold font-heading uppercase tracking-wider border transition-colors ${
                      g === selectedGrip
                        ? 'border-kinetic-blue bg-kinetic-blue text-white'
                        : 'border-kinetic-border text-kinetic-text hover:border-kinetic-blue'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Tension */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">
                  Tension (LBS)
                </p>
                <span className="font-heading font-bold text-2xl text-kinetic-text">{tension}</span>
              </div>
              <input
                type="range"
                min={20}
                max={29}
                value={tension}
                onChange={(e) => setTension(Number(e.target.value))}
                className="w-full accent-kinetic-blue"
              />
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mt-2">
              <button
                className="flex-1 py-4 flex items-center justify-center gap-2 text-white font-heading font-bold text-sm tracking-[1.4px] uppercase"
                style={{ backgroundImage: 'linear-gradient(135deg, #00538F 0%, #006CB7 100%)' }}
              >
                Add to Tactical Kit
              </button>
              <button className="w-14 h-14 border border-kinetic-border flex items-center justify-center text-kinetic-text-muted hover:text-red-500 hover:border-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Engineered Specs */}
      <section className="bg-kinetic-bg-alt px-8 py-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: title + description + progress bars */}
            <div>
              <h2 className="font-heading font-bold text-4xl text-kinetic-text tracking-tighter uppercase leading-tight">
                Engineered<br />Specs
              </h2>
              <p className="text-kinetic-text-secondary text-base leading-7 mt-6">{mockProduct.description}</p>

              <div className="mt-8 space-y-5">
                {/* Balance bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-sans font-bold text-[10px] text-kinetic-blue uppercase tracking-[1.4px]">Head Heavy Balance</span>
                    <span className="font-heading font-bold text-[10px] text-kinetic-green uppercase tracking-[1.4px]">Max Power</span>
                  </div>
                  <div className="h-1 bg-kinetic-border rounded-full">
                    <div className="h-1 bg-kinetic-green rounded-full w-[85%]" />
                  </div>
                </div>
                {/* Flex bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-sans font-bold text-[10px] text-kinetic-blue uppercase tracking-[1.4px]">Shaft Flex</span>
                    <span className="font-heading font-bold text-[10px] text-kinetic-green uppercase tracking-[1.4px]">Stiff</span>
                  </div>
                  <div className="h-1 bg-kinetic-border rounded-full">
                    <div className="h-1 bg-kinetic-green rounded-full w-[75%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: specs grid card */}
            <div className="bg-white p-12">
              {[
                [
                  { label: 'Flex', value: mockProduct.spec.face },
                  { label: 'Frame Material', value: mockProduct.spec.material },
                ],
                [
                  { label: 'Shaft Material', value: mockProduct.spec.frameMaterial },
                  { label: 'Joint Type', value: mockProduct.spec.jointType },
                ],
                [
                  { label: 'Weight / Grip', value: mockProduct.spec.weightGrip },
                  { label: 'Recommended Tension', value: mockProduct.spec.recTension },
                ],
              ].map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`flex gap-12 py-4 ${rowIdx < 2 ? 'border-b border-[#EFEDF0]' : ''}`}
                >
                  {row.map((spec) => (
                    <div key={spec.label} className="flex-1 flex flex-col gap-1">
                      <p className="font-sans font-bold text-[10px] text-kinetic-text-muted uppercase tracking-[1.4px]">
                        {spec.label}
                      </p>
                      <p className="font-heading font-bold text-lg text-kinetic-blue leading-snug">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="px-8 py-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            {/* Left: all tech descriptions stacked */}
            <div className="flex flex-col justify-center gap-16">
              {mockProduct.technologies.map((tech) => (
                <div key={tech.name}>
                  <div className="mb-4 w-10 h-1 bg-kinetic-green" />
                  <h3 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">
                    {tech.name}
                  </h3>
                  <p className="mt-4 text-kinetic-text-secondary text-base leading-7">{tech.description}</p>
                </div>
              ))}
            </div>

            {/* Right: one tall image */}
            <div className="relative min-h-[500px] overflow-hidden rounded-lg">
              <Image
                src="/images/description/description_pic.png"
                alt="Technology"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-6 right-6 bg-white rounded-lg px-4 py-3 max-w-[220px]">
                <p className="font-heading font-bold text-xs text-kinetic-green uppercase tracking-[1px]">Flex Pattern</p>
                <p className="font-sans text-xs text-kinetic-text-secondary mt-1 leading-5">Optimal localized flexing provides increased shuttle hold for enhanced power control.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Your Loadout */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">
              Complete Your Loadout
            </h2>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 font-sans font-bold text-sm text-kinetic-blue tracking-[1.4px] uppercase hover:underline"
            >
              View Collection
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProduct.relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="group">
                <div className="relative bg-kinetic-bg-alt aspect-square mb-4 group-hover:scale-[1.02] transition-transform duration-300 rounded overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-kinetic-blue text-white font-sans font-bold text-[10px] tracking-[1px] uppercase px-2 py-1 rounded">
                    Recommended
                  </span>
                </div>
                <p className="font-sans text-[10px] text-kinetic-text-muted uppercase tracking-[1px]">{item.category}</p>
                <h4 className="font-heading font-bold text-base text-kinetic-text uppercase tracking-tight mt-1">{item.name}</h4>
                <p className="font-heading font-bold text-base text-kinetic-blue mt-1">${item.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
