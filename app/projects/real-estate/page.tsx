"use client"
import { useEffect, useMemo, useState } from "react"
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
  Building2,
  Tag,
  Percent,
  Coins,
  Star,
  MapPin,
  Home,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { ThemeProvider, useTheme } from "@/lib/theme-context"
import { DashTopNav } from "@/components/dashboard/dash-top-nav"

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
    kpis: { listings: "Listings", price: "Precio medio", occ: "Ocupación", revenue: "Revenue/mes" },
    kpiSub: { listings: (n: number) => `${n} zonas`, price: "por noche", occ: "media de listings", revenue: "estimado" },
    overview: "Resumen",
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
    kpis: { listings: "Listings", price: "Avg price", occ: "Occupancy", revenue: "Revenue/mo" },
    kpiSub: { listings: (n: number) => `${n} areas`, price: "per night", occ: "across listings", revenue: "estimated" },
    overview: "Overview",
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

type ChartPalette = {
  tick: string
  tickStrong: string
  axisLine: string
  grid: string
  cursor: string
  nonPeak: string
  legend: string
  tipBg: string
  tipBorder: string
  tipText: string
  tipLabel: string
  tipSub: string
}

function AreaTooltip({ active, payload, metric, m, c }: Partial<TooltipContentProps<number, string>> & { metric: Metric; m: typeof labels.es; c: ChartPalette }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Neighborhood
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ backgroundColor: c.tipBg, border: `1px solid ${c.tipBorder}` }}>
      <p className="text-[11px] mb-1" style={{ color: c.tipLabel }}>{p.neighborhood}</p>
      <p className="text-sm font-medium tabular-nums" style={{ color: c.tipText }}>
        <span style={{ color: ACCENT }}>{m.metrics[metric]}: </span>{fmtMetric(metric, p[metric])}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: c.tipSub }}>{nf.format(p.listings)} listings · {p.occupancy}% · ★ {p.avg_rating}</p>
    </div>
  )
}

function ScatterTooltip({ active, payload, c }: Partial<TooltipContentProps<number, string>> & { c: ChartPalette }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as ScatterPoint
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ backgroundColor: c.tipBg, border: `1px solid ${c.tipBorder}` }}>
      <p className="text-[11px] mb-0.5" style={{ color: c.tipLabel }}>{p.neighborhood}</p>
      <p className="text-xs" style={{ color: c.tipSub }}>{p.room_type}</p>
      <p className="text-sm font-medium tabular-nums mt-0.5" style={{ color: c.tipText }}>{eur0(p.price)} · {p.occupancy}%</p>
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

export default function RealEstateDashboard() {
  return (
    <ThemeProvider>
      <RealEstateInner />
    </ThemeProvider>
  )
}

