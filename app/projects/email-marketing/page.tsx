"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"

type Totals = {
  sent: number
  delivered: number
  open_rate: number
  click_rate: number
  revenue: number
  orders: number
  conv_rate: number
  unsub_rate: number
  rpe: number
  date_range: { start: string; end: string }
}
type Week = { week: string; sent: number; open_rate: number; click_rate: number; revenue: number; orders: number }
type Campaign = { campaign_name: string; type: string; sent: number; open_rate: number; click_rate: number; revenue: number }
type AbTest = {
  test: string
  type: string
  subject_a: string
  subject_b: string
  sent_per_variant: number
  a_open_rate: number
  b_open_rate: number
  a_click_rate: number
  b_click_rate: number
  a_revenue: number
  b_revenue: number
  winner: string
}
type Email = { totals: Totals; by_week: Week[]; top_campaigns: Campaign[]; ab_tests: AbTest[] }

type TrendMetric = "open_rate" | "click_rate" | "revenue" | "sent"
type AbMetric = "open_rate" | "click_rate" | "revenue"

const ACCENT = "#E840D0"
const ACCENT_B = "#7C3AED"

const labels = {
  es: {
    eyebrow: "Caso de estudio",
    title: "Email Marketing",
    subtitle: "Open rate, CTR, revenue atribuido y comparativa A/B de campañas de email.",
    back: "Volver a proyectos",
    loading: "Cargando datos…",
    error: "No se pudieron cargar los datos.",
    range: "Periodo",
    kpis: { sent: "Enviados", open: "Open rate", ctr: "CTR", revenue: "Revenue", orders: "Órdenes", unsub: "Bajas" },
    trend: "Evolución semanal",
    metrics: { open_rate: "Open rate", click_rate: "CTR", revenue: "Revenue", sent: "Enviados" },
    ab: "Comparativa A/B",
    abMetrics: { open_rate: "Open rate", click_rate: "CTR", revenue: "Revenue" },
    variantA: "Variante A",
    variantB: "Variante B",
    winner: "Ganadora",
    topCampaigns: "Top campañas",
    cols: { campaign: "Campaña", type: "Tipo", sent: "Enviados", open: "Open", ctr: "CTR", revenue: "Revenue" },
  },
  en: {
    eyebrow: "Case study",
    title: "Email Marketing",
    subtitle: "Open rate, CTR, attributed revenue and A/B comparison of email campaigns.",
    back: "Back to projects",
    loading: "Loading data…",
    error: "Could not load data.",
    range: "Period",
    kpis: { sent: "Sent", open: "Open rate", ctr: "CTR", revenue: "Revenue", orders: "Orders", unsub: "Unsubs" },
    trend: "Weekly trend",
    metrics: { open_rate: "Open rate", click_rate: "CTR", revenue: "Revenue", sent: "Sent" },
    ab: "A/B comparison",
    abMetrics: { open_rate: "Open rate", click_rate: "CTR", revenue: "Revenue" },
    variantA: "Variant A",
    variantB: "Variant B",
    winner: "Winner",
    topCampaigns: "Top campaigns",
    cols: { campaign: "Campaign", type: "Type", sent: "Sent", open: "Open", ctr: "CTR", revenue: "Revenue" },
  },
}

const nf = new Intl.NumberFormat("en-US")
const cf0 = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const compact = (n: number) => "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
const pct = (n: number) => n.toFixed(2) + "%"

function fmtTrend(metric: TrendMetric, v: number) {
  if (metric === "revenue") return cf0(v)
  if (metric === "sent") return nf.format(v)
  return pct(v)
}

function TrendTooltip({ active, payload, label, metric, m }: Partial<TooltipContentProps<number, string>> & { metric: TrendMetric; m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/40">{label}</p>
      <p className="font-mono text-sm text-white">
        <span style={{ color: ACCENT }}>{m.metrics[metric]}: </span>
        {fmtTrend(metric, value)}
      </p>
    </div>
  )
}

function AbTooltip({ active, payload, label, abMetric }: Partial<TooltipContentProps<number, string>> & { abMetric: AbMetric }) {
  if (!active || !payload?.length) return null
  const fmt = (v: number) => (abMetric === "revenue" ? cf0(v) : pct(v))
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/60 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey as string} className="font-mono text-xs text-white">
          <span style={{ color: p.color }}>{p.name}: </span>
          {fmt(p.value as number)}
        </p>
      ))}
    </div>
  )
}

