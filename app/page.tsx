"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"

const stack = [
  "Python", "Meta Ads API", "Next.js", "Supabase",
  "Klaviyo API", "Claude API", "pandas", "SQL",
]

export default function Home() {
  const { t } = useLocale()

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 max-w-4xl mx-auto">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm z-50">
        <span className="font-mono text-sm text-[#00C4B0]">mv.dev</span>
        <div className="flex gap-6 items-center text-sm text-white/50">
          <Link href="/about" className="hover:text-white transition-colors">{t.nav.about}</Link>
          <Link href="/projects" className="hover:text-white transition-colors">{t.nav.projects}</Link>
          <a href="mailto:veramanuelvlc@gmail.com" className="hover:text-white transition-colors">{t.nav.contact}</a>
          <LocaleToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20">
        <p className="font-mono text-[#00C4B0] text-sm mb-4 tracking-widest uppercase">
          {t.hero.role}
        </p>
        <h1 className="text-5xl font-semibold leading-tight mb-4">
          Manuel Vera
        </h1>
        <p className="text-white/50 text-lg max-w-xl mb-3">
          {t.hero.description}
        </p>
        <p className="font-mono text-sm text-white/30 mb-10">
          Python · Meta Ads API · Next.js · Claude API
        </p>

        <div className="flex gap-4">
          <Link
            href="/projects"
            className="px-6 py-3 bg-[#00C4B0] text-[#0A0A0A] font-medium text-sm rounded-lg hover:bg-[#00C4B0]/90 transition-colors"
          >
            {t.hero.cta_projects}
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 border border-white/10 text-white/70 text-sm rounded-lg hover:border-white/30 hover:text-white transition-colors"
          >
            {t.hero.cta_about}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12 border-t border-white/5">
        {t.stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="font-mono text-3xl font-semibold text-[#00C4B0]">{s.value}</span>
            <span className="text-sm text-white/40">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Stack */}
      <section className="py-12 border-t border-white/5">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{t.hero.stack_label}</p>
        <div className="flex flex-wrap gap-2">
          {stack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 border border-white/10 text-white/60 text-sm rounded-full font-mono hover:border-[#00C4B0]/50 hover:text-[#00C4B0] transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

    </main>
  )
}
