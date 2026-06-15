"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { AdminShell, KpiCard, ViewToggle, type DashView, ADMIN_DARK, AX_TICK, AX_LINE, AX_GRID } from "@/components/dashboard/admin-shell"

type Totals = {
  listings: number
  avg_price: number
  avg_occupancy: number
  est_monthly_revenue: number
  avg_rating: number
  superhost_rate: number
  neighborhoods: number
}
type Neighborhood = { neighborhood: string; listings: number; avg_price: number; occupancy: number; est_revenue: number; avg_rating: number }
type RoomType = { room_type: string; listings: number; avg_price: number; occupancy: number }
type ScatterPoint = { price: number; occupancy: number; neighborhood: string; room_type: string }
type Listing = { name: string; neighborhood: string; room_type: string; price: number; occupancy: number; est_revenue: number; rating: number }
type RealEstate = {
  totals: Totals
  by_neighborhood: Neighborhood[]
  by_room_type: RoomType[]
  scatter: ScatterPoint[]
  top_listings: Listing[]
}

type Metric = "avg_price" | "occupancy" | "est_revenue" | "listings"

const ACCENT = "#F59E0B"
const ROOM_COLORS: Record<string, string> = {
  "Entire home/apt": "#F59E0B",
  "Private room": "#00C4B0",
  "Shared room": "#E840D0",
}

const labels = {
  es: {
    eyebrow: "Caso de estudio",
    title: "Real Estate Market",
    subtitle: "Precios, ocupación y revenue estimado de listings de Airbnb por zona.",
    back: "Volver a proyectos",
    loading: "Cargando datos…",
    error: "No se pudieron cargar los datos.",
    kpis: { listings: "Listings", price: "Precio medio", occ: "Ocupación", revenue: "Revenue/mes", rating: "Rating", superhost: "Superhosts" },
    byNeighborhood: "Por zona",
    metrics: { avg_price: "Precio", occupancy: "Ocupación", est_revenue: "Revenue", listings: "Listings" },
    scatter: "Precio vs ocupación",
    scatterX: "Precio/noche (€)",
    scatterY: "Ocupación (%)",
    topListings: "Top listings por revenue",
    cols: { listing: "Listing", zone: "Zona", room: "Tipo", price: "Precio", occ: "Ocupación", revenue: "Revenue/mes", rating: "Rating" },
    viewMinimal: "Minimal",
    viewAdmin: "Admin",
    admin: { title: "Resumen inmobiliario", export: "Exportar", import: "Importar", goal: "Meta", nav: ["Resumen", "Zonas", "Listings", "Ajustes"] as [string, string, string, string] },
  },
  en: {
    eyebrow: "Case study",
    title: "Real Estate Market",
    subtitle: "Prices, occupancy and estimated revenue from Airbnb listings by area.",
    back: "Back to projects",
    loading: "Loading data…",
    error: "Could not load data.",
    kpis: { listings: "Listings", price: "Avg price", occ: "Occupancy", revenue: "Revenue/mo", rating: "Rating", superhost: "Superhosts" },
    byNeighborhood: "By area",
    metrics: { avg_price: "Price", occupancy: "Occupancy", est_revenue: "Revenue", listings: "Listings" },
    scatter: "Price vs occupancy",
    scatterX: "Price/night (€)",
    scatterY: "Occupancy (%)",
    topListings: "Top listings by revenue",
    cols: { listing: "Listing", zone: "Area", room: "Type", price: "Price", occ: "Occupancy", revenue: "Revenue/mo", rating: "Rating" },
    viewMinimal: "Minimal",
    viewAdmin: "Admin",
    admin: { title: "Real estate summary", export: "Export", import: "Import", goal: "Goal", nav: ["Overview", "Areas", "Listings", "Settings"] as [string, string, string, string] },
  },
}

const nf = new Intl.NumberFormat("en-US")
const eur0 = (n: number) => "€" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
const eurCompact = (n: number) => "€" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)

function fmtMetric(metric: Metric, v: number) {
  if (metric === "avg_price") return eur0(v)
  if (metric === "occupancy") return v + "%"
  if (metric === "est_revenue") return eurCompact(v)
  return nf.format(v)
}