function RealEstateInner() {
  const { locale } = useLocale()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const m = labels[locale]
  const [data, setData] = useState<RealEstate | null>(null)
  const [metric, setMetric] = useState<Metric>("est_revenue")

  useEffect(() => {
    fetch("/data/real_estate.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const c: ChartPalette = dark
    ? {
        tick: "rgba(255,255,255,0.30)",
        tickStrong: "rgba(255,255,255,0.5)",
        axisLine: "rgba(255,255,255,0.08)",
        grid: "rgba(255,255,255,0.05)",
        cursor: "rgba(255,255,255,0.1)",
        nonPeak: "rgba(245,158,11,0.35)",
        legend: "rgba(255,255,255,0.6)",
        tipBg: "#1a1a1a",
        tipBorder: "rgba(255,255,255,0.1)",
        tipText: "#ffffff",
        tipLabel: "rgba(255,255,255,0.5)",
        tipSub: "rgba(255,255,255,0.35)",
      }
    : {
        tick: "#9aa1ad",
        tickStrong: "#6b7280",
        axisLine: "rgba(17,24,39,0.12)",
        grid: "rgba(17,24,39,0.07)",
        cursor: "rgba(17,24,39,0.15)",
        nonPeak: "rgba(245,158,11,0.4)",
        legend: "#6b7280",
        tipBg: "#ffffff",
        tipBorder: "rgba(17,24,39,0.1)",
        tipText: "#15161c",
        tipLabel: "#6b7280",
        tipSub: "#9aa1ad",
      }

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
              {d.kpis.map(({ key, Icon, label, value, sub }) => (
                <div key={key} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Icon size={15} /> {label}</span>
                  <p className="text-2xl font-semibold tabular-nums">{value}</p>
                  <p className="mt-2 text-xs text-[var(--txt4)]">{sub}</p>
                </div>
              ))}
            </div>

            {/* Overview heading */}
            <h2 className="text-lg font-semibold mt-8 mb-4">{m.overview}</h2>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* By area */}
              <div className="lg:col-span-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2 text-[var(--txt3)] text-xs"><MapPin size={14} /> {m.byArea}</span>
                  <div className="flex gap-1.5">
                    {(["est_revenue", "avg_price", "occupancy", "listings"] as Metric[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => setMetric(k)}
                        className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
                        style={metric === k ? { borderColor: ACCENT + "60", color: ACCENT, backgroundColor: ACCENT + "12" } : { borderColor: "var(--line)", color: "var(--txt3)" }}
                      >
                        {m.metrics[k]}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: sortedAreas.length * 38 + 16 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={sortedAreas} margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
                      <XAxis type="number" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtMetric(metric, v)} />
                      <YAxis type="category" dataKey="neighborhood" tick={{ fill: c.tickStrong, fontSize: 11 }} tickLine={false} axisLine={false} width={84} />
                      <Tooltip content={<AreaTooltip metric={metric} m={m} c={c} />} cursor={{ fill: c.cursor, fillOpacity: 0.3 }} />
                      <Bar dataKey={metric} radius={[0, 4, 4, 0]} barSize={16}>
                        {sortedAreas.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? ACCENT : c.nonPeak} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                {/* Room mix */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Home size={14} /> {m.roomMix}</span>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                    {d.roomMix.map((r) => (
                      <div key={r.room_type} style={{ width: `${r.share}%`, backgroundColor: ROOM_COLORS[r.room_type] ?? ACCENT }} />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {d.roomMix.map((r) => (
                      <div key={r.room_type} className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ROOM_COLORS[r.room_type] ?? ACCENT }} />
                        <span className="text-[var(--txt2)]">{r.room_type}</span>
                        <span className="ml-auto tabular-nums text-[var(--txt3)]">{nf.format(r.listings)}</span>
                        <span className="tabular-nums text-[var(--txt)] w-9 text-right">{r.share.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Star size={14} /> {m.quality}</span>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[11px] text-[var(--txt3)]">{m.ratingLbl}</p>
                      <p className="text-xl font-semibold tabular-nums mt-0.5" style={{ color: ACCENT }}>★ {d.t.avg_rating}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[var(--txt3)]">{m.superhosts}</p>
                      <p className="text-xl font-semibold tabular-nums mt-0.5 text-[var(--txt2)]">{d.t.superhost_rate}%</p>
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-[var(--track)] overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${d.t.superhost_rate}%`, backgroundColor: ACCENT }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Price vs occupancy scatter */}
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
              <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Percent size={14} /> {m.scatter}</span>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 12, bottom: 16, left: -4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                    <XAxis type="number" dataKey="price" name="price" unit="€" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={{ stroke: c.axisLine }} label={{ value: m.scatterX, position: "insideBottom", offset: -8, fill: c.tick, fontSize: 11 }} />
                    <YAxis type="number" dataKey="occupancy" name="occupancy" unit="%" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={48} />
                    <ZAxis range={[36, 36]} />
                    <Tooltip content={<ScatterTooltip c={c} />} cursor={{ strokeDasharray: "3 3", stroke: c.axisLine }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: c.legend }} iconType="circle" />
                    {d.roomTypes.map((rt) => (
                      <Scatter key={rt} name={rt} data={data!.scatter.filter((s) => s.room_type === rt)} fill={ROOM_COLORS[rt] ?? ACCENT} fillOpacity={0.6} />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top listings */}
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
              <span className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4"><Building2 size={14} /> {m.topListings}</span>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[var(--line)]">
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5">{m.cols.listing}</th>
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5">{m.cols.zone}</th>
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5">{m.cols.room}</th>
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5 text-right">{m.cols.price}</th>
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5 text-right">{m.cols.occ}</th>
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5 text-right">{m.cols.revenue}</th>
                      <th className="text-xs text-[var(--txt4)] font-normal py-2.5 text-right">{m.cols.rating}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.top_listings.map((l, i) => (
                      <tr key={l.name + i} className="border-b border-[var(--line)] last:border-0">
                        <td className="py-2.5 text-[var(--txt)]">{l.name}</td>
                        <td className="py-2.5 text-[var(--txt3)]">{l.neighborhood}</td>
                        <td className="py-2.5 text-[var(--txt3)]">{l.room_type}</td>
                        <td className="py-2.5 text-right tabular-nums text-[var(--txt2)]">{eur0(l.price)}</td>
                        <td className="py-2.5 text-right tabular-nums text-[var(--txt2)]">{l.occupancy}%</td>
                        <td className="py-2.5 text-right tabular-nums font-medium" style={{ color: ACCENT }}>{eur0(l.est_revenue)}</td>
                        <td className="py-2.5 text-right tabular-nums text-[var(--txt2)]">★ {l.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
