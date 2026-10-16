"use client"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Send, MailOpen, DollarSign, Coins, TrendingUp, Filter, FlaskConical, Trophy, ListOrdered } from "lucide-react"
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
  nf,
  pct,
  usd0,
  usd2,
  usdCompact,
} from "@/components/dashboard/dash-kit"

type Week = { week: string; sent: number; open_rate: number; click_rate: number; revenue: number; orders: number }
type Campaign = { campaign_name: string; type: string; sent: number; open_rate: number; click_rate: number; revenue: number }
type AbTest = {
  test: string
  type: string
  subject_a: string
  subject_b: string
  sent_per_variant: number
  a_open_rate: number
  b_open_rate: number
  a_click_rate: number
  b_click_rate: number
  a_revenue: number
  b_revenue: number
  winner: "A" | "B"
}
type Email = {
  totals: {
    sent: number
    delivered: number
    open_rate: number
    click_rate: number
    revenue: number
    orders: number
    conv_rate: number
    unsub_rate: number
    rpe: number
    date_range: { start: string; end: string }
  }
  by_week: Week[]
  top_campaigns: Campaign[]
  ab_tests: AbTest[]
}

const ACCENT = "#E840D0"
const LINE = "#00C4B0"
const TYPE_COLORS: Record<string, string> = {
  "Abandoned Cart": "#F59E0B",
  Welcome: "#00C4B0",
  Promo: "#E840D0",
  Newsletter: "#3B82F6",
  "Win-back": "#A3A3A3",
}

const labels = {
  es: {
    back: "Proyectos",
    loading: "Cargando…",
    kpis: { sent: "Enviados", open: "Apertura", revenue: "Revenue atribuido", rpe: "Revenue por email" },
    kpiSub: {
      sent: (p: string) => `${p} entregados`,
      open: (p: string) => `${p} de clics`,
      revenue: (n: string) => `${n} pedidos`,
      rpe: (p: string) => `${p} de bajas`,
    },
    weekly: "Revenue y apertura por semana",
    revenue: "Revenue",
    openRate: "Apertura",
    funnel: "Del envío a la compra",
    steps: { delivered: "Entregados", opens: "Abiertos", clicks: "Clics", orders: "Pedidos" },
    convNote: (p: string) => `${p} de quienes hacen clic terminan comprando.`,
    tests: "Tests A/B de asunto",
    testsSub: "El ganador se decide por revenue, no por apertura.",
    perVariant: (n: string) => `${n} envíos por variante`,
    open: "Apertura",
    click: "Clics",
    winner: "Ganador",
    lift: (p: string) => `+${p} revenue`,
    paradox: "Abrió más la otra variante, pero esta vendió más.",
    campaigns: "Top campañas por revenue",
    cols: { name: "Campaña", type: "Tipo", sent: "Enviados", open: "Apertura", click: "Clics", revenue: "Revenue" },
    types: { "Abandoned Cart": "Carrito abandonado", Welcome: "Bienvenida", Promo: "Promo", Newsletter: "Newsletter", "Win-back": "Win-back" } as Record<string, string>,
  },
  en: {
    back: "Projects",
    loading: "Loading…",
    kpis: { sent: "Sent", open: "Open rate", revenue: "Attributed revenue", rpe: "Revenue per email" },
    kpiSub: {
      sent: (p: string) => `${p} delivered`,
      open: (p: string) => `${p} click rate`,
      revenue: (n: string) => `${n} orders`,
      rpe: (p: string) => `${p} unsubscribed`,
    },
    weekly: "Revenue and open rate by week",
    revenue: "Revenue",
    openRate: "Open rate",
    funnel: "From send to purchase",
    steps: { delivered: "Delivered", opens: "Opened", clicks: "Clicked", orders: "Orders" },
    convNote: (p: string) => `${p} of clickers go on to buy.`,
    tests: "Subject line A/B tests",
    testsSub: "The winner is decided by revenue, not opens.",
    perVariant: (n: string) => `${n} sends per variant`,
    open: "Open",
    click: "Clicks",
    winner: "Winner",
    lift: (p: string) => `+${p} revenue`,
    paradox: "The other variant got more opens, but this one sold more.",
    campaigns: "Top campaigns by revenue",
    cols: { name: "Campaign", type: "Type", sent: "Sent", open: "Open", click: "Clicks", revenue: "Revenue" },
    types: { "Abandoned Cart": "Abandoned cart", Welcome: "Welcome", Promo: "Promo", Newsletter: "Newsletter", "Win-back": "Win-back" } as Record<string, string>,
  },
}

