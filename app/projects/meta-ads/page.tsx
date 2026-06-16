"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import {
  LayoutGrid,
  LayoutDashboard,
  Megaphone,
  Layers,
  Users,
  Settings,
  Download,
  Upload,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
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
type View = "minimal" | "admin"

const ACCENT = "#00C4B0"
const ADMIN_BG = "#F8F9FA"
const ADMIN_DARK = "#1a1a2e"
const ADMIN_RED = "#EF4444"
const ADMIN_BLUE = "#2563EB"
const ADMIN_FONT = "Inter, ui-sans-serif, system-ui, sans-serif"

const labels = {
  es: {
    eyebrow: "Caso de estudio",
    title: "Meta Ads Performance",
    subtitle: "Dashboard de campañas con KPIs, evolución diaria y desglose por adset.",
    back: "Volver a proyectos",
    loading: "Cargando datos…",
    error: "No se pudieron cargar los datos.",
    range: "Periodo",
    kpis: { spend: "Gasto total", leads: "Leads", cpl: "CPL", roas: "ROAS", clicks: "Clicks", ctr: "CTR" },
    daily: "Evolución diaria",
    metrics: { leads: "Leads", spend: "Gasto", cpl: "CPL", roas: "ROAS" },
    byCampaign: "Gasto por campaña",
    adsets: "Adsets",
    cols: { adset: "Adset", campaign: "Campaña", spend: "Gasto", leads: "Leads", cpl: "CPL", ctr: "CTR" },
    viewMinimal: "Minimal",
    viewAdmin: "Admin",
    admin: {
      title: "Resumen campañas",
      export: "Exportar",
      import: "Importar",
      goal: "Meta",
      vsPrev: "vs mes ant.",
      nav: { overview: "Resumen", campaigns: "Campañas", adsets: "Adsets", audiences: "Audiencias", settings: "Ajustes" },
      kpis: { revenue: "Ingresos", leads: "Leads", cpl: "CPL", roas: "ROAS" },
      profitability: "Rentabilidad",
      rowLeads: "Leads",
      rowRevenue: "Ingresos",
      weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie"],
      trend: "Leads vs CPL",
      flow: { title: "Flujo adsets", spend: "Gasto", in: "Entradas", out: "Salida", cum: "Acum." },
      source: "Fuente campañas",
      fixedVar: "Fijos y Variables",
      fixed: "Fijos",
      variable: "Variables",
    },
  },
  en: {
    eyebrow: "Case study",
    title: "Meta Ads Performance",
    subtitle: "Campaign dashboard with KPIs, daily trend and adset breakdown.",
    back: "Back to projects",
    loading: "Loading data…",
    error: "Could not load data.",
    range: "Period",
    kpis: { spend: "Total spend", leads: "Leads", cpl: "CPL", roas: "ROAS", clicks: "Clicks", ctr: "CTR" },
    daily: "Daily trend",
    metrics: { leads: "Leads", spend: "Spend", cpl: "CPL", roas: "ROAS" },
    byCampaign: "Spend by campaign",
    adsets: "Adsets",
    cols: { adset: "Adset", campaign: "Campaign", spend: "Spend", leads: "Leads", cpl: "CPL", ctr: "CTR" },
    viewMinimal: "Minimal",
    viewAdmin: "Admin",
    admin: {
      title: "Campaign summary",
      export: "Export",
      import: "Import",
      goal: "Goal",
      vsPrev: "vs last mo.",
      nav: { overview: "Overview", campaigns: "Campaigns", adsets: "Adsets", audiences: "Audiences", settings: "Settings" },
      kpis: { revenue: "Revenue", leads: "Leads", cpl: "CPL", roas: "ROAS" },
      profitability: "Profitability",
      rowLeads: "Leads",
      rowRevenue: "Revenue",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      trend: "Leads vs CPL",
      flow: { title: "Adset flow", spend: "Spend", in: "In", out: "Out", cum: "Cum." },
      source: "Campaign source",
      fixedVar: "Fixed & Variable",
      fixed: "Fixed",
      variable: "Variable",
    },
  },
}

const nf = new Intl.NumberFormat("en-US")
const cf = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const cf2 = (n: number) => "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const pctSigned = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%"

/* ---------------------------------- Shared ---------------------------------- */

