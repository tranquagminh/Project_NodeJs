'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const products = [
  { id: 'x1', series: 'Vector', title: 'Vector X1 Pro', sub: 'Offensive · head-heavy', price: 265, balance: 'HEAD HEAVY', stiff: 'STIFF', badge: 'NEW', accent: true, slug: 'vector-x1-pro', img: '/images/products/product1.png' },
  { id: 'v800', series: 'Pulse', title: 'Pulse 800 Pro', sub: 'Speed · head-light', price: 240, balance: 'HEAD LIGHT', stiff: 'STIFF', slug: 'pulse-800-pro', img: '/images/products/product2.png' },
  { id: 'a11', series: 'Arc', title: 'Arc 11 Pro', sub: 'Control · even balance', price: 255, balance: 'EVEN', stiff: 'STIFF', slug: 'arcsaber-11-pro', img: '/images/products/product3.png' },
  { id: 'x88', series: 'Vector', title: 'Vector 88D Pro', sub: 'Offensive · rotational', price: 235, balance: 'HEAD HEAVY', stiff: 'STIFF', badge: 'BEST SELLER', slug: 'astrox-88d-pro', img: '/images/products/product4.png' },
];

const athletes = [
  { name: 'Arlo Hansen', rank: 'World #4 · 2025 season', country: 'DEN · Men\'s Singles', gear: 'Plays the Vector X1 Pro · 3U G5 · 28 lbs', img: '/images/word-class/word-class1.png' },
  { name: 'Mei Tanaka', rank: 'World #2 · 2025 season', country: 'JPN · Women\'s Singles', gear: 'Plays the Pulse 800 Pro · 4U G6 · 26 lbs', img: '/images/word-class/word-class2.png' },
  { name: 'Ravi Kulkarni', rank: 'World #6 · 2025 season', country: 'IND · Men\'s Doubles', gear: 'Plays the Arc 11 Pro · 4U G5 · 30 lbs', img: '/images/word-class/word-class3.png' },
];