export default function EmailDashboard() {
  return (
    <ThemeProvider>
      <EmailInner />
    </ThemeProvider>
  )
}

function EmailInner() {
  const { locale } = useLocale()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const m = labels[locale]
  const c = chartPalette(dark)
  const [data, setData] = useState<Email | null>(null)

  useEffect(() => {
    fetch("/data/email.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const d = useMemo(() => {
    if (!data) return null
    const t = data.totals
    // Rates are over delivered emails; orders come straight from the data.
    const opens = Math.round(t.delivered * (t.open_rate / 100))
    const clicks = Math.round(t.delivered * (t.click_rate / 100))
    const funnel = [
      { key: "delivered", label: m.steps.delivered, value: t.delivered },
      { key: "opens", label: m.steps.opens, value: opens },
      { key: "clicks", label: m.steps.clicks, value: clicks },
      { key: "orders", label: m.steps.orders, value: t.orders },
    ]

    const tests = data.ab_tests.map((ab) => {
      const win = ab.winner === "A" ? { open: ab.a_open_rate, rev: ab.a_revenue } : { open: ab.b_open_rate, rev: ab.b_revenue }
      const lose = ab.winner === "A" ? { open: ab.b_open_rate, rev: ab.b_revenue } : { open: ab.a_open_rate, rev: ab.a_revenue }
      return { ...ab, lift: ((win.rev - lose.rev) / lose.rev) * 100, paradox: lose.open > win.open }
    })

    return {
      t,
      funnel,
      tests,
      kpis: [
        { key: "sent", Icon: Send, label: m.kpis.sent, value: nf.format(t.sent), sub: m.kpiSub.sent(pct((t.delivered / t.sent) * 100)) },
        { key: "open", Icon: MailOpen, label: m.kpis.open, value: pct(t.open_rate, 2), sub: m.kpiSub.open(pct(t.click_rate, 2)) },
        { key: "revenue", Icon: DollarSign, label: m.kpis.revenue, value: usdCompact(t.revenue), sub: m.kpiSub.revenue(nf.format(t.orders)) },
        { key: "rpe", Icon: Coins, label: m.kpis.rpe, value: usd2(t.rpe), sub: m.kpiSub.rpe(pct(t.unsub_rate, 2)) },
      ],
    }
  }, [data, m])

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
                title={m.weekly}
                className="lg:col-span-2"
                aside={
                  <span className="flex items-center gap-3 text-[11px] text-[var(--txt3)]">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: ACCENT }} />{m.revenue}</span>
                    <span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ backgroundColor: LINE }} />{m.openRate}</span>
                  </span>
                }
              >
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data!.by_week} margin={{ top: 4, right: 0, bottom: 0, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="rev" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={52} tickFormatter={usdCompact} />
                      <YAxis yAxisId="open" orientation="right" tick={{ fill: c.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={36} tickFormatter={(v: number) => v + "%"} />
                      <Tooltip
                        content={<ChartTooltip c={c} format={(k, v) => (k === "revenue" ? usd0(v) : pct(v))} />}
                        cursor={{ fill: c.cursor }}
                      />
                      <Bar yAxisId="rev" dataKey="revenue" name={m.revenue} fill={ACCENT} radius={[2, 2, 0, 0]} maxBarSize={28} />
                      <Line yAxisId="open" type="monotone" dataKey="open_rate" name={m.openRate} stroke={LINE} strokeWidth={2} dot={{ r: 2.5, fill: LINE }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel Icon={Filter} title={m.funnel}>
                <div className="flex flex-col gap-3">
                  {d.funnel.map((s) => {
                    const w = (s.value / d.funnel[0].value) * 100
                    return (
                      <div key={s.key}>
                        <div className="mb-1 flex items-baseline justify-between text-xs">
                          <span className="text-[var(--txt2)]">{s.label}</span>
                          <span className="tabular-nums text-[var(--txt)]">{nf.format(s.value)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--track)]">
                          <div className="h-2 rounded-full" style={{ width: `${Math.max(w, 1)}%`, backgroundColor: ACCENT }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-[var(--txt3)]">{m.convNote(pct(d.t.conv_rate, 2))}</p>
              </Panel>
            </div>

            <Panel Icon={FlaskConical} title={m.tests} className="mt-4" aside={<span className="text-[11px] text-[var(--txt3)]">{m.testsSub}</span>}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {d.tests.map((ab) => (
                  <div key={ab.test} className="rounded-lg border border-[var(--line)] p-4">
                    <div className="mb-3 flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">{ab.test}</p>
                      <span className="text-[11px] text-[var(--txt4)]">{m.perVariant(nf.format(ab.sent_per_variant))}</span>
                    </div>
                    {(["A", "B"] as const).map((v) => {
                      const isWin = ab.winner === v
                      const subject = v === "A" ? ab.subject_a : ab.subject_b
                      const open = v === "A" ? ab.a_open_rate : ab.b_open_rate
                      const click = v === "A" ? ab.a_click_rate : ab.b_click_rate
                      const rev = v === "A" ? ab.a_revenue : ab.b_revenue
                      return (
                        <div key={v} className="mb-3 last:mb-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold"
                              style={isWin ? { backgroundColor: ACCENT, color: "#0a0a0a" } : { backgroundColor: "var(--track)", color: "var(--txt3)" }}
                            >
                              {v}
                            </span>
                            <span className={`min-w-0 truncate ${isWin ? "text-[var(--txt)]" : "text-[var(--txt3)]"}`}>{subject}</span>
                            {isWin && <Trophy size={13} className="ml-auto shrink-0" style={{ color: ACCENT }} aria-label={m.winner} />}
                          </div>
                          <div className="mt-1.5 grid grid-cols-3 gap-2 pl-7 text-[11px] tabular-nums text-[var(--txt3)]">
                            <span>{m.open} <span className="text-[var(--txt2)]">{pct(open)}</span></span>
                            <span>{m.click} <span className="text-[var(--txt2)]">{pct(click)}</span></span>
                            <span className="text-right"><span className={isWin ? "font-medium text-[var(--txt)]" : "text-[var(--txt2)]"}>{usd0(rev)}</span></span>
                          </div>
                        </div>
                      )
                    })}
                    <p className="mt-3 text-[11px]" style={{ color: ACCENT }}>
                      {m.lift(pct(ab.lift, 0))}
                    </p>
                    {ab.paradox && <p className="mt-1 text-[11px] text-[var(--txt3)]">{m.paradox}</p>}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel Icon={ListOrdered} title={m.campaigns} className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-left">
                      <th className="py-2 text-xs font-normal text-[var(--txt4)]">{m.cols.name}</th>
                      <th className="py-2 text-xs font-normal text-[var(--txt4)]">{m.cols.type}</th>
                      <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.sent}</th>
                      <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.open}</th>
                      <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.click}</th>
                      <th className="py-2 text-right text-xs font-normal text-[var(--txt4)]">{m.cols.revenue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.top_campaigns.map((cmp) => (
                      <tr key={cmp.campaign_name} className="border-b border-[var(--line)] last:border-0">
                        <td className="py-2 text-[var(--txt)]">{cmp.campaign_name}</td>
                        <td className="py-2">
                          <span className="flex items-center gap-1.5 text-[var(--txt3)]">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[cmp.type] ?? ACCENT }} />
                            {m.types[cmp.type] ?? cmp.type}
                          </span>
                        </td>
                        <td className="py-2 text-right tabular-nums text-[var(--txt2)]">{nf.format(cmp.sent)}</td>
                        <td className="py-2 text-right tabular-nums text-[var(--txt2)]">{pct(cmp.open_rate)}</td>
                        <td className="py-2 text-right tabular-nums text-[var(--txt2)]">{pct(cmp.click_rate)}</td>
                        <td className="py-2 text-right font-medium tabular-nums" style={{ color: ACCENT }}>
                          {usd0(cmp.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  )
}
