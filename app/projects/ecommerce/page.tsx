"use client"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"
import { DollarSign, ShoppingCart, Receipt, Users, TrendingUp, Filter, Layers, Repeat, Package } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { ThemeProvider, useTheme } from "@/lib/theme-context"
import { DashTopNav } from "@/components/dashboard/dash-top-nav"
import {
  DARK_VARS,
  LIGHT_VARS,
  chartPalette,
  ChartTooltip,
  Panel,
  StatCards,
  Toggle,
  nf,
  pct,
  usd0,
  usd2,
  usdCompact,
} from "@/components/dashboard/dash-kit"

type Month = { month: string; revenue: number; orders: number; customers: number; aov: number }
type Category = { category: string; revenue: number; orders: number; aov: number }
type Product = { product: string; category: string; revenue: number; orders: number; aov: number }
type FunnelStep = { stage: string; count: number; rate: number }
type Cohort = { cohort: string; customers: number; ltv: number }
type Ecommerce = {
  totals: {
    revenue: number
    orders: number
    customers: number
    aov: number
    ltv: number
    repeat_rate: number
    churn_rate: number
    date_range: { start: string; end: string }
  }
  by_month: Month[]
  by_category: Category[]
  top_products: Product[]
  funnel: FunnelStep[]
  ltv_by_cohort: Cohort[]
}

type CatMetric = "revenue" | "orders" | "aov"

const ACCENT = "#3B82F6"

