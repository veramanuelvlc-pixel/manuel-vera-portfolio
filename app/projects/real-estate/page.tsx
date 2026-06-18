"use client"
import { useEffect, useMemo, useState } from "react"
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
  Cell,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import {
  Search,
  Bell,
  Maximize2,
  MoreHorizontal,
  Building2,
  Tag,
  Percent,
  Coins,
  Star,
  MapPin,
  LayoutDashboard,
  Home,
  CalendarDays,
  MessageSquare,
  Settings2,
  ChevronsUpDown,
  ArrowLeft,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"

type Neighborhood = { neighborhood: string; listings: number; avg_price: number; occupancy: number; est_revenue: number; avg_rating: number }
type RoomType = { room_type: string; listings: number; avg_price: number; occupancy: number }
type ScatterPoint = { price: number; occupancy: number; neighborhood: string; room_type: string }
type Listing = { name: string; neighborhood: string; room_type: string; price: number; occupancy: number; est_revenue: number; rating: number }
type RealEstate = {
  totals: { listings: number; avg_price: number; avg_occupancy: number; est_monthly_revenue: number; avg_rating: number; superhost_rate: number; neighborhoods: number }
  by_neighborhood: Neighborhood[]
  by_room_type: RoomType[]
  scatter: ScatterPoint[]
  top_listings: Listing[]
}

type Metric = "est_revenue" | "avg_price" | "occupancy" | "listings"

const ACCENT = "#F59E0B"
const ROOM_COLORS: Record<string, string> = {
  "Entire home/apt": "#F59E0B",
  "Private room": "#00C4B0",
  "Shared room": "#E840D0",
}

const labels = {
  es: {
    back: "Proyectos",
    loading: "Cargando…",
    nav: { dashboard: "Dashboard", listings: "Listings", areas: "Zonas", calendar: "Calendario", reviews: "Reseñas", settings: "Ajustes" },
    search: "Buscar…",
    kpis: { listings: "Listings", price: "Precio medio", occ: "Ocupación", revenue: "Revenue/mes" },
    kpiSub: { listings: (n: number) => `${n} zonas`, price: "por noche", occ: "media de listings", revenue: "estimado" },
    overview: "Resumen",
    customize: "Personalizar",
    byArea: "Por zona",
    metrics: { est_revenue: "Revenue", avg_price: "Precio", occupancy: "Ocupación", listings: "Listings" },
    roomMix: "Mix por tipo",
    quality: "Calidad",
    superhosts: "Superhosts",
    ratingLbl: "Rating medio",
    scatter: "Precio vs ocupación",
    scatterX: "Precio/noche (€)",
    topListings: "Top listings por revenue",
    cols: { listing: "Listing", zone: "Zona", room: "Tipo", price: "Precio", occ: "Ocupación", revenue: "Revenue/mes", rating: "Rating" },
  },
  en: {
    back: "Projects",
    loading: "Loading…",
    nav: { dashboard: "Dashboard", listings: "Listings", areas: "Areas", calendar: "Calendar", reviews: "Reviews", settings: "Settings" },
    search: "Search…",
    kpis: { listings: "Listings", price: "Avg price", occ: "Occupancy", revenue: "Revenue/mo" },
    kpiSub: { listings: (n: number) => `${n} areas`, price: "per night", occ: "across listings", revenue: "estimated" },
    overview: "Overview",
    customize: "Customize",
    byArea: "By area",
    metrics: { est_revenue: "Revenue", avg_price: "Price", occupancy: "Occupancy", listings: "Listings" },
    roomMix: "Room mix",
    quality: "Quality",
    superhosts: "Superhosts",
    ratingLbl: "Avg rating",
    scatter: "Price vs occupancy",
    scatterX: "Price/night (€)",
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

function AreaTooltip({ active, payload, metric, m }: Partial<TooltipContentProps<number, string>> & { metric: Metric; m: typeof labels.es }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Neighborhood
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-lg">
      <p className="text-[11px] text-white/50 mb-1">{p.neighborhood}</p>
      <p className="text-sm text-white font-medium tabular-nums">
        <span style={{ color: ACCENT }}>{m.metrics[metric]}: </span>{fmtMetric(metric, p[metric])}
      </p>
      <p className="text-[11px] text-white/35 mt-0.5">{nf.format(p.listings)} listings · {p.occupancy}% · ★ {p.avg_rating}</p>
    </div>
  )
}

function ScatterTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as ScatterPoint
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-lg">
      <p className="text-[11px] text-white/50 mb-0.5">{p.neighborhood}</p>
      <p className="text-xs text-white/60">{p.room_type}</p>
      <p className="text-sm text-white font-medium tabular-nums mt-0.5">{eur0(p.price)} · {p.occupancy}%</p>
    </div>
  )
}

