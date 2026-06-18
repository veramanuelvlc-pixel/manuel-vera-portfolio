export type Locale = "es" | "en"

export const content = {
  es: {
    nav: {
      about: "sobre mí",
      projects: "proyectos",
      contact: "contacto",
    },
    hero: {
      role: "Marketing Data Analyst",
      description: "Construyo dashboards, automatizo reportes y conecto datos de marketing con AI.",
      stack_label: "Stack",
      cta_projects: "Ver proyectos",
      cta_about: "Sobre mí",
    },
    stats: [
      { value: "5", label: "dashboards en producción" },
      { value: "4", label: "APIs reales integradas" },
      { value: "4h → 45min", label: "tiempo de reporte semanal" },
      { value: "2", label: "idiomas (ES/EN)" },
    ],
    home: {
      nav_home: "Inicio",
      gallery_label: "Proyectos destacados",
      gallery_caption: "Dashboards en vivo con datos de Meta Ads, e-commerce, email y real estate.",
      cta_title: "Hablemos de tu próximo proyecto de datos.",
      cta_desc: "Agenda una llamada o escríbeme. Te muestro cómo automatizar tus reportes y construir dashboards que tu equipo de verdad use.",
      cta_contact: "Contacto",
      cta_projects: "Ver proyectos",
      rights: "Todos los derechos reservados.",
      built_with: "Construido con",
      contact_kicker: "Contacto",
      contact_heading: "¿Trabajamos juntos?",
      whatsapp: "Escríbeme por WhatsApp",
      email: "Envíame un correo",
    },
    about: {
      title: "Sobre mí",
      bio: "Analista de datos de marketing con experiencia construyendo sistemas de reportes automatizados, dashboards en tiempo real e integraciones con AI. Trabajo con agencias y startups conectando Meta Ads, Klaviyo y Shopify con stacks modernos de datos.",
      experience: "Experiencia",
      skills_title: "Skills",
      download_cv: "Descargar CV",
      jobs: [
        {
          role: "Marketing Data Analyst",
          company: "Engage Medida Solutions",
          period: "Nov 2024 – Presente",
          bullets: [
            "Automaticé reportes semanales de Meta Ads con Python (ReportLab + pandas), reduciendo tiempo de reporte en 80%",
            "Construí dashboards en Next.js integrando Meta Ads API, Klaviyo y Shopify para 8+ clientes",
            "Desarrollé sistema de clasificación de leads para The Founders Law procesando 1000+ contactos/semana",
            "Integré Claude API para generación automática de insights en lenguaje natural",
          ],
        },
        {
          role: "Customer Operations Analyst",
          company: "Compañía Boliviana de Tickets y Controles",
          period: "Abr 2022 – Nov 2024",
          bullets: [
            "Análisis de datos de ventas y clientes para equipos comerciales y administrativos",
            "Construcción de reportes en Power BI y Tableau para toma de decisiones",
            "Optimización de procesos operativos mediante análisis de datos",
          ],
        },
      ],
      skills: [
        {
          category: "Marketing & Ads",
          items: ["Meta Ads API", "Klaviyo API", "Shopify API", "Google Analytics", "GoHighLevel"],
        },
        {
          category: "Data & Code",
          items: ["Python", "pandas", "SQL", "Next.js", "TypeScript", "Supabase"],
        },
        {
          category: "AI & Automation",
          items: ["Claude API", "ReportLab", "OpenClaw", "Make.com", "Vercel"],
        },
      ],
    },
  },
  en: {
    nav: {
      about: "about",
      projects: "projects",
      contact: "contact",
    },
    hero: {
      role: "Marketing Data Analyst",
      description: "I build dashboards, automate reports and connect marketing data with AI.",
      stack_label: "Stack",
      cta_projects: "View projects",
      cta_about: "About me",
    },
    stats: [
      { value: "5", label: "dashboards in production" },
      { value: "4", label: "real APIs integrated" },
      { value: "4h → 45min", label: "weekly reporting time" },
      { value: "2", label: "languages (ES/EN)" },
    ],
    home: {
      nav_home: "Home",
      gallery_label: "Featured work",
      gallery_caption: "Live dashboards with Meta Ads, e-commerce, email and real estate data.",
      cta_title: "Let's talk about your next data project.",
      cta_desc: "Book a call or drop me a line. I'll show you how to automate your reporting and build dashboards your team actually uses.",
      cta_contact: "Get in touch",
      cta_projects: "View projects",
      rights: "All rights reserved.",
      built_with: "Built with",
      contact_kicker: "Contact",
      contact_heading: "Let's work together?",
      whatsapp: "Message me on WhatsApp",
      email: "Send me an email",
    },
    about: {
      title: "About me",
      bio: "Marketing data analyst with experience building automated reporting systems, real-time dashboards and AI integrations. I work with agencies and startups connecting Meta Ads, Klaviyo and Shopify with modern data stacks.",
      experience: "Experience",
      skills_title: "Skills",
      download_cv: "Download CV",
      jobs: [
        {
          role: "Marketing Data Analyst",
          company: "Engage Medida Solutions",
          period: "Nov 2024 – Present",
          bullets: [
            "Automated weekly Meta Ads reports with Python (ReportLab + pandas), reducing reporting time by 80%",
            "Built Next.js dashboards integrating Meta Ads API, Klaviyo and Shopify for 8+ clients",
            "Developed lead classification system for The Founders Law processing 1000+ contacts/week",
            "Integrated Claude API for automatic natural language insight generation",
          ],
        },
        {
          role: "Customer Operations Analyst",
          company: "Compañía Boliviana de Tickets y Controles",
          period: "Apr 2022 – Nov 2024",
          bullets: [
            "Sales and customer data analysis for commercial and administrative teams",
            "Built Power BI and Tableau reports for decision making",
            "Process optimization through data analysis",
          ],
        },
      ],
      skills: [
        {
          category: "Marketing & Ads",
          items: ["Meta Ads API", "Klaviyo API", "Shopify API", "Google Analytics", "GoHighLevel"],
        },
        {
          category: "Data & Code",
          items: ["Python", "pandas", "SQL", "Next.js", "TypeScript", "Supabase"],
        },
        {
          category: "AI & Automation",
          items: ["Claude API", "ReportLab", "OpenClaw", "Make.com", "Vercel"],
        },
      ],
    },
  },
}
