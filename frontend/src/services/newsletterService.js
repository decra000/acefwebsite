// src/services/newsletterService.js
import { API_URL } from "../config";

// Email validation regex - more comprehensive than basic HTML5 validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// List of common disposable email domains to prevent fake emails
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'temp-mail.org', 'getairmail.com', 'maildrop.cc'
];

/**
 * Validate email format and check for disposable domains
 */
export function validateEmail(email) {
  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic format validation
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      message: "Please enter a valid email address"
    };
  }
  
  // Check for disposable email domains
  const domain = trimmedEmail.split('@')[1];
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      message: "Temporary email addresses are not allowed. Please use a permanent email address."
    };
  }
  
  // Additional checks
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      message: "Email address is too long"
    };
  }
  
  return { isValid: true };
}

/**
 * Subscribe to newsletter with email validation and confirmation
 */
export async function subscribeToNewsletter(email) {
  const trimmedEmail = email.trim().toLowerCase();

  // Client-side validation first
  const validation = validateEmail(trimmedEmail);
  if (!validation.isValid) {
    return { success: false, message: validation.message };
  }

  try {
    const response = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 409) {
        return { success: false, message: "You are already subscribed to our newsletter." };
      }
      if (response.status === 400 && data.message?.includes('invalid')) {
        return { success: false, message: "Please enter a valid email address." };
      }
      return { success: false, message: data.message || "Subscription failed. Please try again." };
    }

    // Success response
    return { 
      success: true, 
      message: data.message || "Successfully subscribed to our newsletter!",
      data: data.data
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    
    // Network error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, message: "Connection error. Please check your internet connection and try again." };
    }
    
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(token) {
  try {
    const response = await fetch(`${API_URL}/newsletter/unsubscribe/${token}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Unsubscribe failed." };
    }

    return { success: true, message: data.message || "Successfully unsubscribed." };
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return { success: false, message: "Unsubscribe failed. Please try again." };
  }
}


export async function getNewsletterStats() {
  try {
    const response = await fetch(`${API_URL}/newsletter/stats`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to fetch statistics." };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Newsletter stats error:", error);
    return { success: false, message: "Failed to fetch newsletter statistics." };
  }
}


export async function getNewsletterSubscribers() {
  try {
    const response = await fetch(`${API_URL}/newsletter/subscribers`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to fetch subscribers." };
    }

    return { success: true, data: data.data, count: data.count };
  } catch (error) {
    console.error("Get subscribers error:", error);
    return { success: false, message: "Failed to fetch subscribers." };
  }
}


export async function deleteSubscriber(email) {
  try {
    const response = await fetch(`${API_URL}/newsletter/subscribers/${encodeURIComponent(email)}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to delete subscriber." };
    }

    return { success: true, message: data.message || "Subscriber deleted successfully." };
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return { success: false, message: "Failed to delete subscriber." };
  }
}


export async function sendNewsletterMessage({ subject, message, messageType = 'newsletter' }) {
  // Validate required fields
  if (!subject || !subject.trim()) {
    return { success: false, message: "Subject is required." };
  }
  
  if (!message || !message.trim()) {
    return { success: false, message: "Message content is required." };
  }

  if (subject.length > 200) {
    return { success: false, message: "Subject must be less than 200 characters." };
  }

  if (message.length > 10000) {
    return { success: false, message: "Message must be less than 10,000 characters." };
  }

  try {
    const response = await fetch(`${API_URL}/newsletter/send-message`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify({
        subject: subject.trim(),
        message: message.trim(),
        messageType
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to send message." };
    }

    return { 
      success: true, 
      message: data.message || "Message sent successfully!",
      data: data.data
    };
  } catch (error) {
    console.error("Send newsletter message error:", error);
    return { success: false, message: "Failed to send message. Please try again." };
  }
}


export async function getNewsletterMessages(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_URL}/newsletter/messages?page=${page}&limit=${limit}`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to fetch message history." };
    }

    return { 
      success: true, 
      data: data.data.messages, 
      pagination: data.data.pagination 
    };
  } catch (error) {
    console.error("Get messages error:", error);
    return { success: false, message: "Failed to fetch message history." };
  }
}

/**
 * Download subscriber emails as CSV
 */
export function downloadSubscribersCSV(subscribers) {
  if (!subscribers || subscribers.length === 0) {
    return { success: false, message: "No subscribers to download." };
  }

  try {
    const emailList = subscribers.map(subscriber => subscriber.email).join('\n');
    const blob = new Blob([emailList], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_emails_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    return { success: true, message: "Subscriber list downloaded successfully." };
  } catch (error) {
    console.error("Download error:", error);
    return { success: false, message: "Failed to download subscriber list." };
  }
}

/**
 * Check subscription status by email
 */
export async function checkSubscriptionStatus(email) {
  try {
    const response = await fetch(`${API_URL}/newsletter/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("Subscription status check error:", error);
    return { success: false, message: "Could not check subscription status." };
  }
}

/**
 * Utility function to format date for display
 */
export function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return dateString;
  }
}

/**
 * Utility function to format subscriber count
 */
export function formatSubscriberCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}