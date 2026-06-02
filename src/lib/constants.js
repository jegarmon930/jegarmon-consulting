// src/lib/constants.js

export const BRAND = {
  name: "JE Garmon CM Consulting",
  tagline: "Federal Construction Quality Control & Compliance",
  email: "james@jegarmon.com",
  certifications: [
    "OSHA 30",
    "USACE QCM",
    "GSA",
    "EM 385-1-1",
    "19+ Years Federal Experience",
  ],
  services: [
    {
      id: "qc-plan",
      label: "Quality Control Plans",
      icon: "📋",
      desc: "RMS 3.0-compliant QC Plans for federal construction contracts",
      prompt: "I need help developing a Quality Control Plan for a federal construction project.",
    },
    {
      id: "aha",
      label: "Activity Hazard Analysis",
      icon: "⚠️",
      desc: "EM 385-1-1 compliant AHA documentation for all scopes of work",
      prompt: "I need Activity Hazard Analysis (AHA) documentation per EM 385-1-1.",
    },
    {
      id: "three-phase",
      label: "Three-Phase Control System",
      icon: "🔄",
      desc: "Preparatory, Initial & Follow-up inspection management",
      prompt: "I need help managing the Three-Phase Control System for my project.",
    },
    {
      id: "dfow",
      label: "DFOW Checklists",
      icon: "✅",
      desc: "Definable Features of Work checklists keyed to UFGS specs",
      prompt: "I need Definable Features of Work (DFOW) checklists aligned to UFGS specifications.",
    },
    {
      id: "mop",
      label: "Methods of Procedure",
      icon: "📐",
      desc: "Detailed MOPs for complex mechanical/electrical systems",
      prompt: "I need Methods of Procedure (MOP) documentation for mechanical or electrical systems.",
    },
    {
      id: "compliance",
      label: "Compliance Audits",
      icon: "🔍",
      desc: "FAR/DFARS, UFC, and EM 385-1-1 compliance reviews",
      prompt: "I need a compliance audit for FAR/DFARS, UFC, or EM 385-1-1 requirements.",
    },
    {
      id: "rms",
      label: "RMS 3.0 Support",
      icon: "🖥️",
      desc: "Full RMS 3.0 database setup, entry, and closeout support",
      prompt: "I need RMS 3.0 support — setup, data entry, or project closeout.",
    },
    {
      id: "training",
      label: "QC Staff Training",
      icon: "🎓",
      desc: "On-site or remote QC program training for project teams",
      prompt: "I'm interested in QC staff training for my project team.",
    },
  ],
};
