import type { Metadata } from "next"
import { inter, jetbrainsMono } from "@/lib/fonts"
import { LocaleProvider } from "@/lib/locale-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Manuel Vera — Marketing Data Analyst",
  description: "Portfolio de dashboards y proyectos de marketing analytics con Python, Meta Ads API y AI.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0A0A0A] text-white antialiased`}>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
