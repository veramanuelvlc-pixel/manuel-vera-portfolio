import type { Metadata } from "next"
import Script from "next/script"
import { inter, jetbrainsMono, zilla } from "@/lib/fonts"
import { LocaleProvider } from "@/lib/locale-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Manuel Vera — Marketing Data Analyst",
  description:
    "Analista de datos de marketing. Conecto Meta Ads, Klaviyo y Shopify a dashboards y reportes semanales automáticos con Python, Next.js y Claude.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Marks JS as available so entrance animations may start hidden. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js')"}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${zilla.variable} font-sans bg-[#0A0A0A] text-white antialiased`}
      >
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}
