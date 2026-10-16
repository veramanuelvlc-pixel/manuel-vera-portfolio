export type Locale = "es" | "en"

export const contact = {
  email: "veramanuelvlc@gmail.com",
  whatsapp: "https://wa.me/59177442301",
  whatsappLabel: "+591 774 42301",
  linkedin: "https://www.linkedin.com/in/manuel-veraleon",
  github: "https://github.com/veramanuelvlc-pixel",
  cv: { es: "/cv-manuel-vera-es.pdf", en: "/cv-manuel-vera-en.pdf" },
  cvName: { es: "Manuel-Vera-CV.pdf", en: "Manuel-Vera-Resume.pdf" },
}

export const content = {
  es: {
    nav: {
      home: "inicio",
      about: "sobre mí",
      projects: "proyectos",
      contact: "contacto",
      cv: "CV en PDF",
      write: "Escríbeme",
      skip: "Saltar al contenido",
      pause: "Pausar la rotación de proyectos",
      play: "Reanudar la rotación de proyectos",
    },
    hero: {
      headline: "Analista de datos de marketing.",
      sentence:
        "Conecto Meta Ads, Klaviyo y Shopify a dashboards y reportes semanales que se arman solos, con Python, Next.js y la API de Claude.",
      action: "Escríbeme un correo",
      mailSubject: "Hola Manuel, vi tu portafolio",
      stripe: "Inversión diaria real en Meta Ads, 1 de enero a 31 de marzo de 2024",
    },
    work: {
      heading: "Proyectos",
      hint: "Pasa el cursor por un proyecto para verlo con sus datos.",
      all: "Ver todos los proyectos",
    },
    stats: {
      heading: "Lo que ya entregué",
      photoAlt: "Dashboard de Meta Ads con leads, clicks, alcance e ingresos diarios",
      photoCaption: "Dashboard de Meta Ads, uno de los cinco proyectos del portafolio.",
      a: { figure: "80%", caption: "menos tiempo armando el reporte semanal de Meta Ads." },
      b: { figure: "8+", caption: "clientes con reportes automáticos en Python." },
    },
    pipeline: {
      heading: "Cómo trabajo",
      label: "Etapa del proceso",
      stages: [
        { name: "Extraer", clause: "Primero, saco los datos de la API." },
        { name: "Ordenar", clause: "Después, los ordeno por campaña." },
        { name: "Dibujar", clause: "Luego, los convierto en un gráfico." },
        { name: "Explicar", clause: "Al final, los explico en palabras." },
      ],
      fragment: {
        file: "meta_ads_raw.csv",
        rows: "filas",
        campaign: "Campaña",
        spend: "Inversión",
        leads: "Leads",
        cpl: "CPL",
        revenue: "Ingresos",
        chartTitle: "Inversión e ingresos por semana",
        reportTitle: "Resumen del trimestre",
      },
    },
    letter: {
      heading: "Sobre mí",
      paragraphs: [
        "Soy Manuel Vera, analista de datos de marketing en Cochabamba, Bolivia. Desde noviembre de 2024 trabajo en Engage Media Solutions, donde mi trabajo es que nadie tenga que armar un reporte a mano.",
        "Automaticé el reporte semanal de Meta Ads con Python, pandas y ReportLab para más de ocho clientes, y el tiempo que se le dedica bajó un 80%. Construí dashboards en Next.js que unen Meta Ads, Klaviyo y Shopify para clientes de legal, fintech y e-commerce.",
        "Para The Founders Law armé un sistema que clasifica y atribuye más de 1.000 leads por semana, cruzando Meta Ads con su CRM en GoHighLevel. Y conecté la API de Claude para que los números lleguen explicados en lenguaje natural.",
        "Antes pasé dos años y medio en la Compañía Boliviana de Tickets y Controles, analizando ventas y clientes con Power BI y Tableau. Estudié Ingeniería Financiera en la Universidad Católica San Pablo.",
        "Busco un equipo de marketing o una agencia donde los datos decidan el presupuesto. Si es el tuyo, hablemos.",
      ],
      highlight: "el tiempo que se le dedica bajó un 80%",
      role: "Marketing Data Analyst",
      more: "Leer la experiencia completa",
    },
    contactBlock: {
      heading: "Contacto",
      promptA: "¿Qué necesitas medir?",
      promptB: "Cuéntamelo en una línea.",
      placeholder: "Ej.: reportes semanales de Meta Ads para 5 clientes…",
      submit: "Abrir el correo con este mensaje",
      next: "Se abre tu correo con el mensaje listo para enviar.",
      email: "Correo",
      whatsapp: "WhatsApp",
      location: "Ubicación",
      locationValue: "Cochabamba, Bolivia",
      languages: "Idiomas",
      languagesValue: "Español nativo, inglés avanzado",
    },
    footer: {
      rights: "Todos los derechos reservados.",
      data: "Los gráficos usan datasets de muestra de cada proyecto.",
    },
    projectsPage: {
      title: "Proyectos",
      intro:
        "Cinco dashboards construidos con Python, Next.js y Recharts sobre datasets de marketing. Cada uno resuelve una pregunta que un equipo se hace cada semana.",
      open: "Abrir el dashboard",
      question: "Pregunta",
      stack: "Hecho con",
    },
    aboutPage: {
      title: "Experiencia",
      intro:
        "Analista de datos de marketing. Automatizo reportes, construyo dashboards en tiempo real e integro AI para agencias y clientes de fintech, legal y e-commerce.",
      download: "Descargar el CV en PDF",
      experience: "Trayectoria",
      skills: "Herramientas",
      education: "Formación",
      shotCaption: "El dashboard de Meta Ads del portafolio: el tipo de tablero que construyo para clientes, con datos de muestra.",
      archiveScotland:
        "William Playfair, 1786: exportaciones e importaciones de Escocia, el primer gráfico de barras publicado. Dominio público, vía Wikimedia Commons.",
      archiveEngland:
        "William Playfair, 1786: importaciones y exportaciones de Inglaterra de 1700 a 1782. El mismo oficio, 240 años antes. Dominio público, vía Wikimedia Commons.",
      educationValue: "Licenciatura en Ingeniería Financiera, Universidad Católica San Pablo, 2016 a 2020.",
      jobs: [
        {
          role: "Marketing Data Analyst",
          company: "Engage Media Solutions",
          period: "Nov 2024 a hoy",
          bullets: [
            "Automaticé reportes semanales de Meta Ads con Python (ReportLab y pandas) para 8+ clientes, reduciendo el tiempo de reporte manual en 80%.",
            "Construí dashboards en Next.js que integran Meta Ads API, Klaviyo y Shopify, con datos en tiempo real para clientes de legal, fintech y e-commerce.",
            "Desarrollé un sistema de clasificación y atribución de leads para The Founders Law que procesa 1.000+ contactos por semana, cruzando Meta Ads con el CRM (GoHighLevel).",
            "Integré la API de Claude para generar insights en lenguaje natural a partir de los datos de campañas.",
            "Diseñé pipelines de atribución que cruzan leads de Meta (formulario, landing, WhatsApp) con registros de CRM y ventas.",
          ],
        },
        {
          role: "Customer Success / Data Analyst",
          company: "BAMC Incubator",
          period: "Nov 2024 a hoy",
          bullets: [
            "Construí dashboards y reportes automatizados para seguir KPIs y engagement de clientes.",
            "Apoyo a los equipos de ventas y marketing con reportes y seguimiento.",
          ],
        },
        {
          role: "Customer Operations Analyst",
          company: "Compañía Boliviana de Tickets y Controles",
          period: "Abr 2022 a nov 2024",
          bullets: [
            "Análisis de datos de ventas y clientes para los equipos comerciales y administrativos.",
            "Reportes en Power BI y Tableau para la toma de decisiones.",
            "Iniciativas de retención de clientes a partir del análisis de datos.",
          ],
        },
      ],
      skillGroups: [
        { category: "Marketing y ads", items: "Meta Ads API, Klaviyo API, Shopify API, Google Analytics, GoHighLevel" },
        { category: "Datos y código", items: "Python, pandas, SQL, Next.js, TypeScript, React, Supabase" },
        { category: "AI y automatización", items: "Claude API, ReportLab, OpenClaw, Make.com" },
        { category: "Visualización", items: "Power BI, Tableau, Looker Studio, Recharts, Excel avanzado" },
      ],
    },
  },
  en: {
    nav: {
      home: "home",
      about: "about",
      projects: "projects",
      contact: "contact",
      cv: "CV as PDF",
      write: "Email me",
      skip: "Skip to content",
      pause: "Pause the project rotation",
      play: "Resume the project rotation",
    },
    hero: {
      headline: "Marketing data analyst.",
      sentence:
        "I connect Meta Ads, Klaviyo and Shopify to dashboards and weekly reports that build themselves, with Python, Next.js and the Claude API.",
      action: "Send me an email",
      mailSubject: "Hi Manuel, I saw your portfolio",
      stripe: "Real daily Meta Ads spend, January 1 to March 31, 2024",
    },
    work: {
      heading: "Projects",
      hint: "Hover a project to see it with its data.",
      all: "See every project",
    },
    stats: {
      heading: "What I've shipped",
      photoAlt: "Meta Ads dashboard with leads, clicks, reach and daily revenue",
      photoCaption: "Meta Ads dashboard, one of the five portfolio projects.",
      a: { figure: "80%", caption: "less time spent building the weekly Meta Ads report." },
      b: { figure: "8+", caption: "clients on automated Python reporting." },
    },
    pipeline: {
      heading: "How I work",
      label: "Process stage",
      stages: [
        { name: "Extract", clause: "First, I pull the data from the API." },
        { name: "Shape", clause: "Then I group it by campaign." },
        { name: "Draw", clause: "Next, I turn it into a chart." },
        { name: "Explain", clause: "Last, I explain it in words." },
      ],
      fragment: {
        file: "meta_ads_raw.csv",
        rows: "rows",
        campaign: "Campaign",
        spend: "Spend",
        leads: "Leads",
        cpl: "CPL",
        revenue: "Revenue",
        chartTitle: "Spend and revenue by week",
        reportTitle: "Quarter summary",
      },
    },
    letter: {
      heading: "About me",
      paragraphs: [
        "I'm Manuel Vera, a marketing data analyst based in Cochabamba, Bolivia. Since November 2024 I've worked at Engage Media Solutions, where my job is making sure nobody builds a report by hand.",
        "I automated the weekly Meta Ads report with Python, pandas and ReportLab for more than eight clients, and the time it takes dropped by 80%. I built Next.js dashboards that join Meta Ads, Klaviyo and Shopify for clients in legal, fintech and e-commerce.",
        "For The Founders Law I built a system that classifies and attributes more than 1,000 leads a week, matching Meta Ads against their GoHighLevel CRM. And I wired in the Claude API so the numbers arrive explained in plain language.",
        "Before that I spent two and a half years at Compañía Boliviana de Tickets y Controles, analysing sales and customers with Power BI and Tableau. I studied Financial Engineering at Universidad Católica San Pablo.",
        "I'm looking for a marketing team or agency where data decides the budget. If that's yours, let's talk.",
      ],
      highlight: "the time it takes dropped by 80%",
      role: "Marketing Data Analyst",
      more: "Read the full experience",
    },
    contactBlock: {
      heading: "Contact",
      promptA: "What do you need to measure?",
      promptB: "Tell me in one line.",
      placeholder: "E.g. weekly Meta Ads reports for 5 clients…",
      submit: "Open my email with this message",
      next: "Your email app opens with the message ready to send.",
      email: "Email",
      whatsapp: "WhatsApp",
      location: "Location",
      locationValue: "Cochabamba, Bolivia",
      languages: "Languages",
      languagesValue: "Native Spanish, advanced English",
    },
    footer: {
      rights: "All rights reserved.",
      data: "Charts use each project's sample dataset.",
    },
    projectsPage: {
      title: "Projects",
      intro:
        "Five dashboards built with Python, Next.js and Recharts on marketing datasets. Each one answers a question a team asks every week.",
      open: "Open the dashboard",
      question: "Question",
      stack: "Built with",
    },
    aboutPage: {
      title: "Experience",
      intro:
        "Marketing data analyst. I automate reporting, build real-time dashboards and integrate AI for agencies and clients in fintech, legal and e-commerce.",
      download: "Download the CV as PDF",
      experience: "Career",
      skills: "Tools",
      education: "Education",
      shotCaption: "The portfolio's Meta Ads dashboard: the kind of board I build for clients, on sample data.",
      archiveScotland:
        "William Playfair, 1786: Scotland's exports and imports, the first bar chart ever published. Public domain, via Wikimedia Commons.",
      archiveEngland:
        "William Playfair, 1786: England's imports and exports, 1700 to 1782. The same craft, 240 years earlier. Public domain, via Wikimedia Commons.",
      educationValue: "BSc in Financial Engineering, Universidad Católica San Pablo, 2016 to 2020.",
      jobs: [
        {
          role: "Marketing Data Analyst",
          company: "Engage Media Solutions",
          period: "Nov 2024 to now",
          bullets: [
            "Automated weekly Meta Ads reports with Python (ReportLab and pandas) for 8+ clients, cutting manual reporting time by 80%.",
            "Built Next.js dashboards integrating the Meta Ads API, Klaviyo and Shopify, with real-time data for clients in legal, fintech and e-commerce.",
            "Built a lead classification and attribution system for The Founders Law processing 1,000+ contacts a week, matching Meta Ads against the CRM (GoHighLevel).",
            "Integrated the Claude API to generate natural-language insights from campaign data.",
            "Designed attribution pipelines matching Meta leads (form, landing page, WhatsApp) against CRM and sales records.",
          ],
        },
        {
          role: "Customer Success / Data Analyst",
          company: "BAMC Incubator",
          period: "Nov 2024 to now",
          bullets: [
            "Built dashboards and automated reports to track client KPIs and engagement.",
            "Support the sales and marketing teams with reporting and follow-up.",
          ],
        },
        {
          role: "Customer Operations Analyst",
          company: "Compañía Boliviana de Tickets y Controles",
          period: "Apr 2022 to Nov 2024",
          bullets: [
            "Sales and customer data analysis for the commercial and administrative teams.",
            "Power BI and Tableau reports for decision making.",
            "Customer retention initiatives driven by data analysis.",
          ],
        },
      ],
      skillGroups: [
        { category: "Marketing and ads", items: "Meta Ads API, Klaviyo API, Shopify API, Google Analytics, GoHighLevel" },
        { category: "Data and code", items: "Python, pandas, SQL, Next.js, TypeScript, React, Supabase" },
        { category: "AI and automation", items: "Claude API, ReportLab, OpenClaw, Make.com" },
        { category: "Visualisation", items: "Power BI, Tableau, Looker Studio, Recharts, Excel (advanced)" },
      ],
    },
  },
}
