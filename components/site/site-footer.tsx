"use client"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { contact } from "@/lib/i18n"
import { DataStripe } from "./data-stripe"

/** A designed close: the stripe returns, then the name runs the full width. */
export function SiteFooter() {
  const { t, locale } = useLocale()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[var(--field)] text-[var(--field-ink)]">
      <div className="bg-[var(--bg)] px-[var(--gutter)]">
        <DataStripe label={t.hero.stripe} height={24} />
      </div>
      <div className="flex flex-col gap-10 px-[var(--gutter)] pt-10 sm:flex-row sm:justify-between">
        <nav data-reveal className="flex flex-col gap-1.5">
          <Link href="/" className="mv-link w-fit">{t.nav.home}</Link>
          <Link href="/projects" className="mv-link w-fit">{t.nav.projects}</Link>
          <Link href="/about" className="mv-link w-fit">{t.nav.about}</Link>
          <a href={contact.cv[locale]} download={contact.cvName[locale]} className="mv-link w-fit">{t.nav.cv}</a>
        </nav>
        <div data-reveal style={{ "--i": 1 } as React.CSSProperties} className="flex flex-col gap-1.5 sm:items-end">
          <a href={`mailto:${contact.email}`} className="mv-link w-fit">{contact.email}</a>
          <a href={contact.whatsappWith(t.hero.mailSubject)} target="_blank" rel="noopener noreferrer" className="mv-link w-fit">WhatsApp</a>
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="mv-link w-fit">LinkedIn</a>
          <a href={contact.github} target="_blank" rel="noopener noreferrer" className="mv-link w-fit">GitHub</a>
        </div>
      </div>
      <p
        aria-hidden
        data-reveal
        style={{ "--i": 2 } as React.CSSProperties}
        className="mt-16 whitespace-nowrap px-[calc(var(--gutter)-0.04em)] text-[19.2vw] font-semibold leading-[0.8] tracking-[-0.045em]"
      >
        Manuel Vera
      </p>
      <p className="flex flex-col gap-1 px-[var(--gutter)] pb-8 pt-6 text-[length:var(--step-small)] text-[var(--field-ink)]/80 sm:flex-row sm:justify-between">
        <span>© {year} Manuel Vera. {t.footer.rights}</span>
        <span>{t.footer.data}</span>
      </p>
    </footer>
  )
}
