"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { barlow, instrumentSerif } from "@/lib/fonts"

const ACCENT = "#00C4B0"
const MAIL = "mailto:veramanuelvlc@gmail.com"

const stackLine = "Python · Meta Ads API · Next.js · Claude API"

export default function Home() {
  const { t } = useLocale()
  const h = t.home
  const year = new Date().getFullYear()

  return (
    <div
      className={`${barlow.variable} ${instrumentSerif.variable} flex min-h-screen flex-col bg-[#0A0A0A] text-slate-300`}
      style={{ fontFamily: "var(--font-barlow), sans-serif" }}
    >
      {/* Top nav (shared pattern with about / projects) */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/80 px-8 py-5 backdrop-blur-sm">
        <Link href="/" className="font-mono text-sm text-[#00C4B0]">mv.dev</Link>
        <div className="flex items-center gap-6 text-sm text-white/50">
          <Link href="/about" className="transition-colors hover:text-white">{t.nav.about}</Link>
          <Link href="/projects" className="transition-colors hover:text-white">{t.nav.projects}</Link>
          <a href={MAIL} className="transition-colors hover:text-white">{t.nav.contact}</a>
          <LocaleToggle />
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-8 pb-16 pt-36 text-center">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t.hero.role}
          </span>
          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">Manuel Vera</h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            {t.hero.description}
            <span className="mt-4 block font-mono text-sm text-slate-500">{stackLine}</span>
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/projects"
              className="rounded-lg px-8 py-3 text-sm font-medium text-[#0A0A0A] transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              {t.hero.cta_projects}
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-white/15 px-8 py-3 text-sm font-medium text-white transition-colors hover:border-white/40"
            >
              {t.hero.cta_about}
            </Link>
          </div>
        </section>

        {/* Metrics */}
        <section className="mx-auto w-full max-w-5xl px-8 py-12">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {t.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <div className="mb-1 text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Project gallery (live dashboards preview) */}
        <section className="mx-auto w-full max-w-5xl px-8 py-16">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{h.gallery_label}</h2>
            <Link href="/projects" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: ACCENT }}>
              {t.hero.cta_projects} →
            </Link>
          </div>
          <Link
            href="/projects"
            className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F1115] shadow-2xl transition-colors hover:border-white/20"
          >
            {/* Mock dashboard header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#161A1F] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(0,196,176,0.2)" }}>
                  <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: ACCENT }} />
                </div>
                <nav className="flex gap-4 text-xs font-medium text-slate-400">
                  <span className="border-b border-white pb-1 text-white">Overview</span>
                  <span>Customers</span>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-700" />
                <span className="text-[10px] uppercase text-slate-500">MV</span>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { k: "Open queue", v: "38" },
                  { k: "Active conversations", v: "126" },
                  { k: "Median first reply", v: "4.1m" },
                  { k: "CSAT (90d)", v: "94%" },
                ].map((kpi) => (
                  <div key={kpi.k} className="rounded-lg border border-white/[0.06] bg-[#1A1D21] p-4">
                    <p className="mb-1 text-[10px] uppercase text-slate-500">{kpi.k}</p>
                    <p className="text-2xl font-semibold text-white">{kpi.v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="relative h-64 rounded-xl border border-white/[0.06] bg-[#1A1D21] p-6 md:col-span-2">
                  <p className="mb-4 text-xs text-slate-400">Conversation volume</p>
                  <svg className="h-40 w-full opacity-70" viewBox="0 0 400 150" preserveAspectRatio="none">
                    <path d="M0 120 Q 50 80, 100 100 T 200 60 T 300 90 T 400 40" fill="none" stroke={ACCENT} strokeWidth="1.5" />
                    <circle cx="100" cy="100" fill={ACCENT} r="2.5" />
                    <circle cx="200" cy="60" fill={ACCENT} r="2.5" />
                    <circle cx="300" cy="90" fill={ACCENT} r="2.5" />
                  </svg>
                </div>
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#1A1D21] p-6">
                  <p className="mb-6 w-full text-left text-xs text-slate-400">Traffic by channel</p>
                  <div
                    className="h-32 w-32 rounded-full border-8"
                    style={{ borderColor: "rgba(0,196,176,0.18)", borderTopColor: ACCENT }}
                  />
                  <div className="mt-4 grid w-full grid-cols-2 gap-2 text-[10px] text-slate-500">
                    <span style={{ color: ACCENT }}>● Direct</span>
                    <span>● Email</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
          <p className="mt-4 text-sm text-slate-500">{h.gallery_caption}</p>
        </section>

        {/* Cinematic CTA */}
        <section className="relative mt-auto w-full overflow-hidden bg-black">
          {/* Gradient backdrop (replaces the template's external video) */}
          <div
            className="absolute inset-0 z-0"
            style={{ background: "radial-gradient(120% 80% at 50% 120%, rgba(0,196,176,0.22), transparent 60%)" }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
          <div className="relative z-10 mx-auto max-w-4xl px-8 py-28 text-center md:py-32">
            <h2
              className="mb-6 text-5xl leading-tight text-white md:text-7xl"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
            >
              {h.cta_title}
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
              {h.cta_desc}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <a
                href={MAIL}
                className="min-w-[180px] rounded-full px-10 py-4 font-semibold text-[#0A0A0A] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                {h.cta_contact}
              </a>
              <Link
                href="/projects"
                className="min-w-[180px] rounded-full border border-white/20 bg-white/5 px-10 py-4 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                {h.cta_projects}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-black px-8 py-12">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-sm text-slate-500">© {year} Manuel Vera. {h.rights}</div>
            <div className="flex gap-8 text-sm text-slate-400">
              <Link href="/projects" className="transition-colors hover:text-white">{t.nav.projects}</Link>
              <Link href="/about" className="transition-colors hover:text-white">{t.nav.about}</Link>
              <a href={MAIL} className="transition-colors hover:text-white">{t.nav.contact}</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