function ViewToggle({ view, setView, theme, m }: { view: View; setView: (v: View) => void; theme: "dark" | "light"; m: typeof labels.es }) {
  const dark = theme === "dark"
  const items: { key: View; Icon: typeof LayoutGrid; label: string }[] = [
    { key: "minimal", Icon: LayoutGrid, label: m.viewMinimal },
    { key: "admin", Icon: LayoutDashboard, label: m.viewAdmin },
  ]
  return (
    <div className="inline-flex rounded-lg p-0.5 gap-0.5" style={{ backgroundColor: dark ? "rgba(255,255,255,0.05)" : "#ECEEF1" }}>
      {items.map(({ key, Icon, label }) => {
        const active = view === key
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            title={label}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={
              active
                ? dark
                  ? { backgroundColor: ACCENT + "18", color: ACCENT }
                  : { backgroundColor: "#fff", color: ADMIN_DARK, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }
                : { color: dark ? "rgba(255,255,255,0.4)" : "#6b7280" }
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* --------------------------------- Minimal --------------------------------- */

function MinimalTooltip({ active, payload, label, metric, m }: Partial<TooltipContentProps<number, string>> & { metric: Metric; m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  const fmt = metric === "spend" ? cf2(value) : metric === "cpl" ? cf2(value) : metric === "roas" ? value.toFixed(2) + "x" : nf.format(value)
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

function MinimalView({ data, m, view, setView }: { data: MetaAds; m: typeof labels.es; view: View; setView: (v: View) => void }) {
  const [metric, setMetric] = useState<Metric>("leads")

  return (
    <main className="min-h-screen px-6 max-w-5xl mx-auto">
      <section className="pt-36 pb-10 border-b border-white/5">
        <Link href="/projects" className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors">
          {String.fromCharCode(8592)} {m.back}
        </Link>
        <p className="font-mono text-[#00C4B0] text-xs uppercase tracking-widest mt-6 mb-4">{m.eyebrow}</p>
        <h1 className="text-4xl font-semibold mb-4">{m.title}</h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{m.subtitle}</p>
        <p className="font-mono text-xs text-white/30 mt-4">
          {m.range}: {data.totals.date_range.start} {String.fromCharCode(8594)} {data.totals.date_range.end}
        </p>
      </section>

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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                minTickGap={32}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<MinimalTooltip metric={metric} m={m} />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
              <Line type="monotone" dataKey={metric} stroke={ACCENT} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: ACCENT, stroke: "#0A0A0A", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Spend by campaign */}
      <section className="py-10 border-b border-white/5">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.byCampaign}</p>
        <div style={{ height: data.by_campaign.length * 64 + 24 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.by_campaign} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => cf(v)} />
              <YAxis type="category" dataKey="campaign_name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickLine={false} axisLine={false} width={180} />
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
    </main>
  )
}

/* ---------------------------------- Admin ---------------------------------- */

function AdminTrendTooltip({ active, payload, label, m }: Partial<TooltipContentProps<number, string>> & { m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      {payload.map((p) => {
        const isCpl = p.dataKey === "cpl"
        return (
          <p key={p.dataKey as string} className="text-xs font-medium" style={{ color: p.color }}>
            {isCpl ? m.admin.kpis.cpl : m.admin.kpis.leads}: {isCpl ? cf2(p.value as number) : nf.format(p.value as number)}
          </p>
        )
      })}
    </div>
  )
}

function AdminView({ data, m, view, setView }: { data: MetaAds; m: typeof labels.es; view: View; setView: (v: View) => void }) {
  const derived = useMemo(() => {
    // Month-over-month from daily data
    const byMonth = new Map<string, { spend: number; leads: number; revenue: number }>()
    for (const d of data.by_day) {
      const k = d.date.slice(0, 7)
      const cur = byMonth.get(k) ?? { spend: 0, leads: 0, revenue: 0 }
      cur.spend += d.spend
      cur.leads += d.leads
      cur.revenue += d.revenue
      byMonth.set(k, cur)
    }
    const months = [...byMonth.keys()].sort()
    const L = byMonth.get(months[months.length - 1])
    const P = months.length > 1 ? byMonth.get(months[months.length - 2]) : undefined
    const mom = (cur: number, prv: number | undefined) => (prv && prv > 0 ? ((cur - prv) / prv) * 100 : 0)
    const cplOf = (x?: { spend: number; leads: number }) => (x && x.leads > 0 ? x.spend / x.leads : 0)
    const roasOf = (x?: { spend: number; revenue: number }) => (x && x.spend > 0 ? x.revenue / x.spend : 0)

    // Weekday aggregation (Mon–Fri)
    const wd = Array.from({ length: 5 }, () => ({ leads: 0, revenue: 0 }))
    for (const d of data.by_day) {
      const day = new Date(d.date + "T00:00:00Z").getUTCDay() // 0=Sun … 6=Sat
      if (day >= 1 && day <= 5) {
        wd[day - 1].leads += d.leads
        wd[day - 1].revenue += d.revenue
      }
    }

    // Adset flow with cumulative spend
    const sorted = [...data.by_adset].sort((a, b) => b.spend - a.spend)
    let acc = 0
    const flow = sorted.map((a) => {
      acc += a.spend
      return { ...a, acumulado: acc }
    })

    // Top campaigns by spend
    const camps = [...data.by_campaign].sort((a, b) => b.spend - a.spend).slice(0, 3)
    const maxCamp = Math.max(...camps.map((c) => c.spend), 1)

    return {
      momRevenue: mom(L?.revenue ?? 0, P?.revenue),
      momLeads: mom(L?.leads ?? 0, P?.leads),
      momCpl: mom(cplOf(L), P ? cplOf(P) : undefined),
      momRoas: mom(roasOf(L), P ? roasOf(P) : undefined),
      wd,
      flow,
      camps,
      maxCamp,
    }
  }, [data])

  const goalRevenue = Math.round((data.totals.revenue * 1.1) / 1000) * 1000
  const goalLeads = Math.round((data.totals.leads * 1.1) / 100) * 100
  const goalCpl = data.totals.cpl * 0.9
  const goalRoas = data.totals.roas * 1.05

  const kpis = [
    { label: m.admin.kpis.revenue, value: cf(data.totals.revenue), goal: cf(goalRevenue), mom: derived.momRevenue, inverse: false },
    { label: m.admin.kpis.leads, value: nf.format(data.totals.leads), goal: nf.format(goalLeads), mom: derived.momLeads, inverse: false },
    { label: m.admin.kpis.cpl, value: cf2(data.totals.cpl), goal: cf2(goalCpl), mom: derived.momCpl, inverse: true },
    { label: m.admin.kpis.roas, value: data.totals.roas.toFixed(2) + "x", goal: goalRoas.toFixed(2) + "x", mom: derived.momRoas, inverse: false },
  ]

  const navItems: { Icon: typeof LayoutDashboard; label: string; active?: boolean }[] = [
    { Icon: LayoutDashboard, label: m.admin.nav.overview, active: true },
    { Icon: Megaphone, label: m.admin.nav.campaigns },
    { Icon: Layers, label: m.admin.nav.adsets },
    { Icon: Users, label: m.admin.nav.audiences },
    { Icon: Settings, label: m.admin.nav.settings },
  ]

  const range = `${data.totals.date_range.start} – ${data.totals.date_range.end}`
  const btn = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors"

  return (
    <div className="min-h-screen" style={{ backgroundColor: ADMIN_BG, fontFamily: ADMIN_FONT }}>
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:flex flex-col sticky top-16 self-start min-h-[calc(100vh-4rem)]" style={{ backgroundColor: ADMIN_DARK }}>
          <div className="p-5">
            <p className="font-mono text-sm mb-8" style={{ color: ACCENT }}>mv.dev</p>
            <nav className="flex flex-col gap-1">
              {navItems.map(({ Icon, label, active }) => (
                <button
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                  style={active ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" } : { color: "rgba(255,255,255,0.55)" }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <Link href="/projects" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {String.fromCharCode(8592)} {m.back}
              </Link>
              <h1 className="text-2xl font-semibold mt-2" style={{ color: ADMIN_DARK }}>{m.admin.title}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className={btn}><Download size={15} /> {m.admin.export}</button>
              <button className={btn}><Upload size={15} /> {m.admin.import}</button>
              <button className={btn}><Calendar size={15} /> {range}</button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => {
              const up = kpi.mom >= 0
              const good = kpi.inverse ? kpi.mom < 0 : kpi.mom >= 0
              return (
                <div key={kpi.label} className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
                  <p className="text-xs text-gray-500 mb-2">{kpi.label}</p>
                  <p className="text-2xl font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{kpi.value}</p>
                  <p className="text-xs mt-1" style={{ color: ADMIN_RED }}>{m.admin.goal}: {kpi.goal}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: good ? "#16A34A" : "#DC2626" }}>
                    {up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                    <span className="tabular-nums">{pctSigned(kpi.mom)}</span>
                    <span className="text-gray-400 font-normal">{m.admin.vsPrev}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Profitability + Trend */}
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            {/* Profitability weekday table */}
            <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.admin.profitability}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-gray-400 text-xs pb-3"></th>
                    {m.admin.weekdays.map((w) => (
                      <th key={w} className="text-right font-medium text-gray-400 text-xs pb-3">{w}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="py-2.5 text-gray-500">{m.admin.rowLeads}</td>
                    {derived.wd.map((d, i) => (
                      <td key={i} className="py-2.5 text-right font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{nf.format(d.leads)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-2.5 text-gray-500">{m.admin.rowRevenue}</td>
                    {derived.wd.map((d, i) => (
                      <td key={i} className="py-2.5 text-right font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{cf(d.revenue)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Two-line trend */}
            <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: ADMIN_DARK }}>{m.admin.trend}</h3>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ADMIN_BLUE }} />{m.admin.kpis.leads}</span>
                  <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ADMIN_RED }} />{m.admin.kpis.cpl}</span>
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.by_day} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F2" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} minTickGap={32} tickFormatter={(d: string) => d.slice(5)} />
                    <YAxis yAxisId="left" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
                    <Tooltip content={<AdminTrendTooltip m={m} />} cursor={{ stroke: "#E5E7EB" }} />
                    <Line yAxisId="left" type="monotone" dataKey="leads" stroke={ADMIN_BLUE} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="cpl" stroke={ADMIN_RED} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Adset flow */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.admin.flow.title}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {derived.flow.map((a) => (
                <div key={a.adset_id} className="bg-white rounded-xl border border-gray-200/70 p-4 shadow-sm">
                  <p className="text-xs text-gray-500 truncate mb-2" title={a.adset_name}>{a.adset_name}</p>
                  <p className="text-xl font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{cf(a.spend)}</p>
                  <p className="text-[11px] text-gray-400 mb-3">{m.admin.flow.spend}</p>
                  <div className="grid grid-cols-3 gap-1 text-center pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">{m.admin.flow.in}</p>
                      <p className="text-sm font-semibold tabular-nums" style={{ color: "#16A34A" }}>{nf.format(a.leads)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">{m.admin.flow.out}</p>
                      <p className="text-sm font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{nf.format(a.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">{m.admin.flow.cum}</p>
                      <p className="text-sm font-semibold tabular-nums text-gray-500">{cf(a.acumulado)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source + Fixed/Variable */}
          <div className="grid lg:grid-cols-2 gap-4 pb-8">
            {/* Campaign source */}
            <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.admin.source}</h3>
              {derived.camps.map((c, i) => {
                const share = (c.spend / derived.maxCamp) * 100
                return (
                  <div key={c.campaign_id} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600 truncate pr-2">{c.campaign_name}</span>
                      <span className="font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{cf(c.spend)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: ADMIN_RED, opacity: 1 - i * 0.2 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Fixed & Variable donut */}
            <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.admin.fixedVar}</h3>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ name: m.admin.fixed, value: 60 }, { name: m.admin.variable, value: 40 }]}
                      dataKey="value"
                      innerRadius={52}
                      outerRadius={72}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      stroke="none"
                    >
                      <Cell fill={ADMIN_RED} />
                      <Cell fill="#CBD5E1" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-2xl font-semibold" style={{ color: ADMIN_DARK }}>60%</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs mt-2 text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ADMIN_RED }} />{m.admin.fixed} 60%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />{m.admin.variable} 40%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- Page ----------------------------------- */

export default function MetaAdsDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<MetaAds | null>(null)
  const [error, setError] = useState(false)
  const [view, setView] = useState<View>("minimal")

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
    <>
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm z-50">
        <Link href="/" className="font-mono text-sm text-[#00C4B0]">mv.dev</Link>
        <div className="flex gap-6 items-center text-sm text-white/50">
          <Link href="/about" className="hover:text-white transition-colors">{t.nav.about}</Link>
          <Link href="/projects" className="text-white">{t.nav.projects}</Link>
          <a href="mailto:veramanuelvlc@gmail.com" className="hover:text-white transition-colors">{t.nav.contact}</a>
          {data && <ViewToggle view={view} setView={setView} theme="dark" m={m} />}
          <LocaleToggle />
        </div>
      </nav>

      {!data && !error && <div className="min-h-screen pt-36 text-center font-mono text-sm text-white/30">{m.loading}</div>}
      {error && <div className="min-h-screen pt-36 text-center font-mono text-sm text-red-400/70">{m.error}</div>}

      {data && (view === "minimal" ? (
        <MinimalView data={data} m={m} view={view} setView={setView} />
      ) : (
        <AdminView data={data} m={m} view={view} setView={setView} />
      ))}
    </>
  )
}