export default function RealEstateDashboard() {
  const { locale } = useLocale()
  const m = labels[locale]
  const [data, setData] = useState<RealEstate | null>(null)
  const [metric, setMetric] = useState<Metric>("est_revenue")

  useEffect(() => {
    fetch("/data/real_estate.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const d = useMemo(() => {
    if (!data) return null
    const t = data.totals

    const kpis = [
      { key: "listings", Icon: Building2, label: m.kpis.listings, value: nf.format(t.listings), sub: m.kpiSub.listings(t.neighborhoods) },
      { key: "price", Icon: Tag, label: m.kpis.price, value: eur0(t.avg_price), sub: m.kpiSub.price },
      { key: "occ", Icon: Percent, label: m.kpis.occ, value: t.avg_occupancy + "%", sub: m.kpiSub.occ },
      { key: "revenue", Icon: Coins, label: m.kpis.revenue, value: eurCompact(t.est_monthly_revenue), sub: m.kpiSub.revenue },
    ]

    const totalRoomListings = data.by_room_type.reduce((s, r) => s + r.listings, 0)
    const roomMix = data.by_room_type.map((r) => ({ ...r, share: totalRoomListings > 0 ? (r.listings / totalRoomListings) * 100 : 0 }))

    const roomTypes = Array.from(new Set(data.scatter.map((s) => s.room_type)))

    return { kpis, roomMix, roomTypes, t }
  }, [data, m])

  const sortedAreas = useMemo(() => {
    if (!data) return []
    return [...data.by_neighborhood].sort((a, b) => b[metric] - a[metric])
  }, [data, metric])

  const navItems = [
    { Icon: LayoutDashboard, label: m.nav.dashboard, active: true },
    { Icon: Home, label: m.nav.listings },
    { Icon: MapPin, label: m.nav.areas },
    { Icon: CalendarDays, label: m.nav.calendar },
    { Icon: MessageSquare, label: m.nav.reviews },
    { Icon: Settings2, label: m.nav.settings },
  ]

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/[0.06] hidden md:flex flex-col p-3 sticky top-0 self-start h-screen">
        <button className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.04] transition-colors">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-xs font-bold" style={{ color: ACCENT }}>mv</span>
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
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-black" style={{ backgroundColor: ACCENT }}>3</span>
          </button>
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#7C3AED]" />
        </header>

        <div className="p-6">
          {!d && <p className="text-white/30 text-sm py-20 text-center">{m.loading}</p>}

          {d && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {d.kpis.map(({ key, Icon, label, value, sub }) => (
                  <div key={key} className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                    <div className="flex items-center justify-between text-white/45 mb-4">
                      <span className="flex items-center gap-2 text-xs"><Icon size={15} /> {label}</span>
                      <MoreHorizontal size={15} />
                    </div>
                    <p className="text-2xl font-semibold tabular-nums">{value}</p>
                    <p className="mt-2 text-xs text-white/35">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Overview heading */}
              <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-lg font-semibold">{m.overview}</h2>
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
                {/* By area */}
                <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 text-white/45 text-xs"><MapPin size={14} /> {m.byArea}</span>
                    <div className="flex gap-1.5">
                      {(["est_revenue", "avg_price", "occupancy", "listings"] as Metric[]).map((k) => (
                        <button
                          key={k}
                          onClick={() => setMetric(k)}
                          className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
                          style={metric === k ? { borderColor: ACCENT + "60", color: ACCENT, backgroundColor: ACCENT + "12" } : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                        >
                          {m.metrics[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: sortedAreas.length * 38 + 16 }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={sortedAreas} margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtMetric(metric, v)} />
                        <YAxis type="category" dataKey="neighborhood" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickLine={false} axisLine={false} width={84} />
                        <Tooltip content={<AreaTooltip metric={metric} m={m} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar dataKey={metric} radius={[0, 4, 4, 0]} barSize={16}>
                          {sortedAreas.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? ACCENT : "rgba(245,158,11,0.35)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                  {/* Room mix */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                    <div className="flex items-center justify-between text-white/45 text-xs mb-4">
                      <span className="flex items-center gap-2"><Home size={14} /> {m.roomMix}</span>
                      <Maximize2 size={14} />
                    </div>
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                      {d.roomMix.map((r) => (
                        <div key={r.room_type} style={{ width: `${r.share}%`, backgroundColor: ROOM_COLORS[r.room_type] ?? ACCENT }} />
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-2.5">
                      {d.roomMix.map((r) => (
                        <div key={r.room_type} className="flex items-center gap-2 text-xs">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ROOM_COLORS[r.room_type] ?? ACCENT }} />
                          <span className="text-white/55">{r.room_type}</span>
                          <span className="ml-auto tabular-nums text-white/40">{nf.format(r.listings)}</span>
                          <span className="tabular-nums text-white/70 w-9 text-right">{r.share.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                    <div className="flex items-center justify-between text-white/45 text-xs mb-4">
                      <span className="flex items-center gap-2"><Star size={14} /> {m.quality}</span>
                      <Maximize2 size={14} />
                    </div>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-[11px] text-white/40">{m.ratingLbl}</p>
                        <p className="text-xl font-semibold tabular-nums mt-0.5" style={{ color: ACCENT }}>★ {d.t.avg_rating}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/40">{m.superhosts}</p>
                        <p className="text-xl font-semibold tabular-nums mt-0.5 text-white/70">{d.t.superhost_rate}%</p>
                      </div>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${d.t.superhost_rate}%`, backgroundColor: ACCENT }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price vs occupancy scatter */}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                <div className="flex items-center justify-between text-white/45 text-xs mb-4">
                  <span className="flex items-center gap-2"><Percent size={14} /> {m.scatter}</span>
                  <Maximize2 size={14} />
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 8, right: 12, bottom: 16, left: -4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" dataKey="price" name="price" unit="€" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} label={{ value: m.scatterX, position: "insideBottom", offset: -8, fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                      <YAxis type="number" dataKey="occupancy" name="occupancy" unit="%" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} width={48} />
                      <ZAxis range={[36, 36]} />
                      <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                      {d.roomTypes.map((rt) => (
                        <Scatter key={rt} name={rt} data={data!.scatter.filter((s) => s.room_type === rt)} fill={ROOM_COLORS[rt] ?? ACCENT} fillOpacity={0.6} />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top listings */}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#121212] p-5">
                <div className="flex items-center justify-between text-white/45 text-xs mb-4">
                  <span className="flex items-center gap-2"><Building2 size={14} /> {m.topListings}</span>
                  <MoreHorizontal size={15} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-white/[0.06]">
                        <th className="text-xs text-white/30 font-normal py-2.5">{m.cols.listing}</th>
                        <th className="text-xs text-white/30 font-normal py-2.5">{m.cols.zone}</th>
                        <th className="text-xs text-white/30 font-normal py-2.5">{m.cols.room}</th>
                        <th className="text-xs text-white/30 font-normal py-2.5 text-right">{m.cols.price}</th>
                        <th className="text-xs text-white/30 font-normal py-2.5 text-right">{m.cols.occ}</th>
                        <th className="text-xs text-white/30 font-normal py-2.5 text-right">{m.cols.revenue}</th>
                        <th className="text-xs text-white/30 font-normal py-2.5 text-right">{m.cols.rating}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data!.top_listings.map((l, i) => (
                        <tr key={l.name + i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 text-white/80">{l.name}</td>
                          <td className="py-2.5 text-white/40">{l.neighborhood}</td>
                          <td className="py-2.5 text-white/40">{l.room_type}</td>
                          <td className="py-2.5 text-right tabular-nums text-white/70">{eur0(l.price)}</td>
                          <td className="py-2.5 text-right tabular-nums text-white/70">{l.occupancy}%</td>
                          <td className="py-2.5 text-right tabular-nums font-medium" style={{ color: ACCENT }}>{eur0(l.est_revenue)}</td>
                          <td className="py-2.5 text-right tabular-nums text-white/70">★ {l.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
