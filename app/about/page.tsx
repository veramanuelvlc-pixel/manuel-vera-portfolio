"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { barlow, instrumentSerif } from "@/lib/fonts"
import { BrandIcon } from "@/components/brand-icons"

const LINKEDIN = "https://www.linkedin.com/in/manuel-veraleon"
const GITHUB = "https://github.com/veramanuelvlc-pixel"
const brands = [
  { name: "vercel" as const, label: "Vercel", href: "https://vercel.com" },
  { name: "github" as const, label: "GitHub", href: GITHUB },
  { name: "supabase" as const, label: "Supabase", href: "https://supabase.com" },
  { name: "claude" as const, label: "Claude Code", href: "https://claude.com/claude-code" },
]

export default function About() {
  const { t, locale } = useLocale()
  const a = t.about

  return (
    <main
      className={`${barlow.variable} ${instrumentSerif.variable} min-h-screen px-6 max-w-4xl mx-auto`}
      style={{ fontFamily: "var(--font-barlow), sans-serif" }}
    >

      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm z-50">
        <Link href="/" className="font-mono text-sm text-[#00C4B0]">mv.dev</Link>
        <div className="flex gap-6 items-center text-sm text-white/50">
          <Link href="/about" className="text-white">{t.nav.about}</Link>
          <Link href="/projects" className="hover:text-white transition-colors">{t.nav.projects}</Link>
          <a href="mailto:veramanuelvlc@gmail.com" className="hover:text-white transition-colors">{t.nav.contact}</a>
          <LocaleToggle />
        </div>
      </nav>

      <section className="pt-36 pb-12 border-b border-white/5">
        <p className="text-[#00C4B0] text-xs uppercase tracking-widest mb-4">{a.title}</p>
        <h1 className="text-5xl font-serif italic leading-[1.05] mb-6">Manuel Vera</h1>
        <p className="text-white/70 text-lg max-w-2xl leading-relaxed text-pretty mb-8">{a.bio}</p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={locale === "es" ? "/cv-manuel-vera-es.pdf" : "/cv-manuel-vera-en.pdf"}
            download={locale === "es" ? "Manuel-Vera-CV.pdf" : "Manuel-Vera-Resume.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/70 text-sm rounded-lg hover:border-white/30 hover:text-white transition-colors"
          >
            {String.fromCharCode(8595)} {a.download_cv}
          </a>
          <div className="flex items-center gap-3">
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/50 hover:text-white transition-colors">
              <BrandIcon name="linkedin" label="LinkedIn" className="h-5 w-5" />
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-white/50 hover:text-white transition-colors">
              <BrandIcon name="github" label="GitHub" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 border-b border-white/5">
        <p className="text-xs text-white/55 uppercase tracking-widest mb-8">{a.experience}</p>
        <div className="flex flex-col gap-10">
          {a.jobs.map((job) => (
            <div key={job.company} className="grid md:grid-cols-[200px_1fr] gap-4">
              <div>
                <p className="font-mono text-xs text-white/55 leading-relaxed">{job.period}</p>
                <p className="text-sm text-white/55 mt-1">{job.company}</p>
              </div>
              <div>
                <p className="font-serif italic text-xl text-white mb-3">{job.role}</p>
                <ul className="flex flex-col gap-2">
                  {job.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                      <span className="text-[#00C4B0] mt-1 shrink-0">-</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 pb-24">
        <p className="text-xs text-white/55 uppercase tracking-widest mb-8">{a.skills_title}</p>
        <div className="grid md:grid-cols-3 gap-8">
          {a.skills.map((group) => (
            <div key={group.category}>
              <p className="text-sm text-white/55 mb-4">{group.category}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="px-3 py-1 border border-white/10 text-white/70 text-xs rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-xs text-white/55 uppercase tracking-widest mb-5">{t.home.built_with}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {brands.map((b) => (
              <a
                key={b.name}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/55 hover:text-white transition-colors"
              >
                <BrandIcon name={b.name} label={b.label} className="h-4 w-4" />
                <span className="text-sm">{b.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
