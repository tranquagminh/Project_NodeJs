import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { LeafPowerIcon, CircleIcon } from '@/components/icons';

const athletes = [
  { name: 'VIKTOR AXELSEN', title: 'World No. 1, Denmark', img: '/images/word-class/word-class1.png' },
  { name: 'AN SE-YOUNG', title: 'World Champion', img: '/images/word-class/word-class2.png' },
  { name: 'KENTO MOMOTA', title: 'Olympic Gold, Japan', img: '/images/word-class/word-class3.png' },
];

export default function HomePage() {
  return (
    <div className="bg-kinetic-bg">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative bg-kinetic-blue min-h-[700px] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/hero/hero-track-bg.png"
          alt=""
          fill
          className="object-cover object-center opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-kinetic-blue via-kinetic-blue/60 to-transparent" />

        <div className="relative max-w-[1280px] mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          <div className="flex flex-col gap-4">
            <p className="font-heading font-bold text-kinetic-green-light text-xs tracking-[2.4px] uppercase">
              New Precision Standard
            </p>
            <h1 className="font-heading font-bold text-[80px] xl:text-[128px] leading-none text-white tracking-tighter uppercase">
              ASTROX<br />
              <span className="text-kinetic-green-light">100 ZZ</span>
            </h1>
            <p className="text-kinetic-blue-pale text-lg leading-7 max-w-md opacity-90 mt-2">
              Engineered for the relentless attacker. Featuring the Hyper Slim Shaft and
              Rotational Generator System for unparalleled smash power and swing speed.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/products/astrox-100-zz"
                className="inline-flex items-center justify-center px-8 py-4 font-heading font-bold text-sm text-white tracking-[0.8px] uppercase rounded shadow-lg"
                style={{ backgroundImage: 'linear-gradient(135deg, #00538f 0%, #006cb7 100%)' }}
              >
                Explore Technology
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 font-heading font-bold text-sm text-white tracking-[0.8px] uppercase rounded border border-white/20 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
          {/* Racket product image */}
          <div className="hidden lg:flex items-center justify-end">
            <Image
              src="/images/hero/hero-track.png"
              alt="Astrox 100ZZ Racket"
              width={600}
              height={600}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* ═══════════ NEW ARRIVALS - BENTO GRID ═══════════ */}
      <section className="px-8 py-24 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="font-heading font-bold text-5xl text-kinetic-blue tracking-tighter uppercase">
              New Series
            </h2>
            <div className="mt-4 w-24 h-1 bg-kinetic-green" />
          </div>
          <Link
            href="/products?sort=newest"
            className="hidden md:flex items-center gap-2 font-sans font-bold text-sm text-kinetic-blue tracking-[1.4px] uppercase hover:underline"
          >
            View All Collections
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-6 lg:h-[800px]">
          {/* Large Feature Card */}
          <div className="lg:col-span-2 lg:row-span-2 bg-white relative overflow-hidden flex flex-col justify-between p-8 min-h-[400px]">
            <div className="relative z-10">
              <span className="inline-block bg-kinetic-green px-2 py-0.5 text-white font-sans font-bold text-[10px] tracking-[1px] uppercase">
                Elite Series
              </span>
              <h3 className="mt-4 font-heading font-bold text-4xl text-kinetic-text uppercase leading-tight">
                POWER CUSHION<br />INFINITY 2
              </h3>
              <p className="mt-2 text-kinetic-text-muted text-base max-w-[320px] leading-6">
                Double BOA Fit System for ultimate stability and high-performance footwork.
              </p>
            </div>
            <div className="absolute bottom-[-100px] right-0 w-[80%] h-[80%] rounded">
              <Image
                src="/images/arrivals/arrival_shoe.png"
                alt="Power Cushion Infinity 2 Shoe"
                fill
                className="object-contain absolute -top-12 -right-12"
                
              />  
            </div>
            <div className="relative z-10 pt-8">
              <Link href="/products" className="font-sans font-bold text-sm text-kinetic-text uppercase border-b-2 border-kinetic-blue pb-0.5 hover:text-kinetic-blue transition-colors">
                Quick Buy
              </Link>
            </div>
          </div>

          {/* Nanoflare Card */}
          <div className="bg-white border-b-4 border-transparent overflow-hidden flex flex-col p-6 gap-1 hover:border-kinetic-green transition-colors min-h-[250px]">
            <h3 className="font-heading font-bold text-xl text-kinetic-text uppercase">NANOFLARE 1000Z</h3>
            <p className="font-sans font-bold text-xs text-kinetic-green">Speed Re-engineered</p>
            <div className="flex-1 bg-kinetic-bg-alt mt-2 rounded">
              <Image
                src="/images/arrivals/arrival_racket.png"
                alt="Nanoflare 1000Z Racket"
                width={300}
                height={200}
                className="object-contain h-full w-full"
              />
            </div>
          </div>

          {/* Aerobite Card */}
          <div className="bg-white border-b-4 border-transparent overflow-hidden relative p-6 hover:border-kinetic-blue transition-colors min-h-[250px]">
            <h3 className="font-heading font-bold text-xl text-kinetic-text uppercase">AEROBITE BOOST</h3>
            <p className="font-sans font-bold text-xs text-kinetic-green mt-1">Hybrid Power String</p>
            <div className="absolute bottom-0 left-0 right-0 h-[70%]">
              <Image
                src="/images/arrivals/arrival_boost.png"
                alt="Aerobite Boost String"
                fill
                className="object-contain object-bottom opacity-90"
              />
            </div>
          </div>

          {/* Tournament Gear */}
          <div className="relative lg:col-span-2 bg-kinetic-blue overflow-hidden relative p-8 flex flex-col justify-center min-h-[250px]">
            <h3 className="font-heading font-bold text-3xl text-white uppercase">Tournament Gear</h3>
            <p className="mt-2 text-kinetic-blue-muted text-base">
              Equipping the world&apos;s best since 1994.
            </p>
            
            <Link
              href="/products?category=apparel"
              className="inline-flex items-center justify-center mt-4 px-6 py-3 bg-kinetic-green text-white font-sans font-bold text-xs tracking-[1.2px] uppercase rounded hover:bg-kinetic-green/90 transition-colors w-fit"
            >
              Shop Apparel
            </Link>
            <Image
              src="/images/arrivals/arrival_shirt.png"
              alt="Tournament Gear"
              width={300}
              height={200}
              className="absolute top-0 right-4 object-contain h-full w-auto"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ ENGINEERED TO DOMINATE ═══════════ */}
      <section className="relative px-8 py-24 bg-kinetic-blue overflow-hidden">
        {/* Ghost background text */}
        <span className="pointer-events-none select-none absolute top-1/2 left-3/10 -translate-x-1/2 -translate-y-1/2 font-heading font-bold text-[200px] lg:text-[280px] leading-none tracking-tighter uppercase text-white/5 whitespace-nowrap">
          TECH
        </span>

        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <h2 className="font-heading font-bold text-6xl lg:text-7xl text-white tracking-tighter uppercase leading-none">
                ENGINEERED<br />TO DOMINATE
              </h2>
              <div className="mt-12 space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                    <LeafPowerIcon className="w-5 h-5 text-kinetic-green-light" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-white uppercase tracking-wide">Power Cushion+</h4>
                    <p className="mt-1 text-white/50 text-sm leading-6">
                      A raw egg can be dropped from 12 metres above the Power Cushion+ mat, rebounding to a height of 6 metres without breaking.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                    <CircleIcon className="w-5 h-5 text-kinetic-green-light" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-white uppercase tracking-wide">Rotational Generator System</h4>
                    <p className="mt-1 text-white/50 text-sm leading-6">
                      Weight distribution in the grip end, frame top and the joint for maximum control and faster follow-through transition.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: asymmetric 2-column layout */}
            <div className="flex gap-4 h-[520px]">
              {/* Left column: racket (tall) + 28% stat (short) */}
              <div className="flex flex-col gap-4 flex-1">
                <div className="relative rounded-lg overflow-hidden bg-black/40 flex-1">
                  <Image
                    src="/images/technology/technology_racket.png"
                    alt="Racket technology"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="rounded p-5 shrink-0 border border-white/10 bg-white/5 backdrop-blur-md">
                  <p className="text-4xl font-heading font-bold text-kinetic-green-light">28%</p>
                  <p className="text-white/60 text-xs uppercase tracking-wider mt-1">More Shock Absorption</p>
                </div>
              </div>

              {/* Right column: 62% stat (short) + increase image (tall) */}
              <div className="flex flex-col gap-4 flex-1">
                <div className="bg-kinetic-green rounded-lg p-5 shrink-0">
                  <p className="text-4xl font-heading font-bold text-white">62%</p>
                  <p className="text-white/60 text-xs uppercase tracking-wider mt-1">Increased Repulsion</p>
                </div>
                <div className="relative rounded-lg overflow-hidden bg-black/40 flex-1">
                  <Image
                    src="/images/technology/technology_increase.png"
                    alt="Technology increase"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TEAM KINETIC ═══════════ */}
      <section className="px-8 py-24 bg-kinetic-bg">
        <div className="max-w-[1400px] mx-auto text-left">
          
          <h2 className="font-heading font-bold text-5xl text-kinetic-blue tracking-tighter uppercase mb-4">
            Team Kinetic
          </h2>
          <p className="font-heading font-bold text-xs text-kinetic-text-muted tracking-[2.4px] uppercase">
            Choose by champions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-16">
            {athletes.map((athlete) => (
              <div key={athlete.name} className="group relative overflow-hidden aspect-[3/4] bg-kinetic-text">
                <Image
                  src={athlete.img}
                  alt={athlete.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h3 className="font-heading font-bold text-2xl text-white uppercase tracking-tight">{athlete.name}</h3>
                  <p className="mt-1 font-sans text-sm text-kinetic-green-light uppercase">{athlete.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TECHNICAL BLUEPRINT ═══════════ */}
      <section className="bg-kinetic-bg px-8 py-24 bg-kinetic-bg-alt">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: product image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-kinetic-bg-alt">
              <Image
                src="/images/product-feature/product-spec.png"
                alt="Technical Blueprint Racket"
                fill
                className="object-cover"
              />
            </div>

            {/* Right: specs */}
            <div className="flex flex-col gap-8">
              <h2 className="font-heading font-bold text-4xl text-kinetic-blue tracking-tighter uppercase">
                Technical Blueprint
              </h2>

              <div className="flex flex-col">
                {[
                  { label: 'Flex', value: 'Extra Stiff' },
                  { label: 'Frame', value: 'HM Graphite / Namd' },
                  { label: 'Weight / Grip', value: '4U (Avg. 83g) G5' },
                  { label: 'Stringing Advice', value: '20 - 28 lbs' },
                ].map((spec, i) => (
                  <div key={spec.label} className={`flex items-center justify-between py-5 ${i !== 0 ? 'border-t border-kinetic-border' : ''}`}>
                    <p className="font-sans text-xs text-kinetic-text-muted uppercase tracking-[1.4px]">{spec.label}</p>
                    <p className="font-heading font-bold text-kinetic-blue">{spec.value}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-kinetic-blue text-white font-heading font-bold text-sm tracking-[1.4px] uppercase hover:bg-kinetic-blue-dark transition-colors"
              >
                Configure Your Racket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
