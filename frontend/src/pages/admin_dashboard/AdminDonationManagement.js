import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Eye, CheckCircle, Clock, AlertCircle, 
  Mail, RefreshCw,
  TrendingUp, Users, DollarSign, Gift, Send, X, 
} from 'lucide-react';

import { API_URL } from '../../config';

// Badge Template Component
const DonorBadgeTemplate = ({ 
  recipientName = "Donor", 
  donationAmount = 0,
  year = new Date().getFullYear(),
  size = "standard",
  id = "donor-badge",
  isAnonymous = false
}) => {
  const displayName = isAnonymous ? "ACEF Friend" : recipientName;
  
  const sizeConfig = {
    compact: { diameter: 280, fontSize: { name: '1rem', title: '0.7rem' } },
    standard: { diameter: 350, fontSize: { name: '1.3rem', title: '0.8rem' } },
    premium: { diameter: 420, fontSize: { name: '1.6rem', title: '0.9rem' } }
  };

  const config = sizeConfig[size];

  return (
    <div id={id} style={{
      width: config.diameter,
      height: config.diameter,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0a451c, #16a34a)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '25px',
      color: 'white',
      fontFamily: '"Playfair Display", serif',
      boxShadow: '0 20px 40px rgba(10, 69, 28, 0.3)',
      position: 'relative'
    }}>
      {/* Decorative border */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        right: '15px',
        bottom: '15px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50%'
      }}></div>
      
      <div style={{ fontSize: '2.5rem', marginBottom: '10px', zIndex: 2 }}>🏆</div>
      <div style={{ 
        fontSize: '0.9rem', 
        textAlign: 'center', 
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        opacity: 0.9,
        zIndex: 2
      }}>
        Thank You
      </div>
      <div style={{ 
        fontSize: config.fontSize.name, 
        fontWeight: '700', 
        textAlign: 'center', 
        marginBottom: '8px',
        zIndex: 2
      }}>
        {displayName}
      </div>
      <div style={{ 
        fontSize: config.fontSize.title, 
        textAlign: 'center', 
        marginBottom: '12px',
        opacity: 0.9,
        zIndex: 2
      }}>
        Generous Donor
      </div>
      <div style={{ 
        fontSize: '0.7rem',
        background: 'rgba(255,255,255,0.2)',
        padding: '4px 12px',
        borderRadius: '15px',
        zIndex: 2
      }}>
        {year}
      </div>
      <div style={{ 
        fontSize: '0.6rem',
        marginTop: '8px',
        opacity: 0.8,
        textAlign: 'center',
        zIndex: 2
      }}>
        Your generosity makes a difference
      </div>
    </div>
  );
};