function NeighborhoodTooltip({ active, payload, metric, m }: Partial<TooltipContentProps<number, string>> & { metric: Metric; m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Neighborhood
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/60 mb-1">{p.neighborhood}</p>
      <p className="font-mono text-sm text-white">
        <span style={{ color: ACCENT }}>{m.metrics[metric]}: </span>
        {fmtMetric(metric, p[metric])}
      </p>
      <p className="font-mono text-[11px] text-white/40">{nf.format(p.listings)} listings · {p.occupancy}% occ · ★ {p.avg_rating}</p>
    </div>
  )
}

function ScatterTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as ScatterPoint
  return (
    <div className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-white/60 mb-1">{p.neighborhood}</p>
      <p className="font-mono text-xs text-white/70">{p.room_type}</p>
      <p className="font-mono text-sm text-white">{eur0(p.price)}/noche · {p.occupancy}%</p>
    </div>
  )
}

function AdminScatterTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as ScatterPoint
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-gray-500 mb-1">{p.neighborhood} · {p.room_type}</p>
      <p className="text-xs font-semibold" style={{ color: ADMIN_DARK }}>{eur0(p.price)}/noche · {p.occupancy}%</p>
    </div>
  )
}

function AdminNeighborhoodTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Neighborhood
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-gray-500 mb-1">{p.neighborhood}</p>
      <p className="text-xs font-semibold" style={{ color: ADMIN_DARK }}>{eur0(p.est_revenue)}</p>
    </div>
  )
}

/* --------------------------------- Minimal --------------------------------- */

