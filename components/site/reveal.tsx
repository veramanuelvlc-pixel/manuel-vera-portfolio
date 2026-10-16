"use client"
import { useEffect } from "react"

/**
 * Adds `is-in` to every `[data-reveal]` and `.stripe` element once it enters
 * the viewport. Stagger comes from a `--i` custom property set in markup.
 * Content is only hidden under `html.js`, so nothing stays invisible without it.
 */
export function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".mv [data-reveal], .mv .stripe")
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
