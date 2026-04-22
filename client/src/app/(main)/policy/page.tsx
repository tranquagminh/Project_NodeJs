'use client';

import { useState } from 'react';

const sections = [
  'Terms of Service',
  'Privacy Policy',
  'Returns & Refunds',
  'Warranty',
  'Cookies',
  'Accessibility',
] as const;

type Section = (typeof sections)[number];

function SectionHeading({
  children,
  first = false,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <h2
      className={`font-heading font-semibold text-[26px] tracking-[-0.02em] text-volta-ink pt-6 ${
        first ? '' : 'border-t border-volta-line mt-12'
      }`}
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading font-semibold text-[17px] mt-7 mb-2.5">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-volta-ink-2 text-[15px] leading-[1.7] mb-3.5">
      {children}
    </p>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="text-volta-ink-2 text-[15px] leading-[1.7] pl-5 mb-3.5 list-disc">
      {children}
    </ul>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-5 px-6 bg-volta-bg border-l-[3px] border-volta-accent-ink rounded-md text-[14px] text-volta-ink leading-relaxed my-5">
      {children}
    </div>
  );
}

function TermsOfService() {
  return (
    <div>
      <SectionHeading first>Terms of Service</SectionHeading>

      <SubHeading>Acceptance of terms</SubHeading>
      <P>
        By accessing and using the Volta Sport website and services, you accept
        and agree to be bound by the terms and provisions of this agreement.
        If you do not agree to abide by these terms, please do not use our
        services. These terms apply to all visitors, users, and others who
        access or use the service.
      </P>

      <SubHeading>Account responsibilities</SubHeading>
      <P>
        When you create an account with us, you must provide information that
        is accurate, complete, and current at all times. Failure to do so
        constitutes a breach of the terms, which may result in immediate
        termination of your account.
      </P>
      <UL>
        <li>You are responsible for safeguarding the password used to access the service</li>
        <li>You agree not to disclose your password to any third party</li>
        <li>You must notify us immediately upon becoming aware of any breach of security</li>
        <li>You may not use as a username the name of another person or entity that is not lawfully available for use</li>
      </UL>

      <SubHeading>Intellectual property</SubHeading>
      <P>
        The service and its original content, features, and functionality are
        and will remain the exclusive property of Volta Sport and its licensors.
        The service is protected by copyright, trademark, and other laws of
        both the country and foreign countries.
      </P>

      <Callout>
        All product specifications, designs, engineering data, and other
        technical information displayed on this site are proprietary to Volta
        Sport and may not be reproduced, used, or disclosed without prior
        written consent.
      </Callout>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div>
      <SectionHeading first>Privacy Policy</SectionHeading>

      <SubHeading>What we collect</SubHeading>
      <P>
        We collect information you provide directly to us when you create an
        account, make a purchase, subscribe to our newsletter, or contact our
        support team. This may include:
      </P>
      <UL>
        <li>Name, email address, and contact information</li>
        <li>Billing and shipping addresses</li>
        <li>Payment information (processed securely through our payment providers)</li>
        <li>Order history and product preferences</li>
        <li>Communications you send to us</li>
      </UL>

      <SubHeading>How we use your data</SubHeading>
      <P>
        We use the information we collect to provide, maintain, and improve our
        services, process transactions, send transactional communications, and
        respond to your comments and questions. We may also use the data to
        send you marketing communications, which you can opt out of at any
        time.
      </P>

      <SubHeading>Third-party sharing</SubHeading>
      <P>
        We may share your information with third-party service providers who
        perform services on our behalf, such as payment processing, shipping,
        data analysis, email delivery, hosting services, and customer service.
        These third parties have access to your personal information only to
        perform these tasks and are obligated not to disclose or use it for
        any other purpose.
      </P>

      <Callout>
        We never sell personal data to third parties. Your information is only
        shared with service providers essential to fulfilling your orders and
        improving your experience with Volta Sport.
      </Callout>
    </div>
  );
}

function ReturnsRefunds() {
  return (
    <div>
      <SectionHeading first>Returns &amp; Refunds</SectionHeading>

      <SubHeading>30-day on-court trial</SubHeading>
      <P>
        We believe in our products. That&apos;s why every Volta racket comes
        with a 30-day on-court trial. If you&apos;re not completely satisfied
        with your purchase, you can return it within 30 days of delivery for a
        full refund or exchange. We want you to feel the difference on the
        court, not just in the store.
      </P>

      <SubHeading>Return conditions</SubHeading>
      <UL>
        <li>Items must be returned within 30 days of the delivery date</li>
        <li>Rackets may show reasonable signs of on-court use and still be eligible for return</li>
        <li>Accessories and apparel must be in original, unused condition with tags attached</li>
        <li>Custom stringing services are non-refundable</li>
        <li>Sale items are eligible for exchange or store credit only</li>
      </UL>

      <SubHeading>Refund process</SubHeading>
      <P>
        Once your return is received and inspected, we will send you an email
        to notify you of the approval or rejection of your refund. If approved,
        your refund will be processed and a credit will automatically be
        applied to your original method of payment within 5–10 business days.
      </P>
    </div>
  );
}