const labels = {
  es: {
    back: "Proyectos",
    loading: "Cargando…",
    kpis: { revenue: "Revenue", orders: "Pedidos", aov: "Ticket medio", ltv: "LTV por cliente" },
    kpiSub: {
      revenue: "ene a dic 2024",
      orders: (n: string) => `${n} clientes`,
      aov: "por pedido",
      ltv: "valor acumulado",
    },
    monthly: "Revenue por mes",
    monthlyBest: (m: string) => `Mejor mes: ${m}`,
    funnel: "Funnel de conversión",
    funnelLoss: (s: string, p: string) => `La mayor fuga está en ${s}: se pierde el ${p} del paso anterior.`,
    stages: { sessions: "Sesiones", product_views: "Vistas de producto", add_to_cart: "Al carrito", checkout: "Checkout", purchase: "Compra" } as Record<string, string>,
    categories: "Por categoría",
    catMetrics: { revenue: "Revenue", orders: "Pedidos", aov: "Ticket" },
    retention: "Retención",
    repeat: "Recompra",
    churn: "Churn",
    repeatSub: "clientes con más de un pedido",
    churnSub: "clientes sin compras recientes",
    cohorts: "LTV por cohorte de alta",
    cohortsSub: "Las cohortes antiguas acumulan más meses de compras.",
    products: "Top productos por revenue",
    cols: { product: "Producto", category: "Categoría", orders: "Pedidos", aov: "Ticket", revenue: "Revenue" },
    revenue: "Revenue",
    orders: "Pedidos",
    ltv: "LTV",
    months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  },
  en: {
    back: "Projects",
    loading: "Loading…",
    kpis: { revenue: "Revenue", orders: "Orders", aov: "Avg order value", ltv: "LTV per customer" },
    kpiSub: {
      revenue: "Jan to Dec 2024",
      orders: (n: string) => `${n} customers`,
      aov: "per order",
      ltv: "lifetime value",
    },
    monthly: "Revenue by month",
    monthlyBest: (m: string) => `Best month: ${m}`,
    funnel: "Conversion funnel",
    funnelLoss: (s: string, p: string) => `The biggest leak is at ${s}: ${p} of the previous step is lost.`,
    stages: { sessions: "Sessions", product_views: "Product views", add_to_cart: "Add to cart", checkout: "Checkout", purchase: "Purchase" } as Record<string, string>,
    categories: "By category",
    catMetrics: { revenue: "Revenue", orders: "Orders", aov: "AOV" },
    retention: "Retention",
    repeat: "Repeat rate",
    churn: "Churn",
    repeatSub: "customers with more than one order",
    churnSub: "customers with no recent purchase",
    cohorts: "LTV by signup cohort",
    cohortsSub: "Older cohorts have had more months to buy.",
    products: "Top products by revenue",
    cols: { product: "Product", category: "Category", orders: "Orders", aov: "AOV", revenue: "Revenue" },
    revenue: "Revenue",
    orders: "Orders",
    ltv: "LTV",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
}

const fmtCat = (k: CatMetric, v: number) => (k === "orders" ? nf.format(v) : k === "aov" ? usd0(v) : usdCompact(v))

export default function EcommerceDashboard() {
  return (
    <ThemeProvider>
      <EcommerceInner />
    </ThemeProvider>
  )
}

function EcommerceInner() {
  const { locale } = useLocale()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const m = labels[locale]
  const c = chartPalette(dark)
  const [data, setData] = useState<Ecommerce | null>(null)
  const [catMetric, setCatMetric] = useState<CatMetric>("revenue")

  useEffect(() => {
    fetch("/data/ecommerce.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const d = useMemo(() => {
    if (!data) return null
    const t = data.totals
    const monthName = (ym: string) => m.months[Number(ym.slice(5, 7)) - 1]
    const months = data.by_month.map((x) => ({ ...x, label: monthName(x.month) }))
    const best = months.reduce((a, b) => (b.revenue > a.revenue ? b : a), months[0])

    // Step-to-step drop-off; the worst one is the headline insight.
    const funnel = data.funnel.map((s, i) => ({
      ...s,
      name: m.stages[s.stage] ?? s.stage,
      drop: i === 0 ? 0 : 100 - (s.count / data.funnel[i - 1].count) * 100,
    }))
    const leak = funnel.slice(1).reduce((a, b) => (b.drop > a.drop ? b : a))

    const cohorts = data.ltv_by_cohort.map((x) => ({ ...x, label: monthName(x.cohort) }))

    return {
      t,
      months,
      best,
      funnel,
      leak,
      cohorts,
      kpis: [
        { key: "revenue", Icon: DollarSign, label: m.kpis.revenue, value: usdCompact(t.revenue), sub: m.kpiSub.revenue },
        { key: "orders", Icon: ShoppingCart, label: m.kpis.orders, value: nf.format(t.orders), sub: m.kpiSub.orders(nf.format(t.customers)) },
        { key: "aov", Icon: Receipt, label: m.kpis.aov, value: usd2(t.aov), sub: m.kpiSub.aov },
        { key: "ltv", Icon: Users, label: m.kpis.ltv, value: usd2(t.ltv), sub: m.kpiSub.ltv },
      ],
    }
  }, [data, m])

  const categories = useMemo(
    () => (data ? [...data.by_category].sort((a, b) => b[catMetric] - a[catMetric]) : []),
    [data, catMetric],
  )

  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-[var(--txt)]"
      style={{ ...(dark ? DARK_VARS : LIGHT_VARS), fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <DashTopNav backLabel={m.back} />

      <div className="mx-auto w-full max-w-7xl p-6">
        {!d && <p className="py-20 text-center text-sm text-[var(--txt4)]">{m.loading}</p>}

        {d && (
          <>
            <StatCards items={d.kpis} />

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Panel
                Icon={TrendingUp}
                title={m.monthly}
                aside={<span className="text-xs text-[var(--txt3)]">{m.monthlyBest(`${d.best.label} · ${usdCompact(d.best.revenue)}`)}</span>}
                className="lg:col-span-2"
              >
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.months} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                      <defs>
                        <linearGradient id="ecoFade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={52} tickFormatter={usdCompact} domain={["dataMin - 100000", "auto"]} />
                      <Tooltip
                        content={<ChartTooltip c={c} format={(k, v) => (k === "revenue" ? usd0(v) : nf.format(v))} />}
                        cursor={{ stroke: c.muted }}
                      />
                      <Area type="monotone" dataKey="revenue" name={m.revenue} stroke={ACCENT} strokeWidth={2} fill="url(#ecoFade)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel Icon={Filter} title={m.funnel}>
                <div className="flex flex-col gap-3">
                  {d.funnel.map((s) => (
                    <div key={s.stage}>
                      <div className="mb-1 flex items-baseline justify-between text-xs">
                        <span className="text-[var(--txt2)]">{s.name}</span>
                        <span className="tabular-nums text-[var(--txt3)]">
                          {nf.format(s.count)} · <span className="text-[var(--txt)]">{pct(s.rate)}</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--track)]">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${s.rate}%`, backgroundColor: s.stage === d.leak.stage ? "#ef4444" : ACCENT }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-[var(--txt3)]">{m.funnelLoss(d.leak.name, pct(d.leak.drop, 0))}</p>
              </Panel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Panel
                Icon={Layers}
                title={m.categories}
                className="lg:col-span-2"
                aside={
                  <Toggle
                    accent={ACCENT}
                    value={catMetric}
                    onChange={setCatMetric}
                    options={(["revenue", "orders", "aov"] as CatMetric[]).map((k) => ({ key: k, label: m.catMetrics[k] }))}
                  />
                }
              >
                <div style={{ height: categories.length * 40 + 16 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={categories} margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtCat(catMetric, v)} />
                      <YAxis type="category" dataKey="category" tick={{ fill: c.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip content={<ChartTooltip c={c} format={(k, v) => fmtCat(k as CatMetric, v)} />} cursor={{ fill: c.cursor }} />
                      <Bar dataKey={catMetric} name={m.catMetrics[catMetric]} radius={[0, 4, 4, 0]} barSize={16}>
                        {categories.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? ACCENT : c.muted} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel Icon={Repeat} title={m.retention}>
                {[
                  { label: m.repeat, value: d.t.repeat_rate, sub: m.repeatSub, color: ACCENT },
                  { label: m.churn, value: d.t.churn_rate, sub: m.churnSub, color: "#ef4444" },
                ].map((r) => (
                  <div key={r.label} className="mb-5 last:mb-0">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-xs text-[var(--txt3)]">{r.label}</span>
                      <span className="text-xl font-semibold tabular-nums">{pct(r.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--track)]">
                      <div className="h-2 rounded-full" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[var(--txt4)]">{r.sub}</p>
                  </div>
                ))}
              </Panel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <Panel Icon={Users} title={m.cohorts} className="lg:col-span-2">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.cohorts} margin={{ top: 4, right: 0, bottom: 0, left: -12 }}>
                      <XAxis dataKey="label" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
                      <YAxis tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={usdCompact} />
                      <Tooltip content={<ChartTooltip c={c} format={(_, v) => usd0(v)} />} cursor={{ fill: c.cursor }} />
                      <Bar dataKey="ltv" name={m.ltv} fill={ACCENT} radius={[2, 2, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-[11px] text-[var(--txt4)]">{m.cohortsSub}</p>
              </Panel>

              <Panel Icon={Package} title={m.products} className="lg:col-span-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-left">
                        <th className="py-2 text-xs font-normal text-[var(--txt4)]">{m.cols.product}</th>
                        <th className="py-2 text-xs font-normal text-[var(--txt4)]">{m.cols.category}</th>
                        <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.orders}</th>
                        <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.aov}</th>
                        <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.revenue}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data!.top_products.map((p) => (
                        <tr key={p.product} className="border-b border-[var(--line)] last:border-0">
                          <td className="py-2 text-[var(--txt)]">{p.product}</td>
                          <td className="py-2 text-[var(--txt3)]">{p.category}</td>
                          <td className="py-2 text-right tabular-nums text-[var(--txt2)]">{nf.format(p.orders)}</td>
                          <td className="py-2 text-right tabular-nums text-[var(--txt2)]">{usd0(p.aov)}</td>
                          <td className="py-2 text-right font-medium tabular-nums" style={{ color: ACCENT }}>
                            {usdCompact(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
