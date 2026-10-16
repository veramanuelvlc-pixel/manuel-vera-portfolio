import type { Locale } from "./i18n"

export type ProjectSlug = "meta-ads" | "ecommerce" | "email-marketing" | "real-estate"

type Text = Record<Locale, string>

export type Project = {
  slug: ProjectSlug
  title: string
  kind: Text
  scale: Text
  question: Text
  description: Text
  stack: string
}

export const projects: Project[] = [
  {
    slug: "meta-ads",
    title: "Meta Ads Performance",
    kind: { es: "Dashboard de campañas", en: "Campaign dashboard" },
    scale: { es: "6.067 leads", en: "6,067 leads" },
    question: {
      es: "¿Qué campaña y qué audiencia traen el lead más barato esta semana?",
      en: "Which campaign and audience bring the cheapest lead this week?",
    },
    description: {
      es: "Noventa días de inversión, leads, compras e ingresos por campaña y por adset, con CPL, CTR y ROAS diarios.",
      en: "Ninety days of spend, leads, purchases and revenue by campaign and ad set, with daily CPL, CTR and ROAS.",
    },
    stack: "Python, Meta Ads API, Recharts, Next.js",
  },
  {
    slug: "ecommerce",
    title: "E-commerce Analytics",
    kind: { es: "Revenue, LTV y funnel", en: "Revenue, LTV and funnel" },
    scale: { es: "100.000 pedidos", en: "100,000 orders" },
    question: {
      es: "¿Qué categorías sostienen el revenue y en qué paso del funnel se pierde la venta?",
      en: "Which categories carry revenue, and at which funnel step is the sale lost?",
    },
    description: {
      es: "Un año de pedidos: revenue mensual, ticket medio, LTV por cohorte, churn y el funnel desde la sesión hasta la compra.",
      en: "A year of orders: monthly revenue, average order value, LTV by cohort, churn and the funnel from session to purchase.",
    },
    stack: "Python, pandas, Recharts, Next.js",
  },
  {
    slug: "email-marketing",
    title: "Email Marketing",
    kind: { es: "Klaviyo y tests A/B", en: "Klaviyo and A/B tests" },
    scale: { es: "966.818 envíos", en: "966,818 sends" },
    question: {
      es: "¿Qué flujos y qué asuntos generan revenue, no solo aperturas?",
      en: "Which flows and subject lines drive revenue, not just opens?",
    },
    description: {
      es: "Apertura, clics y revenue atribuido por semana y por campaña, con cinco tests A/B de asunto y su ganador.",
      en: "Opens, clicks and attributed revenue by week and by campaign, with five subject-line A/B tests and their winner.",
    },
    stack: "Klaviyo API, Python, Recharts",
  },
  {
    slug: "real-estate",
    title: "Real Estate Market",
    kind: { es: "Airbnb por barrio, Madrid", en: "Airbnb by area, Madrid" },
    scale: { es: "2.200 anuncios", en: "2,200 listings" },
    question: {
      es: "¿En qué barrio rinde más un anuncio, y a qué precio se llena?",
      en: "Which area earns the most per listing, and at what price does it fill?",
    },
    description: {
      es: "Precio medio, ocupación y revenue estimado de 2.200 anuncios en ocho barrios, con la relación precio contra ocupación.",
      en: "Average price, occupancy and estimated revenue for 2,200 listings across eight areas, with price plotted against occupancy.",
    },
    stack: "Python, Recharts, Next.js",
  },
]
