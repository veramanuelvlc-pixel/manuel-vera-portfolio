"use client"
import { useState } from "react"
import metaAds from "@/public/data/meta_ads.json"
import { useLocale } from "@/lib/locale-context"
import { fmt } from "./project-fragment"

const ACCENT = "#00C4B0"

// First rows of public/data/meta_ads_raw.csv, trimmed to the columns that matter.
const RAW = [
  "date,campaign_name,spend,clicks,leads",
  "2024-01-01,Leads - Formulario Contacto,149.34,234,13",
  "2024-01-02,Leads - Formulario Contacto,165.08,337,17",
  "2024-01-03,Leads - Formulario Contacto,171.43,314,21",
  "2024-01-01,Conversion - Compra Directa,…",
  "… 455 filas · 3 campañas · 5 adsets",
]

function weekly() {
  const weeks: { spend: number; revenue: number }[] = []
  metaAds.by_day.forEach((d, i) => {
    const w = Math.floor(i / 7)
    weeks[w] ??= { spend: 0, revenue: 0 }
    weeks[w].spend += d.spend
    weeks[w].revenue += d.revenue
  })
  return weeks
}

function Fragment({ stage }: { stage: number }) {
  const { t, locale } = useLocale()
  const f = t.pipeline.fragment
  const nf = fmt(locale)
  const money = (v: number) => nf.money(v)
  const num = nf.n

  if (stage === 0) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03]">
        <p className="bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/60">{f.file}</p>
        <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-6 text-white/85">
          <code>
            {RAW.slice(0, -1).join("\n")}
            {"\n"}
            <span className="text-white/50">
              {locale === "es" ? RAW[RAW.length - 1] : "… 455 rows · 3 campaigns · 5 ad sets"}
            </span>
          </code>
        </pre>
      </div>
    )
  }

  if (stage === 1) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-white/50">
              <th className="pb-2 font-normal">{f.campaign}</th>
              <th className="pb-2 text-right font-normal">{f.spend}</th>
              <th className="pb-2 text-right font-normal">{f.leads}</th>
              <th className="pb-2 text-right font-normal">{f.revenue}</th>
            </tr>
          </thead>
          <tbody>
            {metaAds.by_campaign.map((c) => (
              <tr key={c.campaign_id} className="border-t border-white/[0.06]">
                <td className="py-2 pr-2 text-white/85">{c.campaign_name}</td>
                <td className="py-2 text-right text-white">{money(c.spend)}</td>
                <td className="py-2 text-right text-white">{c.leads ? num(c.leads) : "–"}</td>
                <td className="py-2 text-right text-white">{c.revenue ? money(c.revenue) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (stage === 2) {
    const w = weekly()
    const max = Math.max(...w.map((x) => x.revenue))
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-4 text-[13px] text-white/60">
          <span>{f.chartTitle}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-white/40" /> {f.spend}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: ACCENT }} /> {f.revenue}
          </span>
        </div>
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label={f.chartTitle}>
          {w.map((x, i) => (
            <div key={i} className="flex h-full flex-1 items-end gap-[2px]">
              <span className="flex-1 rounded-t-[2px] bg-white/40" style={{ height: `${(x.spend / max) * 100}%` }} />
              <span className="flex-1 rounded-t-[2px]" style={{ height: `${(x.revenue / max) * 100}%`, backgroundColor: ACCENT }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const [leads, , conv] = metaAds.by_campaign
  const traffic = metaAds.by_campaign[1]
  const tt = metaAds.totals
  const text =
    locale === "es"
      ? `Entre el 1 de enero y el 31 de marzo se invirtieron ${money(tt.spend)} en tres campañas. La de leads trajo ${num(leads.leads)} contactos a $${num(leads.cpl, 2)} cada uno. La de compra directa devolvió ${money(conv.revenue)}, un ROAS de ${num(conv.roas, 1)}×. La de tráfico gastó ${money(traffic.spend)} sin leads ni ventas: es la primera candidata a recortar.`
      : `Between January 1 and March 31, ${money(tt.spend)} went into three campaigns. The lead campaign brought ${num(leads.leads)} contacts at $${num(leads.cpl, 2)} each. Direct purchase returned ${money(conv.revenue)}, a ${num(conv.roas, 1)}× ROAS. Traffic spent ${money(traffic.spend)} with no leads or sales: it is the first candidate to cut.`
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="mb-2 text-[13px] text-white/60">{f.reportTitle}</p>
      <p className="text-[15px] leading-relaxed text-white/90">{text}</p>
    </div>
  )
}

export function Pipeline() {
  const { t } = useLocale()
  const p = t.pipeline
  const [stage, setStage] = useState(0)
  const current = p.stages[stage]

  return (
    <section aria-labelledby="pipeline-h" className="grid grid-cols-1 lg:min-h-[88svh] lg:grid-cols-2">
      <h2 id="pipeline-h" className="sr-only">
        {p.heading}
      </h2>

      {/* Fragment field */}
      <div className="flex min-h-[46svh] min-w-0 items-center justify-center bg-[#121410] px-[var(--gutter)] py-12 lg:order-2 lg:min-h-0">
        <div data-ui data-reveal style={{ "--i": 1 } as React.CSSProperties} className="w-full min-w-0 max-w-[520px] font-[family-name:var(--font-inter)]">
          <div key={stage} className="mv-fade">
            <Fragment stage={stage} />
          </div>
        </div>
      </div>

      {/* Clause field + slider */}
      <div className="flex flex-col justify-between gap-12 bg-[var(--surface)] px-[var(--gutter)] py-14 lg:order-1 lg:py-20">
        <p
          key={stage}
          aria-live="polite"
          className="mv-fade max-w-[14ch] text-[clamp(2.25rem,1rem+4.6vw,4.75rem)] font-semibold leading-[1] tracking-[-0.025em]"
        >
          {current.clause}
        </p>

        <div data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          <label htmlFor="pipeline-range" className="sr-only">
            {p.label}
          </label>
          <div className="relative">
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-[#c9c7bf]" />
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 bg-[var(--ink)] transition-[width] duration-200"
            style={{ width: `${(stage / (p.stages.length - 1)) * 100}%` }}
          />
          <input
            id="pipeline-range"
            type="range"
            min={0}
            max={p.stages.length - 1}
            step={1}
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            aria-valuetext={current.name}
            className="mv-range relative block w-full"
          />
          </div>
          <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            {p.stages.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  onClick={() => setStage(i)}
                  className={`text-left transition-colors duration-150 ${i === stage ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
                  aria-current={i === stage ? "step" : undefined}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
