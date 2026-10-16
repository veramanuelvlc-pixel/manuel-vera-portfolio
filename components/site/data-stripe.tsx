import metaAds from "@/public/data/meta_ads.json"

const spend = metaAds.by_day.map((d) => d.spend)
const min = Math.min(...spend)
const max = Math.max(...spend)

/**
 * The page's one ornament is the subject's own data: 91 real days of Meta Ads
 * spend, drawn as a band of ink bars on paper.
 */
export function DataStripe({ label, height = 56 }: { label: string; height?: number }) {
  return (
    <div className="stripe flex items-end gap-[2px]" style={{ height }} role="img" aria-label={label}>
      {spend.map((v, i) => (
        <span
          key={i}
          className="stripe-bar flex-1 bg-[var(--ink)]"
          style={{ height: `${28 + ((v - min) / (max - min)) * 72}%`, "--i": i } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
