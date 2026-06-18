"use client"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import type { TooltipContentProps } from "recharts"
import {
  Globe,
  Activity,
  Target,
  MousePointerClick,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { ThemeProvider, useTheme } from "@/lib/theme-context"
import { DashTopNav } from "@/components/dashboard/dash-top-nav"

type Day = { date: string; spend: number; impressions: number; clicks: number; leads: number; revenue: number; ctr: number }
type Campaign = { campaign_name: string; spend: number }
type MetaAds = {
  totals: { spend: number; impressions: number; clicks: number; leads: number; revenue: number; ctr: number; date_range: { start: string; end: string } }
  by_day: Day[]
  by_campaign: Campaign[]
}

const ACCENT = "#00C4B0"

const labels = {
  es: {
    back: "Proyectos",
    loading: "Cargando…",
    kpis: { leads: "Leads", clicks: "Clicks", reach: "Alcance total", ctr: "Engagement medio" },
    sinceLast: "vs mes anterior",
    today: "Hoy",
    revenue: "Ingresos",
    todayLbl: "Hoy",
    yesterday: "Ayer",
    budget: "Presupuesto de hoy",
    usedToday: "Usado hoy",
    allowance: "Límite diario",
    used: "usado",
    peak: "Mejor día",
    peakSub: (d: string, p: string) => `${d} concentra ~${p}% de los leads`,
  },
  en: {
    back: "Projects",
    loading: "Loading…",
    kpis: { leads: "Leads", clicks: "Clicks", reach: "Total reach", ctr: "Avg. engagement" },
    sinceLast: "since last month",
    today: "Today",
    revenue: "Revenue",
    todayLbl: "Today",
    yesterday: "Yesterday",
    budget: "Today's budget",
    usedToday: "Used today",
    allowance: "Daily allowance",
    used: "used",
    peak: "Best day",
    peakSub: (d: string, p: string) => `${d} drives ~${p}% of leads`,
  },
}

const nf = new Intl.NumberFormat("en-US")
const cf = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const cf2 = (n: number) => "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
const pctSigned = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%"

type ChartPalette = {
  tick: string
  axisLine: string
  cursor: string
  barTop: string
  barBottom: string
  budgetTop: string
  budgetBottom: string
  nonPeak: string
  tipBg: string
  tipBorder: string
  tipText: string
  tipLabel: string
}

function RevenueTooltip({ active, payload, label, c }: Partial<TooltipContentProps<number, string>> & { c: ChartPalette }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ backgroundColor: c.tipBg, border: `1px solid ${c.tipBorder}` }}>
      <p className="text-[11px] mb-0.5" style={{ color: c.tipLabel }}>{label}</p>
      <p className="text-sm font-medium tabular-nums" style={{ color: c.tipText }}>{cf2(payload[0].value as number)}</p>
    </div>
  )
}

const DARK_VARS: React.CSSProperties = {
  "--bg": "#0a0a0a",
  "--panel": "#121212",
  "--line": "rgba(255,255,255,0.06)",
  "--txt": "#ffffff",
  "--txt2": "rgba(255,255,255,0.70)",
  "--txt3": "rgba(255,255,255,0.45)",
  "--txt4": "rgba(255,255,255,0.30)",
  "--track": "rgba(255,255,255,0.06)",
} as React.CSSProperties

const LIGHT_VARS: React.CSSProperties = {
  "--bg": "#F6F7F9",
  "--panel": "#ffffff",
  "--line": "rgba(17,24,39,0.09)",
  "--txt": "#15161c",
  "--txt2": "#41444f",
  "--txt3": "#6b7280",
  "--txt4": "#9aa1ad",
  "--track": "rgba(17,24,39,0.07)",
} as React.CSSProperties

export default function MetaAdsDashboard() {
  return (
    <ThemeProvider>
      <MetaAdsInner />
    </ThemeProvider>
  )
}

