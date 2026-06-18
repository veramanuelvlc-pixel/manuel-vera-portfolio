"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { barlow, instrumentSerif } from "@/lib/fonts"

const ACCENT = "#00C4B0"
const GITHUB_URL = "https://github.com/veramanuelvlc-pixel"
const MAIL = "mailto:veramanuelvlc@gmail.com"

const stackLine = "Python · Meta Ads API · Next.js · Claude API"

function GithubIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z" />
    </svg>
  )
}

export default function Home() {
  const { t } = useLocale()
  const h = t.home
  const year = new Date().getFullYear()

  const navItems = [
    { label: h.nav_home, href: "/", active: true },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.contact, href: MAIL },
  ]

  return (
    <div
      className={`${barlow.variable} ${instrumentSerif.variable} flex min-h-screen bg-[#121417] text-slate-300`}
      style={{ fontFamily: "var(--font-barlow), sans-serif" }}
    >
      {/* Sidebar (desktop) */}
      <aside className="fixed z-20 hidden h-full w-64 flex-col border-r border-white/[0.06] bg-[#1A1D21] p-8 md:flex">
        <div className="mb-12">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-white">Manuel Vera</Link>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors"
              style={
                item.active
                  ? { backgroundColor: "rgba(0,196,176,0.14)", color: ACCENT }
                  : { color: "#94a3b8" }
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-4">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-slate-500 transition-colors hover:text-white" aria-label="GitHub">
            <GithubIcon />
          </a>
          <a href={MAIL} className="text-slate-500 transition-colors hover:text-white" aria-label="Email">
            <MailIcon />
          </a>
          <span className="ml-auto"><LocaleToggle /></span>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#1A1D21]/90 px-5 py-4 backdrop-blur md:hidden">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">Manuel Vera</Link>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <Link href="/projects" className="uppercase tracking-wide hover:text-white">{t.nav.projects}</Link>
          <Link href="/about" className="uppercase tracking-wide hover:text-white">{t.nav.about}</Link>
          <LocaleToggle />
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-screen flex-1 flex-col bg-[#121417] pt-16 md:ml-64 md:pt-0">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-8 pb-16 pt-20 text-center">
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
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#121417] to-transparent" />
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
