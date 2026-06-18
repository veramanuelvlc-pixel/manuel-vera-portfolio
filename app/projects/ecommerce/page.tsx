"use client"
import { useState } from "react"
import { LayoutGrid, LayoutDashboard } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLocale } from "@/lib/locale-context"
import { ThemeProvider } from "@/lib/theme-context"
import { DashTopNav } from "@/components/dashboard/dash-top-nav"
import { AppShell as Shell2 } from "@/components/efferd/d2/app-shell"
import { Dashboard as Dash2 } from "@/components/efferd/d2/dashboard"
import { AppShell as Shell4 } from "@/components/efferd/d4/app-shell"
import { Dashboard as Dash4 } from "@/components/efferd/d4/dashboard"

type View = "v1" | "v2"

export default function EcommerceDashboard() {
  return (
    <ThemeProvider>
      <EcommerceInner />
    </ThemeProvider>
  )
}

function EcommerceInner() {
  const { locale } = useLocale()
  const [view, setView] = useState<View>("v1")
  const back = locale === "es" ? "Proyectos" : "Projects"

  const views: { key: View; Icon: typeof LayoutGrid; label: string }[] = [
    { key: "v1", Icon: LayoutGrid, label: "1" },
    { key: "v2", Icon: LayoutDashboard, label: "2" },
  ]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <DashTopNav backLabel={back}>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5">
            {views.map(({ key, Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                title={`Vista ${label}`}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={
                  view === key
                    ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </DashTopNav>

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
