import Link from "next/link"
import { DollarSign, Target, Tag, TrendingUp } from "lucide-react"
import metaAds from "@/public/data/meta_ads.json"
import { MetaAdsKpiCards, type Kpi } from "@/components/meta-ads-kpi-cards"

const ACCENT = "#00C4B0"

// Dark palette for the embedded preview (the dashboard itself is theme-aware;
// here we lock it to the landing's dark surface).
const PREVIEW_VARS = {
  "--line": "rgba(255,255,255,0.08)",
  "--panel": "rgba(255,255,255,0.03)",
  "--txt": "#ffffff",
  "--txt3": "rgba(255,255,255,0.55)",
  "--txt4": "rgba(255,255,255,0.35)",
} as React.CSSProperties

const cf0 = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const nf = new Intl.NumberFormat("en-US")

export type PreviewLabels = {
  kicker: string
  cta: string
  spend: string
  leads: string
  cpl: string
  roas: string
}

/** Builds a normalized SVG polyline path (viewBox 0 0 100 H) from a series. */
function buildSparkline(series: number[], width = 100, height = 36) {
  const n = series.length
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const x = (i: number) => (i / (n - 1)) * width
  const y = (v: number) => height - ((v - min) / span) * height
  const line = series.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ")
  const area = `0,${height} ${line} ${width},${height}`
  return { line, area, height, width }
}

export function DashboardPreview({ labels }: { labels: PreviewLabels }) {
  const t = metaAds.totals
  const kpis: Kpi[] = [
    { key: "spend", Icon: DollarSign, label: labels.spend, value: cf0(t.spend) },
    { key: "leads", Icon: Target, label: labels.leads, value: nf.format(t.leads) },
    { key: "cpl", Icon: Tag, label: labels.cpl, value: "$" + t.cpl.toFixed(2) },
    { key: "roas", Icon: TrendingUp, label: labels.roas, value: t.roas.toFixed(2) + "×" },
  ]

  const spark = buildSparkline(metaAds.by_day.map((d) => d.revenue))

  return (
    <section className="mx-auto w-full max-w-5xl px-8 pt-10 pb-24">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
        {labels.kicker}
      </p>

      <Link
        href="/projects/meta-ads"
        aria-label={labels.cta}
        className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
      >
        <div
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/40 transition duration-300 ease-out group-hover:-translate-y-1 group-hover:border-white/20 group-hover:brightness-110 motion-reduce:transform-none motion-reduce:transition-none"
          style={PREVIEW_VARS}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate rounded-md bg-white/[0.04] px-3 py-1 font-mono text-xs text-white/40">
              mv.dev/projects/meta-ads
            </span>
          </div>

          {/* Preview body */}
          <div className="p-5 sm:p-6">
            <MetaAdsKpiCards kpis={kpis} />

            {/* Revenue trend — hidden on mobile so the KPI column stays clean */}
            <div className="mt-4 hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:block">
              <div className="mb-4 flex items-center gap-2 text-xs text-[var(--txt3)]">
                <TrendingUp size={15} /> {t.date_range.start} → {t.date_range.end}
              </div>
              <div className="h-28 w-full">
                <svg viewBox={`0 0 ${spark.width} ${spark.height}`} preserveAspectRatio="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="previewFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={spark.area} fill="url(#previewFade)" />
                  <polyline
                    points={spark.line}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-white/60 transition-colors group-hover:text-white">
              {labels.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </p>
          </div>
        </div>
      </Link>
    </section>
  )
}
