// intentClassifier.js
// Determines what the user is asking for (updated to include mission-vision, jobs, categories, contacts, transactions, core-values, videos, highlights)

export const intentRules = {
  GET_COUNTRIES: ["countries", "where we operate", "locations", "countries reached"],
  GET_PROJECTS: ["projects", "initiatives", "programs", "what we do"],
  GET_TEAM: ["team", "staff", "members", "leadership"],
  GET_EVENTS: ["events", "activities", "what's happening", "calendar", "upcoming events"],
  GET_POSTS: ["news", "blog", "updates", "stories", "insights"],
  GET_PARTNERS: ["partners", "organizations we work with", "affiliations"],
  GET_VOLUNTEERS: ["volunteer", "join", "help out", "apply to volunteer"],
  GET_COLLABORATIONS: ["collaboration", "collaborate", "report", "partnership"],
  GET_DONATIONS: ["donate", "contribute", "support", "give"],
  GET_IMPACT: ["impact", "results", "achievements", "outcomes"],
  GET_PILLARS: ["pillars", "core areas", "themes"],
  CONTACT: ["contact", "message", "reach", "talk to someone", "email us"],
  SEARCH: ["search", "find", "look for", "lookup"],
  GET_MISSION_VISION: ["mission", "vision", "mission-vision", "mission vision", "about our mission"],
  GET_JOBS: ["job", "jobs", "vacancy", "openings", "position"],
  GET_CATEGORIES: ["categories", "category", "pillars", "sections"],
  GET_CONTACTS: ["contacts", "contact details", "phone", "address"],
  GET_TRANSACTIONS: ["transaction", "transactions", "donation receipt", "payment", "payment details", "transaction id"],
  GET_CORE_VALUES: ["core values", "values", "our values"],
  GET_VIDEOS: ["videos", "watch", "multimedia"],
  GET_HIGHLIGHTS: ["highlights", "featured", "top stories", "spotlight"],
  FALLBACK: []
};

export function classify(text = "") {
  const lower = (text || "").toLowerCase();
  const entities = {};

  // ID extraction (id:123, id 123, #123, tx:abc-123)
  const idMatch = lower.match(/(?:id[:#\s]*)([a-z0-9\-]+)/i) || lower.match(/\b(tx|txn|transaction)[:#\s]*([a-z0-9\-]+)/i);
  if (idMatch) entities.id = idMatch[1] || idMatch[2];

  // Country extraction: "in Kenya", "for Kenya"
  const countryMatch = lower.match(/\b(in|for)\s+([A-Za-z\s]{2,40})\b/);
  if (countryMatch) entities.country = countryMatch[2].trim();

  // Job/position capture
  const jobMatch = lower.match(/\b(position|role|job)\s+[:\s]*([A-Za-z0-9\s\-]+)\b/);
  if (jobMatch) entities.position = jobMatch[2].trim();

  // Category / department heuristics
  const possibleCats = ["board", "management", "advisors", "volunteer", "staff", "partner", "pillar", "department", "category"];
  for (const cat of possibleCats) {
    if (lower.includes(cat)) entities.category = cat;
  }

  // Transaction id pattern (txid etc.)
  const txMatch = lower.match(/\b(txn|tx|transaction)[:#\s]*([a-z0-9\-]+)/i);
  if (txMatch) entities.transactionId = txMatch[2];

  // Match known intents
  for (const [intent, keywords] of Object.entries(intentRules)) {
    for (const kw of keywords) {
      if (!kw) continue;
      if (lower.includes(kw)) {
        return { intent, confidence: 0.92, entities };
      }
    }
  }

  // Fallback heuristics
  if (/\bjob(s)?\b|\bopening(s)?\b|\bvacancy\b/.test(lower)) return { intent: "GET_JOBS", confidence: 0.6, entities };
  if (/\bmission\b|\bvision\b/.test(lower)) return { intent: "GET_MISSION_VISION", confidence: 0.6, entities };
  if (/\bvideo(s)?\b/.test(lower)) return { intent: "GET_VIDEOS", confidence: 0.6, entities };
  if (/\btransaction(s)?\b|\bpayment\b/.test(lower)) return { intent: "GET_TRANSACTIONS", confidence: 0.6, entities };

  return { intent: "FALLBACK", confidence: 0.1, entities };
}
