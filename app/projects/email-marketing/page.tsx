"use client"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale-context"
import { ThemeProvider } from "@/lib/theme-context"
import { DashTopNav } from "@/components/dashboard/dash-top-nav"
import { AppShell } from "@/components/efferd/d3/app-shell"
import { Dashboard } from "@/components/efferd/d3/dashboard"

export default function EmailDashboard() {
  return (
    <ThemeProvider>
      <EmailInner />
    </ThemeProvider>
  )
}

function EmailInner() {
  const { locale } = useLocale()
  const back = locale === "es" ? "Proyectos" : "Projects"

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <DashTopNav backLabel={back} />
        <AppShell>
          <Dashboard />
        </AppShell>
      </div>
    </TooltipProvider>
  )
}
