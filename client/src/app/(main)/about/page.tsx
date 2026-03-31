import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const timeline = [
  { year: '2012', title: 'Foundation', desc: 'Incorporated in the Nanostructures Lab of the Switzerland Innovation Centre with our founding blend of badminton engineering.' },
  { year: '2016', title: 'Global Partnership', desc: 'First partnership signed with the Asian Badminton Confederation for high-speed shuttlecock & racquet innovation.' },
  { year: '2020', title: 'Olympic Promise', desc: 'Awarded Olympic licensing rights for competition-class rackets after Kinetic composites achieved independent third-party fusion validation testing.' },
  { year: '2024', title: 'Precision Series', desc: 'Launch of the Precision Series featuring NAMD carbon neural integration for real-time ballistic feedback during training sessions.' },
];

const athletes = [
  { name: 'HIROKI SATO', img: '/images/athlete-hiroki.jpg' },
  { name: 'ELENA ROSSI', img: '/images/athlete-elena.jpg' },
  { name: 'LIAM CHEN', img: '/images/athlete-liam.jpg' },
];

export default function AboutPage() {
  return (
    <div className="bg-kinetic-bg">
      {/* Hero Section */}
      <section className="relative bg-kinetic-blue min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('/images/about-hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-kinetic-blue via-kinetic-blue/70 to-transparent" />
        <div className="relative max-w-[1280px] mx-auto px-8 w-full py-24">
          <p className="font-heading font-bold text-xs text-kinetic-green-light tracking-[2.4px] uppercase mb-4">
            The Kinetic Engineering
          </p>
          <h1 className="font-heading font-bold text-[64px] lg:text-[96px] leading-none text-white tracking-tighter uppercase">
            PRECISION<br />
            <span className="text-kinetic-green-light">IN MOTION.</span>
          </h1>
          <p className="mt-6 text-kinetic-blue-pale text-lg leading-7 max-w-lg opacity-90">
            We don&apos;t just manufacture a gear. We engineer kinetic energy. Every stroke, drive, and flick is a result of calculated physics perfected between lab sessions and live courts.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 font-heading font-bold text-sm text-white tracking-[0.8px] uppercase rounded"
              style={{ backgroundImage: 'linear-gradient(135deg, #00538f 0%, #006cb7 100%)' }}
            >
              Explore Labs
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 font-heading font-bold text-sm text-white tracking-[0.8px] uppercase rounded border border-white/20 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors">
              Watch Theory
            </button>
          </div>
        </div>
      </section>

      {/* Engineering Philosophy */}
      <section className="px-8 py-24 bg-kinetic-bg-alt">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-video bg-kinetic-text rounded-lg overflow-hidden" />
          <div>
            <h2 className="font-heading font-bold text-4xl text-kinetic-text tracking-tighter uppercase italic">
              Engineering Philosophy
            </h2>
            <div className="mt-8 space-y-6">
              {[
                { title: 'Structural Severity', desc: 'Full-length ultra HMG carbon graphite with nano resin, achieving unprecedented tensile to flex while without compromising your stability.' },
                { title: 'Aerodynamic Velocity', desc: 'Our patented Hyper Aero Frame System reduces drag at the head, enabling 12% faster swing speeds for high-intensity smashes.' },
                { title: 'Precision Feedback', desc: 'Engineered vibration dampening systems provide remarkable tactile feedback, allowing for surgical shuttle placement.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-kinetic-green/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-kinetic-green rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-kinetic-text uppercase tracking-wide italic">{item.title}</h4>
                    <p className="mt-1 text-kinetic-text-muted text-sm leading-6">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Evolution of Kinetic - Timeline */}
      <section className="px-8 py-24 bg-kinetic-text">
        <div className="max-w-[1280px] mx-auto">
          <p className="font-heading font-bold text-xs text-kinetic-green-light tracking-[2.4px] uppercase mb-4">
            Evolution
          </p>
          <h2 className="font-heading font-bold text-5xl text-white tracking-tighter uppercase">
            Evolution of Kinetic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {timeline.map((item) => (
              <div key={item.year} className="border-t-2 border-kinetic-green pt-6">
                <span className="font-heading font-bold text-4xl text-white/20">{item.year}</span>
                <h3 className="mt-2 font-heading font-bold text-sm text-kinetic-green-light uppercase tracking-[1px]">
                  {item.title}
                </h3>
                <p className="mt-3 text-white/60 text-sm leading-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="px-8 py-24">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading font-bold text-5xl text-kinetic-text tracking-tighter uppercase">
              Global Presence
            </h2>
            <p className="mt-4 text-kinetic-text-secondary text-base leading-7 max-w-md">
              Headquartered in Munich, Engineered in Japan, and tested on every major pro-circuit court.
              Accessible. Kinetic is at the district of disruption across 45 countries.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              {[
                { value: '120+', label: 'Pro Tour Medals' },
                { value: '45', label: 'Distribution Countries' },
                { value: '16M+', label: 'Units Sold' },
                { value: '0.02%', label: 'Defect Rate' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading font-bold text-3xl text-kinetic-blue">{stat.value}</p>
                  <p className="font-sans text-xs text-kinetic-text-muted uppercase tracking-[0.5px] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-square bg-kinetic-text rounded-lg overflow-hidden" />
        </div>
      </section>

      {/* Team Kinetic */}
      <section className="px-8 py-24 bg-kinetic-bg-alt">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="font-heading font-bold text-5xl text-kinetic-text tracking-tighter uppercase">
            Team Kinetic
          </h2>
          <p className="mt-4 text-kinetic-text-muted text-base max-w-lg mx-auto">
            Meet the elite athletes who push our engineering to the absolute limit. They
            serve. Kinetic serves harder.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {athletes.map((athlete) => (
              <div key={athlete.name} className="relative overflow-hidden aspect-[3/4] bg-kinetic-text rounded-lg group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <h3 className="font-heading font-bold text-2xl text-white uppercase tracking-tight">
                    {athlete.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-kinetic-blue px-8 py-24">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="font-heading font-bold text-5xl lg:text-6xl text-white tracking-tighter uppercase leading-tight">
            Experience the<br />
            <span className="text-kinetic-green-light">Kinetic Revolution.</span>
          </h2>
          <p className="mt-6 text-kinetic-blue-pale text-base max-w-lg mx-auto">
            Join the thousands of professional and aspiring players who have upgraded their
            game through precision engineering.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-kinetic-blue font-heading font-bold text-sm tracking-[0.8px] uppercase rounded hover:bg-white/90 transition-colors"
            >
              Shop the Collection
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 font-heading font-bold text-sm text-white tracking-[0.8px] uppercase rounded border border-white/20 bg-white/10 hover:bg-white/20 transition-colors">
              Download Tech Specs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
