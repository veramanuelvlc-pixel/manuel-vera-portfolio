import Anthropic from "@anthropic-ai/sdk"

// Claude API streams can run long; 60s is the max on Vercel's Hobby plan (higher values fail the deploy).
export const maxDuration = 60

const MODEL = "claude-opus-4-8"
const MAX_ROWS = 500

type AnalyzeBody = {
  csv?: string
  filename?: string
  locale?: "es" | "en"
}

function buildPrompt(csv: string, filename: string, locale: "es" | "en") {
  // Cap rows sent to the model — keep the header, sample the rest, and tell the model
  // (and downstream the user) when we truncated, rather than silently dropping data.
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const header = lines[0] ?? ""
  const dataRows = lines.slice(1)
  const truncated = dataRows.length > MAX_ROWS
  const sample = [header, ...dataRows.slice(0, MAX_ROWS)].join("\n")

  const langNote =
    locale === "es"
      ? "Escribe el informe completo en español."
      : "Write the entire report in English."

  const truncNote = truncated
    ? locale === "es"
      ? `\n\nNOTA: el CSV tiene ${dataRows.length} filas de datos; solo se incluyen las primeras ${MAX_ROWS} como muestra. Menciónalo al inicio del informe.`
      : `\n\nNOTE: the CSV has ${dataRows.length} data rows; only the first ${MAX_ROWS} are included as a sample. Mention this at the top of the report.`
    : ""

  return { sample, truncated, totalRows: dataRows.length, langNote, truncNote, filename }
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY no está configurada en el servidor. Añádela a .env.local." },
      { status: 500 },
    )
  }

  let body: AnalyzeBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Cuerpo de la petición inválido." }, { status: 400 })
  }

  const csv = (body.csv ?? "").trim()
  const locale: "es" | "en" = body.locale === "en" ? "en" : "es"
  const filename = body.filename || "dataset.csv"

  if (!csv) {
    return Response.json({ error: "No se recibió ningún CSV." }, { status: 400 })
  }

  const { sample, langNote, truncNote } = buildPrompt(csv, filename, locale)

  const system = [
    "Eres un analista de datos de marketing senior. Recibes un CSV de campañas o métricas de marketing",
    "y produces un informe claro y accionable en Markdown. Estructura el informe con estas secciones:",
    "1. Resumen ejecutivo (2-3 frases con los hallazgos clave).",
    "2. KPIs principales (calcula totales/medias relevantes a partir de las columnas).",
    "3. Hallazgos y patrones (tendencias, outliers, mejores y peores performers).",
    "4. Recomendaciones (3-5 acciones concretas y priorizadas).",
    "Usa tablas Markdown para los números, sé específico citando cifras del dataset, y no inventes columnas que no existen.",
    langNote,
  ].join(" ")

  const userContent = `Archivo: ${filename}\n\nDatos (CSV):\n\`\`\`csv\n${sample}\n\`\`\`${truncNote}`

  const client = new Anthropic()

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 64000,
          thinking: { type: "adaptive" },
          output_config: { effort: "medium" },
          system,
          messages: [{ role: "user", content: userContent }],
        })

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        const final = await messageStream.finalMessage()
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              locale === "es"
                ? "\n\n_El modelo declinó analizar este contenido._"
                : "\n\n_The model declined to analyze this content._",
            ),
          )
        }
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "error desconocido"
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
