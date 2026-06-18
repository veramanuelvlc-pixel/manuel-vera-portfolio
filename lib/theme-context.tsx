"use client"
import { createContext, useContext, useState } from "react"

export type Theme = "light" | "dark"

type ThemeContextType = {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

/**
 * Scoped theme provider for the dashboard pages. Mirrors the locale-context
 * pattern: plain React state, no persistence. Renders a wrapper that carries
 * the `.dark` class so the shadcn/efferd token system (globals.css) flips,
 * while bespoke dashboards read `theme` to set their own CSS-var palette.
 */
export function ThemeProvider({
  defaultTheme = "dark",
  children,
}: {
  defaultTheme?: Theme
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
