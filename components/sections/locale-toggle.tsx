"use client"
import { useLocale } from "@/lib/locale-context"

export function LocaleToggle() {
  const { locale, toggle } = useLocale()
  return (
    <button
      onClick={toggle}
      className="font-mono text-xs px-3 py-1.5 border border-white/10 rounded-full text-white/50 hover:border-[#00C4B0]/50 hover:text-[#00C4B0] transition-colors"
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  )
}
