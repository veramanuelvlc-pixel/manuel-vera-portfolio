"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale-context"
import { AppShell } from "@/components/efferd/d3/app-shell"
import { Dashboard } from "@/components/efferd/d3/dashboard"

export default function EmailDashboard() {
  const { locale } = useLocale()
  const back = locale === "es" ? "Proyectos" : "Projects"

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Link
          href="/projects"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> {back}
        </Link>
        <AppShell>
          <Dashboard />
        </AppShell>
      </div>
    </TooltipProvider>
  )
}