function WarrantySection() {
  return (
    <div>
      <SectionHeading first>Warranty</SectionHeading>

      <SubHeading>Frame warranty</SubHeading>
      <P>
        All Volta racket frames are covered by a 2-year limited warranty
        against defects in materials and workmanship from the date of original
        purchase. This warranty covers structural failures of the frame under
        normal playing conditions and does not cover cosmetic damage or damage
        caused by misuse, neglect, or modification.
      </P>

      <SubHeading>What&apos;s not covered</SubHeading>
      <UL>
        <li>Cosmetic damage including scratches, dents, and paint chips from normal play</li>
        <li>Damage caused by misuse, abuse, or modification of the product</li>
        <li>Natural wear and tear of strings, grips, and bumper guards</li>
        <li>Damage resulting from improper stringing or stringing above recommended tension</li>
        <li>Products purchased from unauthorized retailers</li>
      </UL>

      <SubHeading>Claiming warranty</SubHeading>
      <P>
        To make a warranty claim, contact our support team with your proof of
        purchase and photos of the defect. Our team will review your claim
        within 3–5 business days and, if approved, will provide a replacement
        frame or store credit at our discretion.
      </P>
    </div>
  );
}

function CookiesSection() {
  return (
    <div>
      <SectionHeading first>Cookies</SectionHeading>

      <SubHeading>Essential cookies</SubHeading>
      <P>
        Essential cookies are required for the basic functionality of our
        website. These cookies enable core features such as security, network
        management, and account access. You cannot opt out of essential cookies
        as the website cannot function properly without them.
      </P>

      <SubHeading>Analytics cookies</SubHeading>
      <P>
        We use analytics cookies to understand how visitors interact with our
        website. These cookies help us measure and improve the performance of
        our site by collecting information about which pages are visited most
        often, how visitors navigate between pages, and whether they encounter
        any error messages. All information these cookies collect is aggregated
        and anonymous.
      </P>

      <SubHeading>Managing preferences</SubHeading>
      <P>
        You can manage your cookie preferences at any time through your browser
        settings. Most browsers allow you to refuse or accept cookies, delete
        existing cookies, and set preferences for certain websites. Please note
        that disabling certain cookies may limit the functionality of our
        website.
      </P>
    </div>
  );
}

function AccessibilitySection() {
  return (
    <div>
      <SectionHeading first>Accessibility</SectionHeading>

      <P>
        Volta Sport is committed to ensuring digital accessibility for people
        of all abilities. We are continually improving the user experience for
        everyone and applying the relevant accessibility standards. Our website
        strives to conform to the Web Content Accessibility Guidelines (WCAG)
        2.1, Level AA. We welcome your feedback on the accessibility of our
        site. If you encounter any accessibility barriers or have suggestions
        for improvement, please contact us at{' '}
        <a
          href="mailto:accessibility@voltasport.com"
          className="text-volta-accent-ink underline underline-offset-2"
        >
          accessibility@voltasport.com
        </a>
        .
      </P>
    </div>
  );
}

function PolicyContent({ active }: { active: Section }) {
  switch (active) {
    case 'Terms of Service':
      return <TermsOfService />;
    case 'Privacy Policy':
      return <PrivacyPolicy />;
    case 'Returns & Refunds':
      return <ReturnsRefunds />;
    case 'Warranty':
      return <WarrantySection />;
    case 'Cookies':
      return <CookiesSection />;
    case 'Accessibility':
      return <AccessibilitySection />;
  }
}

export default function PolicyPage() {
  const [active, setActive] = useState<Section>('Terms of Service');

  return (
    <div className="bg-volta-bg">
      <div className="container mx-auto px-6 py-12 pb-24">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">
          Legal
        </p>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,64px)] tracking-[-0.03em] leading-[0.95]">
          Terms &amp; policies
        </h1>
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-ink-3 mb-10">
          Last updated: March 2026
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-16">
          {/* Sidebar Nav */}
          <nav className="sticky top-6 flex flex-col gap-0.5 self-start">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActive(section)}
                className={`py-2.5 px-3.5 rounded-lg text-[14px] font-medium text-left transition-colors ${
                  active === section
                    ? 'bg-volta-ink text-white'
                    : 'text-volta-ink-2 hover:bg-volta-bg hover:text-volta-ink'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="max-w-[760px]">
            <PolicyContent active={active} />
          </div>
        </div>
      </div>
    </div>
  );
}
