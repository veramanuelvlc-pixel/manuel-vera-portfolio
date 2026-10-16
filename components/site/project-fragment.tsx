import metaAds from "@/public/data/meta_ads.json"
import ecommerce from "@/public/data/ecommerce.json"
import email from "@/public/data/email.json"
import realEstate from "@/public/data/real_estate.json"
import type { Locale } from "@/lib/i18n"
import type { ProjectSlug } from "@/lib/projects"

/*
 * Interface fragments drawn from each project's real JSON, in the dashboards'
 * own dark style. Marked `data-ui`: these are product surfaces, so they keep
 * their own type, borders and density instead of the page's house style.
 */

const ACCENT = "#00C4B0"

export function fmt(locale: Locale) {
  // en-US output is identical in Node and browsers; Spanish swaps separators.
  const swap = (str: string) => (locale === "es" ? str.replace(/[.,]/g, (c) => (c === "," ? "." : ",")) : str)
  const num = (v: number, d = 0) =>
    swap(v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }))
  const sym = (cur: "USD" | "EUR") => (cur === "EUR" ? "€" : "$")
  return {
    n: (v: number, d = 0) => num(v, d),
    money: (v: number, cur: "USD" | "EUR" = "USD", d = 0) => sym(cur) + num(v, d),
    compact: (v: number, cur: "USD" | "EUR" = "USD") =>
      sym(cur) + (v >= 1e6 ? num(v / 1e6, 1) + "M" : num(v / 1e3, 0) + "K"),
    pct: (v: number) => num(v, 1) + "%",
  }
}

function Kpis({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
          <p className="text-[13px] text-white/60">{k.label}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">{k.value}</p>
        </div>
      ))}
    </div>
  )
}

function Bars({ values, highlight, height = 120 }: { values: number[]; highlight?: number; height?: number }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-[2px]" style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-[2px]"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            backgroundColor: i === highlight ? ACCENT : "rgba(255,255,255,0.32)",
          }}
        />
      ))}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="mb-3 text-[13px] text-white/60">{title}</p>
      {children}
    </div>
  )
}

