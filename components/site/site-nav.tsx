"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { contact } from "@/lib/i18n"

/** Plain bar for the inner pages: wordmark, a few links, one action. */
export function SiteNav({ current }: { current?: "about" | "projects" }) {
  const { t, locale, toggle } = useLocale()
  const link = (active: boolean) =>
    `transition-colors duration-150 ${active ? "text-[var(--ink)] underline underline-offset-[0.3em]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-[var(--gutter)] py-5">
      <Link href="/" translate="no" className="text-[1.375rem] font-semibold tracking-[-0.02em]">
        Manuel Vera
      </Link>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[length:var(--step-small)] sm:text-base">
        <Link href="/projects" className={link(current === "projects")} aria-current={current === "projects" ? "page" : undefined}>
          {t.nav.projects}
        </Link>
        <Link href="/about" className={link(current === "about")} aria-current={current === "about" ? "page" : undefined}>
          {t.nav.about}
        </Link>
        <button type="button" onClick={toggle} className={link(false)} lang={locale === "es" ? "en" : "es"}>
          {locale === "es" ? "English" : "Español"}
        </button>
        <a href={`mailto:${contact.email}?subject=${encodeURIComponent(t.hero.mailSubject)}`} className="mv-btn !min-h-[44px] !px-5">
          {t.nav.write}
        </a>
      </nav>
    </header>
  )
}
