'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowRight, Shield, Wrench, Truck } from 'lucide-react';

const supportCenters = [
  {
    region: 'Asia Pacific Hub',
    color: 'bg-kinetic-green',
    name: 'Tokyo Engineering Center',
    address: '3-7-1 Yoda-Kojimachi, Minato-ku,\nTokyo 107-0051, Japan',
    phone: '+81 3 5688 9000',
    email: 'support.asia@kinetic.pro',
  },
  {
    region: 'Europe Hub',
    color: 'bg-kinetic-blue',
    name: 'Copenhagen Design Lab',
    address: 'Bredgade 24A,\n1260 København K, Denmark',
    phone: '+45 33 12 34 56',
    email: 'support.eu@kinetic.pro',
  },
  {
    region: 'Americas Hub',
    color: 'bg-kinetic-green',
    name: 'Irvine Logistics Center',
    address: '1325 Von Karman Ave,\nIrvine, CA 92612, USA',
    phone: '+1 949 555 0199',
    email: 'support.usa@kinetic.pro',
  },
];

const faqItems = [
  { icon: <Shield size={24} />, title: 'Warranty Activation', desc: 'Register your frame serial number to activate the 12-month Kinetic structural guarantee.' },
  { icon: <Wrench size={24} />, title: 'Tension Charts', desc: 'Access engineering specifications for optimal string tension based on frame materials.' },
  { icon: <Truck size={24} />, title: 'Shipping Matrix', desc: 'Detailed lead times and logistics tracking for all international equipment orders.' },
];

const departments = ['Technical Support', 'Sales & Orders', 'Warranty Claims', 'Partnership Inquiry', 'Media & Press'];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'Technical Support',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with API
  };

  return (
    <div className="bg-kinetic-bg">
      {/* Hero */}
      <section className="relative bg-kinetic-blue min-h-[300px] flex items-end overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/contact-hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-kinetic-blue to-transparent" />
        <div className="relative max-w-[1280px] mx-auto px-8 w-full pb-16 pt-24">
          <p className="font-heading font-bold text-xs text-kinetic-green-light tracking-[2.4px] uppercase mb-4">
            Connect With Kinetic
          </p>
          <h1 className="font-heading font-bold text-6xl lg:text-[80px] leading-none text-white tracking-tighter uppercase">
            ENGINEERING<br />
            <span className="text-kinetic-green-light">SUPPORT</span>
          </h1>
          <p className="mt-4 text-kinetic-blue-pale text-base max-w-lg opacity-90">
            Whether you&apos;re seeking technical specifications or looking to become a certified dealer, our engineering team is ready to assist.
          </p>
        </div>
      </section>

      {/* Contact Form + Support Centers */}
      <section className="px-8 py-20">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">
              Get in Touch
            </h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ex: Kento Tanaka"
                    className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue"
                  />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="k.tanaka@kinetic.pro"
                    className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text focus:outline-none focus:border-kinetic-blue bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans font-bold text-[10px] text-kinetic-text-muted tracking-[1px] uppercase mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your technical requirements..."
                  className="w-full border border-kinetic-border px-4 py-3 font-sans text-sm text-kinetic-text placeholder:text-kinetic-text-muted/50 focus:outline-none focus:border-kinetic-blue resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-heading font-bold text-sm tracking-[1.4px] uppercase"
                style={{ backgroundImage: 'linear-gradient(135deg, #00538f 0%, #006cb7 100%)' }}
              >
                Dispatch Message <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Support Centers */}
          <div>
            <h2 className="font-heading font-bold text-3xl text-kinetic-text tracking-tight uppercase">
              Global Support Centers
            </h2>
            <div className="mt-8 space-y-8">
              {supportCenters.map((center) => (
                <div key={center.name} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-2 h-2 ${center.color} rounded-full`} />
                  </div>
                  <div>
                    <p className="font-sans font-bold text-[10px] text-kinetic-green tracking-[1px] uppercase">{center.region}</p>
                    <h4 className="font-heading font-bold text-lg text-kinetic-text mt-1">{center.name}</h4>
                    <p className="font-sans text-sm text-kinetic-text-muted whitespace-pre-line mt-2">{center.address}</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-kinetic-blue" />
                        <span className="font-sans text-sm text-kinetic-blue font-bold">{center.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-kinetic-text-muted" />
                        <span className="font-sans text-sm text-kinetic-text-muted">{center.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dealer Locator CTA */}
      <section className="relative bg-kinetic-blue overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/dealer-bg.jpg')] bg-cover bg-center" />
        <div className="relative max-w-[1280px] mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl text-white tracking-tighter uppercase leading-tight">
              Find Your Local<br />
              <span className="text-kinetic-green-light italic">Performance Lab</span>
            </h2>
            <p className="mt-4 text-kinetic-blue-pale text-base max-w-md">
              Experience the Kinetic range in person. Our authorized dealers provide professional
              stringing services and expert consultation tailored to your playing style.
            </p>
            <div className="flex gap-4 mt-8">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-kinetic-green text-white font-heading font-bold text-sm tracking-[1px] uppercase rounded hover:bg-kinetic-green/90 transition-colors">
                <MapPin size={14} /> Dealer Locator
              </button>
              <button className="inline-flex items-center px-6 py-3 font-heading font-bold text-sm text-white tracking-[1px] uppercase border border-white/20 rounded hover:bg-white/10 transition-colors">
                Partnership Inquiry
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-kinetic-blue-dark/50 backdrop-blur-sm rounded-lg p-8 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <p className="font-heading font-bold text-xs text-kinetic-green-light tracking-[1px] uppercase">Kinetic Certified</p>
                <span className="font-sans text-xs text-white/50 uppercase tracking-wider">Authorized Network</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm font-sans">Global Locations</span>
                  <span className="font-heading font-bold text-kinetic-green-light text-lg">1,240+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm font-sans">Certified Technicians</span>
                  <span className="font-heading font-bold text-kinetic-green-light text-lg">4,800+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Service / FAQ */}
      <section className="px-8 py-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-heading font-bold text-xs text-kinetic-green tracking-[2.4px] uppercase mb-2">
                Self-Service Portal
              </p>
              <h2 className="font-heading font-bold text-4xl text-kinetic-text tracking-tighter uppercase">
                Instant Answers
              </h2>
            </div>
            <Link href="/policy" className="hidden md:flex items-center gap-2 font-sans font-bold text-sm text-kinetic-blue tracking-[1px] uppercase hover:underline">
              View Knowledge Base <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faqItems.map((item) => (
              <div key={item.title} className="bg-white p-8">
                <div className="w-12 h-12 bg-kinetic-blue/10 rounded flex items-center justify-center text-kinetic-blue mb-4">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-base text-kinetic-text uppercase tracking-wide">{item.title}</h3>
                <p className="mt-2 text-kinetic-text-muted text-sm leading-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
