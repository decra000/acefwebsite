// actionHandler.js
// Executes user actions like form submissions or redirects (includes job application path)

import api, { buildFormData } from "./chatApiService";

export async function submitContactForm(payload) {
  try {
    const res = await api.sendContact(payload);
    return { success: true, message: res.message || "Your message has been sent!" };
  } catch (err) {
    return { success: false, message: err.message || (err.payload && err.payload.message) || "Failed to send message." };
  }
}

export async function submitVolunteerForm(data) {
  try {
    const body = data instanceof FormData ? data : buildFormData(data);
    const res = await api.submitVolunteer(body);
    return { success: true, message: res.message || "Volunteer application submitted successfully!" };
  } catch (err) {
    return { success: false, message: err.message || "Failed to submit application." };
  }
}

export async function submitCollaborationReport(data) {
  try {
    const body = data instanceof FormData ? data : buildFormData(data);
    const res = await api.submitCollaborationReport(body);
    return { success: true, message: res.message || "Collaboration report submitted successfully!" };
  } catch (err) {
    return { success: false, message: err.message || "Failed to submit report." };
  }
}

export async function submitDonation(payload) {
  try {
    const res = await api.submitDonation(payload);
    return { success: true, message: res.message || "Donation submitted successfully!" };
  } catch (err) {
    return { success: false, message: err.message || "Failed to submit donation." };
  }
}

export async function submitJobApplication(formData) {
  try {
    const body = formData instanceof FormData ? formData : buildFormData(formData);
    const res = await api.submitJobApplication(body);
    return { success: true, message: res.message || "Job application submitted. Thank you!" };
  } catch (err) {
    return { success: false, message: err.message || "Failed to submit job application." };
  }
}

// Smart redirect: confirms with user before redirecting to human support or external resource
export async function offerRedirect({ label = "human support", url }, confirmWithUser) {
  const ok = await confirmWithUser(`I can't fully assist with this. Would you like me to connect you to ${label}?`);
  if (!ok) return { success: false, message: "Redirect cancelled." };
  if (url) window.open(url, "_blank");
  return { success: true, message: `Opening ${label}...` };
}

export default {
  submitContactForm,
  submitVolunteerForm,
  submitCollaborationReport,
  submitDonation,
  submitJobApplication,
  offerRedirect,
};
