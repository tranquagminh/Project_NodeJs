'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ChevronRight, Minus, Plus, ArrowLeft, Star } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { useAuth } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getProductBySlug } from '@/services/products';
import { getProductReviews, createReview } from '@/services/reviews';
import { resolveProductImage } from '@/lib/images';
import { playStyleLabel, flexLabel } from '@/lib/enums';

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

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [selectedString, setSelectedString] = useState(stringOptions[0].name);
  const [selectedGrip, setSelectedGrip] = useState(gripOptions[1].name);
  const [tension, setTension] = useState(26);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const { addItem, openDrawer } = useCart();
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    // Don't retry on 404 — product doesn't exist, show error immediately
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => getProductReviews(product!.id),
    enabled: !!product?.id,
  });
  const reviews = reviewsData?.data ?? [];

  const submitReview = useMutation({
    mutationFn: () => createReview({ productId: product!.id, rating: reviewRating, comment: reviewComment }),
    onSuccess: () => {
      success('Review submitted! It will appear after approval.');
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
    },
    onError: (err: any) => toastError(err?.response?.data?.message || 'Failed to submit review. Please try again.'),
  });

  const handleAddToCart = () => {
    if (!product) return;
    const mainImg = product.images?.find((i) => i.isMain)?.url ?? product.images?.[0]?.url ?? '';
    addItem(
      {
        id: `${slug}-${selectedString}-${selectedGrip}-${tension}`,
        productId: product.id,
        name: product.name,
        series: product.spec?.series ?? product.brand?.name ?? '',
        slug,
        price: Number(product.salePrice ?? product.basePrice),
        image: mainImg,
        attrs: [
          { label: `${tension} lbs`, accent: true },
          { label: selectedString, accent: false },
          { label: selectedGrip, accent: false },
          { label: product.spec?.weightGripDesc?.split('·')[0]?.trim() ?? '4U', accent: false },
        ],
      },
      quantity,
    );
    success(`${product.name} added to cart`);
    openDrawer();
  };

  if (isLoading) {
    return (
      <div className="bg-volta-bg min-h-screen">
        <div className="max-w-[1360px] mx-auto px-8 py-20 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-[72px_1fr_420px] gap-6">
            <div />
            <div className="aspect-square bg-volta-bg-3 rounded-lg" />
            <div className="space-y-4">
              <div className="h-4 bg-volta-bg-3 rounded w-1/3" />
              <div className="h-10 bg-volta-bg-3 rounded w-2/3" />
              <div className="h-6 bg-volta-bg-3 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="bg-volta-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading font-bold text-[24px] text-volta-ink">Product not found.</p>
          <Link href="/products" className="inline-flex items-center gap-2 mt-4 text-volta-ink-3 hover:text-volta-ink transition-colors">
            <ArrowLeft size={14} /> Back to rackets
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(product.salePrice ?? product.basePrice);
  const balance = playStyleLabel(product.spec?.playStyle);
  const flex = flexLabel(product.spec?.flex);
  // String/grip/tension selectors only make sense for rackets
  const isRacket = product.category?.slug === 'rackets';
  const images = product.images.length > 0 ? product.images : [{ url: '', isMain: true }];
  const mainImg = resolveProductImage(images[selectedThumb]?.url ?? images[0]?.url ?? '', slug, 'w=800&h=800');

  const specBars = [
    { label: 'Head balance', desc: balance || '—', value: product.spec?.playStyle === 'POWER_HEAD_HEAVY' ? 82 : product.spec?.playStyle === 'SPEED_HEAD_LIGHT' ? 25 : 50 },
    { label: 'Shaft flex', desc: flex || '—', value: product.spec?.flex === 'STIFF' ? 78 : product.spec?.flex === 'MEDIUM' ? 50 : 30 },
    { label: 'Skill level', desc: product.spec?.skillLevel?.toLowerCase() ?? '—', value: product.spec?.skillLevel === 'PROFESSIONAL' ? 90 : product.spec?.skillLevel === 'INTERMEDIATE' ? 55 : 25 },
  ];

  const specCards = [
    { label: 'Flex', value: flex || '—', sub: 'Shaft energy storage' },
    { label: 'Frame', value: product.spec?.frameMaterial || '—', sub: '' },
    { label: 'Shaft', value: product.spec?.shaftMaterial || '—', sub: '' },
    { label: 'Joint', value: product.spec?.jointType || '—', sub: '' },
    { label: 'Weight · grip', value: product.spec?.weightGripDesc || '—', sub: '' },
    { label: 'Tension range', value: product.spec?.recommendedTension || '—', sub: 'Recommended' },
    { label: 'Series', value: product.spec?.series || product.brand?.name || '—', sub: '' },
    { label: 'Category', value: product.category?.name || '—', sub: '' },
  ];

  return (
    <div className="bg-volta-bg min-h-screen">
      {/* ── Breadcrumb ── */}
      <nav className="max-w-[1360px] mx-auto px-8 pt-6 pb-2">
        <ol className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] uppercase text-volta-ink-3">
          <li><Link href="/" className="hover:text-volta-ink transition-colors">Home</Link></li>
          <li className="text-volta-ink-4">/</li>
          <li><Link href="/products" className="hover:text-volta-ink transition-colors">Rackets</Link></li>
          {product.spec?.series && (
            <>
              <li className="text-volta-ink-4">/</li>
              <li className="text-volta-ink-4">{product.spec.series}</li>
            </>
          )}
          <li className="text-volta-ink-4">/</li>
          <li className="text-volta-ink">{product.name}</li>
        </ol>
      </nav>

      {/* ── Product Top Section ── */}
      <section className="max-w-[1360px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[72px_1fr_420px] gap-6 items-start">
          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3">
            {images.slice(0, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedThumb(i)}
                className={`w-[72px] h-[72px] rounded bg-volta-bg-2 border flex items-center justify-center overflow-hidden transition-colors ${
                  selectedThumb === i ? 'border-volta-ink' : 'border-volta-line hover:border-volta-ink-4'
                }`}
              >
                <Image
                  src={resolveProductImage(img.url, slug, 'w=80&h=80')}
                  alt={`View ${i + 1}`}
                  width={72}
                  height={72}
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative aspect-square rounded-lg bg-volta-bg-2 overflow-hidden">
            <Image src={mainImg} alt={product.name} fill className="object-contain p-8" priority />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">
              {product.spec?.series ?? product.brand?.name ?? ''} {balance ? `· ${balance}` : ''}
            </p>

            <h1 className="font-heading font-bold text-[clamp(28px,3vw,42px)] tracking-[-0.02em] leading-[0.95] text-volta-ink">
              {product.name}
            </h1>

            {Number(product.avgRating) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 text-volta-accent">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(Number(product.avgRating)) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-volta-ink-3">
                  {Number(product.avgRating).toFixed(1)} rating
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-[36px] tracking-[-0.02em] text-volta-ink">${price}</span>
              {product.salePrice && (
                <span className="font-mono text-[14px] text-volta-ink-3 line-through">${Number(product.basePrice)}</span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink bg-volta-accent-soft px-2 py-1 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-volta-accent" />
                In stock · ships today
              </span>
            </div>

            <div className="h-px bg-volta-line" />

            {/* String / grip / tension — rackets only */}
            {isRacket && <>
              <div>
                <div className="flex justify-between mb-2.5">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3">Select performance string</p>
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">Recommended · BG80</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {stringOptions.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedString(s.name)}
                      className={`px-3.5 py-3 rounded text-left flex justify-between items-center transition-all ${
                        s.name === selectedString ? 'bg-volta-ink text-white border border-volta-ink' : 'bg-white border border-volta-line hover:border-volta-ink-4'
                      }`}
                    >
                      <div>
                        <div className="font-heading font-bold text-[13px]">{s.name}</div>
                        <div className={`font-mono text-[10px] mt-0.5 ${s.name === selectedString ? 'text-white/70' : 'text-volta-ink-3'}`}>{s.sub}</div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16} className={`transition-opacity ${s.name === selectedString ? 'opacity-100' : 'opacity-0'}`}>
                        <path d="M5 12l5 5 9-11" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grip options */}
              <div>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3 mb-2.5">Grip size</p>
                <div className="grid grid-cols-4 gap-2">
                  {gripOptions.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => setSelectedGrip(g.name)}
                      className={`px-3.5 py-3 rounded text-left transition-all ${
                        g.name === selectedGrip ? 'bg-volta-ink text-white border border-volta-ink' : 'bg-white border border-volta-line hover:border-volta-ink-4'
                      }`}
                    >
                      <div className="font-heading font-bold text-[13px]">{g.name}</div>
                      <div className={`font-mono text-[10px] mt-0.5 ${g.name === selectedGrip ? 'text-white/70' : 'text-volta-ink-3'}`}>{g.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tension */}
              <div>
                <div className="flex justify-between mb-2.5">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-ink-3">String tension</p>
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink">Recommended · 26 lbs</p>
                </div>
                <div className="bg-volta-bg-2 rounded-lg p-4">
                  <div className="font-heading font-bold text-[32px] tracking-[-0.02em] text-volta-ink">
                    {tension}
                    <span className="font-mono text-[13px] font-normal text-volta-ink-3 ml-1.5 tracking-[0.08em] uppercase">lbs</span>
                  </div>
                  <input type="range" min={20} max={31} value={tension} onChange={(e) => setTension(Number(e.target.value))} className="w-full accent-volta-ink mt-3.5 mb-1" />
                  <div className="flex justify-between font-mono text-[10px] text-volta-ink-3 tracking-[0.06em]">
                    <span>20</span><span>23</span><span>26</span><span>28</span><span>31</span>
                  </div>
                </div>
              </div>
            </>}

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
              <div className="flex items-center border border-volta-line rounded overflow-hidden bg-white">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-12 flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-2 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="min-w-[36px] text-center font-mono font-medium text-[13px] text-volta-ink">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-12 flex items-center justify-center text-volta-ink-2 hover:bg-volta-bg-2 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => setWishlist((w) => !w)}
                className={`w-12 h-12 rounded border flex items-center justify-center transition-colors ${
                  wishlist ? 'border-red-400 text-red-500 bg-red-50' : 'border-volta-line text-volta-ink-2 bg-white hover:border-volta-ink hover:text-volta-ink'
                }`}
              >
                <Heart size={18} fill={wishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Perks grid */}
            <div className="grid grid-cols-2 border border-volta-line rounded overflow-hidden mt-5">
              {[
                { icon: 'M3 7h13l4 5v4h-2M3 7v10h14M3 7L8 4h8l3 3', title: 'Free shipping', sub: 'Orders over $100' },
                { icon: 'M12 8v4l2.5 2.5 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', title: '48-hour stringing', sub: 'By certified stringers' },
                { icon: 'M12 3l9 4v5c0 5-4 8-9 9-5-1-9-4-9-9V7l9-4z', title: '2-year warranty', sub: 'Frame breakage' },
                { icon: 'M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9 M21 3l-9 9-3-3', title: '30-day returns', sub: 'On-court trial' },
              ].map((perk, i) => (
                <div key={perk.title} className={`px-3.5 py-3 flex gap-2.5 items-start bg-white ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''} border-volta-line`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18} className="text-volta-ink-2 shrink-0 mt-0.5">
                    <path d={perk.icon} />
                  </svg>
                  <div>
                    <p className="text-[12px] font-semibold text-volta-ink">{perk.title}</p>
                    <p className="text-[11px] text-volta-ink-3 mt-0.5">{perk.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Frame Specs ── */}
      <section className="border-t border-volta-line">
        <div className="max-w-[1360px] mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-3">Engineered specs</p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-[1] text-volta-ink">
                {product.spec?.playStyle === 'POWER_HEAD_HEAVY' ? 'Built for the back-court attacker.' : product.spec?.playStyle === 'SPEED_HEAD_LIGHT' ? 'Built for speed and net play.' : 'Built for control and precision.'}
              </h2>
              <p className="text-volta-ink-2 text-[15px] leading-[1.6] mt-5 max-w-[480px]">
                {product.description ?? product.shortDescription ?? ''}
              </p>
              <div className="mt-10 space-y-6">
                {specBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-volta-ink-3">{bar.label}</span>
                      <span className="font-mono text-[11px] tracking-[0.04em] text-volta-ink capitalize">{bar.desc}</span>
                    </div>
                    <div className="h-1 bg-volta-bg-3 rounded-full">
                      <div className="h-1 bg-volta-ink rounded-full transition-all" style={{ width: `${bar.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-volta-line rounded-lg overflow-hidden">
              {specCards.map((card) => (
                <div key={card.label} className="bg-white p-6 flex flex-col gap-1">
                  <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-volta-ink-3">{card.label}</p>
                  <p className="font-heading font-bold text-[15px] tracking-[-0.01em] text-volta-ink leading-snug">{card.value}</p>
                  {card.sub && <p className="text-[11px] text-volta-ink-3 mt-0.5">{card.sub}</p>}
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
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">Complete your loadout</p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-[1] text-volta-ink">Frequently played together.</h2>
            </div>
            <Link href="/products" className="hidden md:inline-flex items-center gap-1.5 font-heading font-medium text-[12px] tracking-[0.08em] uppercase text-volta-ink-2 pb-1 border-b border-volta-line hover:text-volta-ink hover:border-volta-ink transition-colors">
              View collection
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'Power Cushion 65 Z3', category: 'Footwear', price: 165, slug: 'power-cushion-65-z3', img: 'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
              { name: 'Pro Tournament Bag', category: 'Equipment', price: 95, slug: 'pro-tournament-bag', img: 'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
              { name: 'Aerosensa 50 (12pk)', category: 'Essentials', price: 42, slug: 'aerosensa-50', img: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg?auto=compress&cs=tinysrgb&w=400&h=440&fit=crop' },
            ].map((item) => (
              <Link key={item.slug} href={`/products/${item.slug}`} className="group border border-volta-line rounded-lg overflow-hidden hover:border-volta-ink-4 hover:shadow-md transition-all">
                <div className="relative aspect-[1/1.1] bg-volta-bg-2 overflow-hidden">
                  <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-accent-ink">{item.category}</p>
                  <h4 className="font-heading font-bold text-[17px] tracking-[-0.01em] text-volta-ink">{item.name}</h4>
                  <p className="font-heading font-bold text-[17px] text-volta-ink mt-1">${item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="border-t border-volta-line bg-volta-bg">
        <div className="max-w-[1360px] mx-auto px-8 py-20">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">Customer reviews</p>
          <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-[1] text-volta-ink mb-10">
            What players say.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            {/* Review list */}
            <div className="flex flex-col gap-6">
              {reviews.length === 0 ? (
                <p className="text-volta-ink-3 text-[15px]">No reviews yet. Be the first to share your experience.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-volta-line p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-volta-ink flex items-center justify-center text-white font-heading font-bold text-[13px]">
                          {r.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-[14px] text-volta-ink">{r.user.fullName}</p>
                          <p className="font-mono text-[10px] text-volta-ink-3 tracking-[0.08em]">
                            {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-volta-line fill-volta-line'} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-[14px] text-volta-ink-2 leading-relaxed">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Submit form */}
            <div className="bg-white rounded-xl border border-volta-line p-6 h-fit">
              {user ? (
                <>
                  <h3 className="font-heading font-bold text-[20px] tracking-[-0.01em] text-volta-ink mb-1">Write a review</h3>
                  <p className="text-[13px] text-volta-ink-3 mb-5">Share your experience with this racket.</p>
                  <div className="mb-4">
                    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-2">Your rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="p-0.5"
                        >
                          <Star
                            size={22}
                            className={s <= (reviewHover || reviewRating) ? 'text-amber-400 fill-amber-400' : 'text-volta-line fill-volta-line'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Comment</label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you think of the racket's feel, power, and control?"
                      className="w-full py-3 px-4 border border-volta-line rounded-[10px] text-[14px] bg-white text-volta-ink focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 outline-none transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => submitReview.mutate()}
                    disabled={submitReview.isPending}
                    className="w-full py-3.5 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors disabled:opacity-60"
                  >
                    {submitReview.isPending ? 'Submitting…' : 'Submit review'}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-volta-ink-2 text-[14px] mb-4">Sign in to leave a review.</p>
                  <Link
                    href={`/login?redirect=/products/${slug}`}
                    className="inline-flex items-center gap-2 py-3 px-6 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:bg-volta-ink-2 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
