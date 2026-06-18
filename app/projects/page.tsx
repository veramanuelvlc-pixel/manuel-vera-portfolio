"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { barlow, instrumentSerif } from "@/lib/fonts"

const projects = [
  {
    slug: "meta-ads",
    title: "Meta Ads Performance",
    title_en: "Meta Ads Performance",
    description: "Dashboard de campañas con KPIs en tiempo real, gráficas diarias y tabla de adsets.",
    description_en: "Campaign dashboard with real-time KPIs, daily charts and adset table.",
    tags: ["Python", "Meta Ads API", "Recharts", "Next.js"],
    status: "en progreso",
    status_en: "in progress",
    color: "#00C4B0",
  },
  {
    slug: "ecommerce",
    title: "E-commerce Analytics",
    title_en: "E-commerce Analytics",
    description: "Análisis de 100k órdenes reales: revenue, LTV, churn y funnel de conversión.",
    description_en: "Analysis of 100k real orders: revenue, LTV, churn and conversion funnel.",
    tags: ["Python", "pandas", "Recharts", "Supabase"],
    status: "en progreso",
    status_en: "in progress",
    color: "#7C3AED",
  },
  {
    slug: "email-marketing",
    title: "Email Marketing",
    title_en: "Email Marketing",
    description: "Open rate, CTR, revenue atribuido y comparativa A/B de campañas de email.",
    description_en: "Open rate, CTR, attributed revenue and A/B comparison of email campaigns.",
    tags: ["Klaviyo API", "Python", "Recharts"],
    status: "en progreso",
    status_en: "in progress",
    color: "#E840D0",
  },
  {
    slug: "real-estate",
    title: "Real Estate Market",
    title_en: "Real Estate Market",
    description: "Precios, ocupación y revenue estimado de listings de Airbnb por zona.",
    description_en: "Prices, occupancy and estimated revenue from Airbnb listings by area.",
    tags: ["Python", "D3.js", "Supabase"],
    status: "en progreso",
    status_en: "in progress",
    color: "#F59E0B",
  },
  {
    slug: "ai-report",
    title: "AI Report Generator",
    title_en: "AI Report Generator",
    description: "Sube un CSV de campañas y Claude genera un análisis completo en lenguaje natural.",
    description_en: "Upload a campaign CSV and Claude generates a full natural language analysis.",
    tags: ["Claude API", "Next.js", "Python"],
    status: "en progreso",
    status_en: "in progress",
    color: "#00C4B0",
  },
]

export default function Projects() {
  const { t, locale } = useLocale()

  return (
    <main
      className={`${barlow.variable} ${instrumentSerif.variable} min-h-screen px-6 max-w-4xl mx-auto`}
      style={{ fontFamily: "var(--font-barlow), sans-serif" }}
    >

      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm z-50">
        <Link href="/" className="font-mono text-sm text-[#00C4B0]">mv.dev</Link>
        <div className="flex gap-6 items-center text-sm text-white/50">
          <Link href="/about" className="hover:text-white transition-colors">{t.nav.about}</Link>
          <Link href="/projects" className="text-white">{t.nav.projects}</Link>
          <a href="mailto:veramanuelvlc@gmail.com" className="hover:text-white transition-colors">{t.nav.contact}</a>
          <LocaleToggle />
        </div>
      </nav>

      <section className="pt-36 pb-12 border-b border-white/5">
        <p className="text-[#00C4B0] text-xs uppercase tracking-widest mb-4">{t.nav.projects}</p>
        <h1 className="text-5xl font-serif italic leading-[1.05] mb-4">{locale === "es" ? "Proyectos" : "Projects"}</h1>
        <p className="text-white/60 text-lg">{locale === "es" ? "Dashboards con datos reales y open source." : "Dashboards built with real and open source data."}</p>
      </section>

      <section className="py-12 pb-24">
        <div className="flex flex-col gap-4">
          {projects.map((p, i) => (
            <Link key={p.slug} href={p.status === "en progreso" ? `/projects/${p.slug}` : "#"} className="group block">
              <div className="border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all hover:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-white/20">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="font-serif italic text-xl text-white group-hover:text-[#00C4B0] transition-colors">
                      {locale === "es" ? p.title : p.title_en}
                    </h2>
                  </div>
                  <span className="font-mono text-xs px-2 py-1 rounded-full border shrink-0" style={{ borderColor: p.status === "en progreso" ? p.color + "40" : "rgba(255,255,255,0.08)", color: p.status === "en progreso" ? p.color : "rgba(255,255,255,0.3)" }}>
                    {locale === "es" ? p.status : p.status_en}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed text-pretty mb-4 ml-7">
                  {locale === "es" ? p.description : p.description_en}
                </p>
                <div className="flex flex-wrap gap-2 ml-7">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-xs text-white/50 px-2 py-0.5 border border-white/10 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
