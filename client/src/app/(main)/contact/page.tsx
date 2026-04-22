'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const topics = [
  'General inquiry',
  'Order support',
  'Stringing help',
  'Returns',
  'Wholesale',
  'Press',
]

const channels = [
  {
    eyebrow: 'Email support',
    title: 'Write to us',
    description:
      'For order inquiries, returns, or product questions — email is the fastest way to reach us.',
    value: 'hello@volta.sport',
    hours: 'Mon–Fri · 9 am–6 pm EST',
  },
  {
    eyebrow: 'Phone',
    title: 'Call our team',
    description:
      'Speak directly with a VOLTA specialist about gear, stringing, or custom orders.',
    value: '+1 804 555 0142',
    hours: 'Mon–Fri · 10 am–5 pm EST',
  },
  {
    eyebrow: 'Visit',
    title: 'Richmond workshop',
    description:
      'Book a stringing session or try frames in person at our flagship location.',
    value: '1847 Brook Rd, Richmond VA 23220',
  },
]

const faqs = [
  {
    question: 'How long does stringing take?',
    answer:
      'We hand-string every racket in our Richmond workshop. Standard turnaround is 24–48 hours from the time we receive your frame. Rush service (same-day) is available for an additional fee.',
  },
  {
    question: "What's your return policy?",
    answer:
      "You have 30 days to play with any racket. If it doesn't fit your game, send it back in any condition — we'll cover return shipping and issue a full refund.",
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes — we ship to 45+ countries. Standard international shipping is free on orders over $250. Duties and taxes are calculated at checkout so there are no surprises on delivery.',
  },
  {
    question: 'Can I visit your workshop?',
    answer:
      'Absolutely. Walk-ins are welcome Monday through Saturday, 10 am–6 pm. You can test demo frames, watch our stringers at work, and pick up online orders in person.',
  },
]

export default function ContactPage() {
  const [activeTopic, setActiveTopic] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="max-w-[1120px] mx-auto px-6">
      {/* Hero */}
      <section className="py-20 pb-10">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">
          Get in touch
        </p>
        <h1 className="font-heading font-bold text-[clamp(48px,7vw,96px)] tracking-[-0.03em] leading-[0.95] mb-6">
          We&apos;d love to hear from&nbsp;you.
        </h1>
        <p className="text-volta-ink-2 text-[18px] leading-relaxed max-w-[60ch] mb-10">
          Whether you need help choosing a racket, want to check on an order, or
          just want to talk tennis — we&apos;re here for&nbsp;it.
        </p>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic, i) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(i)}
              className={`py-2.5 px-3.5 border rounded-full font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer transition-colors ${
                activeTopic === i
                  ? 'bg-volta-ink text-white border-volta-ink'
                  : 'bg-white text-volta-ink-2 border-volta-line hover:border-volta-ink-3'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {/* Contact form + side channels */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 pb-16">
        {/* Left — Form card */}
        <div className="bg-white border border-volta-line rounded-[20px] p-10">
          <h2 className="font-heading font-semibold text-[22px] mb-1">
            Send a message
          </h2>
          <p className="text-volta-ink-2 text-[14px] mb-8">
            We typically reply within 24&nbsp;hours.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3">
                  Name
                </span>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] outline-none focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 transition"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  className="py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] outline-none focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 transition"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3">
                Message
              </span>
              <textarea
                rows={5}
                placeholder="How can we help?"
                className="py-3.5 px-4 border border-volta-line rounded-[10px] text-[15px] min-h-[140px] resize-y outline-none focus:border-volta-accent-ink focus:ring-[3px] focus:ring-volta-accent/25 transition"
              />
            </label>

            <button
              type="submit"
              className="self-start py-4 px-8 bg-volta-ink text-white rounded-[10px] font-heading font-medium text-[14px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Send message
            </button>
          </form>
        </div>

        {/* Right — Support channels */}
        <div className="flex flex-col gap-4">
          {channels.map((ch) => (
            <div
              key={ch.eyebrow}
              className="p-7 bg-white border border-volta-line rounded-2xl hover:border-volta-ink hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">
                {ch.eyebrow}
              </p>
              <h3 className="font-heading font-semibold text-[20px] mb-1">
                {ch.title}
              </h3>
              <p className="text-volta-ink-2 text-[13px] leading-relaxed mb-4">
                {ch.description}
              </p>
              <p className="font-mono text-[13px] tracking-[0.04em] text-volta-ink mb-2">
                {ch.value}
              </p>
              {ch.hours && (
                <div className="flex items-center gap-2 text-volta-ink-3 text-[12px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  {ch.hours}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-volta-line pt-16 mt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">
          Common questions
        </p>
        <h2 className="font-heading font-bold text-[clamp(32px,5vw,56px)] tracking-[-0.02em] leading-[1] mb-10">
          Quick answers
        </h2>

        <div>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <div
                key={i}
                className="py-6 border-b border-volta-line cursor-pointer"
                onClick={() => setOpenFaq(isOpen ? null : i)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-heading font-semibold text-[18px]">
                    {faq.question}
                  </h3>
                  <Plus
                    size={20}
                    className={`shrink-0 text-volta-ink-3 transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-volta-ink-2 text-[14px] leading-relaxed max-w-[70ch] pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
