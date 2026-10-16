"use client"
import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowUpRight, Pause, Play } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { projects, type ProjectSlug } from "@/lib/projects"
import { ProjectFragment } from "./project-fragment"

const HOLD_MS = 6000
const REDUCE = "(prefers-reduced-motion: reduce)"

function subscribeReduce(cb: () => void) {
  const mq = window.matchMedia(REDUCE)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

/**
 * The fixed half. Every project's fragment is mounted in the same place and
 * crossfades in when it becomes active. With `auto`, it cycles on its own
 * until something takes control (a hovered row, a scrolled-to section);
 * paused when the tab is hidden and disabled under reduced motion.
 */
export function Stage({
  active,
  auto = false,
  className = "",
}: {
  active: ProjectSlug | null
  auto?: boolean
  className?: string
}) {
  const { locale, t } = useLocale()
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => true, // server: render the still version
  )
  const canAuto = auto && !reduce

  useEffect(() => {
    if (!canAuto || active || paused) return
    const id = window.setInterval(() => {
      if (!document.hidden) setTick((n) => n + 1)
    }, HOLD_MS)
    return () => window.clearInterval(id)
  }, [canAuto, active, paused])

  const shown = active ?? projects[tick % projects.length].slug
  const project = projects.find((p) => p.slug === shown)!

  return (
    <div className={`relative overflow-hidden bg-[#121410] ${className}`}>
      {projects.map((p) => (
        <div
          key={p.slug}
          aria-hidden={p.slug !== shown}
          className="stage-layer absolute inset-0 flex items-center justify-center px-[clamp(20px,4vw,64px)] pb-20 pt-10"
          style={
            p.slug === shown
              ? { opacity: 1, transform: "scale(1)", transitionDelay: "280ms, 0ms" }
              : { opacity: 0, transform: "scale(1.02)", transitionDuration: "320ms, 6000ms" }
          }
        >
          <ProjectFragment slug={p.slug} title={p.title} locale={locale} />
        </div>
      ))}

      {canAuto && (
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-label={paused ? t.nav.play : t.nav.pause}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center text-[var(--field-ink)]/70 transition-colors duration-150 hover:text-[var(--field-ink)]"
        >
          {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
        </button>
      )}

      <Link
        href={`/projects/${project.slug}`}
        className="group absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-[clamp(20px,4vw,64px)] py-6 text-[var(--field-ink)]"
      >
        <span>
          <span className="block font-medium">{project.title}</span>
          <span className="block text-[length:var(--step-small)] text-[var(--field-ink)]/75">{project.kind[locale]}</span>
        </span>
        <span className="flex items-center gap-1.5 text-[length:var(--step-small)]">
          {t.projectsPage.open}
          <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}
