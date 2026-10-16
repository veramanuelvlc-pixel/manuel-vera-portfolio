"use client"
import Image from "next/image"
import { Download } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { contact } from "@/lib/i18n"
import { SiteNav } from "@/components/site/site-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { Reveal } from "@/components/site/reveal"
import { SkipLink } from "@/components/site/skip-link"
import realEstateShot from "@/public/images/work/real-estate.png"
import metaAdsShot from "@/public/images/work/meta-ads.png"
import Link from "next/link"
import playfairEngland from "@/public/images/archive/playfair-england-1786.jpg"
import playfairScotland from "@/public/images/archive/playfair-scotland-1786.jpg"

const PLAYFAIR_ENGLAND =
  "https://commons.wikimedia.org/wiki/File:1786_Playfair_-_1_Chart_of_all_the_import_and_exports_to_and_from_England_from_the_year_1700_to_1782.jpg"
const PLAYFAIR_SCOTLAND =
  "https://commons.wikimedia.org/wiki/File:1786_Playfair_-_Exports_and_Imports_of_Scotland_to_and_from_different_parts_for_one_Year_from_Christmas_1780_to_Christmas_1781.jpg"

function Archive({ src, href, caption, alt }: { src: typeof playfairEngland; href: string; caption: string; alt: string }) {
  return (
    <figure data-reveal>
      <Image src={src} alt={alt} sizes="(min-width: 1024px) 33vw, 100vw" className="h-auto w-full" />
      <figcaption className="mt-3 max-w-[48ch] text-[length:var(--step-small)] text-[var(--muted)]">
        <a href={href} target="_blank" rel="noopener noreferrer" className="mv-link">
          {caption}
        </a>
      </figcaption>
    </figure>
  )
}

export default function About() {
  const { t, locale } = useLocale()
  const a = t.aboutPage

  return (
    <div className="mv min-h-svh">
      <SkipLink />
      <Reveal />
      <SiteNav current="about" />

      <main id="main">
        {/* Intro */}
        <section className="grid gap-12 px-[var(--gutter)] pb-32 pt-16 lg:grid-cols-[1fr_1fr] lg:pb-44 lg:pt-24">
          <div>
            <h1 data-reveal className="text-[clamp(3.25rem,1rem+7.4vw,7.5rem)] leading-[0.92]">
              {a.title}
            </h1>
            <p data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-8 max-w-[34ch] text-[length:var(--step-lead)] leading-[1.4]">
              {a.intro}
            </p>
            <a
              data-reveal
              style={{ "--i": 2 } as React.CSSProperties}
              href={contact.cv[locale]}
              download={contact.cvName[locale]}
              className="mv-btn mt-10"
            >
              <Download size={18} />
              {a.download}
            </a>
          </div>
          <figure data-reveal style={{ "--i": 2 } as React.CSSProperties} className="self-end bg-[#0a0a0a]">
            <Image
              src={realEstateShot}
              alt={locale === "es" ? "Dashboard de Real Estate con revenue por barrio de Madrid" : "Real Estate dashboard with revenue by Madrid area"}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full"
              priority
            />
          </figure>
        </section>

        {/* Career */}
        <section aria-labelledby="career-h" className="bg-[var(--paper)] px-[var(--gutter)] py-28 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-12">
            <h2 id="career-h" data-reveal className="text-[length:var(--step-head)]">
              {a.experience}
            </h2>
            <Archive
              src={playfairEngland}
              href={PLAYFAIR_ENGLAND}
              caption={a.archiveEngland}
              alt={locale === "es" ? "Gráfico de 1786 con dos líneas de importaciones y exportaciones de Inglaterra y el área entre ellas" : "1786 chart with two lines for England's imports and exports and the area between them"}
            />
          </div>
          <div className="mt-16 flex flex-col gap-20">
            {a.jobs.map((job) => (
              <article key={job.role + job.company} data-reveal className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:gap-12">
                <div>
                  <p className="font-medium">{job.company}</p>
                  <p className="text-[var(--muted)]">{job.period}</p>
                </div>
                <div className="max-w-[62ch]">
                  <h3 className="text-[length:var(--step-lead)] leading-[1.15]">{job.role}</h3>
                  <ul className="mt-5 flex list-disc flex-col gap-3 pl-5 marker:text-[var(--muted)]">
                    {job.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <figure data-reveal className="mt-24 grid gap-4 lg:grid-cols-[1fr_2fr] lg:gap-12">
            <figcaption className="order-2 text-[var(--muted)] lg:order-1">
              {a.shotCaption}{" "}
              <Link href="/projects/meta-ads" className="mv-link text-[var(--ink)]">
                {t.projectsPage.open}
              </Link>
            </figcaption>
            <div className="order-1 bg-[#0a0a0a] lg:order-2">
              <Image src={metaAdsShot} alt={t.stats.photoAlt} sizes="(min-width: 1024px) 66vw, 100vw" className="h-auto w-full" />
            </div>
          </figure>
        </section>

        {/* Tools + education */}
        <section aria-labelledby="tools-h" className="grid gap-16 px-[var(--gutter)] py-28 lg:grid-cols-[1fr_2fr] lg:gap-12 lg:py-40">
          <div className="flex flex-col gap-12">
            <h2 id="tools-h" data-reveal className="text-[length:var(--step-head)]">
              {a.skills}
            </h2>
            <Archive
              src={playfairScotland}
              href={PLAYFAIR_SCOTLAND}
              caption={a.archiveScotland}
              alt={locale === "es" ? "Gráfico de barras horizontal de 1786 con el comercio de Escocia por país" : "1786 horizontal bar chart of Scotland's trade by country"}
            />
          </div>
          <dl className="grid max-w-[62ch] gap-x-8 gap-y-6 sm:grid-cols-[12rem_1fr]">
            {a.skillGroups.map((g, i) => (
              <div key={g.category} data-reveal style={{ "--i": i } as React.CSSProperties} className="contents">
                <dt className="font-medium">{g.category}</dt>
                <dd className="-mt-5 sm:mt-0">{g.items}</dd>
              </div>
            ))}
            <dt className="font-medium">{a.education}</dt>
            <dd className="-mt-5 sm:mt-0">{a.educationValue}</dd>
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