function MetaAdsInner() {
  const { locale } = useLocale()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const m = labels[locale]
  const [data, setData] = useState<MetaAds | null>(null)

  useEffect(() => {
    fetch("/data/meta_ads.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const c: ChartPalette = dark
    ? {
        tick: "rgba(255,255,255,0.30)",
        axisLine: "rgba(255,255,255,0.08)",
        cursor: "rgba(255,255,255,0.03)",
        barTop: "#b5b5b5",
        barBottom: "#1c1c1c",
        budgetTop: "#565656",
        budgetBottom: "#2a2a2a",
        nonPeak: "rgba(255,255,255,0.18)",
        tipBg: "#1a1a1a",
        tipBorder: "rgba(255,255,255,0.1)",
        tipText: "#ffffff",
        tipLabel: "rgba(255,255,255,0.4)",
      }
    : {
        tick: "#9aa1ad",
        axisLine: "rgba(17,24,39,0.12)",
        cursor: "rgba(17,24,39,0.04)",
        barTop: "#6b7280",
        barBottom: "#dfe2e7",
        budgetTop: "#94a3b8",
        budgetBottom: "#cbd5e1",
        nonPeak: "rgba(17,24,39,0.12)",
        tipBg: "#ffffff",
        tipBorder: "rgba(17,24,39,0.1)",
        tipText: "#15161c",
        tipLabel: "#6b7280",
      }

  const d = useMemo(() => {
    if (!data) return null
    const byMonth = new Map<string, { leads: number; clicks: number; impressions: number }>()
    for (const day of data.by_day) {
      const k = day.date.slice(0, 7)
      const cur = byMonth.get(k) ?? { leads: 0, clicks: 0, impressions: 0 }
      cur.leads += day.leads
      cur.clicks += day.clicks
      cur.impressions += day.impressions
      byMonth.set(k, cur)
    }
    const months = [...byMonth.keys()].sort()
    const L = byMonth.get(months[months.length - 1])!
    const P = months.length > 1 ? byMonth.get(months[months.length - 2])! : null
    const mom = (cur: number, prv?: number) => (prv && prv > 0 ? ((cur - prv) / prv) * 100 : 0)
    const ctrOf = (x: { clicks: number; impressions: number } | null) => (x && x.impressions > 0 ? (x.clicks / x.impressions) * 100 : 0)

    const days = data.by_day
    const last = days[days.length - 1]
    const prev = days[days.length - 2]
    const revToday = last.revenue
    const revYest = prev.revenue
    const revDelta = revYest > 0 ? ((revToday - revYest) / revYest) * 100 : 0
    const revBars = days.slice(-24).map((x) => ({ date: x.date.slice(5), revenue: Math.round(x.revenue) }))

    const avgSpend = data.totals.spend / days.length
    const allowance = Math.ceil((avgSpend * 1.25) / 50) * 50
    const usedToday = last.spend
    const usedPct = Math.min(100, Math.round((usedToday / allowance) * 100))

    const wdNames = locale === "es" ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const wd = Array.from({ length: 7 }, (_, i) => ({ day: wdNames[i], leads: 0 }))
    let totalLeads = 0
    for (const day of days) {
      const wi = new Date(day.date + "T00:00:00Z").getUTCDay()
      wd[wi].leads += day.leads
      totalLeads += day.leads
    }
    const peak = wd.reduce((a, b) => (b.leads > a.leads ? b : a), wd[0])
    const peakShare = totalLeads > 0 ? ((peak.leads / totalLeads) * 100).toFixed(0) : "0"
    const wdChart = [1, 2, 3, 4, 5, 6, 0].map((i) => wd[i])

    return {
      kpis: [
        { key: "leads", Icon: Target, label: m.kpis.leads, value: nf.format(data.totals.leads), delta: mom(L.leads, P?.leads) },
        { key: "clicks", Icon: MousePointerClick, label: m.kpis.clicks, value: nf.format(data.totals.clicks), delta: mom(L.clicks, P?.clicks) },
        { key: "reach", Icon: Globe, label: m.kpis.reach, value: compact(data.totals.impressions), delta: mom(L.impressions, P?.impressions) },
        { key: "ctr", Icon: Activity, label: m.kpis.ctr, value: data.totals.ctr.toFixed(2) + "%", delta: mom(ctrOf(L), ctrOf(P)) },
      ],
      revToday, revYest, revDelta, revBars,
      allowance, usedToday, usedPct,
      wdChart, peak, peakShare,
    }
  }, [data, locale, m])

  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-[var(--txt)]"
      style={{ ...(dark ? DARK_VARS : LIGHT_VARS), fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <DashTopNav backLabel={m.back} />

      <div className="mx-auto w-full max-w-7xl p-6">
        {!d && <p className="text-[var(--txt4)] text-sm py-20 text-center">{m.loading}</p>}

        {d && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {d.kpis.map(({ key, Icon, label, value, delta }) => {
                const up = delta >= 0
                return (
                  <div key={key} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                    <div className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4">
                      <Icon size={15} /> {label}
                    </div>
                    <p className="text-2xl font-semibold tabular-nums">{value}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs">
                      <span className={`flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-500"}`}>
                        {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {pctSigned(delta)}
                      </span>
                      <span className="text-[var(--txt4)]">{m.sinceLast}</span>
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Today heading */}
            <h2 className="text-lg font-semibold mt-8 mb-4">{m.today}</h2>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Revenue */}
              <div className="lg:col-span-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Activity size={14} /> {m.revenue}</span>
                <div className="flex items-end gap-6 mb-5">
                  <div>
                    <span className="flex items-center gap-1.5 text-[11px] text-[var(--txt3)]"><span className="h-2 w-2 rounded-full bg-[var(--txt2)]" /> {m.todayLbl}</span>
                    <p className="text-2xl font-semibold tabular-nums mt-1">{cf2(d.revToday)}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[11px] text-[var(--txt3)]"><span className="h-2 w-2 rounded-full bg-[var(--txt4)]" /> {m.yesterday}</span>
                    <p className="text-2xl font-semibold tabular-nums mt-1 text-[var(--txt2)]">{cf2(d.revYest)}</p>
                  </div>
                  <span className={`ml-auto flex items-center gap-0.5 text-xs ${d.revDelta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {d.revDelta >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{pctSigned(d.revDelta)}
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.revBars} margin={{ top: 4, right: 0, bottom: 0, left: -16 }}>
                      <defs>
                        <linearGradient id="barFade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c.barTop} />
                          <stop offset="100%" stopColor={c.barBottom} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => "$" + compact(v)} />
                      <Tooltip content={<RevenueTooltip c={c} />} cursor={{ fill: c.cursor }} />
                      <Bar dataKey="revenue" fill="url(#barFade)" radius={[2, 2, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                {/* Budget */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Target size={14} /> {m.budget}</span>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[11px] text-[var(--txt3)]">{m.usedToday}</p>
                      <p className="text-xl font-semibold tabular-nums mt-0.5">{cf2(d.usedToday)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[var(--txt3)]">{m.allowance}</p>
                      <p className="text-xl font-semibold tabular-nums mt-0.5 text-[var(--txt2)]">{cf(d.allowance)}</p>
                    </div>
                  </div>
                  <div className="relative h-20 rounded-lg bg-[var(--track)] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-y-0 left-0" style={{ width: `${d.usedPct}%`, background: `linear-gradient(to top, ${c.budgetBottom}, ${c.budgetTop})` }} />
                    <span className="relative text-sm font-semibold">{d.usedPct}% <span className="text-[var(--txt3)] font-normal">{m.used}</span></span>
                  </div>
                </div>

                {/* Peak day */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-3"><BarChart3 size={14} /> {m.peak}</span>
                  <p className="text-lg font-semibold">{d.peak.day}</p>
                  <p className="text-[11px] text-[var(--txt3)] mb-3">{m.peakSub(d.peak.day, d.peakShare)}</p>
                  <div className="h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={d.wdChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <XAxis dataKey="day" tick={{ fill: c.tick, fontSize: 9 }} tickLine={false} axisLine={false} interval={0} />
                        <Bar dataKey="leads" radius={[2, 2, 0, 0]} maxBarSize={20}>
                          {d.wdChart.map((w, i) => (
                            <Cell key={i} fill={w.day === d.peak.day ? ACCENT : c.nonPeak} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
