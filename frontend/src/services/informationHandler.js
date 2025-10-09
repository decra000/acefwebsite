// informationHandler.js
// Interprets intent and fetches correct information (updated to handle new intents)

import api from "./chatApiService";
import { classify } from "./intentClassifier";

/**
 * Standard response:
 * { success: boolean, type: 'info'|'list'|'action'|'none'|'error', data, message, source, meta }
 */

export async function handleIntent(text) {
  const { intent, entities } = classify(text);

  try {
    switch (intent) {
      case "GET_COUNTRIES":
        return { success: true, type: "list", data: await api.fetchCountries(), source: "countries" };

      case "GET_PROJECTS": {
        const opts = {};
        if (entities.country) opts.country = entities.country;
        return { success: true, type: "list", data: await api.fetchProjects(opts), source: "projects" };
      }

      case "GET_TEAM": {
        const opts = {};
        if (entities.category) opts.category = entities.category;
        if (entities.country) opts.country = entities.country;
        return { success: true, type: "list", data: await api.fetchTeam(opts), source: "team" };
      }

      case "GET_EVENTS":
        return { success: true, type: "list", data: await api.fetchEvents(), source: "events" };

      case "GET_PROJECT_BY_ID":
      case "GET_BY_ID":
        if (!entities.id) return { success: false, type: "none", message: "Please provide the ID." };
        return { success: true, type: "info", data: await api.fetchProjectById(entities.id), source: "projects" };

      case "GET_POSTS":
        return { success: true, type: "list", data: await api.fetchPosts(), source: "posts" };

      case "GET_POST_BY_ID":
        if (!entities.id) return { success: false, type: "none", message: "Please provide the post id." };
        return { success: true, type: "info", data: await api.fetchPostById(entities.id), source: "posts" };

      case "GET_PARTNERS":
        return { success: true, type: "list", data: await api.fetchPartners(), source: "partners" };

      case "GET_PILLARS":
        return { success: true, type: "list", data: await api.fetchPillars(), source: "pillars" };

      case "GET_MISSION_VISION":
        // If the backend exposes a list, use it; otherwise single object
        try {
          const mv = await api.fetchMissionVision();
          return { success: true, type: "info", data: mv, source: "mission-vision" };
        } catch (_) {
          const mvs = await api.fetchMissionVisionList();
          return { success: true, type: "list", data: mvs, source: "mission-visions" };
        }

      case "GET_JOBS": {
        const opts = {};
        if (entities.position) opts.q = entities.position;
        return { success: true, type: "list", data: await api.fetchJobs(opts), source: "jobs" };
      }

      case "GET_CATEGORIES":
        return { success: true, type: "list", data: await api.fetchCategories(), source: "categories" };

      case "GET_CONTACTS": {
        // There might be a public contact-info endpoint
        try {
          const info = await api.fetchContactInfo();
          return { success: true, type: "info", data: info, source: "contact-info" };
        } catch (_) {
          const list = await api.fetchContacts();
          return { success: true, type: "list", data: list, source: "contacts" };
        }
      }

      case "GET_VIDEOS":
        return { success: true, type: "list", data: await api.fetchVideos(), source: "videos" };

      case "GET_HIGHLIGHTS":
        return { success: true, type: "list", data: await api.fetchHighlights(), source: "highlights" };

      case "GET_CORE_VALUES":
        return { success: true, type: "list", data: await api.fetchCoreValues(), source: "core-values" };

      case "GET_DONATIONS":
        return { success: true, type: "list", data: await api.fetchDonations(), source: "donations" };

      case "GET_TRANSACTIONS": {
        if (entities.transactionId) {
          // try to fetch single transaction
          try {
            const tx = await api.fetchTransactionById(entities.transactionId);
            return { success: true, type: "info", data: tx, source: "transactions" };
          } catch (err) {
            return { success: false, type: "error", message: err.message || "Transaction not found" };
          }
        }
        return { success: true, type: "list", data: await api.fetchTransactions(), source: "transactions" };
      }

      case "SEARCH": {
        const q = text;
        return { success: true, type: "list", data: await api.searchSite(q), source: "search" };
      }

      case "CONTACT":
        return { success: true, type: "action", message: "You can send us a message via the contact form (I can open it for you or submit on your behalf)." };

      case "FALLBACK":
      default:
        return { success: false, type: "none", message: "I didn't understand that. Could you rephrase or be more specific?" };
    }
  } catch (err) {
    return { success: false, type: "error", message: err.message || "Failed to fetch data", meta: err };
  }
}

export default { handleIntent };
