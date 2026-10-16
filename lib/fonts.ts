import { Inter, JetBrains_Mono, Zilla_Slab } from "next/font/google"

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// The marketing pages (home, about, projects index) are set entirely in Zilla
// Slab; the dashboards keep Inter. Scoped via the `.mv` root class.
export const zilla = Zilla_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-zilla",
})
