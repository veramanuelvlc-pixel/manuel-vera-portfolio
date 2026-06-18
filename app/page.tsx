"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { barlow, instrumentSerif } from "@/lib/fonts"
import { BrandIcon } from "@/components/brand-icons"

const ACCENT = "#00C4B0"
const MAIL = "mailto:veramanuelvlc@gmail.com"
const WHATSAPP = "https://wa.me/59177442301"
const LINKEDIN = "https://www.linkedin.com/in/manuel-veraleon"
const GITHUB = "https://github.com/veramanuelvlc-pixel"

const stackLine = "Python · Meta Ads API · Next.js · Claude API"

const brands = [
  { name: "vercel" as const, label: "Vercel", href: "https://vercel.com" },
  { name: "github" as const, label: "GitHub", href: GITHUB },
  { name: "supabase" as const, label: "Supabase", href: "https://supabase.com" },
  { name: "claude" as const, label: "Claude Code", href: "https://claude.com/claude-code" },
]

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"

// TODO: reemplazar con vídeo propio o eliminar si no hay uno.
// Placeholder de ejemplo exportado por Stitch (stream de demo de Mux).
const HERO_VIDEO_SRC = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"

function useHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const play = () => {
      if (!reduceMotion) video.play().catch(() => {})
    }

    let hls: import("hls.js").default | null = null
    let cancelled = false

    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled || !videoRef.current) return
        if (Hls.isSupported()) {
          hls = new Hls()
          hls.loadSource(HERO_VIDEO_SRC)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, play)
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS (Safari)
          video.src = HERO_VIDEO_SRC
          video.addEventListener("loadedmetadata", play)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      video.removeEventListener("loadedmetadata", play)
      if (hls) hls.destroy()
    }
  }, [])

  return videoRef
}

export default function Home() {
  const { t } = useLocale()
  const h = t.home
  const year = new Date().getFullYear()
  const videoRef = useHeroVideo()

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
        {/* Cinematic hero (video background) */}
        <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
          {/* Background video */}
          <video
            ref={videoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-50"
            style={{ backgroundColor: "#0A0A0A" }}
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          {/* Blend + legibility overlays */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-48 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[#0A0A0A]/45" />

          {/* Content */}
          <div className="relative z-[2] mx-auto max-w-4xl px-8 py-28 text-center">
            <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              {t.hero.role}
            </span>
            <h1
              className="mb-6 text-balance text-6xl leading-[1.05] text-white md:text-8xl"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
            >
              Manuel Vera
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-slate-200 md:text-xl">
              {t.hero.description}
              <span className="mt-4 block font-mono text-sm text-slate-400">{stackLine}</span>
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/projects"
                className="liquid-glass-strong inline-flex min-w-[180px] items-center justify-center px-10 py-4 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
              >
                {t.hero.cta_projects}
              </Link>
              <Link
                href="/about"
                className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-white px-10 py-4 font-semibold text-[#0A0A0A] transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
              >
                {t.hero.cta_about}
              </Link>
            </div>
          </div>
        </section>

        {/* Built-with / stack logos */}
        <section className="mx-auto w-full max-w-5xl px-8 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{h.built_with}</span>
            {brands.map((b) => (
              <a
                key={b.name}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
              >
                <BrandIcon name={b.name} label={b.label} className="h-4 w-4" />
                <span className="text-sm">{b.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section className="mx-auto w-full max-w-5xl px-8 pt-10 pb-24">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {t.stats.map((s) => (
              <div key={s.label} className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <div
                  className={`mb-1 flex min-h-[2.25rem] items-center justify-center whitespace-nowrap font-bold text-white ${
                    s.value.length > 4 ? "text-base sm:text-xl md:text-2xl" : "text-3xl"
                  }`}
                >
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative mt-auto w-full overflow-hidden bg-black">
          <div
            className="absolute inset-0 z-0"
            style={{ background: "radial-gradient(120% 80% at 50% 120%, rgba(0,196,176,0.22), transparent 60%)" }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
          <div className="relative z-10 mx-auto max-w-4xl px-8 py-32 text-center md:py-40">
            <h2
              className="mb-6 text-balance text-5xl leading-tight text-white md:text-7xl"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
            >
              {h.cta_title}
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              {h.cta_desc}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <a
                href={MAIL}
                className="min-w-[180px] rounded-full px-10 py-4 font-semibold text-[#0A0A0A] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                style={{ backgroundColor: ACCENT }}
              >
                {h.cta_contact}
              </a>
              <Link
                href="/projects"
                className="min-w-[180px] rounded-full border border-white/20 bg-white/5 px-10 py-4 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {h.cta_projects}
              </Link>
            </div>
          </div>
        </section>

        {/* Direct contact */}
        <section className="mx-auto w-full max-w-3xl px-8 py-24 text-center">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            {h.contact_kicker}
          </span>
          <h2
            className="mb-10 text-balance text-3xl text-white md:text-4xl"
            style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
          >
            {h.contact_heading}
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={`liquid-glass-strong inline-flex min-w-[220px] items-center justify-center gap-2.5 px-8 py-4 font-semibold text-white ${focusRing}`}
            >
              <BrandIcon name="whatsapp" label="WhatsApp" className="h-5 w-5" />
              {h.whatsapp}
            </a>
            <a
              href={MAIL}
              className={`inline-flex min-w-[220px] items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 font-semibold text-[#0A0A0A] transition-colors hover:bg-slate-200 ${focusRing}`}
            >
              <Mail size={18} />
              {h.email}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-black px-8 py-12">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-sm text-slate-500">© {year} Manuel Vera. {h.rights}</div>
            <div className="flex items-center gap-6">
              <nav className="flex gap-8 text-sm text-slate-400">
                <Link href="/projects" className="transition-colors hover:text-white">{t.nav.projects}</Link>
                <Link href="/about" className="transition-colors hover:text-white">{t.nav.about}</Link>
                <a href={MAIL} className="transition-colors hover:text-white">{t.nav.contact}</a>
              </nav>
              <span className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-4">
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 transition-colors hover:text-white">
                  <BrandIcon name="linkedin" label="LinkedIn" className="h-5 w-5" />
                </a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-slate-400 transition-colors hover:text-white">
                  <BrandIcon name="github" label="GitHub" className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
