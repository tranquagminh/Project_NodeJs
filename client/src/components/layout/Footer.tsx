import Link from 'next/link';

const footerLinks = {
  shop: [
    { label: 'Rackets', href: '/products' },
    { label: 'Footwear', href: '/products?category=footwear' },
    { label: 'Apparel', href: '/products?category=apparel' },
    { label: 'Shuttles', href: '/products?category=shuttles' },
    { label: 'Strings', href: '/products?category=strings' },
  ],
  support: [
    { label: 'Racket fitting', href: '/contact' },
    { label: 'Stringing', href: '/contact' },
    { label: 'Warranty', href: '/policy' },
    { label: 'Shipping & returns', href: '/policy' },
    { label: 'Contact', href: '/contact' },
  ],
  engineering: [
    { label: 'Tech index', href: '/about' },
    { label: 'Material science', href: '/about' },
    { label: 'Sustainability', href: '/about' },
    { label: 'Test methodology', href: '/about' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Team Volta', href: '/about' },
    { label: 'Careers', href: '/about' },
    { label: 'Press', href: '/about' },
    { label: 'Privacy', href: '/policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-volta-bg-2 pt-16 pb-6">
      <div className="max-w-[1360px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1 lg:pr-4">
            <Link href="/" className="font-heading font-bold text-volta-ink text-xl tracking-[0.08em] inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
                <path d="M4 4 L12 20 L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
              VOLTA
            </Link>
            <p className="mt-3 text-volta-ink-3 text-[13px] max-w-[260px] leading-relaxed">
              Precision badminton equipment, engineered for players who count grams. Since 2016 · Richmond, VA.
            </p>
            <div className="mt-5 flex items-stretch max-w-[300px] border border-volta-line rounded overflow-hidden bg-white">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 px-3 py-2.5 text-[13px] text-volta-ink bg-transparent border-0 outline-none placeholder:text-volta-ink-4"
              />
              <button className="flex-shrink-0 px-3.5 py-2.5 bg-volta-ink text-white font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap hover:bg-volta-ink-2 transition-colors">
                Join →
              </button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-4">Shop</h5>
            <ul className="space-y-1.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-volta-ink-2 text-[13px] hover:text-volta-ink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-4">Support</h5>
            <ul className="space-y-1.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-volta-ink-2 text-[13px] hover:text-volta-ink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Engineering Links */}
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-4">Engineering</h5>
            <ul className="space-y-1.5">
              {footerLinks.engineering.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-volta-ink-2 text-[13px] hover:text-volta-ink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-4">Company</h5>
            <ul className="space-y-1.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-volta-ink-2 text-[13px] hover:text-volta-ink transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-volta-line font-mono text-[11px] tracking-[0.08em] text-volta-ink-3 uppercase">
          <span>© 2026 Volta Performance</span>
          <span className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="w-1.5 h-1.5 rounded-full bg-volta-accent shadow-[0_0_8px_var(--color-volta-accent)] animate-pulse" />
            Global shipping active
          </span>
        </div>
      </div>
    </footer>
  );
}

export function FooterMinimal() {
  return (
    <footer className="bg-volta-bg-2 border-t border-volta-line">
      <div className="max-w-[1360px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="font-heading font-bold text-volta-ink text-sm tracking-[0.08em] inline-flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M4 4 L12 20 L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
          </svg>
          VOLTA
        </Link>
        <nav className="flex items-center gap-6">
          {['Stringing', 'Warranty', 'Shipping', 'Privacy'].map((item) => (
            <Link key={item} href="/policy" className="text-volta-ink-3 text-[11px] font-mono tracking-[0.08em] uppercase hover:text-volta-ink transition-colors">
              {item}
            </Link>
          ))}
        </nav>
        <p className="text-volta-ink-3 text-[11px] font-mono tracking-[0.08em] uppercase">
          © 2026 Volta Performance
        </p>
      </div>
    </footer>
  );
}
