'use client';

import { useState } from 'react';
import { Shield, FileText, RotateCcw, Cookie, ChevronRight } from 'lucide-react';

type Section = 'privacy' | 'terms' | 'warranty' | 'cookie';

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={16} /> },
  { id: 'terms', label: 'Terms of Service', icon: <FileText size={16} /> },
  { id: 'warranty', label: 'Warranty & Returns', icon: <RotateCcw size={16} /> },
  { id: 'cookie', label: 'Cookie Policy', icon: <Cookie size={16} /> },
];

export default function PolicyPage() {
  const [active, setActive] = useState<Section>('privacy');

  return (
    <div className="bg-kinetic-bg">
      {/* Hero */}
      <section className="bg-kinetic-text py-20 pb-16">
        <div className="max-w-[1280px] mx-auto px-8">
          <p className="font-heading font-bold text-xs text-kinetic-green-light tracking-[2.4px] uppercase mb-4">
            Legal Documentation
          </p>
          <h1 className="font-heading font-bold text-5xl lg:text-[64px] leading-none text-white tracking-tighter uppercase">
            Policy & Legal<br />
            <span className="text-kinetic-green-light">Center</span>
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-lg">
            Transparent governance for the Kinetic ecosystem. Review the policies that protect
            your data, purchases, and rights as part of our performance community.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-8 py-16">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar Nav */}
          <nav className="lg:sticky lg:top-28 lg:self-start space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-sans font-medium transition-colors ${
                  active === item.id
                    ? 'bg-kinetic-blue text-white'
                    : 'text-kinetic-text-secondary hover:bg-kinetic-bg-alt'
                }`}
              >
                {item.icon}
                {item.label}
                <ChevronRight size={14} className="ml-auto opacity-50" />
              </button>
            ))}
            <p className="px-4 pt-6 text-[10px] text-kinetic-text-muted uppercase tracking-wider">
              Last Updated: March 2025
            </p>
          </nav>

          {/* Policy Content */}
          <div className="min-w-0">
            {active === 'privacy' && <PrivacyPolicy />}
            {active === 'terms' && <TermsOfService />}
            {active === 'warranty' && <WarrantyReturns />}
            {active === 'cookie' && <CookiePolicy />}
          </div>
        </div>
      </section>
    </div>
  );
}

/* --- Privacy Policy --- */
function PrivacyPolicy() {
  return (
    <article className="space-y-12">
      <div>
        <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">Privacy Policy</h2>
        <p className="mt-4 text-kinetic-text-secondary text-sm leading-7 max-w-2xl">
          Kinetic is committed to protecting the personal data of our athletes, customers, and partners.
          This policy outlines how we collect, process, and safeguard information within the Kinetic ecosystem.
        </p>
      </div>

      <PolicyBlock title="Data Collection" number="01">
        <p>We collect personal information that you provide directly when creating a Kinetic account, placing orders,
          or contacting our support team. This includes your name, email address, shipping address, payment details,
          and any communication you send to us.</p>
        <p>We also automatically collect certain technical data when you interact with our digital platforms,
          including device information, IP address, browser type, and usage patterns.</p>
      </PolicyBlock>

      <PolicyBlock title="Security Protocol" number="02">
        <p>All data transmissions are protected using 256-bit TLS encryption. Payment processing is handled through
          PCI DSS Level 1 certified partners. We never store complete credit card numbers on our servers.</p>
        <p>Access to personal data is restricted to authorized personnel on a need-to-know basis, with all access
          logged and audited quarterly.</p>
      </PolicyBlock>

      <PolicyBlock title="Information Usage" number="03">
        <p>Your personal data is used to fulfill orders, provide customer support, improve our products and services,
          and send relevant communications about Kinetic products and events (with your consent).</p>
        <p>We do not sell, rent, or trade personal information to third parties for marketing purposes.</p>
      </PolicyBlock>

      <PolicyBlock title="Biometric Integrity" number="04">
        <p>Kinetic does not collect biometric data (fingerprints, facial recognition, gait analysis) through our
          e-commerce platforms. Any performance analytics from Kinetic-connected devices are processed locally on
          the user&apos;s device and are not transmitted to our servers unless explicitly opted in.</p>
      </PolicyBlock>
    </article>
  );
}

/* --- Terms of Service --- */
function TermsOfService() {
  return (
    <article className="space-y-12">
      <div>
        <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">Terms of Service</h2>
        <p className="mt-4 text-kinetic-text-secondary text-sm leading-7 max-w-2xl">
          By accessing and using the Kinetic platform, you agree to be bound by these terms. Please review them
          carefully before making purchases or creating an account.
        </p>
      </div>

      <PolicyBlock title="Usage Rights" number="01">
        <p>Kinetic grants you a limited, non-exclusive, non-transferable right to access and use the Kinetic platform
          for personal, non-commercial purposes. You may browse products, create an account, and place orders for
          personal use.</p>
        <p>All content on the platform — including but not limited to text, graphics, logos, product images,
          engineering specifications, and software — is the intellectual property of Kinetic or its licensors.</p>
      </PolicyBlock>

      <PolicyBlock title="Prohibited Acts" number="02">
        <p>You agree not to: reproduce or redistribute Kinetic content without authorization; use automated systems
          to scrape or extract data; create fake accounts or impersonate others; attempt to gain unauthorized access
          to our systems; or use the platform for any illegal purpose.</p>
        <p>Kinetic reserves the right to suspend or terminate accounts that violate these terms, without prior notice.</p>
      </PolicyBlock>
    </article>
  );
}

/* --- Warranty & Returns --- */
function WarrantyReturns() {
  const returnsSpecs = [
    { item: 'Racket Frames', window: '30 days', condition: 'Unstrung, original packaging' },
    { item: 'Shoes', window: '30 days', condition: 'Unworn, with tags' },
    { item: 'Apparel', window: '30 days', condition: 'Unworn, with tags' },
    { item: 'Strings (uncut)', window: '30 days', condition: 'Sealed packaging' },
    { item: 'Accessories', window: '14 days', condition: 'Unused, original packaging' },
  ];

  return (
    <article className="space-y-12">
      <div>
        <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">Warranty & Returns</h2>
        <p className="mt-4 text-kinetic-text-secondary text-sm leading-7 max-w-2xl">
          Kinetic products are engineered for performance and durability. Our warranty and returns policies are
          designed to give you confidence in every purchase.
        </p>
      </div>

      <PolicyBlock title="Racket Frame Warranty" number="01">
        <p>All Kinetic racket frames carry a 12-month structural warranty from the date of purchase. This covers
          manufacturing defects in materials and workmanship under normal playing conditions.</p>
        <p>The warranty does not cover damage caused by misuse, accidental impact, unauthorized modifications,
          or normal wear and tear. Cosmetic damage (paint chips, scratches) is not covered.</p>
      </PolicyBlock>

      <PolicyBlock title="Stringing Policy" number="02">
        <p>Pre-strung rackets are warranted for the frame only. String tension and durability vary based on
          playing frequency, technique, and environmental conditions. String breakage is not covered under warranty.</p>
        <p>For warranty claims on strung rackets, the racket must be re-strung at a Kinetic Authorized Service Center
          for assessment.</p>
      </PolicyBlock>

      <PolicyBlock title="Returns — 30-Day Policy" number="03">
        <p>Items purchased from Kinetic may be returned within 30 days of delivery for a full refund.
          Items must be in their original condition, unused, and in original packaging. Custom or personalized
          items are final sale and cannot be returned.</p>
      </PolicyBlock>

      {/* Specification Table */}
      <div>
        <h3 className="font-heading font-bold text-sm text-kinetic-text-muted tracking-[1px] uppercase mb-4">
          Technical Specifications for Returns
        </h3>
        <div className="border border-kinetic-border">
          <div className="grid grid-cols-3 bg-kinetic-bg-alt px-4 py-3 border-b border-kinetic-border">
            <span className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">Item</span>
            <span className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">Return Window</span>
            <span className="font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase">Condition</span>
          </div>
          {returnsSpecs.map((row) => (
            <div key={row.item} className="grid grid-cols-3 px-4 py-3 border-b border-kinetic-border last:border-b-0">
              <span className="font-sans text-sm text-kinetic-text">{row.item}</span>
              <span className="font-sans text-sm text-kinetic-text-secondary">{row.window}</span>
              <span className="font-sans text-sm text-kinetic-text-secondary">{row.condition}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* --- Cookie Policy --- */
function CookiePolicy() {
  return (
    <article className="space-y-12">
      <div>
        <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">Cookie Policy</h2>
        <p className="mt-4 text-kinetic-text-secondary text-sm leading-7 max-w-2xl">
          Kinetic uses cookies and similar tracking technologies to enhance your browsing experience,
          analyze platform usage, and deliver targeted content.
        </p>
      </div>

      <PolicyBlock title="Essential Cookies" number="01">
        <p>These cookies are required for the platform to function correctly. They enable core features such as
          authentication, shopping cart persistence, and security protocols. Essential cookies cannot be disabled.</p>
      </PolicyBlock>

      <PolicyBlock title="Analytics Cookies" number="02">
        <p>We use analytics cookies to understand how visitors interact with our platform. This data helps us
          improve product discovery, optimize page performance, and identify technical issues. All analytics
          data is aggregated and anonymized.</p>
      </PolicyBlock>

      <PolicyBlock title="Managing Preferences" number="03">
        <p>You can manage your cookie preferences at any time through your browser settings or by using
          the Cookie Preferences panel accessible from the footer of every page. Please note that disabling
          certain cookies may affect platform functionality.</p>
      </PolicyBlock>
    </article>
  );
}

/* --- Shared Section Block --- */
function PolicyBlock({
  title,
  number,
  children,
}: {
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <span className="font-heading font-bold text-xs text-kinetic-text-muted/40 mt-1">{number}</span>
      <div className="flex-1">
        <h3 className="font-heading font-bold text-lg text-kinetic-text">{title}</h3>
        <div className="mt-3 space-y-3 text-kinetic-text-secondary text-sm leading-7">{children}</div>
      </div>
    </div>
  );
}
