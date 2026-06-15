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
} from "recharts"
import type { TooltipContentProps } from "recharts"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"

type Totals = {
  spend: number
  impressions: number
  clicks: number
  leads: number
  purchases: number
  revenue: number
  cpl: number
  roas: number
  ctr: number
  date_range: { start: string; end: string }
}

type Day = {
  date: string
  spend: number
  impressions: number
  clicks: number
  leads: number
  purchases: number
  revenue: number
  cpl: number
  roas: number
  ctr: number
}

type Campaign = {
  campaign_id: string
  campaign_name: string
  campaign_objective: string
  spend: number
  impressions: number
  clicks: number
  leads: number
  purchases: number
  revenue: number
  cpl: number
  roas: number
  ctr: number
}

type Adset = {
  adset_id: string
  adset_name: string
  campaign_name: string
  spend: number
  impressions: number
  clicks: number
  leads: number
  cpl: number
  ctr: number
}

type MetaAds = {
  totals: Totals
  by_day: Day[]
  by_campaign: Campaign[]
  by_adset: Adset[]
}

type Metric = "leads" | "spend" | "cpl" | "roas"

const ACCENT = "#00C4B0"

const labels = {
  es: {
    eyebrow: "Caso de estudio",
    title: "Meta Ads Performance",
    subtitle: "Dashboard de campañas con KPIs, evolución diaria y desglose por adset.",
    back: "Volver a proyectos",
    loading: "Cargando datos…",
    error: "No se pudieron cargar los datos.",
    range: "Periodo",
    kpis: {
      spend: "Gasto total",
      leads: "Leads",
      cpl: "CPL",
      roas: "ROAS",
      clicks: "Clicks",
      ctr: "CTR",
    },
    daily: "Evolución diaria",
    metrics: { leads: "Leads", spend: "Gasto", cpl: "CPL", roas: "ROAS" },
    byCampaign: "Gasto por campaña",
    adsets: "Adsets",
    cols: { adset: "Adset", campaign: "Campaña", spend: "Gasto", leads: "Leads", cpl: "CPL", ctr: "CTR" },
  },
  en: {
    eyebrow: "Case study",
    title: "Meta Ads Performance",
    subtitle: "Campaign dashboard with KPIs, daily trend and adset breakdown.",
    back: "Back to projects",
    loading: "Loading data…",
    error: "Could not load data.",
    range: "Period",
    kpis: {
      spend: "Total spend",
      leads: "Leads",
      cpl: "CPL",
      roas: "ROAS",
      clicks: "Clicks",
      ctr: "CTR",
    },
    daily: "Daily trend",
    metrics: { leads: "Leads", spend: "Spend", cpl: "CPL", roas: "ROAS" },
    byCampaign: "Spend by campaign",
    adsets: "Adsets",
    cols: { adset: "Adset", campaign: "Campaign", spend: "Spend", leads: "Leads", cpl: "CPL", ctr: "CTR" },
  },
}

const nf = new Intl.NumberFormat("en-US")
const cf = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const cf2 = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

function MetaAdsTooltip({ active, payload, label, metric, m }: Partial<TooltipContentProps<number, string>> & { metric: Metric; m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  const fmt =
    metric === "spend" ? cf2(value) : metric === "cpl" ? cf2(value) : metric === "roas" ? value.toFixed(2) + "x" : nf.format(value)
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/40">{label}</p>
      <p className="font-mono text-sm text-white">
        <span style={{ color: ACCENT }}>{m.metrics[metric]}: </span>
        {fmt}
      </p>
    </div>
  )
}

function CampaignTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Campaign
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/60 mb-1">{p.campaign_name}</p>
      <p className="font-mono text-sm text-white">{cf2(p.spend)}</p>
      <p className="font-mono text-[11px] text-white/40">{nf.format(p.leads)} leads · CPL {cf2(p.cpl)}</p>
    </div>
  )
}

export default function MetaAdsDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<MetaAds | null>(null)
  const [error, setError] = useState(false)
  const [metric, setMetric] = useState<Metric>("leads")

  useEffect(() => {
    fetch("/data/meta_ads.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json: MetaAds) => setData(json))
      .catch(() => setError(true))
  }, [])

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
        <p className="font-mono text-[#00C4B0] text-xs uppercase tracking-widest mt-6 mb-4">{m.eyebrow}</p>
        <h1 className="text-4xl font-semibold mb-4">{m.title}</h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{m.subtitle}</p>
        {data && (
          <p className="font-mono text-xs text-white/30 mt-4">
            {m.range}: {data.totals.date_range.start} {String.fromCharCode(8594)} {data.totals.date_range.end}
          </p>
        )}
      </section>

      {!data && !error && (
        <div className="py-24 text-center font-mono text-sm text-white/30">{m.loading}</div>
      )}
      {error && (
        <div className="py-24 text-center font-mono text-sm text-red-400/70">{m.error}</div>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <section className="py-10 border-b border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
              {[
                { label: m.kpis.spend, value: cf(data.totals.spend) },
                { label: m.kpis.leads, value: nf.format(data.totals.leads) },
                { label: m.kpis.cpl, value: cf2(data.totals.cpl) },
                { label: m.kpis.roas, value: data.totals.roas.toFixed(2) + "x" },
                { label: m.kpis.clicks, value: nf.format(data.totals.clicks) },
                { label: m.kpis.ctr, value: data.totals.ctr.toFixed(2) + "%" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-[#0A0A0A] p-5">
                  <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-2">{kpi.label}</p>
                  <p className="font-mono text-2xl text-white tabular-nums" style={{ color: ACCENT }}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Daily line chart */}
          <section className="py-10 border-b border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.daily}</p>
              <div className="flex gap-2">
                {(["leads", "spend", "cpl", "roas"] as Metric[]).map((k) => (
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
                <LineChart data={data.by_day} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="lineFade" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    minTickGap={32}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <Tooltip content={<MetaAdsTooltip metric={metric} m={m} />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
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

          {/* Spend by campaign */}
          <section className="py-10 border-b border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.byCampaign}</p>
            <div style={{ height: data.by_campaign.length * 64 + 24 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.by_campaign}
                  margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => cf(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="campaign_name"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={180}
                  />
                  <Tooltip content={<CampaignTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="spend" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Adsets table */}
          <section className="py-10 pb-24">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.adsets}</p>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.adset}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.campaign}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.spend}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.leads}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.cpl}</th>
                    <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.ctr}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_adset.map((a) => (
                    <tr key={a.adset_id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/80">{a.adset_name}</td>
                      <td className="px-4 py-3 text-white/40">{a.campaign_name}</td>
                      <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{cf2(a.spend)}</td>
                      <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{nf.format(a.leads)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums" style={{ color: ACCENT }}>{cf2(a.cpl)}</td>
                      <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{a.ctr.toFixed(2)}%</td>
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