function MinimalView({ data, m, view, setView }: { data: RealEstate; m: typeof labels.es; view: DashView; setView: (v: DashView) => void }) {
  const [metric, setMetric] = useState<Metric>("avg_price")
  const roomTypes = Array.from(new Set(data.scatter.map((s) => s.room_type)))

  return (
    <main className="min-h-screen px-6 max-w-5xl mx-auto">
      <section className="pt-36 pb-10 border-b border-white/5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/projects" className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors">
            {String.fromCharCode(8592)} {m.back}
          </Link>
          <ViewToggle view={view} setView={setView} theme="dark" accent={ACCENT} minimalLabel={m.viewMinimal} adminLabel={m.viewAdmin} />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest mt-6 mb-4" style={{ color: ACCENT }}>{m.eyebrow}</p>
        <h1 className="text-4xl font-semibold mb-4">{m.title}</h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{m.subtitle}</p>
      </section>

      <section className="py-10 border-b border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
          {[
            { label: m.kpis.listings, value: nf.format(data.totals.listings) },
            { label: m.kpis.price, value: eur0(data.totals.avg_price) },
            { label: m.kpis.occ, value: data.totals.avg_occupancy + "%" },
            { label: m.kpis.revenue, value: eurCompact(data.totals.est_monthly_revenue) },
            { label: m.kpis.rating, value: "★ " + data.totals.avg_rating },
            { label: m.kpis.superhost, value: data.totals.superhost_rate + "%" },
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
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.byNeighborhood}</p>
          <div className="flex gap-2">
            {(["avg_price", "occupancy", "est_revenue", "listings"] as Metric[]).map((k) => (
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
        <div style={{ height: data.by_neighborhood.length * 44 + 24 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.by_neighborhood} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => (metric === "est_revenue" ? eurCompact(v) : metric === "avg_price" ? eur0(v) : metric === "occupancy" ? v + "%" : nf.format(v))} />
              <YAxis type="category" dataKey="neighborhood" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickLine={false} axisLine={false} width={84} />
              <Tooltip content={<NeighborhoodTooltip metric={metric} m={m} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey={metric} fill={ACCENT} radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="py-10 border-b border-white/5">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.scatter}</p>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: -4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="price" name="price" unit="€" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} label={{ value: m.scatterX, position: "insideBottom", offset: -8, fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
              <YAxis type="number" dataKey="occupancy" name="occupancy" unit="%" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }} tickLine={false} axisLine={false} width={48} />
              <ZAxis range={[40, 40]} />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} iconType="circle" />
              {roomTypes.map((rt) => (
                <Scatter key={rt} name={rt} data={data.scatter.filter((s) => s.room_type === rt)} fill={ROOM_COLORS[rt] ?? ACCENT} fillOpacity={0.6} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="py-10 pb-24">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.topListings}</p>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.listing}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.zone}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3">{m.cols.room}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.price}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.occ}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.revenue}</th>
                <th className="font-mono text-xs text-white/30 uppercase tracking-wider font-normal px-4 py-3 text-right">{m.cols.rating}</th>
              </tr>
            </thead>
            <tbody>
              {data.top_listings.map((l, i) => (
                <tr key={l.name + i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/80">{l.name}</td>
                  <td className="px-4 py-3 text-white/40">{l.neighborhood}</td>
                  <td className="px-4 py-3 text-white/40">{l.room_type}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{eur0(l.price)}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">{l.occupancy}%</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums" style={{ color: ACCENT }}>{eur0(l.est_revenue)}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70 tabular-nums">★ {l.rating}</td>
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

function AdminView({ data, m, view, setView }: { data: RealEstate; m: typeof labels.es; view: DashView; setView: (v: DashView) => void }) {
  const roomTypes = Array.from(new Set(data.scatter.map((s) => s.room_type)))

  return (
    <AdminShell accent={ACCENT} title={m.admin.title} backLabel={m.back} view={view} setView={setView} navLabels={m.admin.nav} exportLabel={m.admin.export} importLabel={m.admin.import} minimalLabel={m.viewMinimal} adminLabel={m.viewAdmin}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label={m.kpis.revenue} value={eurCompact(data.totals.est_monthly_revenue)} goal={eurCompact(data.totals.est_monthly_revenue * 1.1)} goalLabel={m.admin.goal} vsLabel="" />
        <KpiCard label={m.kpis.price} value={eur0(data.totals.avg_price)} goal={eur0(data.totals.avg_price * 1.1)} goalLabel={m.admin.goal} vsLabel="" />
        <KpiCard label={m.kpis.occ} value={data.totals.avg_occupancy + "%"} goal={(data.totals.avg_occupancy * 1.1).toFixed(1) + "%"} goalLabel={m.admin.goal} vsLabel="" />
        <KpiCard label={m.kpis.listings} value={nf.format(data.totals.listings)} goalLabel={m.admin.goal} vsLabel="" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        {/* Revenue by neighborhood */}
        <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.byNeighborhood} · {m.kpis.revenue}</h3>
          <div style={{ height: data.by_neighborhood.length * 36 + 8 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.by_neighborhood} margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={AX_GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: AX_TICK, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => eurCompact(v)} />
                <YAxis type="category" dataKey="neighborhood" tick={{ fill: "#4b5563", fontSize: 11 }} tickLine={false} axisLine={false} width={78} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} content={<AdminNeighborhoodTooltip />} />
                <Bar dataKey="est_revenue" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price vs occupancy scatter */}
        <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.scatter}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={AX_GRID} />
                <XAxis type="number" dataKey="price" name="price" unit="€" tick={{ fill: AX_TICK, fontSize: 11 }} tickLine={false} axisLine={{ stroke: AX_LINE }} />
                <YAxis type="number" dataKey="occupancy" name="occupancy" unit="%" tick={{ fill: AX_TICK, fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <ZAxis range={[30, 30]} />
                <Tooltip content={<AdminScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: AX_LINE }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                {roomTypes.map((rt) => (
                  <Scatter key={rt} name={rt} data={data.scatter.filter((s) => s.room_type === rt)} fill={ROOM_COLORS[rt] ?? ACCENT} fillOpacity={0.65} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top listings table */}
      <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-4" style={{ color: ADMIN_DARK }}>{m.topListings}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="font-medium text-gray-400 text-xs py-2.5">{m.cols.listing}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5">{m.cols.zone}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5">{m.cols.room}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.price}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.occ}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.revenue}</th>
                <th className="font-medium text-gray-400 text-xs py-2.5 text-right">{m.cols.rating}</th>
              </tr>
            </thead>
            <tbody>
              {data.top_listings.map((l, i) => (
                <tr key={l.name + i} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 font-medium" style={{ color: ADMIN_DARK }}>{l.name}</td>
                  <td className="py-2.5 text-gray-500">{l.neighborhood}</td>
                  <td className="py-2.5 text-gray-500">{l.room_type}</td>
                  <td className="py-2.5 text-right tabular-nums text-gray-600">{eur0(l.price)}</td>
                  <td className="py-2.5 text-right tabular-nums text-gray-600">{l.occupancy}%</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums" style={{ color: ACCENT }}>{eur0(l.est_revenue)}</td>
                  <td className="py-2.5 text-right tabular-nums text-gray-600">★ {l.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}

/* ---------------------------------- Page ----------------------------------- */

export default function RealEstateDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<RealEstate | null>(null)
  const [error, setError] = useState(false)
  const [view, setView] = useState<DashView>("minimal")

  useEffect(() => {
    fetch("/data/real_estate.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json: RealEstate) => setData(json))
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
