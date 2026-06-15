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

export default function RealEstateDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<RealEstate | null>(null)
  const [error, setError] = useState(false)
  const [metric, setMetric] = useState<Metric>("avg_price")

  useEffect(() => {
    fetch("/data/real_estate.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json: RealEstate) => setData(json))
      .catch(() => setError(true))
  }, [])

  const roomTypes = data ? Array.from(new Set(data.scatter.map((s) => s.room_type))) : []

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
      </section>

      {!data && !error && <div className="py-24 text-center font-mono text-sm text-white/30">{m.loading}</div>}
      {error && <div className="py-24 text-center font-mono text-sm text-red-400/70">{m.error}</div>}

      {data && (
        <>
          {/* KPI cards */}
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

          {/* By neighborhood */}
          <section className="py-10 border-b border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.byNeighborhood}</p>
              <div className="flex gap-2">
                {(["avg_price", "occupancy", "est_revenue", "listings"] as Metric[]).map((k) => (
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
            <div style={{ height: data.by_neighborhood.length * 44 + 24 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.by_neighborhood} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => (metric === "est_revenue" ? eurCompact(v) : metric === "avg_price" ? eur0(v) : metric === "occupancy" ? v + "%" : nf.format(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="neighborhood"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={84}
                  />
                  <Tooltip content={<NeighborhoodTooltip metric={metric} m={m} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey={metric} fill={ACCENT} radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Scatter: price vs occupancy */}
          <section className="py-10 border-b border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-6">{m.scatter}</p>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: -4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="price"
                    name="price"
                    unit="€"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    label={{ value: m.scatterX, position: "insideBottom", offset: -8, fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="occupancy"
                    name="occupancy"
                    unit="%"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <ZAxis range={[40, 40]} />
                  <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} iconType="circle" />
                  {roomTypes.map((rt) => (
                    <Scatter
                      key={rt}
                      name={rt}
                      data={data.scatter.filter((s) => s.room_type === rt)}
                      fill={ROOM_COLORS[rt] ?? ACCENT}
                      fillOpacity={0.6}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top listings */}
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
        </>
      )}

    </main>
  )
}
