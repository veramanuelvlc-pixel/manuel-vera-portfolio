"use client"
import { useLocale } from "@/lib/locale-context"

export function SkipLink() {
  const { t } = useLocale()
  return (
    <a
      href="#main"
      className="sr-only z-50 bg-[var(--ink)] px-4 py-3 text-[var(--field-ink)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
    >
      {t.nav.skip}
    </a>
  )
}
