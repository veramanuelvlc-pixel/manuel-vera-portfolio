"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import type { TooltipContentProps } from "recharts"
import {
  Search,
  Bell,
  Maximize2,
  MoreHorizontal,
  Globe,
  Activity,
  Target,
  MousePointerClick,
  LayoutDashboard,
  Calendar,
  Megaphone,
  BarChart3,
  Users,
  Plug,
  ChevronsUpDown,
  Settings2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"

type Day = { date: string; spend: number; impressions: number; clicks: number; leads: number; revenue: number; ctr: number }
type Campaign = { campaign_name: string; spend: number }
type MetaAds = {
  totals: { spend: number; impressions: number; clicks: number; leads: number; revenue: number; ctr: number; date_range: { start: string; end: string } }
  by_day: Day[]
  by_campaign: Campaign[]
}

const labels = {
  es: {
    back: "Proyectos",
    loading: "Cargando…",
    nav: { dashboard: "Dashboard", calendar: "Calendario", campaigns: "Campañas", analytics: "Analítica", team: "Equipo", integrations: "Integraciones" },
    search: "Buscar…",
    kpis: { leads: "Leads", clicks: "Clicks", reach: "Alcance total", ctr: "Engagement medio" },
    sinceLast: "vs mes anterior",
    today: "Hoy",
    customize: "Personalizar",
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
    nav: { dashboard: "Dashboard", calendar: "Calendar", campaigns: "Campaigns", analytics: "Analytics", team: "Team", integrations: "Integrations" },
    search: "Search…",
    kpis: { leads: "Leads", clicks: "Clicks", reach: "Total reach", ctr: "Avg. engagement" },
    sinceLast: "since last month",
    today: "Today",
    customize: "Customize",
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

function RevenueTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-lg">
      <p className="text-[11px] text-white/40 mb-0.5">{label}</p>
      <p className="text-sm text-white font-medium tabular-nums">{cf2(payload[0].value as number)}</p>
    </div>
  )
}

export default function MetaAdsDashboard() {
  const { locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<MetaAds | null>(null)

  useEffect(() => {
    fetch("/data/meta_ads.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const d = useMemo(() => {
    if (!data) return null
    const byMonth = new Map<string, { leads: number; clicks: number; impressions: number }>()
    for (const day of data.by_day) {
      const k = day.date.slice(0, 7)
      const c = byMonth.get(k) ?? { leads: 0, clicks: 0, impressions: 0 }
      c.leads += day.leads
      c.clicks += day.clicks
      c.impressions += day.impressions
      byMonth.set(k, c)
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

    // weekday distribution of leads
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
    // reorder Mon..Sun for the mini chart
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

  const navItems = [
    { Icon: LayoutDashboard, label: m.nav.dashboard, active: true },
    { Icon: Calendar, label: m.nav.calendar },
    { Icon: Megaphone, label: m.nav.campaigns },
    { Icon: BarChart3, label: m.nav.analytics },
    { Icon: Users, label: m.nav.team },
    { Icon: Plug, label: m.nav.integrations },
  ]

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/[0.06] hidden md:flex flex-col p-3 sticky top-0 self-start h-screen">
        <button className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.04] transition-colors">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-[#00C4B0] text-xs font-bold">mv</span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> mv.dev
          </span>
          <ChevronsUpDown size={14} className="ml-auto text-white/30" />
        </button>

        <div className="relative mt-3">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            placeholder={m.search}
            className="w-full rounded-lg bg-white/[0.04] border border-white/[0.06] pl-8 pr-10 py-2 text-sm text-white/70 placeholder:text-white/30 outline-none"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono border border-white/10 rounded px-1">⌘K</span>
        </div>

        <nav className="mt-4 flex flex-col gap-0.5">
          {navItems.map(({ Icon, label, active }) => (
            <button
              key={label}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left"
              style={active ? { backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" } : { color: "rgba(255,255,255,0.45)" }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-end gap-3 px-6 h-14 border-b border-white/[0.06]">
          <button className="relative text-white/50 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00C4B0] text-[9px] font-bold text-black">2</span>
          </button>
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#00C4B0] to-[#7C3AED]" />
        </header>

        <div className="p-6">
          {!d && <p className="text-white/30 text-sm py-20 text-center">{m.loading}</p>}

          {d && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {d.kpis.map(({ key, Icon, label, value, delta }) => {
                  const up = delta >= 0
                  return (
                    <div key={key} className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                      <div className="flex items-center justify-between text-white/45 mb-4">
                        <span className="flex items-center gap-2 text-xs">
                          <Icon size={15} /> {label}
                        </span>
                        <MoreHorizontal size={15} />
                      </div>
                      <p className="text-2xl font-semibold tabular-nums">{value}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs">
                        <span className={`flex items-center gap-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}>
                          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {pctSigned(delta)}
                        </span>
                        <span className="text-white/35">{m.sinceLast}</span>
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Today heading */}
              <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-lg font-semibold">{m.today}</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors">
                    <Settings2 size={14} /> {m.customize}
                  </button>
                  <button className="rounded-lg border border-white/[0.08] p-1.5 text-white/50 hover:text-white transition-colors">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                {/* Revenue */}
                <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                  <div className="flex items-center justify-between text-white/45 text-xs mb-4">
                    <span className="flex items-center gap-2"><TrendingIcon /> {m.revenue}</span>
                    <Maximize2 size={14} />
                  </div>
                  <div className="flex items-end gap-6 mb-5">
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] text-white/40"><span className="h-2 w-2 rounded-full bg-white/70" /> {m.todayLbl}</span>
                      <p className="text-2xl font-semibold tabular-nums mt-1">{cf2(d.revToday)}</p>
                    </div>
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] text-white/40"><span className="h-2 w-2 rounded-full bg-white/25" /> {m.yesterday}</span>
                      <p className="text-2xl font-semibold tabular-nums mt-1 text-white/55">{cf2(d.revYest)}</p>
                    </div>
                    <span className={`ml-auto flex items-center gap-0.5 text-xs ${d.revDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {d.revDelta >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{pctSigned(d.revDelta)}
                    </span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={d.revBars} margin={{ top: 4, right: 0, bottom: 0, left: -16 }}>
                        <defs>
                          <linearGradient id="barFade" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#b5b5b5" />
                            <stop offset="100%" stopColor="#1c1c1c" />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => "$" + compact(v)} />
                        <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar dataKey="revenue" fill="url(#barFade)" radius={[2, 2, 0, 0]} maxBarSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                  {/* Budget */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                    <div className="flex items-center justify-between text-white/45 text-xs mb-4">
                      <span className="flex items-center gap-2"><Target size={14} /> {m.budget}</span>
                      <Maximize2 size={14} />
                    </div>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-[11px] text-white/40">{m.usedToday}</p>
                        <p className="text-xl font-semibold tabular-nums mt-0.5">{cf2(d.usedToday)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/40">{m.allowance}</p>
                        <p className="text-xl font-semibold tabular-nums mt-0.5 text-white/55">{cf(d.allowance)}</p>
                      </div>
                    </div>
                    <div className="relative h-20 rounded-lg bg-white/[0.03] overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-y-0 left-0" style={{ width: `${d.usedPct}%`, background: "linear-gradient(to top, #2a2a2a, #565656)" }} />
                      <span className="relative text-sm font-semibold">{d.usedPct}% <span className="text-white/40 font-normal">{m.used}</span></span>
                    </div>
                  </div>

                  {/* Peak day */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                    <div className="flex items-center justify-between text-white/45 text-xs mb-3">
                      <span className="flex items-center gap-2"><BarChart3 size={14} /> {m.peak}</span>
                      <Maximize2 size={14} />
                    </div>
                    <p className="text-lg font-semibold">{d.peak.day}</p>
                    <p className="text-[11px] text-white/40 mb-3">{m.peakSub(d.peak.day, d.peakShare)}</p>
                    <div className="h-20 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d.wdChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} tickLine={false} axisLine={false} interval={0} />
                          <Bar dataKey="leads" radius={[2, 2, 0, 0]} maxBarSize={20}>
                            {d.wdChart.map((w, i) => (
                              <Cell key={i} fill={w.day === d.peak.day ? "#00C4B0" : "rgba(255,255,255,0.18)"} />
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
      </main>

      {/* Floating back */}
      <Link
        href="/projects"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#161616]/95 px-3.5 py-2 text-xs font-medium text-white/60 shadow-lg backdrop-blur hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> {m.back}
      </Link>
    </div>
  )
}

function TrendingIcon() {
  return <Activity size={14} />
}
