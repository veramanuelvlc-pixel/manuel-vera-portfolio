"use client"
import { createContext, useContext, useState } from "react"
import { type Locale, content } from "./i18n"

type LocaleContextType = {
  locale: Locale
  t: typeof content["es"]
  toggle: () => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es")
  const toggle = () => setLocale((l) => (l === "es" ? "en" : "es"))
  return (
    <LocaleContext.Provider value={{ locale, t: content[locale], toggle }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider")
  return ctx
}
