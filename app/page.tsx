"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { contact } from "@/lib/i18n"
import { projects, type ProjectSlug } from "@/lib/projects"
import { DataStripe } from "@/components/site/data-stripe"
import { Stage } from "@/components/site/stage"
import { Pipeline } from "@/components/site/pipeline"
import { ContactField } from "@/components/site/contact-field"
import { SiteFooter } from "@/components/site/site-footer"
import { Reveal } from "@/components/site/reveal"
import { SkipLink } from "@/components/site/skip-link"
import metaAdsShot from "@/public/images/work/meta-ads.png"

export default function Home() {
  const { t, locale, toggle } = useLocale()
  const [hovered, setHovered] = useState<ProjectSlug | null>(null)
  const mail = `mailto:${contact.email}?subject=${encodeURIComponent(t.hero.mailSubject)}`

  return (
    <div className="mv min-h-svh">
      <SkipLink />
      <Reveal />

      <main id="main">
      {/* ── Split stage: the reading column scrolls, the work never leaves ── */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-3 lg:p-3">
        <div className="px-3 pt-3 lg:order-2 lg:p-0">
          <Stage
            auto
            active={hovered}
            className="h-[60svh] min-h-[480px] lg:sticky lg:top-3 lg:h-[calc(100svh-24px)]"
          />
        </div>

        <div className="lg:order-1">
          {/* Hero card */}
          <header className="relative mx-3 -mt-6 flex flex-col bg-[var(--paper)] lg:m-0 lg:min-h-[calc(100svh-24px)]">
            <div className="px-[var(--gutter)] pt-[var(--gutter)]">
              <DataStripe label={t.hero.stripe} height={56} />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-[var(--gutter)] py-14 text-center lg:py-10">
              <h1
                translate="no"
                data-reveal
                className="text-[clamp(3.25rem,1rem+7.4vw,7.5rem)] leading-[0.92]"
              >
                Manuel Vera
              </h1>
              <p
                data-reveal
                style={{ "--i": 1 } as React.CSSProperties}
                className="mt-5 max-w-[16ch] text-[length:var(--step-head)] font-semibold leading-[1.02] tracking-[-0.025em] [text-wrap:balance]"
              >
                {t.hero.headline}
              </p>
              <p data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-6 max-w-[38ch]">
                {t.hero.sentence}
              </p>
              <div data-reveal style={{ "--i": 3 } as React.CSSProperties} className="mt-9 flex flex-wrap justify-center gap-3">
                <a href={mail} className="mv-btn">
                  {t.hero.action}
                </a>
                <a
                  href={contact.whatsappWith(t.hero.mailSubject)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mv-btn mv-btn-alt"
                >
                  {t.hero.whatsappAction}
                </a>
              </div>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2 px-[var(--gutter)] pb-7 text-[length:var(--step-small)] sm:text-base">
              <a href="#proyectos" className="mv-link">{t.nav.projects}</a>
              <Link href="/about" className="mv-link">{t.nav.about}</Link>
              <a href={contact.cv[locale]} download={contact.cvName[locale]} className="mv-link">{t.nav.cv}</a>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="mv-link">LinkedIn</a>
              <button type="button" onClick={toggle} className="mv-link" lang={locale === "es" ? "en" : "es"}>
                {locale === "es" ? "English" : "Español"}
              </button>
            </nav>
          </header>

          {/* Work ledger */}
          <section
            id="proyectos"
            aria-labelledby="work-h"
            className="scroll-mt-6 px-[var(--gutter)] pb-24 pt-24 lg:min-h-[calc(100svh-24px)] lg:pb-16 lg:pt-28"
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mx-auto max-w-[560px]">
              <h2 id="work-h" data-reveal className="text-[length:var(--step-head)]">
                {t.work.heading}
              </h2>
              <p data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-4 hidden text-[var(--muted)] lg:block">
                {t.work.hint}
              </p>
              <ul className="mt-10">
                {projects.map((p, i) => {
                  const dim = hovered !== null && hovered !== p.slug
                  return (
                    <li key={p.slug} data-reveal style={{ "--i": i + 2 } as React.CSSProperties}>
                      <Link
                        href={`/projects/${p.slug}`}
                        onMouseEnter={() => setHovered(p.slug)}
                        onFocus={() => setHovered(p.slug)}
                        onBlur={() => setHovered(null)}
                        className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-3.5 transition-colors duration-150 sm:grid-cols-[1.25fr_1fr_auto] ${dim ? "text-[var(--muted)]" : "text-[var(--ink)]"}`}
                      >
                        <span className="font-medium">{p.title}</span>
                        <span className="col-start-1 row-start-2 text-[length:var(--step-small)] text-[var(--muted)] sm:col-start-2 sm:row-start-1 sm:text-base">
                          {p.kind[locale]}
                        </span>
                        <span className="col-start-2 row-start-1 text-right text-[length:var(--step-small)] sm:col-start-3 sm:text-base">
                          {p.scale[locale]}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <Link
                href="/projects"
                data-reveal
                style={{ "--i": 8 } as React.CSSProperties}
                className="mv-link mt-10 inline-block"
              >
                {t.work.all}
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* ── Proof: one real dashboard and two figures ── */}
      <section aria-labelledby="stats-h" className="pt-32 lg:pt-44">
        <h2 id="stats-h" data-reveal className="px-[var(--gutter)] pb-10 text-[length:var(--step-head)]">
          {t.stats.heading}
        </h2>
        <div className="grid lg:grid-cols-3">
          <figure data-reveal className="bg-[#0a0a0a] lg:col-span-2">
            <Image
              src={metaAdsShot}
              alt={t.stats.photoAlt}
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="h-full w-full object-cover object-left-top"
            />
            <figcaption className="sr-only">{t.stats.photoCaption}</figcaption>
          </figure>
          <div className="grid grid-cols-2 lg:grid-cols-1">
            {[t.stats.a, t.stats.b].map((s, i) => (
              <div
                key={s.figure}
                data-reveal
                style={{ "--i": i + 1 } as React.CSSProperties}
                className={`aspect-square p-7 lg:aspect-auto ${i === 0 ? "bg-[var(--field)] text-[var(--field-ink)]" : "bg-[var(--surface)]"}`}
              >
                <p className="text-[clamp(3.25rem,1rem+7.4vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
                  {s.figure}
                </p>
                <p className="mt-3 max-w-[22ch]">{s.caption}</p>
              </div>
            ))}
          </div>
        </div>
        <p data-reveal className="px-[var(--gutter)] pt-4 text-[length:var(--step-small)] text-[var(--muted)]">{t.stats.photoCaption}</p>
      </section>

      {/* ── How it works: drag through the stages ── */}
      <div className="pt-32 lg:pt-44">
        <Pipeline />
      </div>

      {/* ── Letter ── */}
      <section aria-labelledby="letter-h" className="px-6 py-40 lg:py-52">
        <h2 id="letter-h" className="sr-only">{t.letter.heading}</h2>
        <div className="mx-auto max-w-[540px]">
          {t.letter.paragraphs.map((para, i) => {
            const hl = t.letter.highlight
            const at = para.indexOf(hl)
            return (
              <p key={i} data-reveal style={{ "--i": i } as React.CSSProperties} className="mb-[1.5em]">
                {at === -1 ? (
                  para
                ) : (
                  <>
                    {para.slice(0, at)}
                    <mark className="bg-[#d6dbb4] px-0.5 text-[var(--ink)]">{hl}</mark>
                    {para.slice(at + hl.length)}
                  </>
                )}
              </p>
            )
          })}
          <p data-reveal className="mt-10 text-[length:var(--step-lead)] italic">Manuel Vera</p>
          <p data-reveal className="text-[length:var(--step-small)] text-[var(--muted)]">{t.letter.role}</p>
          <Link data-reveal href="/about" className="mv-link mt-8 inline-block">
            {t.letter.more}
          </Link>
        </div>
      </section>

      {/* ── Contact: one field ── */}
      <section id="contacto" aria-labelledby="contact-h" className="bg-[var(--surface)] px-6 pb-40 pt-44">
        <div className="mx-auto max-w-[540px]">
          <h2 id="contact-h" data-reveal className="text-[length:var(--step-lead)] font-medium leading-[1.2] tracking-normal">
            <span className="block text-[var(--muted)]">{t.contactBlock.promptA}</span>
            <span className="block">{t.contactBlock.promptB}</span>
          </h2>
          <div data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-7">
            <ContactField />
          </div>
          <dl data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-[72px] grid grid-cols-1 text-base sm:grid-cols-[9rem_1fr] sm:gap-x-6 sm:gap-y-3 [&>dt:not(:first-child)]:mt-5 sm:[&>dt:not(:first-child)]:mt-0">
            <dt className="text-[var(--muted)]">{t.contactBlock.email}</dt>
            <dd><a href={`mailto:${contact.email}`} className="mv-link">{contact.email}</a></dd>
            <dt className="text-[var(--muted)]">{t.contactBlock.whatsapp}</dt>
            <dd><a href={contact.whatsappWith(t.hero.mailSubject)} target="_blank" rel="noopener noreferrer" className="mv-link">{contact.whatsappLabel}</a></dd>
            <dt className="text-[var(--muted)]">{t.contactBlock.location}</dt>
            <dd>{t.contactBlock.locationValue}</dd>
            <dt className="text-[var(--muted)]">{t.contactBlock.languages}</dt>
            <dd>{t.contactBlock.languagesValue}</dd>
          </dl>
        </div>
      </section>

      </main>

      <SiteFooter />
    </div>
  )
}
