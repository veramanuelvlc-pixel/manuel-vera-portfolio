"use client"
import { useLocale } from "@/lib/locale-context"

export function LocaleToggle({ themed = false }: { themed?: boolean }) {
  const { locale, toggle } = useLocale()
  // `themed` opts into the shadcn token palette used by the dashboard top nav
  // (works in both light and dark). The default keeps the fixed dark styling
  // used by the marketing / index pages.
  const className = themed
    ? "font-mono text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
    : "font-mono text-xs px-3 py-1.5 border border-white/10 rounded-full text-white/50 hover:border-[#00C4B0]/50 hover:text-[#00C4B0] transition-colors"
  return (
    <button onClick={toggle} className={className}>
      {locale === "es" ? "EN" : "ES"}
    </button>
  )
}