export default function HomePage() {
  return (
    <div className="bg-volta-bg">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative border-b border-volta-line overflow-hidden py-20 lg:py-24">
        <div className="max-w-[1360px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">
              New · Vector Series 2026
            </p>
            <h1 className="font-heading font-bold text-[clamp(56px,9vw,132px)] leading-[0.88] tracking-[-0.035em] text-volta-ink mt-4 mb-6">
              Aerodynamics,<br/>refined to a <span className="text-volta-accent-ink">point.</span>
            </h1>
            <p className="text-[17px] text-volta-ink-2 max-w-[440px] leading-relaxed mb-8">
              The Vector X1 pairs a 6.5mm shaft with a computer-optimized frame profile, giving you a cleaner swing path and a measurably faster recovery between shots.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/products/vector-x1-pro"
                className="inline-flex items-center justify-center gap-2 font-heading font-medium text-[13px] tracking-[0.08em] uppercase px-6 py-4 bg-volta-ink text-white rounded hover:bg-volta-ink-2 transition-colors"
              >
                Shop the Vector X1
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 font-heading font-medium text-[13px] tracking-[0.08em] uppercase px-6 py-4 border border-volta-ink text-volta-ink rounded hover:bg-volta-ink hover:text-white transition-colors"
              >
                All rackets
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 pt-6 border-t border-volta-line max-w-[520px]">
              <div>
                <div className="font-heading font-bold text-[28px] text-volta-ink">6.5<span className="text-base text-volta-ink-3">mm</span></div>
                <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-volta-ink-3 mt-0.5">Shaft diameter</div>
              </div>
              <div>
                <div className="font-heading font-bold text-[28px] text-volta-ink">83g</div>
                <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-volta-ink-3 mt-0.5">Frame weight</div>
              </div>
              <div>
                <div className="font-heading font-bold text-[28px] text-volta-ink">31<span className="text-base text-volta-ink-3">lbs</span></div>
                <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-volta-ink-3 mt-0.5">Max tension</div>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-lg bg-gradient-to-br from-volta-bg-2 to-volta-bg-3 overflow-hidden">
            <Image
              src="/images/hero/hero-track.png"
              alt="Vector X1 Pro Racket"
              fill
              className="object-contain p-8"
              priority
            />
            <div className="absolute top-6 right-6 bg-volta-accent text-[#002812] font-mono text-[10px] font-medium tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-sm">
              In stock
            </div>
            <div className="absolute left-6 bottom-6 bg-volta-ink text-white font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-2 rounded-sm">
              VECTOR / X1 PRO / OFFENSIVE
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE ROW ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-volta-line border-b border-volta-line">
        {[
          { num: '01', title: 'Free expert stringing', desc: 'Hand-strung by certified stringers in our Richmond workshop. Turnaround under 48 hours.' },
          { num: '02', title: '30-day on-court trial', desc: 'Play it for a month. If it isn\'t the racket for you, send it back — we\'ll cover the return.' },
          { num: '03', title: 'Lifetime frame service', desc: 'Out-of-warranty repairs, regripping and paint-touch on any frame we\'ve ever sold. Flat $20.' },
          { num: '04', title: 'Expert matchmaking', desc: 'Chat with a former national team stringer about the right weight, balance and tension for your game.' },
        ].map((f) => (
          <div key={f.num} className="bg-volta-bg p-7 flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-[0.12em] text-volta-ink-4">{f.num}</span>
            <h3 className="font-heading font-bold text-base tracking-[-0.01em]">{f.title}</h3>
            <p className="text-[13px] text-volta-ink-3 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ═══════════ NEW ARRIVALS ═══════════ */}
      <section className="py-20 border-b border-volta-line">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="flex justify-between items-end gap-6 mb-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">Drop · Spring 2026</p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-none mt-2">New arrivals</h2>
            </div>
            <Link href="/products" className="hidden md:inline-flex items-center gap-1.5 font-heading text-[12px] font-medium tracking-[0.08em] uppercase text-volta-ink-2 border-b border-volta-line hover:text-volta-ink hover:border-volta-ink pb-1 transition-colors">
              View all 24
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white border border-volta-line rounded-lg overflow-hidden hover:border-volta-ink-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
                <div className="relative aspect-[1/1.1] bg-volta-bg-2 overflow-hidden">
                  {p.badge && (
                    <span className={`absolute top-3 left-3 z-10 ${p.accent ? 'bg-volta-accent text-[#002812]' : 'bg-volta-ink text-white'} font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-sm`}>
                      {p.badge}
                    </span>
                  )}
                  {/* Wishlist button */}
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-volta-line flex items-center justify-center text-volta-ink-3 hover:text-volta-ink transition-colors"
                    aria-label={`Save ${p.title}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.2l-1.7-1.6a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1z"/></svg>
                  </button>
                  <Image src={p.img} alt={p.title} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                  {/* Quick view button — slides up on hover */}
                  <span className="absolute left-3 right-3 bottom-3 z-10 bg-volta-ink text-white font-heading font-medium text-[12px] tracking-[0.1em] uppercase py-3 rounded flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    Quick view <ArrowRight size={12} />
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-accent-ink">{p.series} Series</span>
                  <h3 className="font-heading font-bold text-[17px] tracking-[-0.01em] text-volta-ink">{p.title}</h3>
                  <p className="text-[13px] text-volta-ink-3">{p.sub}</p>
                  <div className="flex justify-between items-center mt-2.5 pt-3 border-t border-volta-line-2">
                    <span className="font-heading font-bold text-[18px] text-volta-ink">${p.price}</span>
                    <div className="flex gap-1">
                      <span className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 bg-volta-bg-2 text-volta-ink-2 rounded-sm">{p.balance}</span>
                      <span className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 bg-volta-bg-2 text-volta-ink-2 rounded-sm">{p.stiff}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ENGINEERED / TECH ═══════════ */}
      <section className="bg-volta-ink text-white py-24">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="flex justify-between items-end gap-6 mb-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent">Under the paint</p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-none mt-2 text-white">
                Engineering that<br/>earns the swing.
              </h2>
            </div>
            <span className="hidden md:inline-flex font-heading text-[12px] font-medium tracking-[0.08em] uppercase text-white/70 border-b border-white/20 pb-1">
              Technology index
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
            <div className="flex flex-col gap-0">
              {[
                { icon: '+', title: 'Hyper-slim 6.5mm shaft', desc: 'Smaller frontal area cuts drag on the upswing. Independently measured 12% faster recovery vs. prior-generation Vector shaft.' },
                { icon: '◎', title: 'Counter-mass head geometry', desc: 'Tungsten micro-weights placed at 3 and 9 o\'clock stabilize the swing plane for more forgiveness on off-center contact.' },
                { icon: '⬡', title: 'Nanoresin T-joint', desc: 'Single-piece frame-to-shaft bond removes the traditional joint sleeve, improving energy transfer on full-swing smashes.' },
              ].map((tech) => (
                <div key={tech.title} className="py-6 border-t border-white/12 grid grid-cols-[36px_1fr_auto] gap-5 items-start cursor-pointer hover:opacity-85 transition-opacity">
                  <div className="w-9 h-9 border border-white/30 rounded-full flex items-center justify-center text-volta-accent text-sm">
                    {tech.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[15px] tracking-[0.02em] uppercase">{tech.title}</h4>
                    <p className="mt-1 text-white/70 text-[13px] leading-relaxed max-w-[380px]">{tech.desc}</p>
                  </div>
                  <span className="text-white/50">›</span>
                </div>
              ))}
            </div>
            <div className="bg-white/4 border border-white/12 rounded-lg p-8 flex flex-col justify-between">
              <div>
                <div className="font-heading font-bold text-[clamp(80px,12vw,180px)] leading-[0.9] tracking-[-0.04em] text-volta-accent">
                  12<span className="text-[0.4em] text-white/70">%</span>
                </div>
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/70 max-w-[280px] mt-4">
                  Faster frame-to-contact recovery vs. Vector Gen 2 (lab: 8 players, 400 swings each).
                </p>
                <p className="font-mono text-[9px] tracking-[0.08em] text-white/40 mt-2">
                  Internal testing, Feb 2026 · methodology on request
                </p>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-white/12 mt-6">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.12em] text-white/50 uppercase">Reference</div>
                  <div className="font-heading font-medium text-sm mt-1">Vector X1 Pro · 4U G5</div>
                </div>
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/90 border-b border-white/30 pb-0.5">
                  Read the paper →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ATHLETES ═══════════ */}
      <section className="py-20 border-b border-volta-line">
        <div className="max-w-[1360px] mx-auto px-8">
          <div className="flex justify-between items-end gap-6 mb-8">
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">Team Volta</p>
              <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,44px)] tracking-[-0.02em] leading-none mt-2">
                Chosen by athletes<br/>who count grams.
              </h2>
            </div>
            <Link href="/about" className="hidden md:inline-flex font-heading text-[12px] font-medium tracking-[0.08em] uppercase text-volta-ink-2 border-b border-volta-line hover:text-volta-ink hover:border-volta-ink pb-1 transition-colors">
              Meet the team
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {athletes.map((a) => (
              <div key={a.name} className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-volta-ink cursor-pointer hover:-translate-y-1 transition-transform">
                <Image src={a.img} alt={a.name} fill className="object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-10 group-hover:translate-y-0 transition-transform">
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-accent">{a.rank}</p>
                  <h3 className="font-heading font-bold text-[28px] tracking-[-0.01em] text-white mt-1">{a.name}</h3>
                  <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-white/70">{a.country}</p>
                  <div className="mt-3.5 pt-3.5 border-t border-white/20 text-[12px] text-white/80">{a.gear}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA STRIP ═══════════ */}
      <section className="bg-volta-bg-2 py-[72px] border-b border-volta-line">
        <div className="max-w-[1360px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">Racket fitting</p>
            <h2 className="font-heading font-bold text-[clamp(28px,3.5vw,42px)] tracking-[-0.02em] mt-2">Not sure which frame to pick?</h2>
            <p className="text-volta-ink-2 text-[15px] mt-2 max-w-[520px]">
              Answer five quick questions about your play style and we&apos;ll match you to the right weight, balance and stiffness — or book a call with one of our stringers.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button className="font-heading font-medium text-[13px] tracking-[0.08em] uppercase px-6 py-4 bg-volta-ink text-white rounded hover:bg-volta-ink-2 transition-colors">
              Start the fit
            </button>
            <Link href="/contact" className="font-heading font-medium text-[13px] tracking-[0.08em] uppercase px-6 py-4 border border-volta-ink text-volta-ink rounded hover:bg-volta-ink hover:text-white transition-colors">
              Book a call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
