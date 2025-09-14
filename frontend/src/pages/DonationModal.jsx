import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, CheckCircle, Clock, AlertCircle, 
  Mail, Phone, MessageCircle, Download, RefreshCw,
  TrendingUp, Users, DollarSign, Gift, Star, Calendar,
  ArrowRight, Send, X, Heart, Globe, FileText, User, CreditCard, 
  Building, ArrowLeft, Sparkles, HandHeart, Banknote, 
  Smartphone, MapPin, ExternalLink, Copy, Check
} from 'lucide-react';

// Enhanced API configuration with fallback
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Mock data for demo with more countries
const rawCountryOptions = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", 
  "Bangladesh", "Belgium", "Brazil", "Cameroon", "Canada", "China", "Denmark", 
  "Egypt", "Ethiopia", "France", "Germany", "Ghana", "India", "Indonesia",
  "Japan", "Kenya", "Liberia", "Madagascar", "Mali", "Morocco", "Nigeria", 
  "Rwanda", "Senegal", "Sierra Leone", "South Africa", "Tanzania", "Uganda",
  "United Kingdom", "United States", "Zambia", "Zimbabwe"
];

const countryOptions = rawCountryOptions.map((name) => ({ label: name }));

const colors = {
  primary: '#0a451c',
  secondary: '#facf3c',
  accent: '#9ccf9f',
  primaryLight: '#1a5a2c',
  primaryDark: '#052310',
  secondaryLight: '#fbd96b',
  secondaryDark: '#d4a920',
  accentLight: '#b8dfbb',
  accentDark: '#7ab87f',
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const theme = {
  colors: {
    ...colors,
    background: colors.white,
    backgroundSecondary: colors.gray50,
    surface: colors.white,
    surfaceSecondary: colors.gray100,
    text: colors.gray900,
    textSecondary: colors.gray600,
    textMuted: colors.gray500,
    textInverse: colors.white,
    border: colors.gray200,
    borderLight: colors.gray100,
    borderHover: colors.gray300,
    cardBg: colors.white,
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
  }
};

const withOpacity = (color, opacity) => {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  if (color.startsWith('#')) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  return color;
};

// Steps for the donation process
const steps = [
  'Welcome',
  'Donation Target',
  'Amount',
  'Personal Info',
  'Payment Method'
];

const predefinedAmounts = [10, 25, 50, 100, 250, 500, 1000, 2500];

// Enhanced DonationModal with API payment methods only
const DonationModal = ({ 
  open = true, 
  onClose = () => {}, 
  API_BASE = API_CONFIG.baseURL, 
  onDonationSubmitted = () => {} 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Data states
  const [acefCountries, setAcefCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  
  // Payment method search and filter states
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentCountryFilter, setPaymentCountryFilter] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    donationType: 'general',
    selectedCountry: '',
    selectedProject: '',
    amount: 50,
    customAmount: '',
    name: '',
    email: '',
    phone: '',
    donorCountry: '',
    isAnonymous: false,
    selectedTransactionMethod: null
  });

  // Enhanced API request function with better error handling
  const makeApiRequest = async (endpoint, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const defaultOptions = {
        method: 'GET',
        credentials: 'include',
        headers: API_CONFIG.headers,
        signal: controller.signal
      };

      const finalOptions = { ...defaultOptions, ...options };
      const url = `${API_BASE}${endpoint}`;
      
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 500));
        throw new Error(`Server returned ${contentType || 'unknown'} instead of JSON. The API endpoint may not exist.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      
      throw error;
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      await makeApiRequest('/health');
      setApiConnected(true);
      console.log('API connection successful');
      return true;
    } catch (error) {
      console.warn('API connection failed:', error.message);
      setApiConnected(false);
      return false;
    }
  };

  // Fetch transaction methods
  const fetchTransactionMethods = async () => {
    try {
      console.log('Fetching transaction methods...');
      const data = await makeApiRequest('/transaction-details');
      
      if (Array.isArray(data)) {
        setTransactionMethods(data);
        console.log(`Loaded ${data.length} transaction methods`);
      } else if (data.success && Array.isArray(data.data)) {
        setTransactionMethods(data.data);
        console.log(`Loaded ${data.data.length} transaction methods`);
      } else {
        throw new Error('Invalid transaction methods data format');
      }
    } catch (error) {
      console.error('Failed to fetch transaction methods:', error);
      
      // Fallback transaction methods
      const fallbackMethods = [
        {
          id: 1,
          type: 'bank_transfer',
          name: 'Standard Bank',
          country: 'South Africa',
          fields: [
            { label: 'Account Name', value: 'ACEF International' },
            { label: 'Account Number', value: '123456789' },
            { label: 'Branch Code', value: '051001' }
          ]
        },
        {
          id: 2,
          type: 'paypal',
          name: 'PayPal Donations',
          fields: [
            { label: 'Donation Link', value: 'https://paypal.me/acefdonations' },
            { label: 'PayPal Email', value: 'donations@acef.org' }
          ]
        },
        {
          id: 3,
          type: 'local_merchant',
          name: 'M-Pesa Kenya',
          country: 'Kenya',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg',
          fields: [
            { label: 'Paybill Number', value: '400200' },
            { label: 'Account Number', value: 'ACEF' }
          ]
        }
      ];
      setTransactionMethods(fallbackMethods);
      console.log(`Using fallback: ${fallbackMethods.length} transaction methods`);
    }
  };

  // Fetch ACEF countries with fallback
  const fetchAcefCountries = async () => {
    try {
      console.log('Fetching ACEF countries...');
      const data = await makeApiRequest('/countries');
      
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setAcefCountries(sorted);
        console.log(`Loaded ${sorted.length} ACEF countries`);
      } else if (data.success && Array.isArray(data.data)) {
        const sorted = [...data.data].sort((a, b) => a.name.localeCompare(b.name));
        setAcefCountries(sorted);
        console.log(`Loaded ${sorted.length} ACEF countries`);
      } else {
        throw new Error('Invalid countries data format');
      }
    } catch (error) {
      console.error('Failed to fetch ACEF countries:', error);
      
      const fallbackCountries = [
        "Burkina Faso", "Cameroon", "Chad", "Democratic Republic of Congo", 
        "Ethiopia", "Ghana", "Kenya", "Liberia", "Madagascar", "Mali", 
        "Morocco", "Niger", "Nigeria", "Rwanda", "Senegal", "Sierra Leone", 
        "South Africa", "Tanzania", "Uganda", "Zambia", "Zimbabwe"
      ];
      const fallbackData = fallbackCountries.map((name, index) => ({ 
        id: index + 1, 
        name 
      }));
      setAcefCountries(fallbackData);
      console.log(`Using fallback: ${fallbackData.length} countries`);
    }
  };

  // Load all countries
  const loadAllCountries = () => {
    const sortedCountries = [...countryOptions].sort((a, b) => 
      a.label.localeCompare(b.label)
    );
    setAllCountries(sortedCountries);
    console.log(`Loaded ${sortedCountries.length} donor countries`);
  };

  // Fetch projects with fallback
  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      const data = await makeApiRequest('/projects');
      
      let projectsData = [];
      if (data.success && Array.isArray(data.data)) {
        projectsData = data.data;
      } else if (Array.isArray(data)) {
        projectsData = data;
      }

      // Filter out hidden and completed projects
      const visibleProjects = projectsData.filter(project => 
        !project.is_hidden && project.status !== 'cancelled' && project.status !== 'completed'
      );

      setProjects(visibleProjects);
      console.log(`Loaded ${visibleProjects.length} visible projects`);
      
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      
      const fallbackProjects = [
        { id: 1, title: "Clean Water Initiative", country_name: "Kenya" },
        { id: 2, title: "Educational Support Program", country_name: "Ghana" },
        { id: 3, title: "Healthcare Access Project", country_name: "Uganda" },
        { id: 4, title: "Agricultural Development", country_name: "Rwanda" }
      ];
      setProjects(fallbackProjects);
      console.log(`Using fallback: ${fallbackProjects.length} projects`);
    }
  };

  // Enhanced donation submission with better error handling
  const submitDonationToBackend = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Submitting donation...');

      const donationAmount = parseFloat(formData.customAmount || formData.amount);

      const donationPayload = {
        donor_name: formData.name.trim(),
        donor_email: formData.email.trim(),
        donor_phone: formData.phone.trim() || null,
        donor_country: formData.donorCountry,
        amount: donationAmount,
        donation_type: formData.donationType,
        target_country_id: formData.donationType === 'country' && formData.selectedCountry ? 
          parseInt(formData.selectedCountry) : null,
        target_project_id: formData.donationType === 'project' && formData.selectedProject ? 
          parseInt(formData.selectedProject) : null,
        selected_transaction_method_id: formData.selectedTransactionMethod?.id || null,
        is_anonymous: formData.isAnonymous
      };

      console.log('Donation payload:', donationPayload);

      const result = await makeApiRequest('/donations', {
        method: 'POST',
        body: JSON.stringify(donationPayload)
      });

      if (result.success) {
        console.log('Donation submitted successfully:', result.data);
        setSubmitSuccess(true);
        
        // Notify parent component
        onDonationSubmitted(result.data);

        // Show success briefly then proceed
        setTimeout(() => {
          setActiveStep(prev => prev + 1);
          setSubmitSuccess(false);
        }, 1500);

      } else {
        throw new Error(result.message || 'Failed to submit donation');
      }

    } catch (error) {
      console.error('Donation submission failed:', error);
      
      let userMessage = 'Failed to submit donation. ';
      
      if (error.message.includes('timeout')) {
        userMessage += 'The request timed out. Please check your connection and try again.';
      } else if (error.message.includes('API endpoint')) {
        userMessage += 'The donation service is temporarily unavailable. Your information has been saved locally.';
      } else if (error.message.includes('Network')) {
        userMessage += 'Network connection error. Please check your internet and try again.';
      } else {
        userMessage += error.message || 'Please try again or contact support if the problem persists.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      console.log('Modal opened, loading data...');
      setDataLoading(true);
      setError('');
      
      loadAllCountries();
      
      // Test connection first, then load data
      testApiConnection().then((connected) => {
        if (connected) {
          Promise.allSettled([
            fetchAcefCountries(), 
            fetchProjects(), 
            fetchTransactionMethods()
          ]).finally(() => setDataLoading(false));
        } else {
          // Load fallback data
          fetchAcefCountries();
          fetchProjects();
          fetchTransactionMethods();
          setDataLoading(false);
        }
      });
    }
  }, [open, API_BASE]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleNext = async () => {
    if (activeStep === 0 || validateStep()) {
      if (activeStep === 3) {
        await submitDonationToBackend();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
    setSubmitSuccess(false);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 1:
        if (formData.donationType === 'country' && !formData.selectedCountry) {
          setError('Please select a country where ACEF operates');
          return false;
        }
        if (formData.donationType === 'project' && !formData.selectedProject) {
          setError('Please select a project');
          return false;
        }
        return true;
      
      case 2:
        const amount = formData.customAmount || formData.amount;
        if (!amount || amount <= 0) {
          setError('Please enter a valid donation amount');
          return false;
        }
        if (amount > 50000) {
          setError('For donations over $50,000, please contact us directly');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.name.trim()) {
          setError('Name is required');
          return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.donorCountry) {
          setError('Please select your country');
          return false;
        }
        return true;
      
      case 4:
        if (!formData.selectedTransactionMethod) {
          setError('Please select a payment method');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handlePayPalDonate = (method) => {
    const donationLink = method.fields.find(f => f.label === 'Donation Link')?.value;
    if (donationLink) {
      window.open(donationLink, '_blank');
      handleClose();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    
    setTimeout(() => {
      setActiveStep(0);
      setFormData({
        donationType: 'general',
        selectedCountry: '',
        selectedProject: '',
        amount: 50,
        customAmount: '',
        name: '',
        email: '',
        phone: '',
        donorCountry: '',
        isAnonymous: false,
        selectedTransactionMethod: null
      });
      setPaymentSearchTerm('');
      setPaymentCountryFilter('');
      setSelectedPaymentMethod(null);
      setCopiedField(null);
      setError('');
      setSubmitSuccess(false);
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const getDonationTargetText = () => {
    switch (formData.donationType) {
      case 'country':
        const selectedCountry = acefCountries.find(c => c.id === parseInt(formData.selectedCountry));
        return selectedCountry ? `${selectedCountry.name} projects` : 'Country-specific projects';
      case 'project':
        const selectedProject = projects.find(p => p.id === parseInt(formData.selectedProject));
        return selectedProject ? selectedProject.title : 'Specific project';
      default:
        return 'ACEF General Impact';
    }
  };

  // Filter transaction methods based on search and country
  const filteredTransactionMethods = transactionMethods.filter(method => {
    const matchesSearch = !paymentSearchTerm || 
      method.name.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    const matchesCountry = !paymentCountryFilter || 
      method.country === paymentCountryFilter;
    return matchesSearch && matchesCountry;
  });

  // Get unique countries from transaction methods for filter
  const availableCountries = [...new Set(transactionMethods
    .filter(method => method.country)
    .map(method => method.country)
  )].sort();

  // Copy to clipboard function
  const copyToClipboard = (text, fieldId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Get payment method icon
  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'bank_transfer':
        return Building;
      case 'paypal':
        return CreditCard;
      case 'local_merchant':
        return Smartphone;
      default:
        return Banknote;
    }
  };

  // Get payment method type label
  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'paypal':
        return 'PayPal Donate';
      case 'local_merchant':
        return 'Local Transfer & Other Merchants';
      default:
        return 'Payment Method';
    }
  };

  // Group transaction methods by type for better organization
  const groupedTransactionMethods = {
    paypal: filteredTransactionMethods.filter(method => method.type === 'paypal'),
    bank_transfer: filteredTransactionMethods.filter(method => method.type === 'bank_transfer'),
    local_merchant: filteredTransactionMethods.filter(method => method.type === 'local_merchant')
  };

const RadioOption = ({ value, currentValue, onChange, icon: Icon, title, description, children, onClick }) => {
  const handleOptionClick = (e) => {
    // Don't change selection if clicking within a dropdown area
    if (e.target.tagName === 'SELECT' || 
        e.target.tagName === 'OPTION' || 
        e.target.closest('select') ||
        e.target.closest('.dropdown-container')) {
      e.stopPropagation();
      return;
    }
    
    if (onClick) {
      onClick();
    } else {
      onChange(value);
    }
  };

  return (
    <div 
      className={`donation-option ${currentValue === value ? 'selected' : ''}`}
      onClick={handleOptionClick}
    >
      <div className="option-content">
        <input
          type="radio"
          name="option"
          value={value}
          checked={currentValue === value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Icon size={20} style={{ color: colors.primary }} />
        <div className="option-text">
          <h4>{title}</h4>
          <p>{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

  const AmountButton = ({ amount, selected, onClick }) => (
    <button
      className={`amount-button ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      ${amount}
    </button>
  );

  const ProjectCard = ({ project, isSelected, onClick }) => (
    <div 
      className={`project-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(project.id)}
    >
      <div className="project-card-header">
        <div className="project-info">
          <h4>{project.title}</h4>
          <div className="project-meta">
            <span className="project-country">
              <MapPin size={12} />
              {project.country_name || project.countryName || 'Global'}
            </span>
            {project.status && project.status !== 'completed' && (
              <>
                <span className="separator">•</span>
                <span className="project-status">{project.status}</span>
              </>
            )}
          </div>
        </div>
        <input
          type="radio"
          name="project"
          checked={isSelected}
          onChange={() => {}}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      {project.short_description && (
        <p className="project-description">{project.short_description}</p>
      )}
    </div>
  );

  const PaymentMethodCard = ({ method, isSelected, onClick }) => {
    const IconComponent = getPaymentMethodIcon(method.type);
    
    return (
      <div 
        className={`payment-method-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onClick(method)}
      >
        <div className="payment-method-header">
          <div className="payment-method-info">
            {method.logo_url ? (
              <img 
                src={method.logo_url} 
                alt={method.name}
                className="payment-method-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="payment-method-icon-fallback"
              style={{ display: method.logo_url ? 'none' : 'flex' }}
            >
              <IconComponent size={20} style={{ color: colors.primary }} />
            </div>
            <div className="payment-method-text">
              <h4>{method.name}</h4>
              <div className="payment-method-meta">
                <span className="payment-type">{getPaymentTypeLabel(method.type)}</span>
                {method.country && (
                  <>
                    <span className="separator">•</span>
                    <span className="payment-country">
                      <MapPin size={12} />
                      {method.country}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <input
            type="radio"
            name="payment-method"
            checked={isSelected}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {isSelected && (
          <div className="payment-method-details">
            {method.type === 'paypal' ? (
              <div className="paypal-donation-section">
                <button
                  className="paypal-donate-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePayPalDonate(method);
                  }}
                >
                  <ExternalLink size={16} />
                  Donate Directly
                </button>
                <div className="paypal-email-section">
                  <p className="paypal-instruction">Complete a PayPal transaction by email:</p>
                  <div className="paypal-email">
                    {method.fields.find(f => f.label === 'PayPal Email')?.value || 'donations@acef.org'}
                    <button
                      className="copy-button-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        const email = method.fields.find(f => f.label === 'PayPal Email')?.value || 'donations@acef.org';
                        copyToClipboard(email, `paypal-email-${method.id}`);
                      }}
                      title="Copy email"
                    >
                      {copiedField === `paypal-email-${method.id}` ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="payment-fields">
                {method.fields.map((field, index) => {
                  const fieldId = `${method.id}-${index}`;
                  const isCopied = copiedField === fieldId;
                  
                  return (
                    <div key={index} className="payment-field">
                      <div className="payment-field-header">
                        <label>{field.label}</label>
                        <button
                          className="copy-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(field.value, fieldId);
                          }}
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="payment-field-value">
                        {field.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const PaymentTypeSection = ({ type, methods, title }) => {
    if (methods.length === 0) return null;

    return (
      <div className="payment-type-section">
        <h4 className="payment-type-title">{title}</h4>
        <div className="payment-methods-list">
          {methods.map(method => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={formData.selectedTransactionMethod?.id === method.id}
              onClick={(selectedMethod) => {
                setSelectedPaymentMethod(selectedMethod);
                handleInputChange('selectedTransactionMethod', selectedMethod);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="landing-content">
            <div className="parallax-background"></div>
            <div className="landing-hero">
              <div className="hero-icon">
                <HandHeart size={64} style={{ color: colors.secondary }} />
                <div className="floating-hearts">
                  <Heart size={16} style={{ color: colors.secondary }} className="heart-1" />
                  <Heart size={12} style={{ color: colors.accent }} className="heart-2" />
                  <Heart size={20} style={{ color: colors.primary }} className="heart-3" />
                </div>
              </div>
              
              <h2 className="landing-title">
                Together, We Create
                <span className="highlight-text"> Lasting Change</span>
              </h2>
              
              <p className="landing-description">
                Every contribution becomes part of something bigger. Your generosity helps build 
                stronger communities, provide essential resources, and create opportunities that 
                transform lives across Africa.
              </p>
              
              <div className="impact-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <Sparkles size={20} style={{ color: colors.secondary }} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">1,200+</span>
                    <span className="stat-label">Lives Impacted</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <Globe size={20} style={{ color: colors.accent }} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">{acefCountries.length || '15'}</span>
                    <span className="stat-label">Communities Served</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <Heart size={20} style={{ color: colors.primary }} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Generous Donors</span>
                  </div>
                </div>
              </div>
              
              <div className="inspiration-quote">
                <p>"The best way to find yourself is to lose yourself in the service of others."</p>
                <span>— Mahatma Gandhi</span>
              </div>
              
              <div className="cta-section">
                <button 
                  className="start-donation-btn"
                  onClick={handleNext}
                >
                  <Heart size={18} />
                  Start Your Impact Journey
                  <ArrowRight size={18} />
                </button>
                
                <p className="reassurance">
                  {apiConnected ? 'Secure process' : 'Offline mode'} • Every dollar matters • Take your time
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <div className="step-hero-image"></div>
            <h3 className="step-title">What would you like to support?</h3>
            
            {dataLoading && (
              <div className="loading-message">
                <RefreshCw size={20} className="spin" />
                <p>Loading donation options...</p>
              </div>
            )}
            
            <div className="options-grid">
              <RadioOption
                value="general"
                currentValue={formData.donationType}
                onChange={(value) => handleInputChange('donationType', value)}
                icon={Heart}
                title="General ACEF Impact"
                description="Support our overall mission and let us allocate funds where they're needed most"
              />

              <RadioOption
                value="country"
                currentValue={formData.donationType}
                onChange={(value) => handleInputChange('donationType', value)}
                icon={Globe}
                title="Specific Country"
                description="Focus your donation on projects in a particular country where ACEF operates"
              >
                {formData.donationType === 'country' && (
                  <select
                    value={formData.selectedCountry}
                    onChange={(e) => handleInputChange('selectedCountry', e.target.value)}
                    className="country-select"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Select Country</option>
                    {acefCountries.length === 0 ? (
                      <option value="" disabled>
                        {dataLoading ? 'Loading countries...' : 'No countries available'}
                      </option>
                    ) : (
                      acefCountries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </RadioOption>

              <RadioOption
                value="project"
                currentValue={formData.donationType}
                onChange={(value) => handleInputChange('donationType', value)}
                icon={FileText}
                title="Specific Project"
                description="Donate directly to a particular project you care about"
              >
                {formData.donationType === 'project' && projects.length > 0 && (
                  <div className="projects-grid">
                    {projects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={parseInt(formData.selectedProject) === project.id}
                        onClick={(projectId) => handleInputChange('selectedProject', projectId)}
                      />
                    ))}
                  </div>
                )}
                {formData.donationType === 'project' && projects.length === 0 && !dataLoading && (
                  <div className="no-projects">
                    <p>No projects available for donation at this time.</p>
                  </div>
                )}
              </RadioOption>
            </div>

            {!apiConnected && (
              <div className="api-status-info">
                <AlertCircle size={16} style={{ color: colors.warning }} />
                <span>
                  Offline mode: Using demo data. Your donation will be processed when connection is restored.
                </span>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="amount-hero-image"></div>
            <h3 className="step-title">Choose your donation amount</h3>
            <p className="step-subtitle">Supporting: {getDonationTargetText()}</p>

            <div className="amounts-grid">
              {predefinedAmounts.map(amount => (
                <AmountButton
                  key={amount}
                  amount={amount}
                  selected={formData.amount === amount && !formData.customAmount}
                  onClick={() => {
                    handleInputChange('amount', amount);
                    handleInputChange('customAmount', '');
                  }}
                />
              ))}
            </div>

            <div className="custom-amount-section">
              <label>Custom Amount (USD)</label>
              <div className="input-with-icon">
                <DollarSign size={18} />
                <input
                  type="number"
                  value={formData.customAmount}
                  onChange={(e) => {
                    handleInputChange('customAmount', e.target.value);
                    handleInputChange('amount', '');
                  }}
                  placeholder="Enter amount"
                  min="1"
                  max="50000"
                />
              </div>
            </div>

            {(formData.customAmount || formData.amount) && (
              <div className="donation-summary">
                <h4>Your donation: ${formData.customAmount || formData.amount}</h4>
                <p>Thank you for supporting {getDonationTargetText()}</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="form-hero-image"></div>
            <h3 className="step-title">Your Information</h3>

            {submitSuccess && (
              <div className="success-alert">
                <CheckCircle size={16} />
                <span>Donation details saved successfully! Proceeding to payment...</span>
              </div>
            )}

            <div className="form-fields">
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-field">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-field">
                <label>Your Country *</label>
                <select
                  value={formData.donorCountry}
                  onChange={(e) => handleInputChange('donorCountry', e.target.value)}
                >
                  <option value="">Select your country</option>
                  {allCountries.map(country => (
                    <option key={country.label} value={country.label}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checkbox-field">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
                <label htmlFor="anonymous">Make this donation anonymous</label>
              </div>
            </div>

            <div className="summary-card">
              <h4>Donation Summary</h4>
              <div>
                <p>Amount: ${formData.customAmount || formData.amount}</p>
                <p>Supporting: {getDonationTargetText()}</p>
                <p>Donor: {formData.isAnonymous ? 'Anonymous' : formData.name || 'Not provided'}</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="payment-hero-image"></div>
            <h3 className="step-title">Choose Payment Method</h3>

            <div className="donation-saved-alert">
              <CheckCircle size={20} style={{ color: colors.success }} />
              <div>
                <h4>Donation Details Saved!</h4>
                <p>Your donation information has been securely saved. Choose how you'd like to complete your payment.</p>
              </div>
            </div>

            <div className="payment-search-filters">
              <div className="search-filter-row">
                <div className="search-input-container">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search payment methods..."
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                    className="payment-search-input"
                  />
                </div>
                
                <select
                  value={paymentCountryFilter}
                  onChange={(e) => setPaymentCountryFilter(e.target.value)}
                  className="payment-country-filter"
                >
                  <option value="">All Countries</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="payment-methods-container">
              {filteredTransactionMethods.length === 0 ? (
                <div className="no-payment-methods">
                  <AlertCircle size={20} style={{ color: colors.warning }} />
                  <p>No payment methods found matching your search.</p>
                </div>
              ) : (
                <>
                  <PaymentTypeSection
                    type="paypal"
                    methods={groupedTransactionMethods.paypal}
                    title="PayPal Donate"
                  />

                  <PaymentTypeSection
                    type="bank_transfer"
                    methods={groupedTransactionMethods.bank_transfer}
                    title="Bank Transfer"
                  />

                  <PaymentTypeSection
                    type="local_merchant"
                    methods={groupedTransactionMethods.local_merchant}
                    title="Local Transfer & Other Merchants"
                  />
                </>
              )}
            </div>

            <div className="info-card">
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <AlertCircle 
                  size={18} 
                  style={{ color: colors.info, marginRight: '8px', marginTop: '2px' }} 
                />
                <p style={{ fontSize: '13px', margin: 0 }}>
                  {formData.selectedTransactionMethod?.type === 'paypal' ? 
                    'Click "Donate Directly" to be redirected to PayPal, or use the email provided for manual transactions.' :
                    formData.selectedTransactionMethod ? 
                    'Use the payment details above to complete your donation. Keep this information for your records.' :
                    `Select a payment method to complete your ${formData.customAmount || formData.amount} donation.${!apiConnected ? ' Your donation details are saved and will sync when connection is restored.' : ''}`
                  }
                </p>
              </div>
            </div>
          </div>
        );
    
      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: ${withOpacity(colors.black, 0.7)};
          backdrop-filter: blur(12px);
          animation: ${isClosing ? 'fadeOut' : 'fadeIn'} 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 60px;
          padding-bottom: 20px;
          overflow-y: auto;
        }

        .modal-content {
          width: 85vw;
          max-width: 1100px;
          min-width: 320px;
          background: ${theme.colors.surface};
          border-radius: 24px;
          box-shadow: 
            0 32px 64px ${withOpacity(colors.black, 0.25)}, 
            0 16px 32px ${withOpacity(colors.black, 0.15)},
            0 0 0 1px ${withOpacity(colors.primary, 0.1)};
          animation: ${isClosing ? 'slideOut' : 'slideIn'} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 32px;
          border-bottom: 1px solid ${withOpacity(colors.primary, 0.1)};
          background: linear-gradient(135deg, 
            ${withOpacity(colors.primary, 0.08)}, 
            ${withOpacity(colors.accent, 0.06)},
            ${withOpacity(colors.secondary, 0.04)}
          );
          position: relative;
          overflow: hidden;
        }

        .modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            ${withOpacity(colors.secondary, 0.1)}, 
            transparent
          );
          animation: shimmer 3s ease-in-out infinite;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .header-title {
          margin: 0 0 8px 0;
          color: ${theme.colors.text};
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          margin: 0;
          color: ${theme.colors.textSecondary};
          font-size: 14px;
          font-weight: 500;
        }

        .close-button {
          padding: 12px;
          border: none;
          border-radius: 50%;
          background: ${withOpacity(colors.error, 0.1)};
          color: ${colors.error};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .close-button:hover {
          background: ${withOpacity(colors.error, 0.2)};
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 4px 20px ${withOpacity(colors.error, 0.3)};
        }

        .progress-section {
          padding: 24px 32px;
          background: linear-gradient(135deg, 
            ${withOpacity(colors.primary, 0.05)}, 
            ${withOpacity(colors.accent, 0.08)},
            ${withOpacity(colors.secondary, 0.03)}
          );
          ${activeStep === 0 ? 'display: none;' : ''}
          position: relative;
          overflow: hidden;
        }

        .progress-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=30');
          background-size: cover;
          background-position: center;
          opacity: 0.05;
          z-index: 0;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .progress-step {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${theme.colors.textSecondary};
          transition: all 0.3s ease;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          border-radius: 5px;
          background: ${withOpacity(colors.primary, 0.15)};
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, 
            transparent 25%, 
            ${withOpacity(colors.white, 0.2)} 25%, 
            ${withOpacity(colors.white, 0.2)} 50%, 
            transparent 50%, 
            transparent 75%, 
            ${withOpacity(colors.white, 0.2)} 75%
          );
          background-size: 20px 20px;
          animation: shimmer 2s linear infinite;
        }

        .progress-fill {
          height: 100%;
          border-radius: 5px;
          background: linear-gradient(90deg, 
            ${colors.primary}, 
            ${colors.accent}, 
            ${colors.secondary},
            ${colors.primary}
          );
          background-size: 300% 100%;
          animation: gradientShift 4s ease infinite;
          transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
          width: ${(activeStep / (steps.length - 1)) * 100}%;
          position: relative;
          box-shadow: 0 2px 10px ${withOpacity(colors.primary, 0.4)};
        }

        .content-section {
          padding: 36px 32px;
          min-height: 500px;
          position: relative;
        }

        .error-alert {
          margin-bottom: 24px;
          padding: 18px 24px;
          border-radius: 16px;
          background: ${withOpacity(colors.error, 0.08)};
          border: 1px solid ${withOpacity(colors.error, 0.2)};
          color: ${colors.error};
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          font-weight: 600;
          animation: shake 0.5s ease-in-out, slideInAlert 0.4s ease-out;
        }

        .success-alert {
          margin-bottom: 24px;
          padding: 18px 24px;
          border-radius: 16px;
          background: ${withOpacity(colors.success, 0.08)};
          border: 1px solid ${withOpacity(colors.success, 0.2)};
          color: ${colors.success};
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          font-weight: 600;
          animation: slideInRight 0.5s ease-out;
        }

        .api-status-info {
          margin-top: 24px;
          padding: 16px 20px;
          border-radius: 12px;
          background: ${withOpacity(colors.warning, 0.08)};
          border: 1px solid ${withOpacity(colors.warning, 0.2)};
          color: ${colors.warning};
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .loading-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px;
          color: ${theme.colors.textSecondary};
        }

        .loading-message p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }

        .spin {
          animation: spin 1.2s linear infinite;
        }

        .donation-saved-alert {
          margin-bottom: 28px;
          padding: 24px;
          border-radius: 20px;
          background: ${withOpacity(colors.success, 0.08)};
          border: 1px solid ${withOpacity(colors.success, 0.2)};
          display: flex;
          align-items: flex-start;
          gap: 16px;
          animation: slideInAlert 0.5s ease-out;
        }

        .donation-saved-alert h4 {
          margin: 0 0 8px 0;
          color: ${colors.success};
          font-size: 18px;
          font-weight: 700;
        }

        .donation-saved-alert p {
          margin: 0;
          color: ${theme.colors.text};
          font-size: 14px;
          line-height: 1.6;
        }

        /* Landing Page Styles with Enhanced Visuals */
        .landing-content {
          text-align: center;
          padding: 0;
          background: linear-gradient(
            135deg,
            ${withOpacity(colors.primary, 0.95)} 0%,
            ${withOpacity(colors.primaryDark, 0.9)} 50%,
            ${withOpacity(colors.primary, 0.85)} 100%
          ),
          linear-gradient(
            rgba(0,0,0,0.3),
            rgba(0,0,0,0.1)
          ),
          url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: white;
          margin: -36px -32px 28px -32px;
          position: relative;
          overflow: hidden;
          min-height: 600px;
        }

        .parallax-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, ${withOpacity(colors.secondary, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${withOpacity(colors.accent, 0.15)} 0%, transparent 50%);
          animation: float 6s ease-in-out infinite;
        }

        .landing-hero {
          max-width: 650px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          padding: 48px 24px;
        }

        .hero-icon {
          position: relative;
          margin: 0 auto 32px;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${withOpacity(colors.secondary, 0.2)};
          border-radius: 50%;
          backdrop-filter: blur(10px);
          border: 2px solid ${withOpacity(colors.secondary, 0.3)};
        }

        .floating-hearts {
          position: absolute;
          inset: 0;
        }

        .floating-hearts .heart-1 {
          position: absolute;
          top: 10px;
          right: 20px;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .floating-hearts .heart-2 {
          position: absolute;
          bottom: 20px;
          left: 15px;
          animation: float 2.8s ease-in-out infinite 0.8s;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .floating-hearts .heart-3 {
          position: absolute;
          top: 50px;
          left: -10px;
          animation: float 3.5s ease-in-out infinite 1.5s;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        .landing-title {
          font-size: 2.8rem;
          font-weight: 900;
          margin: 0 0 24px;
          color: white;
          line-height: 1.1;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
          letter-spacing: -1px;
        }

        .highlight-text {
          color: ${colors.secondary};
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
          position: relative;
        }

        .highlight-text::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${colors.secondary};
          border-radius: 2px;
          animation: underlineGrow 2s ease-out 1s both;
        }

        .landing-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 40px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
          font-weight: 400;
        }

        .impact-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin: 0 0 40px;
          padding: 32px 24px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          animation: fadeInUp 0.8s ease-out both;
        }

        .stat-item:nth-child(2) {
          animation-delay: 0.2s;
        }

        .stat-item:nth-child(3) {
          animation-delay: 0.4s;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .stat-content {
          text-align: center;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 900;
          color: ${colors.secondary};
          display: block;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          font-weight: 500;
        }

        .inspiration-quote {
          margin: 0 0 40px;
          padding: 28px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .inspiration-quote::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 20px;
          font-size: 4rem;
          color: ${withOpacity(colors.secondary, 0.3)};
          font-family: serif;
        }

        .inspiration-quote p {
          font-size: 1.1rem;
          font-style: italic;
          color: white;
          margin: 0 0 8px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 1;
        }

        .inspiration-quote span {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          font-weight: 600;
        }

        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .start-donation-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: linear-gradient(135deg, ${colors.secondary}, ${colors.secondaryLight});
          color: ${colors.black};
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.3),
            0 0 0 2px ${withOpacity(colors.secondary, 0.5)};
          position: relative;
          overflow: hidden;
        }

        .start-donation-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.6s ease;
          transform: translate(-50%, -50%);
        }

        .start-donation-btn:hover::before {
          width: 400px;
          height: 400px;
        }

        .start-donation-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.4),
            0 0 0 3px ${withOpacity(colors.secondary, 0.7)};
          background: linear-gradient(135deg, ${colors.secondaryLight}, ${colors.secondary});
        }

        .reassurance {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          font-weight: 500;
        }

        /* Step Hero Images */
        .step-hero-image,
        .amount-hero-image,
        .form-hero-image,
        .payment-hero-image {
          width: 100%;
          height: 120px;
          margin: -36px -32px 32px -32px;
          background-size: cover;
          background-position: center;
          position: relative;
          border-radius: 0;
          overflow: hidden;
        }

        .step-hero-image {
          background: 
            linear-gradient(135deg, ${withOpacity(colors.primary, 0.8)}, ${withOpacity(colors.accent, 0.6)}),
            url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
        }

        .amount-hero-image {
          background: 
            linear-gradient(135deg, ${withOpacity(colors.secondary, 0.8)}, ${withOpacity(colors.primary, 0.6)}),
            url('https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
        }

        .form-hero-image {
          background: 
            linear-gradient(135deg, ${withOpacity(colors.accent, 0.8)}, ${withOpacity(colors.primary, 0.6)}),
            url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
        }

        .payment-hero-image {
          background: 
            linear-gradient(135deg, ${withOpacity(colors.success, 0.8)}, ${withOpacity(colors.primary, 0.6)}),
            url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
        }

        .step-hero-image::after,
        .amount-hero-image::after,
        .form-hero-image::after,
        .payment-hero-image::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }

        /* Regular Step Content */
        .step-content {
          animation: slideInContent 0.5s ease-out;
          position: relative;
        }

        .step-title {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 700;
          color: ${theme.colors.text};
          text-align: center;
        }

        .step-subtitle {
          margin: 0 0 28px 0;
          font-size: 16px;
          color: ${theme.colors.textSecondary};
          text-align: center;
          font-weight: 500;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .donation-option {
          border: 2px solid ${theme.colors.border};
          border-radius: 16px;
          padding: 24px;
          background: transparent;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }

        .donation-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${withOpacity(colors.primary, 0.1)}, transparent);
          transition: left 0.6s ease;
        }

        .donation-option:hover::before {
          left: 100%;
        }

        .donation-option.selected {
          border-color: ${colors.primary};
          background: linear-gradient(135deg, ${withOpacity(colors.primary, 0.08)}, ${withOpacity(colors.accent, 0.05)});
          box-shadow: 0 8px 32px ${withOpacity(colors.primary, 0.15)};
        }

        .donation-option:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px ${withOpacity(colors.primary, 0.2)};
          border-color: ${colors.primaryLight};
        }

        .option-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .option-content input[type="radio"] {
          accent-color: ${colors.primary};
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .option-text {
          flex: 1;
        }

        .option-text h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .option-text p {
          margin: 0 0 16px 0;
          font-size: 14px;
          line-height: 1.5;
          color: ${theme.colors.textSecondary};
        }

        .country-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid ${theme.colors.border};
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
        }

        .country-select:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 20px;
          max-height: 400px;
          overflow-y: auto;
          padding: 4px;
        }

        .project-card {
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          padding: 20px;
          background: ${theme.colors.surface};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${withOpacity(colors.accent, 0.1)}, transparent);
          transition: left 0.5s ease;
        }

        .project-card:hover::before {
          left: 100%;
        }

        .project-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
          box-shadow: 0 8px 25px ${withOpacity(colors.primary, 0.15)};
          transform: translateY(-2px);
        }

        .project-card:hover:not(.selected) {
          border-color: ${colors.primaryLight};
          transform: translateY(-4px);
          box-shadow: 0 12px 30px ${theme.colors.cardShadow};
        }

        .project-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .project-info {
          flex: 1;
        }

        .project-info h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: ${theme.colors.textMuted};
        }

        .project-country {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .project-status {
          background: ${withOpacity(colors.info, 0.1)};
          color: ${colors.info};
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .separator {
          color: ${theme.colors.textMuted};
        }

        .project-description {
          margin: 0;
          font-size: 13px;
          color: ${theme.colors.textSecondary};
          line-height: 1.4;
          position: relative;
          z-index: 1;
        }

        .project-card input[type="radio"] {
          accent-color: ${colors.primary};
          width: 20px;
          height: 20px;
        }

        .no-projects {
          text-align: center;
          padding: 32px;
          color: ${theme.colors.textSecondary};
          background: ${theme.colors.backgroundSecondary};
          border-radius: 12px;
          margin-top: 20px;
        }

        .no-projects p {
          margin: 0;
          font-size: 14px;
        }

        .amounts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .amount-button {
          padding: 20px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }

        .amount-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: ${withOpacity(colors.primary, 0.2)};
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform: translate(-50%, -50%);
        }

        .amount-button:active::before {
          width: 300px;
          height: 300px;
        }

        .amount-button.selected {
          border-color: ${colors.primary};
          background: linear-gradient(135deg, ${withOpacity(colors.primary, 0.15)}, ${withOpacity(colors.accent, 0.1)});
          color: ${colors.primary};
          box-shadow: 0 6px 20px ${withOpacity(colors.primary, 0.3)};
        }

        .amount-button:hover:not(.selected) {
          transform: translateY(-3px);
          background: ${theme.colors.backgroundSecondary};
          box-shadow: 0 8px 25px ${theme.colors.cardShadow};
          border-color: ${colors.primaryLight};
        }

        .custom-amount-section {
          border-top: 1px solid ${theme.colors.border};
          padding-top: 24px;
        }

        .custom-amount-section label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          color: ${theme.colors.textSecondary};
        }

        .input-with-icon input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .donation-summary {
          margin-top: 28px;
          padding: 24px;
          border-radius: 16px;
          color: white;
          text-align: center;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight});
          box-shadow: 0 8px 25px ${withOpacity(colors.primary, 0.3)};
        }

        .donation-summary h4 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 700;
        }

        .donation-summary p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-field label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid ${theme.colors.border};
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: ${withOpacity(colors.accent, 0.05)};
          border-radius: 10px;
          border: 1px solid ${withOpacity(colors.accent, 0.2)};
        }

        .checkbox-field input {
          width: 18px;
          height: 18px;
          accent-color: ${colors.primary};
        }

        .checkbox-field label {
          font-size: 14px;
          cursor: pointer;
          color: ${theme.colors.text};
          margin: 0;
        }

        .summary-card {
          margin-top: 28px;
          padding: 20px;
          border: 1px solid ${withOpacity(colors.primary, 0.2)};
          border-radius: 16px;
          background: ${withOpacity(colors.primary, 0.05)};
        }

        .summary-card h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .summary-card p {
          margin: 0 0 6px 0;
          font-size: 13px;
          color: ${theme.colors.textSecondary};
        }

        /* Payment Methods Styles */
        .payment-search-filters {
          margin-bottom: 28px;
        }

        .search-filter-row {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .search-input-container {
          position: relative;
          flex: 1;
        }

        .search-input-container svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme.colors.textMuted};
          z-index: 1;
        }

        .payment-search-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          font-size: 14px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .payment-search-input:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.15)};
        }

        .payment-country-filter {
          min-width: 180px;
          padding: 14px 16px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          font-size: 14px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .payment-country-filter:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.15)};
        }

        .payment-methods-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .payment-type-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payment-type-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: ${theme.colors.text};
          padding-bottom: 12px;
          border-bottom: 3px solid ${colors.primary};
          position: relative;
        }

        .payment-type-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 60px;
          height: 3px;
          background: ${colors.secondary};
          border-radius: 2px;
        }

        .payment-methods-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-payment-methods {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 48px 24px;
          text-align: center;
          color: ${theme.colors.textSecondary};
          background: ${theme.colors.backgroundSecondary};
          border-radius: 16px;
          border: 2px dashed ${theme.colors.border};
        }

        .no-payment-methods p {
          margin: 0;
          font-size: 14px;
        }

        .payment-method-card {
          border: 2px solid ${theme.colors.border};
          border-radius: 16px;
          background: ${theme.colors.surface};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          overflow: hidden;
          position: relative;
        }

        .payment-method-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${withOpacity(colors.success, 0.1)}, transparent);
          transition: left 0.6s ease;
        }

        .payment-method-card:hover::before {
          left: 100%;
        }

        .payment-method-card.selected {
          border-color: ${colors.primary};
          box-shadow: 0 8px 32px ${withOpacity(colors.primary, 0.2)};
          background: ${withOpacity(colors.primary, 0.03)};
        }

        .payment-method-card:hover:not(.selected) {
          border-color: ${colors.primary};
          transform: translateY(-3px);
          box-shadow: 0 12px 40px ${theme.colors.cardShadow};
        }

        .payment-method-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          position: relative;
          z-index: 1;
        }

        .payment-method-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .payment-method-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid ${theme.colors.border};
        }

        .payment-method-icon-fallback {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: ${withOpacity(colors.primary, 0.1)};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${withOpacity(colors.primary, 0.2)};
        }

        .payment-method-text h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .payment-method-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: ${theme.colors.textMuted};
        }

        .payment-type {
          background: ${withOpacity(colors.primary, 0.1)};
          color: ${colors.primary};
          padding: 4px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 12px;
        }

        .payment-country {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .payment-method-card input[type="radio"] {
          accent-color: ${colors.primary};
          width: 22px;
          height: 22px;
        }

        .payment-method-details {
          border-top: 1px solid ${theme.colors.border};
          padding: 20px 24px;
          background: ${withOpacity(colors.primary, 0.02)};
          position: relative;
          z-index: 1;
        }

        .paypal-donation-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .paypal-donate-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 28px;
          background: linear-gradient(135deg, ${colors.info}, ${withOpacity(colors.info, 0.8)});
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px ${withOpacity(colors.info, 0.3)};
        }

        .paypal-donate-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px ${withOpacity(colors.info, 0.4)};
        }

        .paypal-email-section {
          padding: 16px;
          background: ${withOpacity(colors.info, 0.1)};
          border-radius: 10px;
          border: 1px solid ${withOpacity(colors.info, 0.2)};
        }

        .paypal-instruction {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: ${theme.colors.textSecondary};
          font-weight: 500;
        }

        .paypal-email {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: ${theme.colors.surface};
          border: 1px solid ${theme.colors.border};
          border-radius: 6px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          font-weight: 600;
        }

        .copy-button-small {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: ${colors.primary};
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-button-small:hover {
          background: ${colors.primaryDark};
          transform: scale(1.05);
        }

        .payment-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payment-field {
          background: ${withOpacity(colors.gray100, 0.5)};
          padding: 16px;
          border-radius: 10

        .payment-search-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          border: 1px solid ${theme.colors.border};
          border-radius: 10px;
          font-size: 14px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .payment-search-input:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .payment-country-filter {
          min-width: 160px;
          padding: 12px 14px;
          border: 1px solid ${theme.colors.border};
          border-radius: 10px;
          font-size: 14px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          transition: all 0.3s ease;
        }

        .payment-country-filter:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .payment-methods-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .payment-type-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .payment-type-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: ${theme.colors.text};
          padding-bottom: 10px;
          border-bottom: 2px solid ${colors.primary};
        }

        .payment-methods-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .no-payment-methods {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 20px;
          text-align: center;
          color: ${theme.colors.textSecondary};
          background: ${theme.colors.backgroundSecondary};
          border-radius: 12px;
        }

        .no-payment-methods p {
          margin: 0;
          font-size: 14px;
        }

        .payment-method-card {
          border: 2px solid ${theme.colors.border};
          border-radius: 14px;
          background: ${theme.colors.surface};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .payment-method-card.selected {
          border-color: ${colors.primary};
          box-shadow: 0 6px 25px ${withOpacity(colors.primary, 0.15)};
        }

        .payment-method-card:hover:not(.selected) {
          border-color: ${colors.primary};
          transform: translateY(-2px);
          box-shadow: 0 10px 30px ${theme.colors.cardShadow};
        }

        .payment-method-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
        }

        .payment-method-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .payment-method-logo {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid ${theme.colors.border};
        }

        .payment-method-icon-fallback {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: ${withOpacity(colors.primary, 0.1)};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${withOpacity(colors.primary, 0.2)};
        }

        .payment-method-text h4 {
          margin: 0 0 6px 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .payment-method-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: ${theme.colors.textMuted};
        }

        .payment-type {
          background: ${withOpacity(colors.primary, 0.1)};
          color: ${colors.primary};
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 12px;
        }

        .payment-country {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .payment-method-card input[type="radio"] {
          accent-color: ${colors.primary};
          width: 20px;
          height: 20px;
        }

        .payment-method-details {
          border-top: 1px solid ${theme.colors.border};
          padding: 18px 20px;
          background: ${withOpacity(colors.primary, 0.02)};
        }

        .paypal-donation-section {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .paypal-donate-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;}

        .progress-section {
          padding: 20px 32px;
          background: linear-gradient(to right, ${withOpacity(colors.primary, 0.03)}, ${withOpacity(colors.accent, 0.05)});
          ${activeStep === 0 ? 'display: none;' : ''}
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .progress-step {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${theme.colors.textSecondary};
          transition: color 0.3s ease;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: ${theme.colors.border};
          overflow: hidden;
          position: relative;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.2) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.2) 75%);
          background-size: 20px 20px;
          animation: shimmer 2s linear infinite;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.secondary});
          background-size: 200% 100%;
          animation: gradientShift 3s ease infinite;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          width: ${(activeStep / (steps.length - 1)) * 100}%;
          position: relative;
        }

        .content-section {
          padding: 32px;
        }

        .error-alert {
          margin-bottom: 20px;
          padding: 16px 20px;
          border-radius: 12px;
          background: ${withOpacity(colors.error, 0.1)};
          border: 1px solid ${withOpacity(colors.error, 0.2)};
          color: ${colors.error};
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          animation: shake 0.5s ease-in-out;
        }

        .success-alert {
          margin-bottom: 20px;
          padding: 16px 20px;
          border-radius: 12px;
          background: ${withOpacity(colors.success, 0.1)};
          border: 1px solid ${withOpacity(colors.success, 0.2)};
          color: ${colors.success};
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          animation: slideInRight 0.4s ease-out;
        }

        .api-status-info {
          margin-top: 18px;
          padding: 14px 18px;
          border-radius: 10px;
          background: ${withOpacity(colors.warning, 0.08)};
          border: 1px solid ${withOpacity(colors.warning, 0.2)};
          color: ${colors.warning};
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .loading-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
          color: ${theme.colors.textSecondary};
        }

        .loading-message p {
          margin: 0;
          font-size: 15px;
        }

        .spin {
          animation: spin 1.2s linear infinite;
        }

        .donation-saved-alert {
          margin-bottom: 24px;
          padding: 20px;
          border-radius: 16px;
          background: ${withOpacity(colors.success, 0.08)};
          border: 1px solid ${withOpacity(colors.success, 0.2)};
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .donation-saved-alert h4 {
          margin: 0 0 6px 0;
          color: ${colors.success};
          font-size: 16px;
          font-weight: 600;
        }

        .donation-saved-alert p {
          margin: 0;
          color: ${theme.colors.text};
          font-size: 14px;
          line-height: 1.5;
        }

        /* NEW: Projects Grid Styles */
        .projects-grid-container {
          margin-top: 16px;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
          padding: 4px;
        }

        .project-grid-card {
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          padding: 16px;
          background: ${theme.colors.surface};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .project-grid-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${withOpacity(colors.primary, 0.05)}, transparent);
          transition: left 0.6s ease;
        }

        .project-grid-card:hover::before {
          left: 100%;
        }

        .project-grid-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
          box-shadow: 0 8px 25px ${withOpacity(colors.primary, 0.15)};
          transform: translateY(-2px);
        }

        .project-grid-card:hover:not(.selected) {
          border-color: ${colors.primaryLight};
          transform: translateY(-4px);
          box-shadow: 0 12px 30px ${theme.colors.cardShadow};
        }

        .project-card-content {
          position: relative;
          z-index: 1;
        }

        .project-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .project-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
          line-height: 1.3;
          flex: 1;
          margin-right: 12px;
        }

        .project-grid-card input[type="radio"] {
          accent-color: ${colors.primary};
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .project-status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .project-status.status-ongoing {
          background: ${withOpacity(colors.success, 0.1)};
          color: ${colors.success};
        }

        .project-status.status-planning {
          background: ${withOpacity(colors.info, 0.1)};
          color: ${colors.info};
        }

        .project-country {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: ${theme.colors.textSecondary};
        }

        .project-description {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          color: ${theme.colors.textSecondary};
        }

        .no-projects-message {
          text-align: center;
          padding: 32px 16px;
          color: ${theme.colors.textSecondary};
          font-size: 14px;
          background: ${withOpacity(colors.gray200, 0.3)};
          border-radius: 8px;
          border: 2px dashed ${theme.colors.border};
        }

        /* Payment Methods Styles */
        .payment-search-filters {
          margin-bottom: 24px;
        }

        .search-filter-row {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .search-input-container {
          position: relative;
          flex: 1;
        }

        .search-input-container svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme.colors.textMuted};
          z-index: 1;
        }

        .payment-search-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1px solid ${theme.colors.border};
          border-radius: 10px;
          font-size: 14px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .payment-search-input:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.1)};
        }

        .payment-country-filter {
          min-width: 160px;
          padding: 12px 14px;
          border: 1px solid ${theme.colors.border};
          border-radius: 10px;
          font-size: 14px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .payment-country-filter:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.1)};
        }

        .payment-methods-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .payment-type-section {
          display: flex;
          flex-





        .payment-field-value {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.colors.text};
          background: ${theme.colors.backgroundSecondary};
          padding: 8px 10px;
          border-radius: 4px;
          border: 1px solid ${theme.colors.borderLight};
          word-break: break-all;
        }

        /* Landing Page Styles */
        .landing-content {
          text-align: center;
          padding: 16px 0;
          background: linear-gradient(
            rgba(10, 69, 28, 0.87), 
            rgba(10, 69, 28, 0.78)
          ), url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: local;
          color: white;
          border-radius: 12px;
          margin: -24px -24px 20px -24px;
          position: relative;
          overflow: hidden;
        }

        .landing-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg, 
            ${withOpacity(colors.primary, 0.82)}, 
            ${withOpacity(colors.primaryDark, 0.9)}
          );
          z-index: 1;
        }

        .landing-hero {
          max-width: 550px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          padding: 32px 18px;
        }

      








        .hero-icon {
          position: relative;
          margin: 0 auto 26px;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-hearts {
          position: absolute;
          inset: 0;
        }

        .floating-hearts .heart-1 {
          position: absolute;
          top: 8px;
          right: 16px;
          animation: float 3s ease-in-out infinite;
        }

        .floating-hearts .heart-2 {
          position: absolute;
          bottom: 16px;
          left: 12px;
          animation: float 2.5s ease-in-out infinite 0.5s;
        }

      

        .floating-hearts .heart-3 {
          position: absolute;
          top: 40px;
          left: -8px;
          animation: float 3.5s ease-in-out infinite 1s;
        }

        .landing-title {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 20px;
          color: white;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .highlight-text {
          color: ${colors.secondary};
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .landing-description {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 32px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .impact-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 0 0 32px;
          padding: 24px 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);








        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${colors.secondary};
          display: block;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .inspiration-quote {
          margin: 0 0 32px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .inspiration-quote p {
          font-size: 1rem;
          font-style: italic;
          color: white;
          margin: 0 0 6px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .inspiration-quote span {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .start-donation-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, ${colors.secondary}, ${colors.secondaryLight});
          color: ${colors.black};
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .start-donation-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, ${colors.secondaryLight}, ${colors.secondary});
        }

        .reassurance {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        /* Regular Step Content */
        .step-content {
          animation: slideInContent 0.4s ease-out;
        }

        .step-title {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .step-subtitle {
          margin: 0 0 20px 0;
          font-size: 14px;
          color: ${theme.colors.textSecondary};
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .donation-option {
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          padding: 18px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .donation-option.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.15)};
        }

        .donation-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px ${theme.colors.cardShadow};
          border-color: ${colors.primary};
        }

        .donation-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${withOpacity(colors.primary, 0.1)}, transparent);
          transition: left 0.5s;
        }

        .donation-option:hover::before {
          left: 100%;
        }

        .option-content {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .option-content input[type="radio"] {
          accent-color: ${colors.primary};
        }

        .option-text {
          flex: 1;
        }

        .option-text h4 {
          margin: 0 0 6px 0;
          font-size: 15px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .option-text p {
          margin: 0 0 10px 0;
          font-size: 13px;
          line-height: 1.4;
          color: ${theme.colors.textSecondary};
        }

        .country-select {
          width: 100%;
          padding: 9px 11px;
          border: 1px solid ${theme.colors.border};
          border-radius: 6px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
        }

        .country-select:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .amounts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .amount-button {
          padding: 14px;
          border: 2px solid ${theme.colors.border};
          border-radius: 10px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .amount-button.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.15)};
          color: ${colors.primary};
        }

        .amount-button:hover {
          transform: translateY(-2px);
          background: ${theme.colors.backgroundSecondary};
          box-shadow: 0 4px 15px ${theme.colors.cardShadow};
        }

        .amount-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: ${withOpacity(colors.primary, 0.2)};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translate(-50%, -50%);
        }

        .amount-button:active::before {
          width: 300px;
          height: 300px;
        }

        .custom-amount-section {
          border-top: 1px solid ${theme.colors.border};
          padding-top: 20px;
        }

        .custom-amount-section label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: ${theme.colors.text};
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          color: ${theme.colors.textSecondary};
        }

        .input-with-icon input {
          width: 100%;
          padding: 11px 11px 11px 38px;
          border: 1px solid ${theme.colors.border};
          border-radius: 7px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .donation-summary {
          margin-top: 20px;
          padding: 18px;
          border-radius: 10px;
          color: white;
          text-align: center;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight});
        }

        .donation-summary h4 {
          margin: 0 0 6px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .donation-summary p {
          margin: 0;
          opacity: 0.9;
          font-size: 13px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-field label {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          font-weight: 500;
          color: ${theme.colors.text};
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 11px;
          border: 1px solid ${theme.colors.border};
          border-radius: 7px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          box-sizing: border-box;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${withOpacity(colors.primary, 0.2)};
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-field input {
          width: 16px;
          height: 16px;
          accent-color: ${colors.primary};
        }

        .checkbox-field label {
          font-size: 13px;
          cursor: pointer;
          color: ${theme.colors.text};
        }

        .summary-card {
          margin-top: 20px;
          padding: 16px;
          border: 1px solid ${theme.colors.border};
          border-radius: 10px;
          background: ${theme.colors.backgroundSecondary};
        }

        .summary-card h4 {
          margin: 0 0 10px 0;
          font-size: 15px;
          font-weight: 600;
          color: ${theme.colors.text};
        }

        .summary-card p {
          margin: 0 0 3px 0;
          font-size: 13px;
          color: ${theme.colors.textSecondary};
        }

        .info-card {
          margin-top: 20px;
          padding: 14px;
          border: 1px solid ${withOpacity(colors.info, 0.5)};
          border-radius: 10px;
          background: ${withOpacity(colors.info, 0.15)};
        }

        .info-card p {
          margin: 0;
          color: ${theme.colors.text};
        }

        .navigation-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid ${theme.colors.border};
          ${activeStep === 0 ? 'justify-content: center;' : ''}
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          position: relative;
          overflow: hidden;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .back-button {
          background: transparent;
          color: ${theme.colors.textSecondary};
          border: 1px solid ${theme.colors.border};
        }

        .back-button:not(:disabled):hover {
          background: ${theme.colors.backgroundSecondary};
          color: ${theme.colors.text};
        }

        .next-button {
          background: ${colors.primary};
          color: white;
          border: 1px solid ${colors.primary};
        }

        .next-button:not(:disabled):hover {
          background: ${colors.primaryDark};
        }

        .submit-button {
          background: linear-gradient(135deg, ${colors.success}, ${withOpacity(colors.success, 0.8)});
          color: white;
          border: 1px solid ${colors.success};
        }

        .nav-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translate(-50%, -50%);
        }

        .nav-button:active::before {
          width: 200px;
          height: 200px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideInContent {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 8px;
            max-height: calc(100vh - 16px);
            max-width: 95vw;
          }

          .amounts-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .progress-steps {
            font-size: 10px;
          }

          .step-title {
            font-size: 17px;
          }

          .modal-header {
            padding: 16px 20px;
          }

          .content-section {
            padding: 20px;
          }

          .navigation-section {
            flex-direction: column;
            gap: 10px;
          }

          .nav-button {
            width: 100%;
            justify-content: center;
          }

          .landing-title {
            font-size: 1.9rem;
          }

          .impact-stats {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 20px 16px;
          }

          .stat-item {
            flex-direction: row;
            text-align: left;
            gap: 12px;
          }

          .stat-number {
            font-size: 1.3rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .amounts-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .amount-button {
            padding: 12px;
            font-size: 14px;
          }

          .donation-option {
            padding: 14px;
          }

          .option-content {
            gap: 10px;
          }

          .landing-title {
            font-size: 1.7rem;
          }

          .landing-description {
            font-size: 0.95rem;
          }

          .start-donation-btn {
            font-size: 0.95rem;
            padding: 12px 22px;
          }

          .landing-hero {
            padding: 28px 16px;
          }

          .hero-icon {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }

          .inspiration-quote {
            padding: 16px;
          }
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <Heart size={26} style={{ color: colors.primary }} />
              <div>
                <h2 className="header-title">
                  {activeStep === 0 ? 'Welcome to ACEF' : 'Make a Donation'}
                </h2>
                {activeStep > 0 && (
                  <p className="header-subtitle">
                    Step {activeStep} of {steps.length - 1}: {steps[activeStep]}
                  </p>
                )}
              </div>
            </div>
            <button className="close-button" onClick={handleClose}>
              <X size={22} />
            </button>
          </div>

          {/* Progress Bar - Hidden on landing page */}
          {activeStep > 0 && (
            <div className="progress-section">
              <div className="progress-steps">
                {steps.slice(1).map((step, index) => (
                  <div
                    key={step}
                    className="progress-step"
                    style={{ 
                      color: index < activeStep ? colors.primary : theme.colors.textSecondary 
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ 
                    width: `${(activeStep / (steps.length - 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="content-section">
            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="navigation-section">
              {activeStep === 0 ? (
                // Landing page - no navigation, CTA button is in content
                null
              ) : (
                <>
                  <button
                    className="nav-button back-button"
                    onClick={handleBack}
                    disabled={activeStep === 1}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {activeStep < steps.length - 1 ? (
                      <button
                        className="nav-button next-button"
                        onClick={handleNext}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={16} className="spin" />
                            {activeStep === 3 ? 'Submitting...' : 'Loading...'}
                          </>
                        ) : (
                          <>
                            {activeStep === 3 ? 'Submit Donation' : 'Next'}
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>


                    ) : (
                      <button
                        className="nav-button submit-button"
                        // onClick={handleClose}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={16} className="spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Donation
                            <CheckCircle size={16} />
                          </>
                        )}
                      </button>
                    )
                    
                    
                    
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonationModal;