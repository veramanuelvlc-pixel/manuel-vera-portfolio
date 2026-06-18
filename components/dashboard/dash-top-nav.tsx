"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LocaleToggle } from "@/components/sections/locale-toggle"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"

/**
 * Slim, sticky top bar shared by all four dashboards — the single navigation
 * surface after the sidebars were removed. Back link on the left; locale and
 * theme toggles on the right, with an optional `children` slot for
 * dashboard-specific controls (e.g. the ecommerce view switch).
 */
export function DashTopNav({
  backLabel,
  children,
}: {
  backLabel: string
  children?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Link
        href="/projects"
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} /> {backLabel}
      </Link>
      <div className="flex items-center gap-2">
        {children}
        <LocaleToggle themed />
        <ThemeToggle />
      </div>
    </header>
  )
}
