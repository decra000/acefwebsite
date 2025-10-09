// chatApiService.js
// Unified communication layer for Chat Assistant (includes mission-vision, jobs, categories, contacts, transactions, core-values, videos, highlights)

const API_BASE = process.env.REACT_APP_API_URL || "https://acef-ngo.org/api";

function buildQs(params = {}) {
  const esc = encodeURIComponent;
  const qs = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => `${esc(k)}=${esc(params[k])}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

async function request(endpoint, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE}${endpoint}`;
  const opts = { method, headers: { ...headers }, credentials: "include" };

  if (body && !(body instanceof FormData) && !headers["Content-Type"]) {
    opts.headers["Content-Type"] = "application/json";
  }
  if (body) opts.body = body instanceof FormData ? body : JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    let errMsg = `Request failed ${res.status}`;
    try {
      const j = txt ? JSON.parse(txt) : null;
      if (j && j.message) errMsg = j.message;
    } catch (e) {
      /* ignore */
    }
    const err = new Error(errMsg);
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

/* ========== READ endpoints ========== */
export const fetchSettings = () => request(`/settings`);
export const healthCheck = () => request(`/health`);

export const fetchCountries = (opts = {}) => request(`/countries${buildQs(opts)}`);
export const fetchCountryByName = (name) => request(`/countries/${encodeURIComponent(name)}`);

export const fetchCategories = (opts = {}) => request(`/categories${buildQs(opts)}`);
export const fetchCategoryById = (id) => request(`/categories/${id}`);

export const fetchPillars = () => request(`/pillars`);
export const fetchPillarById = (id) => request(`/pillars/${id}`);

export const fetchMissionVision = () => request(`/mission-vision`);
export const fetchMissionVisionList = () => request(`/mission-visions`); // some backends use plural

export const fetchProjects = (opts = {}) => request(`/projects${buildQs(opts)}`);
export const fetchProjectById = (id) => request(`/projects/${id}`);
export const fetchFeaturedProjects = () => request(`/projects/featured`);

export const fetchTeamCategories = () => request(`/team/categories`);
export const fetchTeam = (opts = {}) => request(`/team${buildQs(opts)}`);
export const fetchTeamMember = (id) => request(`/team/${id}`);

export const fetchEvents = (opts = {}) => request(`/events${buildQs(opts)}`);
export const fetchEventById = (id) => request(`/events/${id}`);

export const fetchPosts = (opts = {}) => request(`/posts${buildQs(opts)}`);
export const fetchPostById = (id) => request(`/posts/${id}`);
export const fetchFeaturedPosts = () => request(`/posts/featured`);

export const fetchPartners = () => request(`/partners`);
export const fetchPrograms = (opts = {}) => request(`/programs${buildQs(opts)}`);
export const fetchImpactStories = (opts = {}) => request(`/impact-stories${buildQs(opts)}`);

export const fetchGallery = () => request(`/gallery`);
export const fetchVideos = (opts = {}) => request(`/videos${buildQs(opts)}`);
export const fetchVideoById = (id) => request(`/videos/${id}`);

export const fetchHighlights = () => request(`/highlights`);
export const fetchHighlightById = (id) => request(`/highlights/${id}`);

export const fetchCoreValues = () => request(`/core-values`);
export const fetchCoreValueById = (id) => request(`/core-values/${id}`);

export const fetchJobs = (opts = {}) => request(`/jobs${buildQs(opts)}`);
export const fetchJobById = (id) => request(`/jobs/${id}`);

export const fetchContacts = () => request(`/contacts`);
export const fetchContactById = (id) => request(`/contacts/${id}`);
export const fetchContactInfo = () => request(`/contact-info`); // some backends expose public contact info here

export const fetchDonations = (opts = {}) => request(`/donations${buildQs(opts)}`);

/* Transactions (some backends expose transaction endpoints for public receipts) */
export const fetchTransactions = (opts = {}) => request(`/transactions${buildQs(opts)}`);
export const fetchTransactionById = (id) => request(`/transactions/${id}`);

/* Search */
export const searchSite = (q, opts = {}) => request(`/search${buildQs({ q, ...opts })}`);

/* ========== ACTION / WRITE endpoints ========== */
export const sendContact = (payload) => request(`/contact`, { method: "POST", body: payload });
export const submitVolunteer = (formData) => request(`/volunteers`, { method: "POST", body: formData });
export const submitCollaborationReport = (formData) => request(`/collaborations/report`, { method: "POST", body: formData });
export const submitDonation = (payload) => request(`/donations`, { method: "POST", body: payload });
export const sendFeedback = (payload) => request(`/feedback`, { method: "POST", body: payload });
export const submitJobApplication = (formData) => request(`/jobs/apply`, { method: "POST", body: formData });

/* Utilities */
export function buildFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((val) => fd.append(`${k}[]`, val));
    } else {
      fd.append(k, v);
    }
  });
  return fd;
}

export default {
  /* settings */
  fetchSettings, healthCheck,
  /* core read */
  fetchCountries, fetchCountryByName,
  fetchCategories, fetchCategoryById,
  fetchPillars, fetchPillarById,
  fetchMissionVision, fetchMissionVisionList,
  fetchProjects, fetchProjectById, fetchFeaturedProjects,
  fetchTeamCategories, fetchTeam, fetchTeamMember,
  fetchEvents, fetchEventById,
  fetchPosts, fetchPostById, fetchFeaturedPosts,
  fetchPartners, fetchPrograms, fetchImpactStories,
  fetchGallery, fetchVideos, fetchVideoById,
  fetchHighlights, fetchHighlightById,
  fetchCoreValues, fetchCoreValueById,
  fetchJobs, fetchJobById,
  fetchContacts, fetchContactById, fetchContactInfo,
  fetchDonations,
  fetchTransactions, fetchTransactionById,
  searchSite,
  /* actions */
  sendContact, submitVolunteer, submitCollaborationReport, submitDonation, sendFeedback, submitJobApplication,
  /* helpers */
  buildFormData
};
