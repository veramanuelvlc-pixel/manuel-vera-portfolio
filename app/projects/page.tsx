"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { projects, type ProjectSlug } from "@/lib/projects"
import { SiteNav } from "@/components/site/site-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { Stage } from "@/components/site/stage"
import { Reveal } from "@/components/site/reveal"
import { SkipLink } from "@/components/site/skip-link"
import { ProjectFragment } from "@/components/site/project-fragment"

export default function Projects() {
  const { t, locale } = useLocale()
  const pp = t.projectsPage
  const [active, setActive] = useState<ProjectSlug>(projects[0].slug)

  // The fixed half follows whichever project block holds the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as ProjectSlug)
      },
      { rootMargin: "-45% 0px -45% 0px" },
    )
    document.querySelectorAll("[data-project]").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="mv min-h-svh">
      <SkipLink />
      <Reveal />
      <SiteNav current="projects" />

      <div className="lg:grid lg:grid-cols-2 lg:gap-3 lg:px-3">
        <div className="hidden lg:order-2 lg:block">
          <Stage active={active} className="sticky top-3 h-[calc(100svh-24px)]" />
        </div>

        <main id="main" className="px-[var(--gutter)] lg:order-1">
          <div className="max-w-[46ch] pb-20 pt-16 lg:pb-32 lg:pt-24">
            <h1 data-reveal className="text-[clamp(3.25rem,1rem+7.4vw,7.5rem)] leading-[0.92]">
              {pp.title}
            </h1>
            <p data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-8 text-[length:var(--step-lead)] leading-[1.4]">
              {pp.intro}
            </p>
          </div>

          {projects.map((p) => (
            <article
              key={p.slug}
              id={p.slug}
              data-project
              className="max-w-[46ch] pb-28 lg:flex lg:min-h-[80svh] lg:flex-col lg:justify-center lg:pb-0"
            >
              <h2 data-reveal className="text-[length:var(--step-head)]">
                {p.title}
              </h2>
              <p data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-3 text-[var(--muted)]">
                {p.kind[locale]}, {p.scale[locale]}
              </p>
              <p data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-8 text-[length:var(--step-lead)] font-medium leading-[1.3]">
                {p.question[locale]}
              </p>
              <p data-reveal style={{ "--i": 3 } as React.CSSProperties} className="mt-5">
                {p.description[locale]}
              </p>
              <p data-reveal style={{ "--i": 4 } as React.CSSProperties} className="mt-5 text-[var(--muted)]">
                {pp.stack}: {p.stack}
              </p>

              {/* Phone: the fragment sits in the flow instead of the fixed half */}
              <div className="mt-8 flex justify-center bg-[#121410] px-4 py-6 lg:hidden">
                <ProjectFragment slug={p.slug} title={p.title} locale={locale} />
              </div>

              <Link href={`/projects/${p.slug}`} className="mv-btn mt-8 w-fit">
                {pp.open}
                <ArrowUpRight size={18} />
              </Link>
            </article>
          ))}
          <div className="h-24 lg:h-40" />
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}
