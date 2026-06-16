"use client"
import { useEffect, useMemo, useState } from "react"
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
import { AdminShell, KpiCard, ViewToggle, type DashView, ADMIN_DARK, ADMIN_GOAL, AX_TICK, AX_LINE, AX_GRID } from "@/components/dashboard/admin-shell"

type Totals = {
  revenue: number
  orders: number
  customers: number
  aov: number
  ltv: number
  repeat_rate: number
  churn_rate: number
  date_range: { start: string; end: string }
}
type Month = { month: string; revenue: number; orders: number; customers: number; aov: number }
type Category = { category: string; revenue: number; orders: number; aov: number }
type Product = { product: string; category: string; revenue: number; orders: number; aov: number }
type FunnelStage = { stage: string; count: number; rate: number }
type Cohort = { cohort: string; customers: number; ltv: number }
type Ecommerce = {
  totals: Totals
  by_month: Month[]
  by_category: Category[]
  top_products: Product[]
  funnel: FunnelStage[]
  ltv_by_cohort: Cohort[]
}

type Metric = "revenue" | "orders" | "customers" | "aov"

const ACCENT = "#7C3AED"

const labels = {
  es: {
    eyebrow: "Caso de estudio",
    title: "E-commerce Analytics",
    subtitle: "Análisis de 100k órdenes reales: revenue, LTV, churn y funnel de conversión.",
    back: "Volver a proyectos",
    loading: "Cargando datos…",
    error: "No se pudieron cargar los datos.",
    range: "Periodo",
    kpis: { revenue: "Revenue", orders: "Órdenes", aov: "AOV", customers: "Clientes", ltv: "LTV", repeat: "Recompra" },
    trend: "Evolución mensual",
    metrics: { revenue: "Revenue", orders: "Órdenes", customers: "Clientes", aov: "AOV" },
    funnel: "Funnel de conversión",
    byCategory: "Revenue por categoría",
    topProducts: "Top productos",
    cols: { product: "Producto", category: "Categoría", revenue: "Revenue", orders: "Órdenes", aov: "AOV" },
    stages: { sessions: "Sesiones", product_views: "Vistas de producto", add_to_cart: "Añadir al carrito", checkout: "Checkout", purchase: "Compra" } as Record<string, string>,
    viewMinimal: "Minimal",
    viewAdmin: "Admin",
    admin: { title: "Resumen e-commerce", export: "Exportar", import: "Importar", goal: "Meta", vsPrev: "vs mes ant.", nav: ["Resumen", "Analítica", "Productos", "Ajustes"] as [string, string, string, string] },
  },
  en: {
    eyebrow: "Case study",
    title: "E-commerce Analytics",
    subtitle: "Analysis of 100k real orders: revenue, LTV, churn and conversion funnel.",
    back: "Back to projects",
    loading: "Loading data…",
    error: "Could not load data.",
    range: "Period",
    kpis: { revenue: "Revenue", orders: "Orders", aov: "AOV", customers: "Customers", ltv: "LTV", repeat: "Repeat rate" },
    trend: "Monthly trend",
    metrics: { revenue: "Revenue", orders: "Orders", customers: "Customers", aov: "AOV" },
    funnel: "Conversion funnel",
    byCategory: "Revenue by category",
    topProducts: "Top products",
    cols: { product: "Product", category: "Category", revenue: "Revenue", orders: "Orders", aov: "AOV" },
    stages: { sessions: "Sessions", product_views: "Product views", add_to_cart: "Add to cart", checkout: "Checkout", purchase: "Purchase" } as Record<string, string>,
    viewMinimal: "Minimal",
    viewAdmin: "Admin",
    admin: { title: "E-commerce summary", export: "Export", import: "Import", goal: "Goal", vsPrev: "vs last mo.", nav: ["Overview", "Analytics", "Products", "Settings"] as [string, string, string, string] },
  },
}

const nf = new Intl.NumberFormat("en-US")
const cf0 = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const cf2 = (n: number) => "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const compact = (n: number) => "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)

function fmtMetric(metric: Metric, v: number) {
  if (metric === "revenue") return cf0(v)
  if (metric === "aov") return cf2(v)
  return nf.format(v)
}

function TrendTooltip({ active, payload, label, metric, m }: Partial<TooltipContentProps<number, string>> & { metric: Metric; m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/40">{label}</p>
      <p className="font-mono text-sm text-white">
        <span style={{ color: ACCENT }}>{m.metrics[metric]}: </span>
        {fmtMetric(metric, value)}
      </p>
    </div>
  )
}

function CategoryTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Category
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/60 mb-1">{p.category}</p>
      <p className="font-mono text-sm text-white">{cf0(p.revenue)}</p>
      <p className="font-mono text-[11px] text-white/40">{nf.format(p.orders)} órdenes · AOV {cf2(p.aov)}</p>
    </div>
  )
}

function AdminLightTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-gray-400 mb-1">{label ?? (payload[0].payload as { category?: string }).category}</p>
      <p className="text-xs font-semibold" style={{ color: ADMIN_DARK }}>{cf0(payload[0].value as number)}</p>
    </div>
  )
}

/* --------------------------------- Minimal --------------------------------- */

function MinimalView({ data, m, view, setView }: { data: Ecommerce; m: typeof labels.es; view: DashView; setView: (v: DashView) => void }) {
  const [metric, setMetric] = useState<Metric>("revenue")
  const maxFunnel = data.funnel[0].count

  return (
    <main className="min-h-screen px-6 max-w-5xl mx-auto">
      <section className="pt-36 pb-10 border-b border-white/5">
        <Link href="/projects" className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors">
          {String.fromCharCode(8592)} {m.back}
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest mt-6 mb-4" style={{ color: ACCENT }}>{m.eyebrow}</p>
        <h1 className="text-4xl font-semibold mb-4">{m.title}</h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{m.subtitle}</p>
        <p className="font-mono text-xs text-white/30 mt-4">
          {m.range}: {data.totals.date_range.start} {String.fromCharCode(8594)} {data.totals.date_range.end}
        </p>
      </section>

      <section className="py-10 border-b border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
          {[
            { label: m.kpis.revenue, value: compact(data.totals.revenue) },
            { label: m.kpis.orders, value: nf.format(data.totals.orders) },
            { label: m.kpis.aov, value: cf2(data.totals.aov) },
            { label: m.kpis.customers, value: nf.format(data.totals.customers) },
            { label: m.kpis.ltv, value: cf2(data.totals.ltv) },
            { label: m.kpis.repeat, value: data.totals.repeat_rate + "%" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#0A0A0A] p-5">
              <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-2">{kpi.label}</p>
              <p className="font-mono text-2xl tabular-nums" style={{ color: ACCENT }}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 border-b border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.trend}</p>
          <div className="flex gap-2">
            {(["revenue", "orders", "customers", "aov"] as Metric[]).map((k) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className="font-mono text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={metric === k ? { borderColor: ACCENT + "60", color: ACCENT, backgroundColor: ACCENT + "12" } : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
              >
                {m.metrics[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.by_month} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => (metric === "revenue" ? compact(v) : nf.format(v))} />
              <Tooltip content={<TrendTooltip metric={metric} m={m} />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
              <Line type="monotone" dataKey={metric} stroke={ACCENT} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: ACCENT, stroke: "#0A0A0A", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="py-10 border-b border-white/5">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.funnel}</p>
        <div className="flex flex-col gap-3">
          {data.funnel.map((s, i) => (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="text-white/70">{m.stages[s.stage] ?? s.stage}</span>
                <span className="font-mono text-white/50 tabular-nums">{nf.format(s.count)} <span className="text-white/30">· {s.rate}%</span></span>
              </div>
              <div className="h-8 w-full rounded-md bg-white/[0.03] overflow-hidden">
                <div className="h-full rounded-md transition-all" style={{ width: `${(s.count / maxFunnel) * 100}%`, backgroundColor: ACCENT, opacity: 1 - i * 0.13 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 border-b border-white/5">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.byCategory}</p>
        <div style={{ height: data.by_category.length * 52 + 24 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.by_category} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => compact(v)} />
              <YAxis type="category" dataKey="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="revenue" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="py-10 pb-24">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.topProducts}</p>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.product}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.category}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.revenue}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.orders}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.aov}</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((p) => (
                <tr key={p.product} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/80">{p.product}</td>
                  <td className="px-4 py-3 text-white/40">{p.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{cf0(p.revenue)}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{nf.format(p.orders)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums" style={{ color: ACCENT }}>{cf2(p.aov)}</td>
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

function AdminView({ data, m, locale, view, setView }: { data: Ecommerce; m: typeof labels.es; locale: "es" | "en"; view: DashView; setView: (v: DashView) => void }) {
  const mom = useMemo(() => {
    const months = data.by_month
    const L = months[months.length - 1]
    const P = months.length > 1 ? months[months.length - 2] : undefined
    const v = (cur: number, prv?: number) => (prv && prv > 0 ? ((cur - prv) / prv) * 100 : 0)
    return {
      revenue: v(L.revenue, P?.revenue),
      orders: v(L.orders, P?.orders),
      aov: v(L.aov, P?.aov),
      customers: v(L.customers, P?.customers),
    }
  }, [data])

  const range = `${data.totals.date_range.start} – ${data.totals.date_range.end}`

  return (
    <AdminShell
      accent={ACCENT}
      title={m.admin.title}
      backLabel={m.back}
      range={range}
      view={view}
      setView={setView}
      navLabels={m.admin.nav}
      exportLabel={m.admin.export}
      importLabel={m.admin.import}
      minimalLabel={m.viewMinimal}
      adminLabel={m.viewAdmin}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label={m.kpis.revenue} value={cf0(data.totals.revenue)} goal={cf0(Math.round((data.totals.revenue * 1.1) / 1000) * 1000)} goalLabel={m.admin.goal} mom={mom.revenue} vsLabel={m.admin.vsPrev} />
        <KpiCard label={m.kpis.orders} value={nf.format(data.totals.orders)} goal={nf.format(Math.round((data.totals.orders * 1.1) / 1000) * 1000)} goalLabel={m.admin.goal} mom={mom.orders} vsLabel={m.admin.vsPrev} />
        <KpiCard label={m.kpis.aov} value={cf2(data.totals.aov)} goal={cf2(data.totals.aov * 1.1)} goalLabel={m.admin.goal} mom={mom.aov} vsLabel={m.admin.vsPrev} />
        <KpiCard label={m.kpis.customers} value={nf.format(data.totals.customers)} goal={nf.format(Math.round((data.totals.customers * 1.1) / 100) * 100)} goalLabel={m.admin.goal} mom={mom.customers} vsLabel={m.admin.vsPrev} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        {/* Monthly revenue trend */}
        <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.trend}</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.by_month} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={AX_GRID} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: AX_TICK, fontSize: 11 }} tickLine={false} axisLine={{ stroke: AX_LINE }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fill: AX_TICK, fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => compact(v)} />
                <Tooltip content={<AdminLightTooltip />} cursor={{ stroke: AX_LINE }} />
                <Line type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by category */}
        <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.byCategory}</h3>
          <div style={{ height: data.by_category.length * 40 + 8 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.by_category} margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={AX_GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: AX_TICK, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => compact(v)} />
                <YAxis type="category" dataKey="category" tick={{ fill: "#4b5563", fontSize: 11 }} tickLine={false} axisLine={false} width={84} />
                <Tooltip content={<AdminLightTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="revenue" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.topProducts}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="font-medium text-gray-400 text-xs py-2.5">{m.cols.product}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5">{m.cols.category}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.revenue}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.orders}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.aov}</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((p) => (
                <tr key={p.product} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 font-medium" style={{ color: ADMIN_DARK }}>{p.product}</td>
                  <td className="py-2.5 text-gray-500">{p.category}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{cf0(p.revenue)}</td>
                  <td className="py-2.5 text-right tabular-nums text-gray-600">{nf.format(p.orders)}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums" style={{ color: ACCENT }}>{cf2(p.aov)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs mt-4" style={{ color: ADMIN_GOAL }}>{locale === "es" ? "Metas y variación calculadas sobre los datos del periodo." : "Goals and variation computed from period data."}</p>
    </AdminShell>
  )
}

/* ---------------------------------- Page ----------------------------------- */

export default function EcommerceDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<Ecommerce | null>(null)
  const [error, setError] = useState(false)
  const [view, setView] = useState<DashView>("minimal")

  useEffect(() => {
    fetch("/data/ecommerce.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json: Ecommerce) => setData(json))
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
          {data && <ViewToggle view={view} setView={setView} theme="dark" accent={ACCENT} minimalLabel={m.viewMinimal} adminLabel={m.viewAdmin} />}
          <LocaleToggle />
        </div>
      </nav>

      {!data && !error && <div className="min-h-screen pt-36 text-center font-mono text-sm text-white/30">{m.loading}</div>}
      {error && <div className="min-h-screen pt-36 text-center font-mono text-sm text-red-400/70">{m.error}</div>}

      {data && (view === "minimal" ? (
        <MinimalView data={data} m={m} view={view} setView={setView} />
      ) : (
        <AdminView data={data} m={m} locale={locale} view={view} setView={setView} />
      ))}
    </>
  )
}
