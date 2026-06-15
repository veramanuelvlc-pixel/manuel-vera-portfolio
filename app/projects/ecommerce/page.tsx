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
    stages: {
      sessions: "Sesiones",
      product_views: "Vistas de producto",
      add_to_cart: "Añadir al carrito",
      checkout: "Checkout",
      purchase: "Compra",
    } as Record<string, string>,
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
    stages: {
      sessions: "Sessions",
      product_views: "Product views",
      add_to_cart: "Add to cart",
      checkout: "Checkout",
      purchase: "Purchase",
    } as Record<string, string>,
  },
}

const nf = new Intl.NumberFormat("en-US")
const cf0 = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const cf2 = (n: number) => "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const compact = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)

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

export default function EcommerceDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<Ecommerce | null>(null)
  const [error, setError] = useState(false)
  const [metric, setMetric] = useState<Metric>("revenue")

  useEffect(() => {
    fetch("/data/ecommerce.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json: Ecommerce) => setData(json))
      .catch(() => setError(true))
  }, [])

  const maxFunnel = data ? data.funnel[0].count : 1

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

          {/* Monthly trend */}
          <section className="py-10 border-b border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.trend}</p>
              <div className="flex gap-2">
                {(["revenue", "orders", "customers", "aov"] as Metric[]).map((k) => (
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
                <LineChart data={data.by_month} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v: number) => (metric === "revenue" ? compact(v) : nf.format(v))}
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

          {/* Conversion funnel */}
          <section className="py-10 border-b border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.funnel}</p>
            <div className="flex flex-col gap-3">
              {data.funnel.map((s, i) => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-white/70">{m.stages[s.stage] ?? s.stage}</span>
                    <span className="font-mono text-white/50 tabular-nums">
                      {nf.format(s.count)} <span className="text-white/30">· {s.rate}%</span>
                    </span>
                  </div>
                  <div className="h-8 w-full rounded-md bg-white/[0.03] overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{
                        width: `${(s.count / maxFunnel) * 100}%`,
                        backgroundColor: ACCENT,
                        opacity: 1 - i * 0.13,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Revenue by category */}
          <section className="py-10 border-b border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.byCategory}</p>
            <div style={{ height: data.by_category.length * 52 + 24 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.by_category} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => compact(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="revenue" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top products */}
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
        </>
      )}

    </main>
  )
}