function MetaAds({ locale }: { locale: Locale }) {
  const f = fmt(locale)
  const t = metaAds.totals
  const es = locale === "es"
  const rev = metaAds.by_day.map((d) => d.revenue)
  const best = rev.indexOf(Math.max(...rev))
  return (
    <>
      <Kpis
        items={[
          { label: es ? "Inversión" : "Spend", value: f.money(t.spend) },
          { label: "Leads", value: f.n(t.leads) },
          { label: "CPL", value: f.money(t.cpl, "USD", 2) },
          { label: "ROAS", value: f.n(t.roas, 2) + "×" },
        ]}
      />
      <Panel title={es ? "Ingresos por día, ene a mar 2024" : "Revenue by day, Jan to Mar 2024"}>
        <Bars values={rev} highlight={best} />
      </Panel>
      <Panel title={es ? "Adsets de la campaña de leads" : "Lead campaign ad sets"}>
        <table className="w-full text-[13px]">
          <tbody>
            {metaAds.by_adset
              .filter((a) => a.leads > 0)
              .slice(0, 3)
              .map((a) => (
                <tr key={a.adset_id} className="border-t border-white/[0.06] first:border-0">
                  <td className="py-1.5 pr-2 text-white/80">{a.adset_name.replace("Audiencia - ", "")}</td>
                  <td className="py-1.5 text-right text-white/60">{f.n(a.leads)}</td>
                  <td className="py-1.5 pl-3 text-right text-white">{f.money(a.cpl, "USD", 2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Panel>
    </>
  )
}

function Ecommerce({ locale }: { locale: Locale }) {
  const f = fmt(locale)
  const t = ecommerce.totals
  const es = locale === "es"
  const funnelNames: Record<string, string> = es
    ? { sessions: "Sesiones", product_views: "Vistas de producto", add_to_cart: "Al carrito", checkout: "Checkout", purchase: "Compra" }
    : { sessions: "Sessions", product_views: "Product views", add_to_cart: "Add to cart", checkout: "Checkout", purchase: "Purchase" }
  return (
    <>
      <Kpis
        items={[
          { label: "Revenue", value: f.compact(t.revenue) },
          { label: es ? "Pedidos" : "Orders", value: f.n(t.orders) },
          { label: es ? "Ticket medio" : "AOV", value: f.money(t.aov) },
          { label: "LTV", value: f.money(t.ltv) },
        ]}
      />
      <Panel title={es ? "Revenue por mes, 2024" : "Revenue by month, 2024"}>
        <Bars values={ecommerce.by_month.map((m) => m.revenue)} highlight={11} />
      </Panel>
      <Panel title="Funnel">
        <div className="space-y-1.5">
          {ecommerce.funnel.map((s) => (
            <div key={s.stage} className="flex items-center gap-3 text-[13px]">
              <span className="w-32 shrink-0 text-white/70">{funnelNames[s.stage] ?? s.stage}</span>
              <span className="h-2 rounded-full" style={{ width: `${Math.max(2, s.rate)}%`, backgroundColor: ACCENT }} />
              <span className="ml-auto text-white">{f.pct(s.rate)}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}

function Email({ locale }: { locale: Locale }) {
  const f = fmt(locale)
  const t = email.totals
  const es = locale === "es"
  return (
    <>
      <Kpis
        items={[
          { label: es ? "Envíos" : "Sent", value: f.n(t.sent) },
          { label: es ? "Apertura" : "Open rate", value: f.pct(t.open_rate) },
          { label: "Click rate", value: f.pct(t.click_rate) },
          { label: "Revenue", value: f.compact(t.revenue) },
        ]}
      />
      <Panel title={es ? "Revenue atribuido por semana" : "Attributed revenue by week"}>
        <Bars values={email.by_week.map((w) => w.revenue)} highlight={email.by_week.findIndex((w) => w.revenue === Math.max(...email.by_week.map((x) => x.revenue)))} />
      </Panel>
      <Panel title={es ? "Tests A/B de asunto" : "Subject line A/B tests"}>
        <table className="w-full text-[13px]">
          <tbody>
            {email.ab_tests.slice(0, 3).map((ab) => (
              <tr key={ab.test} className="border-t border-white/[0.06] first:border-0">
                <td className="py-1.5 pr-2 text-white/80">{ab.test}</td>
                <td className="py-1.5 text-right text-white/60">
                  {f.pct(ab.a_open_rate)} / {f.pct(ab.b_open_rate)}
                </td>
                <td className="py-1.5 pl-3 text-right font-medium" style={{ color: ACCENT }}>
                  {ab.winner}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  )
}

function RealEstate({ locale }: { locale: Locale }) {
  const f = fmt(locale)
  const t = realEstate.totals
  const es = locale === "es"
  const max = Math.max(...realEstate.by_neighborhood.map((n) => n.est_revenue))
  return (
    <>
      <Kpis
        items={[
          { label: es ? "Anuncios" : "Listings", value: f.n(t.listings) },
          { label: es ? "Precio medio" : "Avg price", value: f.money(t.avg_price, "EUR") },
          { label: es ? "Ocupación" : "Occupancy", value: f.pct(t.avg_occupancy) },
          { label: es ? "Revenue/mes" : "Revenue/mo", value: f.compact(t.est_monthly_revenue, "EUR") },
        ]}
      />
      <Panel title={es ? "Revenue estimado por barrio" : "Estimated revenue by area"}>
        <div className="space-y-1.5">
          {realEstate.by_neighborhood.map((n, i) => (
            <div key={n.neighborhood} className="flex items-center gap-3 text-[13px]">
              <span className="w-24 shrink-0 text-white/70">{n.neighborhood}</span>
              <span
                className="h-2.5 rounded-sm"
                style={{ width: `${(n.est_revenue / max) * 62}%`, backgroundColor: i === 0 ? "#F59E0B" : "rgba(245,158,11,0.4)" }}
              />
              <span className="ml-auto text-white">{f.compact(n.est_revenue, "EUR")}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}

const BODIES: Record<ProjectSlug, (p: { locale: Locale }) => React.ReactElement> = {
  "meta-ads": MetaAds,
  ecommerce: Ecommerce,
  "email-marketing": Email,
  "real-estate": RealEstate,
}

export function ProjectFragment({ slug, title, locale }: { slug: ProjectSlug; title: string; locale: Locale }) {
  const Body = BODIES[slug]
  return (
    <div data-ui className="w-full max-w-[560px] space-y-2.5 font-[family-name:var(--font-inter)] text-white">
      <p className="text-sm font-medium text-white">{title}</p>
      <Body locale={locale} />
    </div>
  )
}