const AdminDonationManagement = ({ API_BASE = API_URL }) => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCompletionId, setPendingCompletionId] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [processingBadge, setProcessingBadge] = useState(false);
  
  // Reference data states
  const [countries, setCountries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [referenceDataLoading, setReferenceDataLoading] = useState(false);
  
  const [reminderForm, setReminderForm] = useState({
    type: 'payment_pending',
    message: ''
  });

  // Badge generation reference
  const badgeRef = useRef(null);

  // Load html2canvas for badge generation
  useEffect(() => {
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

// FIXED: Enhanced badge generation with proper buffer handling and validation
const generateBadgeBlob = async (donation) => {
  return new Promise((resolve, reject) => {
    // Enhanced html2canvas availability check
    if (!window.html2canvas) {
      const error = new Error('html2canvas library not loaded - ensure script is loaded before calling this function');
      console.error('❌', error.message);
      reject(error);
      return;
    }

    // Create isolated container for badge rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      top: -10000px;
      left: -10000px;
      width: 450px;
      height: 450px;
      pointer-events: none;
      z-index: -9999;
      visibility: visible;
      opacity: 1;
      background: white;
    `;
    
    // Ensure container is appended to body
    document.body.appendChild(tempContainer);

    const diameter = 400;
    const displayName = donation.is_anonymous ? "ACEF Friend" : (donation.donor_name || "Valued Donor");
    const currentYear = new Date().getFullYear();
    
    // Create badge with explicit styling to ensure proper rendering
    const badgeHTML = `
      <div class="donation-badge" style="
        width: ${diameter}px;
        height: ${diameter}px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0a451c 0%, #16a34a 50%, #22c55e 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        box-shadow: inset 0 0 0 3px rgba(255,255,255,0.3);
        position: relative;
        box-sizing: border-box;
        text-align: center;
      ">
        <div style="font-size: 48px; margin-bottom: 15px; line-height: 1;">🏆</div>
        
        <div style="
          font-size: 16px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
          opacity: 0.95;
        ">Thank You</div>
        
        <div style="
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.2;
          max-width: 85%;
          word-wrap: break-word;
          hyphens: auto;
          text-align: center;
        ">${displayName}</div>
        
        <div style="
          font-size: 14px;
          margin-bottom: 18px;
          font-weight: 500;
          opacity: 0.9;
        ">Generous Donor</div>
        
        <div style="
          font-size: 12px;
          background: rgba(255,255,255,0.25);
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 600;
        ">${currentYear}</div>
        
        <div style="
          font-size: 10px;
          margin-top: 12px;
          max-width: 80%;
          font-style: italic;
          opacity: 0.8;
          line-height: 1.3;
        ">Your generosity makes a difference</div>
      </div>
    `;
    
    tempContainer.innerHTML = badgeHTML;
    const badgeElement = tempContainer.querySelector('.donation-badge');

    // CRITICAL: Wait for fonts and styles to load, then render
    const renderTimeout = setTimeout(() => {
      reject(new Error('Badge generation timeout - html2canvas took too long'));
    }, 30000); // 30 second timeout

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(async () => {
      try {
        console.log('🎨 Starting canvas generation with html2canvas...');
        
        // Enhanced html2canvas options for better reliability
        const canvas = await window.html2canvas(badgeElement, {
          backgroundColor: null,
          scale: 2, // High resolution
          useCORS: true,
          allowTaint: false,
          logging: false, // Disable logging for cleaner output
          width: diameter,
          height: diameter,
          windowWidth: diameter + 100,
          windowHeight: diameter + 100,
          imageTimeout: 10000,
          removeContainer: true, // Let html2canvas manage cleanup
          onclone: function(clonedDoc, element) {
            // Ensure styles are preserved in cloned document
            const clonedBadge = clonedDoc.querySelector('.donation-badge');
            if (clonedBadge) {
              clonedBadge.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
              clonedBadge.style.display = 'flex';
              clonedBadge.style.visibility = 'visible';
            }
          }
        });

        clearTimeout(renderTimeout);

        // Cleanup DOM immediately after canvas generation
        if (tempContainer && tempContainer.parentNode) {
          tempContainer.parentNode.removeChild(tempContainer);
        }

        // CRITICAL: Validate canvas before proceeding
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Generated canvas is invalid or has zero dimensions');
        }

        console.log(`✅ Canvas generated successfully: ${canvas.width}x${canvas.height}`);

        // FIXED: Use canvas.toBlob with proper error handling
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate blob from canvas - toBlob returned null'));
            return;
          }
          
          if (blob.size === 0) {
            reject(new Error('Generated blob is empty (0 bytes)'));
            return;
          }
          
          // Validate reasonable file size bounds
          if (blob.size > 10 * 1024 * 1024) { // 10MB limit
            reject(new Error(`Generated badge file too large: ${blob.size} bytes`));
            return;
          }
          
          if (blob.size < 1000) { // Minimum reasonable size for a PNG badge
            reject(new Error(`Generated badge file too small: ${blob.size} bytes (likely corrupted)`));
            return;
          }
          
          console.log(`✅ Badge blob generated successfully: ${blob.size} bytes, type: ${blob.type}`);
          resolve(blob);
          
        }, 'image/png', 1.0); // Maximum quality PNG
        
      } catch (canvasError) {
        clearTimeout(renderTimeout);
        
        // Cleanup on error
        if (tempContainer && tempContainer.parentNode) {
          tempContainer.parentNode.removeChild(tempContainer);
        }
        
        console.error('❌ Canvas generation failed:', {
          error: canvasError.message,
          stack: canvasError.stack,
          donation: donation.id
        });
        
        reject(new Error(`Canvas generation failed: ${canvasError.message}`));
      }
    });
  });
};

// ENHANCED: Ensure html2canvas loads properly
const ensureHtml2CanvasLoaded = () => {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) {
      resolve();
      return;
    }
    
    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="html2canvas"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve);
      existingScript.addEventListener('error', () => reject(new Error('Failed to load html2canvas script')));
      return;
    }
    
    // Load html2canvas with proper error handling
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ html2canvas loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load html2canvas');
      reject(new Error('Failed to load html2canvas from CDN'));
    };
    document.head.appendChild(script);
  });
};

// FIXED: Browser-compatible sendDonationBadgeEmail function
const sendDonationBadgeEmail = async ({
  donationId,
  recipientEmail,
  recipientName,
  donationAmount,
  badgeBlob,
  badgeFilename = null,
  isAnonymous = false
}) => {
  try {
    console.log(`📧 Preparing badge email for: ${recipientEmail}`);

    // CRITICAL FIX: Validate blob instead of buffer (browser compatible)
    if (!badgeBlob) {
      throw new Error('Badge blob is null or undefined');
    }

    if (!(badgeBlob instanceof Blob)) {
      throw new Error('Provided badge data is not a Blob');
    }

    if (badgeBlob.size === 0) {
      throw new Error('Badge blob is empty (0 bytes)');
    }

    // Validate minimum reasonable file size
    if (badgeBlob.size < 1000) {
      throw new Error(`Badge blob too small: ${badgeBlob.size} bytes (likely corrupted)`);
    }

    console.log(`📎 Badge blob validated: ${badgeBlob.size} bytes, type: ${badgeBlob.type}`);

    // Prepare FormData for API call
    const formData = new FormData();
    
    // Add all required fields
    formData.append('donationId', donationId.toString());
    formData.append('recipientEmail', recipientEmail);
    formData.append('recipientName', isAnonymous ? 'ACEF Friend' : recipientName);
    formData.append('donationAmount', donationAmount.toString());
    formData.append('isAnonymous', isAnonymous ? 'true' : 'false');
    
    // FIXED: Create File object directly from blob (no Buffer needed)
    const filename = badgeFilename || `ACEF_Badge_${donationId}_${Date.now()}.png`;
    const badgeFile = new File([badgeBlob], filename, { 
      type: 'image/png',
      lastModified: Date.now()
    });
    
    formData.append('badge', badgeFile);

    // Log FormData contents for debugging
    console.log('📋 FormData prepared:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Send to API endpoint
    const response = await fetch(`${API_BASE}/donations/admin/${donationId}/send-badge`, {
      method: 'POST',
      credentials: 'include',
      body: formData // Don't set Content-Type, let browser handle multipart
    });

    console.log(`📤 Badge email API response: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API returned success=false');
    }

    console.log('✅ Badge email sent successfully via API');
    return result;

  } catch (error) {
    console.error('❌ Failed to send badge email:', {
      error: error.message,
      recipient: recipientEmail,
      donationId,
      blobSize: badgeBlob?.size || 0
    });
    
    throw error;
  }
};

// NEW: Confirmation handler for marking complete
const handleMarkCompleteClick = (donationId) => {
  setPendingCompletionId(donationId);
  setShowConfirmModal(true);
};

// NEW: Confirmed completion process
const confirmMarkCompleted = async () => {
  if (!pendingCompletionId) return;
  
  setShowConfirmModal(false);
  await markCompleted(pendingCompletionId);
  setPendingCompletionId(null);
};

// FIXED: Updated markCompleted function with browser-compatible approach
const markCompleted = async (donationId, notes = '') => {
  if (processingBadge) {
    showNotification('Badge generation already in progress', 'warning');
    return;
  }
  
  setProcessingBadge(true);
  
  try {
    console.log(`🔄 Processing completion for donation: ${donationId}`);
    
    // 1. Find and validate donation
    const donation = donations.find(d => d.id === donationId);
    if (!donation) {
      throw new Error('Donation not found in current data');
    }

    // Validate donor email
    if (!donation.donor_email) {
      throw new Error('Donation missing donor email address');
    }

    console.log('📄 Processing donation:', {
      id: donation.id,
      donor_name: donation.donor_name,
      donor_email: donation.donor_email,
      amount: donation.amount,
      is_anonymous: donation.is_anonymous
    });
    
    // 2. Mark donation as completed in database first
    const response = await fetch(`${API_BASE}/donations/admin/${donationId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ adminNotes: notes })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
      throw new Error(errorData.message || `Server returned ${response.status}`);
    }

    console.log('✅ Donation marked as completed in database');
    
    // 3. Generate badge with enhanced validation
    console.log('🎨 Starting badge generation...');
    
    // Ensure html2canvas is loaded
    if (!window.html2canvas) {
      console.log('📦 Loading html2canvas...');
      await ensureHtml2CanvasLoaded();
    }
    
    let badgeBlob = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (!badgeBlob && attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`🎨 Badge generation attempt ${attempts}/${maxAttempts}`);
        
        badgeBlob = await generateBadgeBlob(donation);
        
        if (!badgeBlob || badgeBlob.size === 0) {
          throw new Error('Badge generation returned empty blob');
        }
        
        console.log(`✅ Badge generated successfully: ${badgeBlob.size} bytes, type: ${badgeBlob.type}`);
        break;
        
      } catch (blobError) {
        console.error(`❌ Badge generation attempt ${attempts} failed:`, blobError.message);
        
        if (attempts >= maxAttempts) {
          // If badge generation fails completely, still show success for completion
          showNotification(`Donation completed successfully, but badge generation failed: ${blobError.message}`, 'warning');
          await fetchDonations(); // Refresh data
          return;
        }
        
        // Wait before retry
        console.log(`⏳ Waiting before retry attempt ${attempts + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // 4. Send badge email directly with blob (no Buffer conversion needed)
    console.log('📧 Sending badge email with blob...');
    
    const badgeEmailResult = await sendDonationBadgeEmail({
      donationId: donation.id,
      recipientEmail: donation.donor_email,
      recipientName: donation.donor_name,
      donationAmount: donation.amount,
      badgeBlob: badgeBlob,
      badgeFilename: `ACEF_Badge_${donation.id}_${Date.now()}.png`,
      isAnonymous: donation.is_anonymous
    });

    console.log('📧 Badge email result:', {
      messageId: badgeEmailResult.messageId,
      recipient: donation.donor_email
    });
    
    showNotification(`✅ Donation completed and badge sent to ${donation.donor_email}!`, 'success');
    
    // 5. Refresh data to show updated status
    await fetchDonations();
    
  } catch (error) {
    console.error('❌ Failed to complete donation:', {
      donationId,
      error: error.message,
      stack: error.stack
    });
    showNotification(`❌ Failed to complete donation: ${error.message}`, 'error');
  } finally {
    setProcessingBadge(false);
  }
};

// FIXED: Enhanced notification system with better error details
const showNotification = (message, type = 'info') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  
  // Create visual notification
  const notification = document.createElement('div');
  const colors = {
    success: { bg: '#10b981', border: '#059669', text: '#ffffff' },
    warning: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
    error: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
    info: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' }
  };
  
  const color = colors[type] || colors.info;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color.bg};
    color: ${color.text};
    padding: 16px 24px;
    border-radius: 12px;
    border-left: 6px solid ${color.border};
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: 'Inter', 'Arial', sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 450px;
    word-wrap: break-word;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: 700; margin-bottom: 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
      ${type.toUpperCase()}
    </div>
    <div style="line-height: 1.4;">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto-remove with animation
  const delay = type === 'error' ? 10000 : type === 'warning' ? 7000 : 5000;
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, delay);
};

// FIXED: Add debug function to test badge generation without API calls
const testBadgeGeneration = async (donation) => {
  try {
    console.log('🧪 Testing badge generation...');
    
    if (!window.html2canvas) {
      console.error('❌ html2canvas not available');
      return null;
    }
    
    const blob = await generateBadgeBlob(donation);
    
    if (blob && blob.size > 0) {
      console.log(`✅ Test badge generated: ${blob.size} bytes`);
      
      // Create download link for testing
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_badge_${donation.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return blob;
    } else {
      console.error('❌ Test badge generation failed');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Badge test failed:', error);
    return null;
  }
};

// DEBUGGING: Add this to your component for testing
const debugBadgeGeneration = () => {
  if (donations.length > 0) {
    const testDonation = donations[0];
    console.log('🧪 Testing badge generation with:', testDonation);
    testBadgeGeneration(testDonation);
  } else {
    console.log('❌ No donations available for testing');
  }
};

  // Send badge email
  const sendBadgeEmail = async (donation, badgeBlob) => {
    try {
      const formData = new FormData();
      formData.append('recipientName', donation.is_anonymous ? 'ACEF Friend' : donation.donor_name);
      formData.append('isAnonymous', donation.is_anonymous);
      formData.append('badge', badgeBlob, `donor_badge_${donation.id}.png`);

      const response = await fetch(`${API_BASE}/donations/admin/${donation.id}/send-badge`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error sending badge email:', error);
      return false;
    }
  };

  // Fetch countries for reference
  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE}/countries`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setCountries(data.data);
        console.log(`Loaded ${data.data.length} countries for reference`);
      } else if (Array.isArray(data)) {
        setCountries(data);
        console.log(`Loaded ${data.length} countries for reference`);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      const fallbackCountries = [
        { id: 1, name: 'Kenya' },
        { id: 2, name: 'Ghana' },
        { id: 3, name: 'Nigeria' },
        { id: 4, name: 'Uganda' },
        { id: 5, name: 'Rwanda' }
      ];
      setCountries(fallbackCountries);
    }
  };

  // Fetch projects for reference
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        credentials: 'include'
      });
      const data = await response.json();

      let projectsData = [];
      if (data.success && Array.isArray(data.data)) {
        projectsData = data.data;
      } else if (Array.isArray(data)) {
        projectsData = data;
      }

      setProjects(projectsData);
      console.log(`Loaded ${projectsData.length} projects for reference`);
    } catch (error) {
      console.error('Error fetching projects:', error);
      const fallbackProjects = [
        { id: 1, title: 'Clean Water Initiative', country_name: 'Kenya' },
        { id: 2, title: 'Educational Support Program', country_name: 'Ghana' },
        { id: 3, title: 'Healthcare Access Project', country_name: 'Uganda' }
      ];
      setProjects(fallbackProjects);
    }
  };

  // Load reference data on component mount
  const fetchReferenceData = async () => {
    setReferenceDataLoading(true);
    try {
      await Promise.allSettled([fetchCountries(), fetchProjects()]);
    } finally {
      setReferenceDataLoading(false);
    }
  };

  // Helper function to get target display name
  const getTargetDisplayName = (donation) => {
    switch (donation.donation_type) {
      case 'country':
        if (donation.target_country_id) {
          const country = countries.find(c => c.id === parseInt(donation.target_country_id));
          return country ? country.name : `Country ID: ${donation.target_country_id}`;
        }
        return 'Country (not specified)';
      case 'project':
        if (donation.target_project_id) {
          const project = projects.find(p => p.id === parseInt(donation.target_project_id));
          return project ? project.title : `Project ID: ${donation.target_project_id}`;
        }
        return 'Project (not specified)';
      default:
        return 'General Impact';
    }
  };

  // Helper function to get detailed target info for modal
  const getDetailedTargetInfo = (donation) => {
    switch (donation.donation_type) {
      case 'country':
        if (donation.target_country_id) {
          const country = countries.find(c => c.id === parseInt(donation.target_country_id));
          return {
            type: 'Country-Specific',
            name: country ? country.name : `Unknown Country (ID: ${donation.target_country_id})`,
            id: donation.target_country_id};
        }
        return { type: 'Country-Specific', name: 'Not specified', id: null };
      case 'project':
        if (donation.target_project_id) {
          const project = projects.find(p => p.id === parseInt(donation.target_project_id));
          return {
            type: 'Project-Specific',
            name: project ? project.title : `Unknown Project (ID: ${donation.target_project_id})`,
            id: donation.target_project_id,
            country: project?.country_name || project?.countryName || 'Unknown'
          };
        }
        return { type: 'Project-Specific', name: 'Not specified', id: null };
      default:
        return { type: 'General Impact', name: 'ACEF General Fund', id: null };
    }
  };

  // Fetch donations based on active tab
  const fetchDonations = async () => {
    setLoading(true);
    try {
      let endpoint;
      switch (activeTab) {
        case 'pending':
          endpoint = `${API_BASE}/donations/admin/pending`;
          break;
        case 'completed':
          endpoint = `${API_BASE}/donations/admin/completed`;
          break;
        case 'all':
          endpoint = `${API_BASE}/donations/admin/all`;
          break;
        default:
          endpoint = `${API_BASE}/donations/admin/pending`;
      }

      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setDonations(data.data);
        setFilteredDonations(data.data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/donations/admin/statistics`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [activeTab]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Filter donations based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(donation => {
        const searchLower = searchTerm.toLowerCase();
        const targetName = getTargetDisplayName(donation).toLowerCase();
        
        return (
          donation.donor_name?.toLowerCase().includes(searchLower) ||
          donation.donor_email?.toLowerCase().includes(searchLower) ||
          donation.id?.toLowerCase().includes(searchLower) ||
          donation.donation_type?.toLowerCase().includes(searchLower) ||
          targetName.includes(searchLower)
        );
      });
      setFilteredDonations(filtered);
    }
  }, [searchTerm, donations, countries, projects]);

  // Send reminder
  const sendReminder = async () => {
    if (!selectedDonation) {
      showNotification('No donation selected', 'error');
      return;
    }

    try {
      console.log('Sending reminder for donation:', selectedDonation.id);
      console.log('Reminder form data:', reminderForm);

      const response = await fetch(`${API_BASE}/donations/admin/${selectedDonation.id}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reminderType: reminderForm.type,
          message: reminderForm.message,
          sendEmail: true
        })
      });

      console.log('Reminder response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reminder failed with status:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Reminder response data:', data);

      if (data.success) {
        showNotification(
          data.data?.emailSent 
            ? `Reminder email sent to ${selectedDonation.donor_email}` 
            : 'Reminder logged successfully', 
          'success'
        );
        
        setShowReminderModal(false);
        setReminderForm({ type: 'payment_pending', message: '' });
        
        fetchDonations();
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error sending reminder:', error);
      showNotification(`Failed to send reminder: ${error.message}`, 'error');
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    if (status === 'completed' && paymentStatus === 'completed') {
      return <span className="status-badge completed"><CheckCircle size={14} /> Completed</span>;
    }
    if (status === 'pending' || paymentStatus === 'pending') {
      return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
    }
    return <span className="status-badge processing"><AlertCircle size={14} /> Processing</span>;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-donation-management">
      <style jsx>{`
        .admin-donation-management {
          padding: 24px;
          background-color: #f9fafb;
          min-height: 100vh;
        }

        .page-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .page-header h1 {
          margin: 0 0 8px 0;
          color: #0a451c;
          font-size: 28px;
          font-weight: 700;
        }

        .page-header p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .reference-status {
          margin-top: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .reference-status.loading {
          background: #fef3c7;
          color: #92400e;
        }

        .reference-status.loaded {
          background: #d1fae5;
          color: #065f46;
        }

        .reference-status.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #0a451c;
        }

        .stat-card.secondary {
          border-left-color: #facf3c;
        }

        .stat-card.accent {
          border-left-color: #9ccf9f;
        }

        .stat-card.info {
          border-left-color: #3b82f6;
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .stat-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .controls-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .controls-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #0a451c;
          box-shadow: 0 0 0 3px rgba(10, 69, 28, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .tab-buttons {
          display: flex;
          gap: 8px;
        }

        .tab-button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button.active {
          background: #0a451c;
          color: white;
          border-color: #0a451c;
        }

        .tab-button:hover:not(.active) {
          background: #f3f4f6;
        }

        .refresh-button {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .refresh-button:hover {
          background: #f3f4f6;
        }

        .donations-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e5e7eb;
        }

        td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        tr:hover {
          background: #f9fafb;
        }

        .donor-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .donor-name {
          font-weight: 500;
          color: #1f2937;
        }

        .donor-email {
          font-size: 13px;
          color: #6b7280;
        }

        .amount-cell {
          font-weight: 600;
          color: #059669;
        }

        .target-cell {
          max-width: 200px;
        }

        .target-name {
          font-weight: 500;
          color: #1f2937;
          font-size: 14px;
        }

        .target-type {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.processing {
          background: #dbeafe;
          color: #1e40af;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-button {
          padding: 6px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .action-button.view {
          background: #f3f4f6;
          color: #6b7280;
        }

        .action-button.complete {
          background: #d1fae5;
          color: #065f46;
        }

        .action-button.complete.processing {
          background: #fbbf24;
          color: white;
          cursor: not-allowed;
        }

        .action-button.remind {
          background: #fef3c7;
          color: #92400e;
        }

        .action-button:hover:not(.processing) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #374151;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0a451c;
          box-shadow: 0 0 0 3px rgba(10, 69, 28, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .target-info-section {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .target-info-section h4 {
          margin: 0 0 12px 0;
          color: #0a451c;
          font-size: 15px;
          font-weight: 600;
        }

        .target-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .target-detail:last-child {
          margin-bottom: 0;
        }

        .target-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .target-value {
          font-size: 13px;
          color: #1f2937;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .modal-button {
          padding: 8px 16px;
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .modal-button.primary {
          background: #0a451c;
          color: white;
        }

        .modal-button.primary.processing {
          background: #fbbf24;
          cursor: not-allowed;
        }

        .modal-button.secondary {
          background: white;
          color: #6b7280;
          border-color: #d1d5db;
        }

        .modal-button:hover:not(.processing) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .modal-button.danger {
          background: #ef4444;
          color: white;
        }

        .modal-button.danger:hover {
          background: #dc2626;
        }

        /* NEW: Confirmation modal styles */
        .confirm-modal {
          max-width: 450px;
        }

        .confirm-content {
          padding: 20px 0;
        }

        .confirm-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: #fef3c7;
        }

        .confirm-message {
          text-align: center;
          margin-bottom: 20px;
        }

        .confirm-message h3 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
        }

        .confirm-message p {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .confirm-details {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin-top: 16px;
        }

        .confirm-details h4 {
          margin: 0 0 12px 0;
          color: #1e40af;
          font-size: 14px;
          font-weight: 600;
        }

        .confirm-details ul {
          margin: 0;
          padding-left: 20px;
          color: #1e40af;
          font-size: 13px;
        }

        .confirm-details li {
          margin-bottom: 6px;
          line-height: 1.5;
        }

        .confirm-details li:last-child {
          margin-bottom: 0;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .badge-status {
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .badge-status.processing {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .badge-status.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }

        .badge-status.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #ef4444;
        }

        @media (max-width: 768px) {
          .admin-donation-management {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .controls-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: unset;
          }

          .tab-buttons {
            width: 100%;
            justify-content: space-between;
          }

          .table-container {
            font-size: 14px;
          }

          .target-cell {
            max-width: 150px;
          }

          th, td {
            padding: 8px 12px;
          }
        }
      `}</style>

      <div className="page-header">
        <h1>Donation Management</h1>
        <p>Manage donations, send reminders, and track completion status</p>
        
        {referenceDataLoading ? (
          <div className="reference-status loading">
            <RefreshCw size={14} className="spin" />
            Loading reference data...
          </div>
        ) : (
          <div className="reference-status loaded">
            <CheckCircle size={14} />
            Loaded {countries.length} countries, {projects.length} projects
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <DollarSign size={20} color="#0a451c" />
            <h3>Total Donations</h3>
          </div>
          <p className="stat-value">
            {formatAmount(statistics.total_amount || 0)}
          </p>
        </div>

        <div className="stat-card secondary">
          <div className="stat-header">
            <TrendingUp size={20} color="#facf3c" />
            <h3>Total Count</h3>
          </div>
          <p className="stat-value">
            {statistics.total_donations || 0}
          </p>
        </div>

        <div className="stat-card accent">
          <div className="stat-header">
            <Users size={20} color="#9ccf9f" />
            <h3>Average Donation</h3>
          </div>
          <p className="stat-value">
            {formatAmount(statistics.average_amount || 0)}
          </p>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <Gift size={20} color="#3b82f6" />
            <h3>Anonymous</h3>
          </div>
          <p className="stat-value">
            {statistics.anonymous_donations?.total_count || 0}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="controls-row">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, donation ID, or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
          </div>

          <button className="refresh-button" onClick={fetchDonations}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="donations-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Target</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="loading-state">
                      <RefreshCw size={24} className="spin" />
                      <span>Loading donations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <h3>No donations found</h3>
                      <p>No donations match your current filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td>
                      <div className="donor-info">
                        <span className="donor-name">
                          {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                        </span>
                        <span className="donor-email">{donation.donor_email}</span>
                      </div>
                    </td>
                    <td className="amount-cell">
                      {formatAmount(donation.amount)}
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {donation.donation_type}
                      </span>
                    </td>
                    <td className="target-cell">
                      <div className="target-name">
                        {getTargetDisplayName(donation)}
                      </div>
                      <div className="target-type">
                        {donation.donation_type === 'general' ? 'General Fund' : 
                         donation.donation_type === 'country' ? 'Country-specific' : 
                         'Project-specific'}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(donation.status, donation.payment_status)}
                    </td>
                    <td>
                      {formatDate(donation.created_at)}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-button view"
                          onClick={() => setSelectedDonation(donation)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {donation.status !== 'completed' && (
                          <>
                            <button
                              className={`action-button complete ${processingBadge ? 'processing' : ''}`}
                              onClick={() => handleMarkCompleteClick(donation.id)}
                              disabled={processingBadge}
                              title="Mark Complete"
                            >
                              <CheckCircle size={16} />
                            </button>

                            <button
                              className="action-button remind"
                              onClick={() => {
                                setSelectedDonation(donation);
                                setShowReminderModal(true);
                              }}
                              title="Send Reminder"
                            >
                              <Mail size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW: Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Completion</h2>
              <button
                className="close-button"
                onClick={() => setShowConfirmModal(false)}
              ></button>
              <X size={20} />
            </div>

            <div className="confirm-content">
              <div className="confirm-icon">
                <AlertCircle size={32} color="#f59e0b" />
              </div>

              <div className="confirm-message">
                <h3>Complete Donation & Send Badge?</h3>
                <p>
                  By marking this donation as complete, the following actions will be automatically performed:
                </p>
              </div>

              <div className="confirm-details">
                <h4>What will happen:</h4>
                <ul>
                  <li>Donation status will be updated to "Completed"</li>
                  <li>A personalized donor badge will be generated</li>
                  <li>A completion email with the badge will be sent to the donor</li>
                  <li>The donor will receive a thank you message</li>
                </ul>
              </div>

              {pendingCompletionId && donations.find(d => d.id === pendingCompletionId) && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    Donor Email:
                  </div>
                  <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                    {donations.find(d => d.id === pendingCompletionId).donor_email}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="modal-button primary"
                onClick={confirmMarkCompleted}
              >
                <CheckCircle size={16} />
                Yes, Complete & Send Badge
              </button>
              <button
                className="modal-button secondary"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingCompletionId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      {selectedDonation && !showReminderModal && (
        <div className="modal-overlay" onClick={() => setSelectedDonation(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Donation Details</h2>
              <button
                className="close-button"
                onClick={() => setSelectedDonation(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Donation ID</label>
                <input value={selectedDonation.id} readOnly />
              </div>

              <div className="form-group">
                <label>Donor Name</label>
                <input
                  value={selectedDonation.is_anonymous ? 'Anonymous' : selectedDonation.donor_name}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input value={selectedDonation.donor_email} readOnly />
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input value={formatAmount(selectedDonation.amount)} readOnly />
              </div>

              <div className="form-group">
                <label>Donation Type</label>
                <input 
                  value={selectedDonation.donation_type} 
                  style={{ textTransform: 'capitalize' }}
                  readOnly 
                />
              </div>

              <div className="target-info-section">
                <h4>Target Information</h4>
                {(() => {
                  const targetInfo = getDetailedTargetInfo(selectedDonation);
                  return (
                    <>
                      <div className="target-detail">
                        <span className="target-label">Type:</span>
                        <span className="target-value">{targetInfo.type}</span>
                      </div>
                      <div className="target-detail">
                        <span className="target-label">Target:</span>
                        <span className="target-value">{targetInfo.name}</span>
                      </div>
                      {targetInfo.id && (
                        <div className="target-detail">
                          <span className="target-label">ID:</span>
                          <span className="target-value">{targetInfo.id}</span>
                        </div>
                      )}
                      {targetInfo.country && (
                        <div className="target-detail">
                          <span className="target-label">Country:</span>
                          <span className="target-value">{targetInfo.country}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="form-group">
                <label>Status</label>
                <input value={`${selectedDonation.status} / ${selectedDonation.payment_status}`} readOnly />
              </div>

              <div className="form-group">
                <label>Created Date</label>
                <input value={formatDate(selectedDonation.created_at)} readOnly />
              </div>

              {selectedDonation.admin_notes && (
                <div className="form-group">
                  <label>Admin Notes</label>
                  <textarea value={selectedDonation.admin_notes} readOnly />
                </div>
              )}
            </div>

            {selectedDonation.status !== 'completed' && (
              <div className="modal-actions">
                <button
                  className="modal-button primary"
                  onClick={() => {
                    handleMarkCompleteClick(selectedDonation.id);
                    setSelectedDonation(null);
                  }}
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </button>
                <button
                  className="modal-button secondary"
                  onClick={() => {
                    setShowReminderModal(true);
                  }}
                >
                  <Mail size={16} />
                  Send Reminder
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && selectedDonation && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Reminder</h2>
              <button
                className="close-button"
                onClick={() => setShowReminderModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Donor Information</label>
                <input 
                  value={`${selectedDonation.donor_name} (${selectedDonation.donor_email})`} 
                  readOnly 
                  style={{ background: '#f9fafb', color: '#6b7280' }}
                />
              </div>

              <div className="form-group">
                <label>Donation Details</label>
                <input 
                  value={`${formatAmount(selectedDonation.amount)} - ${selectedDonation.donation_type} donation`} 
                  readOnly 
                  style={{ background: '#f9fafb', color: '#6b7280' }}
                />
              </div>

              <div className="form-group">
                <label>Reminder Type *</label>
                <select
                  value={reminderForm.type}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="payment_pending">Payment Pending</option>
                  <option value="completion_reminder">Completion Status Update</option>
                  <option value="thank_you_follow">Thank You Follow-up</option>
                </select>
              </div>

              <div className="form-group">
                <label>Personal Message (Optional)</label>
                <textarea
                  placeholder="Add a personal message to include in the reminder email..."
                  value={reminderForm.message}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  maxLength={500}
                />
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  {reminderForm.message.length}/500 characters
                </small>
              </div>

              <div style={{ 
                background: '#f0f9ff', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #bae6fd',
                marginTop: '16px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '14px' }}>
                  Email Preview:
                </h4>
                <p style={{ margin: '0', fontSize: '13px', color: '#0c4a6e' }}>
                  {reminderForm.type === 'payment_pending' && 'Payment reminder will be sent to complete the pending donation.'}
                  {reminderForm.type === 'completion_reminder' && 'Status update will be sent about donation processing.'}
                  {reminderForm.type === 'thank_you_follow' && 'Follow-up message will be sent with impact information.'}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-button primary"
                onClick={sendReminder}
                disabled={!reminderForm.type}
              >
                <Send size={16} />
                Send Email Reminder
              </button>
              <button
                className="modal-button secondary"
                onClick={() => setShowReminderModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonationManagement;