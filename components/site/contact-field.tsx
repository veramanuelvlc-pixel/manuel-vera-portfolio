"use client"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { contact } from "@/lib/i18n"

/** One field that opens the visitor's email with their line already written. */
export function ContactField() {
  const { t } = useLocale()
  const c = t.contactBlock
  const [value, setValue] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = value.trim() || c.placeholder
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(t.hero.mailSubject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <form action={`mailto:${contact.email}`} method="get" onSubmit={onSubmit} className="w-full max-w-[520px]">
      <input type="hidden" name="subject" value={t.hero.mailSubject} />
      <label htmlFor="contact-line" className="sr-only">
        {c.promptA} {c.promptB}
      </label>
      <div className="relative">
        <input
          id="contact-line"
          name="body"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={c.placeholder}
          className="h-16 w-full bg-[var(--paper)] pl-5 pr-16 text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--ink)]"
        />
        <button
          type="submit"
          aria-label={c.submit}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-[var(--ink)] text-[var(--field-ink)] transition-transform duration-150 active:scale-95"
        >
          <ArrowRight size={20} />
        </button>
      </div>
      <p className="mt-4 text-[length:var(--step-small)] text-[var(--muted)]">{c.next}</p>
    </form>
  )
}
