import Link from 'next/link';
import { Globe } from 'lucide-react';

const footerLinks = {
  support: [
    { label: 'Dealer Locator', href: '/contact' },
    { label: 'Stringing Support', href: '/contact' },
    { label: 'Warranty', href: '/policy#warranty' },
  ],
  tech: [
    { label: 'Technical Specs', href: '/about' },
    { label: 'Material Science', href: '/about' },
    { label: 'Sustainability', href: '/about' },
  ],
  company: [
    { label: 'Privacy Policy', href: '/policy#privacy' },
    { label: 'Terms of Service', href: '/policy#terms' },
    { label: 'Careers', href: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Newsletter */}
      <div className="max-w-[1920px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-heading font-bold text-kinetic-blue text-xl tracking-tight">
              KINETIC
            </Link>
            <p className="mt-4 font-sans text-xs text-kinetic-text-muted uppercase tracking-[0.5px] max-w-[300px] leading-5">
              High performance equipment engineered for the elite athlete. Precision in every swing.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" aria-label="Website" className="text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
                <Globe size={18} />
              </a>
              <a href="#" aria-label="Twitter" className="text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-heading font-bold text-xs text-kinetic-text tracking-[1px] uppercase mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="font-sans text-sm text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Links */}
          <div>
            <h4 className="font-heading font-bold text-xs text-kinetic-text tracking-[1px] uppercase mb-4">Tech</h4>
            <ul className="space-y-3">
              {footerLinks.tech.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="font-sans text-sm text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links + Newsletter */}
          <div>
            <h4 className="font-heading font-bold text-xs text-kinetic-text tracking-[1px] uppercase mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="font-sans text-sm text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <h4 className="font-heading font-bold text-xs text-kinetic-text tracking-[1px] uppercase mb-3">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 bg-kinetic-bg-alt border border-kinetic-border/30 px-3 py-2 text-sm font-sans placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue"
                />
                <button className="bg-kinetic-green text-white px-3 py-2 text-xs font-bold font-heading tracking-wider hover:bg-kinetic-green/90 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-[1920px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-kinetic-text-muted tracking-[0.5px]">
            © 2024 KINETIC PERFORMANCE. ENGINEERED FOR PRECISION.
          </p>
          <p className="font-sans text-xs text-kinetic-green font-bold tracking-[0.5px] uppercase">
            Global Shipping Active
          </p>
        </div>
      </div>
    </footer>
  );
}

export function FooterMinimal() {
  return (
    <footer className="bg-[#f8fafc] border-t border-gray-100">
      <div className="max-w-[1920px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-kinetic-blue text-sm tracking-tight">KINETIC</span>
        </div>
        <nav className="flex items-center gap-6">
          {['Technical Specs', 'Warranty', 'Stringing Service', 'Shipping', 'Privacy'].map((item) => (
            <Link key={item} href="/policy" className="font-sans text-xs text-kinetic-text-muted hover:text-kinetic-blue transition-colors">
              {item}
            </Link>
          ))}
        </nav>
        <p className="font-sans text-xs text-kinetic-text-muted">
          © 2024 KINETIC PERFORMANCE. ENGINEERED FOR VELOCITY.
        </p>
      </div>
    </footer>
  );
}
