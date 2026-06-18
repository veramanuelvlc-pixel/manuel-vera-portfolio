"use client"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === "dark"
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
