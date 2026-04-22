import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "6", label: "Years of R&D" },
  { value: "24", label: "Frames in the range" },
  { value: "11", label: "Tour players" },
  { value: "0.3", label: "mm shaft tolerance" },
];

const values = [
  {
    num: "01",
    title: "Measure everything",
    desc: "If we can't prove a material change with a number, we don't ship it. Every claim we make is backed by repeatable lab data and on-court testing.",
  },
  {
    num: "02",
    title: "Player-first design",
    desc: "Every prototype goes through touring players before production. Their feedback shapes stiffness profiles, balance points, and grip geometry.",
  },
  {
    num: "03",
    title: "Transparent sourcing",
    desc: "We publish our full material chain — from raw graphite supplier to finished frame — so players know exactly what they're swinging.",
  },
];

const timeline = [
  {
    year: "2019",
    title: "University composites lab",
    desc: "Three engineering students begin testing shaft geometries using aerospace-grade carbon prepreg in a shared university lab.",
  },
  {
    year: "2021",
    title: "First prototype",
    desc: "Vector 01 prototype tested by four national squad players. Feedback drives a complete redesign of the throat geometry.",
  },
  {
    year: "2023",
    title: "Official launch",
    desc: "Volta ships its first 24-frame range to 12 countries. Direct-to-player model keeps prices 30 % below legacy brands.",
  },
  {
    year: "2025",
    title: "Tour debut",
    desc: "Six players now compete with Volta frames on the BWF tour. Two podium finishes in the opening quarter.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-volta-ink text-white py-[100px] pb-20 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent mb-6">
            Our story
          </p>
          <h1 className="font-heading font-bold text-[clamp(56px,8vw,128px)] tracking-[-0.035em] leading-[0.95] max-w-[14ch]">
            We started with one question: why do rackets still feel the same?
          </h1>
          <p className="text-white/80 text-[clamp(16px,1.4vw,20px)] leading-relaxed max-w-[640px] mt-8">
            Volta is a performance badminton brand built on composites
            engineering, player data, and the belief that equipment should evolve
            as fast as the sport.
          </p>
        </div>
      </section>

      {/* ── Origin story ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Image placeholder */}
          <div className="aspect-[4/5] bg-volta-bg rounded-[20px] border border-volta-line overflow-hidden" />

          {/* Text */}
          <div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">
              Origin · 2019
            </p>
            <h2 className="font-heading font-bold text-[clamp(36px,4.5vw,64px)] tracking-[-0.03em] leading-none mb-8">
              Born in a composites lab, not a boardroom.
            </h2>
            <div className="space-y-5 text-volta-ink-2 text-base leading-relaxed">
              <p>
                Volta began in a university composites lab in Richmond,
                Virginia. Three materials-science students noticed the same
                problem: badminton shafts hadn&apos;t changed in nearly a decade
                while aerospace carbon technology had leapt forward.
              </p>
              <p>
                They started laying their own prepreg, testing flex profiles on a
                custom jig, and handing prototypes to local club players. The
                feedback was unanimous — the feel was different. Cleaner. Faster.
              </p>
              <p>
                Six years later, that lab project is a full performance brand
                with 24 frames, a growing tour roster, and a direct-to-player
                model that cuts out the middlemen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-t border-b border-volta-line">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-10 px-8 ${
                i < stats.length - 1 ? "border-r border-volta-line" : ""
              }`}
            >
              <p className="font-heading font-bold text-[clamp(40px,4.5vw,64px)] tracking-[-0.03em] text-volta-ink">
                {s.value}
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mt-3">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">
            What we value
          </p>
          <h2 className="font-heading font-bold text-[clamp(36px,4.5vw,64px)] tracking-[-0.03em] leading-none mb-12">
            Engineering honesty, not marketing hype.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.num}
                className="p-8 bg-white border border-volta-line rounded-2xl"
              >
                <p className="font-heading font-bold text-[56px] text-volta-accent-ink tracking-[-0.03em] leading-none">
                  {v.num}
                </p>
                <h3 className="font-heading font-semibold text-[22px] mt-5 mb-3">
                  {v.title}
                </h3>
                <p className="text-volta-ink-2 text-[14px] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 bg-volta-bg">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-4">
            Milestones
          </p>
          <h2 className="font-heading font-bold text-[clamp(36px,4.5vw,64px)] tracking-[-0.03em] leading-none">
            From lab to world tour.
          </h2>

          <div className="border-l-2 border-volta-line pl-8 mt-8">
            {timeline.map((t) => (
              <div key={t.year} className="py-5 relative">
                <span className="absolute left-[-40px] top-7 w-3.5 h-3.5 rounded-full bg-white border-2 border-volta-ink" />
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-volta-accent-ink">
                  {t.year}
                </p>
                <h3 className="font-heading font-semibold text-[22px] mt-1">
                  {t.title}
                </h3>
                <p className="text-volta-ink-2 text-[14px] max-w-[52ch] mt-1 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-volta-ink text-white py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-heading font-bold text-[clamp(36px,4.5vw,64px)] tracking-[-0.03em] leading-none">
            Ready to feel the difference?
          </h2>
          <p className="text-white/70 text-[clamp(16px,1.4vw,20px)] leading-relaxed max-w-[540px] mx-auto mt-6">
            Explore the full Volta range — engineered for players who care about
            what&apos;s under the paint.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-volta-ink font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/90 transition"
            >
              Shop rackets
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:border-white/60 transition"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
