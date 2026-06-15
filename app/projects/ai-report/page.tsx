"use client"
import { useRef, useState } from "react"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { LocaleToggle } from "@/components/sections/locale-toggle"

const ACCENT = "#00C4B0"

const EXAMPLE_CSV = `campaign,channel,spend,impressions,clicks,leads,revenue
Lead Gen - Search,Google,4200.50,182000,5400,210,0
Brand Awareness,Meta,3100.00,540000,8200,95,0
Retargeting,Meta,1850.75,96000,4100,180,9200.40
Newsletter Promo,Email,420.00,38000,2100,140,7600.00
Shopping,Google,5600.20,210000,6900,0,41200.80
Lookalike Prospecting,Meta,2950.00,330000,5100,120,5300.00
Competitor Keywords,Google,1320.00,44000,1600,58,0
Cart Abandoners,Email,180.00,12000,1450,210,12800.00`

const labels = {
  es: {
    eyebrow: "Caso de estudio",
    title: "AI Report Generator",
    subtitle: "Sube un CSV de campañas y Claude genera un análisis completo en lenguaje natural.",
    back: "Volver a proyectos",
    drop: "Arrastra un CSV aquí o haz clic para seleccionar",
    example: "Cargar ejemplo",
    selected: "Seleccionado",
    rows: "filas",
    generate: "Generar informe",
    generating: "Analizando…",
    clear: "Limpiar",
    reportTitle: "Informe",
    poweredBy: "Generado en streaming con Claude (claude-opus-4-8)",
    noFile: "Primero selecciona o carga un CSV.",
    requestError: "Error al generar el informe.",
  },
  en: {
    eyebrow: "Case study",
    title: "AI Report Generator",
    subtitle: "Upload a campaign CSV and Claude generates a full natural language analysis.",
    back: "Back to projects",
    drop: "Drag a CSV here or click to select",
    example: "Load example",
    selected: "Selected",
    rows: "rows",
    generate: "Generate report",
    generating: "Analyzing…",
    clear: "Clear",
    reportTitle: "Report",
    poweredBy: "Streamed with Claude (claude-opus-4-8)",
    noFile: "Select or load a CSV first.",
    requestError: "Failed to generate the report.",
  },
}

function countRows(csv: string) {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0)
  return Math.max(0, lines.length - 1)
}

export default function AiReportDashboard() {
  const { t, locale } = useLocale()
  const m = labels[locale]
  const fileInput = useRef<HTMLInputElement>(null)
  const [csv, setCsv] = useState("")
  const [filename, setFilename] = useState("")
  const [report, setReport] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  function loadFile(file: File) {
    file.text().then((text) => {
      setCsv(text)
      setFilename(file.name)
      setReport("")
      setError("")
    })
  }

  function loadExample() {
    setCsv(EXAMPLE_CSV)
    setFilename("ejemplo_campañas.csv")
    setReport("")
    setError("")
  }

  function clearAll() {
    setCsv("")
    setFilename("")
    setReport("")
    setError("")
    if (fileInput.current) fileInput.current.value = ""
  }

  async function generate() {
    if (!csv.trim()) {
      setError(m.noFile)
      return
    }
    setLoading(true)
    setError("")
    setReport("")
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, filename, locale }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || m.requestError)
        setLoading(false)
        return
      }
      const reader = res.body?.getReader()
      if (!reader) {
        setError(m.requestError)
        setLoading(false)
        return
      }
      const decoder = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        setReport((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch {
      setError(m.requestError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-6 max-w-4xl mx-auto">

      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-sm z-50">
        <Link href="/" className="font-mono text-sm text-[#00C4B0]">mv.dev</Link>
        <div className="flex gap-6 items-center text-sm text-white/50">
          <Link href="/about" className="hover:text-white transition-colors">{t.nav.about}</Link>
          <Link href="/projects" className="text-white">{t.nav.projects}</Link>
          <a href="mailto:veramanuelvlc@gmail.com" className="hover:text-white transition-colors">{t.nav.contact}</a>
          <LocaleToggle />
        </div>
      </nav>

      <section className="pt-36 pb-10 border-b border-white/5">
        <Link href="/projects" className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors">
          {String.fromCharCode(8592)} {m.back}
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest mt-6 mb-4" style={{ color: ACCENT }}>{m.eyebrow}</p>
        <h1 className="text-4xl font-semibold mb-4">{m.title}</h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">{m.subtitle}</p>
      </section>

      {/* Upload */}
      <section className="py-10 border-b border-white/5">
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) loadFile(f)
          }}
        />
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files?.[0]
            if (f) loadFile(f)
          }}
          className="cursor-pointer rounded-xl border border-dashed p-10 text-center transition-colors"
          style={{ borderColor: dragOver ? ACCENT : "rgba(255,255,255,0.12)", backgroundColor: dragOver ? ACCENT + "0A" : "transparent" }}
        >
          <p className="font-mono text-sm text-white/40">{m.drop}</p>
          {filename && (
            <p className="font-mono text-xs mt-3" style={{ color: ACCENT }}>
              {m.selected}: {filename} · {countRows(csv)} {m.rows}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={generate}
            disabled={loading}
            className="font-mono text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: ACCENT, color: "#0A0A0A" }}
          >
            {loading ? m.generating : m.generate}
          </button>
          <button
            onClick={loadExample}
            disabled={loading}
            className="font-mono text-sm px-5 py-2.5 rounded-lg border border-white/10 text-white/60 hover:border-white/20 transition-colors disabled:opacity-50"
          >
            {m.example}
          </button>
          {(csv || report) && (
            <button
              onClick={clearAll}
              disabled={loading}
              className="font-mono text-sm px-5 py-2.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
            >
              {m.clear}
            </button>
          )}
        </div>

        {error && <p className="font-mono text-sm text-red-400/80 mt-4">{error}</p>}
      </section>

      {/* Report */}
      {(report || loading) && (
        <section className="py-10 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{m.reportTitle}</p>
            {loading && (
              <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
            )}
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <pre className="font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
              {report}
              {loading && <span className="inline-block w-2 h-4 align-middle animate-pulse" style={{ backgroundColor: ACCENT }} />}
            </pre>
          </div>
          <p className="font-mono text-[11px] text-white/25 mt-4">{m.poweredBy}</p>
        </section>
      )}

    </main>
  )
}