export default function EmailDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<Email | null>(null)
  const [error, setError] = useState(false)
  const [metric, setMetric] = useState<TrendMetric>("open_rate")
  const [abMetric, setAbMetric] = useState<AbMetric>("open_rate")

  useEffect(() => {
    fetch("/data/email.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json: Email) => setData(json))
      .catch(() => setError(true))
  }, [])

  const aKey = abMetric === "open_rate" ? "a_open_rate" : abMetric === "click_rate" ? "a_click_rate" : "a_revenue"
  const bKey = abMetric === "open_rate" ? "b_open_rate" : abMetric === "click_rate" ? "b_click_rate" : "b_revenue"

  return (
    <main className="min-h-screen px-6 max-w-5xl mx-auto">

      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm z-50">
        <Link href="/" className="font-mono text-sm text-[#00C4B0]">mv.dev</Link>
        <div className="flex gap-6 items-center text-sm text-white/50">
          <Link href="/about" className="hover:text-white transition-colors">{t.nav.about}</Link>
          <Link href="/projects" className="text-white">{t.nav.projects}</Link>
          <a href="mailto:veramanuelvlc@gmail.com" className="hover:text-white transition-colors">{t.nav.contact}</a>
          <LocaleToggle />
        </div>
      </nav>

      <section className="pt-36 pb-10 border-b border-white/5">
        <Link href="/projects" className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors">
          {String.fromCharCode(8592)} {m.back}
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest mt-6 mb-4" style={{ color: ACCENT }}>{m.eyebrow}</p>
        <h1 className="text-4xl font-semibold mb-4">{m.title}</h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{m.subtitle}</p>
        {data && (
          <p className="font-mono text-xs text-white/30 mt-4">
            {m.range}: {data.totals.date_range.start} {String.fromCharCode(8594)} {data.totals.date_range.end}
          </p>
        )}
      </section>

      {!data && !error && <div className="py-24 text-center font-mono text-sm text-white/30">{m.loading}</div>}
      {error && <div className="py-24 text-center font-mono text-sm text-red-400/70">{m.error}</div>}

      {data && (
        <>
          {/* KPI cards */}
          <section className="py-10 border-b border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
              {[
                { label: m.kpis.sent, value: nf.format(data.totals.sent) },
                { label: m.kpis.open, value: pct(data.totals.open_rate) },
                { label: m.kpis.ctr, value: pct(data.totals.click_rate) },
                { label: m.kpis.revenue, value: compact(data.totals.revenue) },
                { label: m.kpis.orders, value: nf.format(data.totals.orders) },
                { label: m.kpis.unsub, value: data.totals.unsub_rate + "%" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-[#0A0A0A] p-5">
                  <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-2">{kpi.label}</p>
                  <p className="font-mono text-2xl tabular-nums" style={{ color: ACCENT }}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly trend */}
          <section className="py-10 border-b border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.trend}</p>
              <div className="flex gap-2">
                {(["open_rate", "click_rate", "revenue", "sent"] as TrendMetric[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setMetric(k)}
                    className="font-mono text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={
                      metric === k
                        ? { borderColor: ACCENT + "60", color: ACCENT, backgroundColor: ACCENT + "12" }
                        : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                    }
                  >
                    {m.metrics[k]}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.by_week} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) => (metric === "revenue" ? compact(v) : metric === "sent" ? nf.format(v) : v + "%")}
                  />
                  <Tooltip content={<TrendTooltip metric={metric} m={m} />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={ACCENT}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: ACCENT, stroke: "#0A0A0A", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* A/B comparison */}
          <section className="py-10 border-b border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.ab}</p>
              <div className="flex gap-2">
                {(["open_rate", "click_rate", "revenue"] as AbMetric[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setAbMetric(k)}
                    className="font-mono text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={
                      abMetric === k
                        ? { borderColor: ACCENT + "60", color: ACCENT, backgroundColor: ACCENT + "12" }
                        : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                    }
                  >
                    {m.abMetrics[k]}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ab_tests} margin={{ top: 8, right: 8, bottom: 0, left: -4 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="test"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) => (abMetric === "revenue" ? compact(v) : v + "%")}
                  />
                  <Tooltip content={<AbTooltip abMetric={abMetric} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} iconType="circle" />
                  <Bar dataKey={aKey} name={m.variantA} fill={ACCENT_B} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey={bKey} name={m.variantB} fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.ab_tests.map((ab) => (
                <div key={ab.test} className="border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white/80">{ab.test}</p>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: ACCENT + "50", color: ACCENT }}
                    >
                      {m.winner}: {ab.winner}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-white/40 truncate">A: {ab.subject_a}</p>
                  <p className="font-mono text-[11px] text-white/40 truncate">B: {ab.subject_b}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Top campaigns */}
          <section className="py-10 pb-24">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.topCampaigns}</p>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.campaign}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.type}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.sent}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.open}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.ctr}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.revenue}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_campaigns.map((c, i) => (
                    <tr key={c.campaign_name + i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/80">{c.campaign_name}</td>
                      <td className="px-4 py-3 text-white/40">{c.type}</td>
                      <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{nf.format(c.sent)}</td>
                      <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{pct(c.open_rate)}</td>
                      <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{pct(c.click_rate)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums" style={{ color: ACCENT }}>{cf0(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

    </main>
  )
}
