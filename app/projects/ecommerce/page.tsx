"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, LayoutGrid, LayoutDashboard } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale-context"
import { AppShell as Shell2 } from "@/components/efferd/d2/app-shell"
import { Dashboard as Dash2 } from "@/components/efferd/d2/dashboard"
import { AppShell as Shell4 } from "@/components/efferd/d4/app-shell"
import { Dashboard as Dash4 } from "@/components/efferd/d4/dashboard"

type View = "v1" | "v2"

export default function EcommerceDashboard() {
  const { locale } = useLocale()
  const [view, setView] = useState<View>("v1")
  const back = locale === "es" ? "Proyectos" : "Projects"

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Floating control: back + view switch (overlays the efferd dashboard) */}
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> {back}
          </Link>
          <span className="h-4 w-px bg-border" />
          <button
            onClick={() => setView("v1")}
            title="Vista 1"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={view === "v1" ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
          >
            <LayoutGrid size={14} /> 1
          </button>
          <button
            onClick={() => setView("v2")}
            title="Vista 2"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={view === "v2" ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}
          >
            <LayoutDashboard size={14} /> 2
          </button>
        </div>

        {view === "v1" ? (
          <Shell2>
            <Dash2 />
          </Shell2>
        ) : (
          <Shell4>
            <Dash4 />
          </Shell4>
        )}
      </div>
    </TooltipProvider>
  )
}
