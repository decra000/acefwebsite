import React, { useState, useEffect } from 'react';
import rawCountryOptions from '../../data/countries.json';

import { 
  Search, CheckCircle, AlertCircle, RefreshCw,
  DollarSign, 
  ArrowRight, X, Heart, Globe, FileText, CreditCard, 
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

const steps = [
  'Welcome',
  'Choose Type', 
  'Select Target',
  'Amount',
  'Your Info',
  'Payment',
  'Complete'
];

const predefinedAmounts = [25, 50, 100, 250];

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

  const [acefCountries, setAcefCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentCountryFilter, setPaymentCountryFilter] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  
  const [formData, setFormData] = useState({
    donationType: '',
    selectedCountry: '',
    selectedProject: '',
    amount: '',
    customAmount: '',
    name: '',
    email: '',
    phone: '',
    donorCountry: '',
    isAnonymous: false,
    selectedTransactionMethod: null
  });

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
      
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server returned ${contentType || 'unknown'} instead of JSON. The API endpoint may not exist.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      
      throw error;
    }
  };

  const testApiConnection = async () => {
    try {
      await makeApiRequest('/health');
      setApiConnected(true);
      return true;
    } catch (error) {
      setApiConnected(false);
      return false;
    }
  };

  const fetchTransactionMethods = async () => {
    try {
      const data = await makeApiRequest('/transaction-details');
      
      if (Array.isArray(data)) {
        setTransactionMethods(data);
      } else if (data.success && Array.isArray(data.data)) {
        setTransactionMethods(data.data);
      } else {
        throw new Error('Invalid transaction methods data format');
      }
    } catch (error) {
      const fallbackMethods = [
        {
          id: 1,
          type: 'bank_transfer',
          name: 'Bank Transfer',
          country: 'Global',
          fields: [
            { label: 'Account Name', value: 'ACEF International' },
            { label: 'Account Number', value: '123456789' },
            { label: 'SWIFT Code', value: 'ACEFXXX' }
          ]
        },
        {
          id: 2,
          type: 'paypal',
          name: 'PayPal',
          fields: [
            { label: 'Donation Link', value: 'https://paypal.me/acefdonations' },
            { label: 'PayPal Email', value: 'donations@acef.org' }
          ]
        },
        {
          id: 3,
          type: 'local_merchant',
          name: 'M-Pesa',
          country: 'Kenya',
          fields: [
            { label: 'Paybill Number', value: '400200' },
            { label: 'Account Number', value: 'ACEF' }
          ]
        }
      ];
      setTransactionMethods(fallbackMethods);
    }
  };

  const fetchAcefCountries = async () => {
    try {
      const data = await makeApiRequest('/countries');
      
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setAcefCountries(sorted);
      } else if (data.success && Array.isArray(data.data)) {
        const sorted = [...data.data].sort((a, b) => a.name.localeCompare(b.name));
        setAcefCountries(sorted);
      } else {
        throw new Error('Invalid countries data format');
      }
    } catch (error) {
      const fallbackCountries = [
        "Kenya", "Ghana", "Uganda", "Rwanda", "Tanzania", "Nigeria"
      ];
      const fallbackData = fallbackCountries.map((name, index) => ({ 
        id: index + 1, 
        name 
      }));
      setAcefCountries(fallbackData);
    }
  };

  const loadAllCountries = () => {
    const sortedCountries = [...countryOptions].sort((a, b) => 
      a.label.localeCompare(b.label)
    );
    setAllCountries(sortedCountries);
  };

  const fetchProjects = async () => {
    try {
      const data = await makeApiRequest('/projects');
      
      let projectsData = [];
      if (data.success && Array.isArray(data.data)) {
        projectsData = data.data;
      } else if (Array.isArray(data)) {
        projectsData = data;
      }

      const visibleProjects = projectsData.filter(project => 
        !project.is_hidden && project.status !== 'cancelled' && project.status !== 'completed'
      );

      setProjects(visibleProjects);
      
    } catch (error) {
      const fallbackProjects = [
        { id: 1, title: "Clean Water Initiative", country_name: "Kenya" },
        { id: 2, title: "Educational Support", country_name: "Ghana" },
        { id: 3, title: "Healthcare Access", country_name: "Uganda" }
      ];
      setProjects(fallbackProjects);
    }
  };

  const submitDonationToBackend = async () => {
    try {
      setLoading(true);
      setError('');

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

      const result = await makeApiRequest('/donations', {
        method: 'POST',
        body: JSON.stringify(donationPayload)
      });

      if (result.success) {
        setSubmitSuccess(true);
        onDonationSubmitted(result.data);
        setTimeout(() => {
          setActiveStep(prev => prev + 1);
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to submit donation');
      }

    } catch (error) {
      let userMessage = 'Failed to submit donation. ';
      
      if (error.message.includes('timeout')) {
        userMessage += 'The request timed out. Please try again.';
      } else if (error.message.includes('Network')) {
        userMessage += 'Network connection error.';
      } else {
        userMessage += error.message || 'Please try again.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setDataLoading(true);
      setError('');
      
      loadAllCountries();
      
      testApiConnection().then((connected) => {
        if (connected) {
          Promise.allSettled([
            fetchAcefCountries(), 
            fetchProjects(), 
            fetchTransactionMethods()
          ]).finally(() => setDataLoading(false));
        } else {
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
      if (activeStep === 5) {
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
        if (!formData.donationType) {
          setError('Please select a donation type');
          return false;
        }
        return true;
      
      case 2:
        if (formData.donationType === 'country' && !formData.selectedCountry) {
          setError('Please select a country');
          return false;
        }
        if (formData.donationType === 'project' && !formData.selectedProject) {
          setError('Please select a project');
          return false;
        }
        return true;
      
      case 3:
        const amount = formData.customAmount || formData.amount;
        if (!amount || amount <= 0) {
          setError('Please select or enter an amount');
          return false;
        }
        return true;
      
      case 4:
        if (!formData.name.trim()) {
          setError('Name is required');
          return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Valid email is required');
          return false;
        }
        if (!formData.donorCountry) {
          setError('Please select your country');
          return false;
        }
        return true;
      
      case 5:
        if (!formData.selectedTransactionMethod) {
          setError('Please select a payment method');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    
    setTimeout(() => {
      setActiveStep(0);
      setFormData({
        donationType: '',
        selectedCountry: '',
        selectedProject: '',
        amount: '',
        customAmount: '',
        name: '',
        email: '',
        phone: '',
        donorCountry: '',
        isAnonymous: false,
        selectedTransactionMethod: null
      });
      setError('');
      setSubmitSuccess(false);
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const copyToClipboard = (text, fieldId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="welcome-content">
            <div className="welcome-icon">
              <HandHeart size={56} style={{ color: colors.primary }} />
            </div>
            <h2 className="welcome-title">Make a Donation</h2>
            <p className="welcome-description">
              Support ACEF's mission to create lasting change across African communities. Every contribution makes a difference.
            </p>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">How would you like to donate?</h3>
            <div className="donation-options">
              <div 
                className={`donation-card ${formData.donationType === 'general' ? 'selected' : ''}`}
                onClick={() => handleInputChange('donationType', 'general')}
              >
                <Heart size={28} style={{ color: colors.primary }} />
                <div className="card-content">
                  <h4>General Support</h4>
                  <p>Support where needed most</p>
                </div>
              </div>
              
              <div 
                className={`donation-card ${formData.donationType === 'country' ? 'selected' : ''}`}
                onClick={() => handleInputChange('donationType', 'country')}
              >
                <Globe size={28} style={{ color: colors.primary }} />
                <div className="card-content">
                  <h4>Country Specific</h4>
                  <p>Focus on one country</p>
                </div>
              </div>
              
              <div 
                className={`donation-card ${formData.donationType === 'project' ? 'selected' : ''}`}
                onClick={() => handleInputChange('donationType', 'project')}
              >
                <FileText size={28} style={{ color: colors.primary }} />
                <div className="card-content">
                  <h4>Specific Project</h4>
                  <p>Support a particular initiative</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        if (formData.donationType === 'general') {
          setActiveStep(3);
          return null;
        }
        
        return (
          <div className="step-content">
            <h3 className="step-title">
              {formData.donationType === 'country' ? 'Select Country' : 'Choose Project'}
            </h3>
            
            {formData.donationType === 'country' ? (
              <div className="selection-grid">
                {acefCountries.slice(0, 6).map(country => (
                  <div
                    key={country.id}
                    className={`selection-card ${formData.selectedCountry === country.id.toString() ? 'selected' : ''}`}
                    onClick={() => handleInputChange('selectedCountry', country.id.toString())}
                  >
                    <MapPin size={22} style={{ color: colors.primary }} />
                    <span>{country.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="selection-grid">
                {projects.slice(0, 3).map(project => (
                  <div
                    key={project.id}
                    className={`selection-card project-card ${formData.selectedProject === project.id.toString() ? 'selected' : ''}`}
                    onClick={() => handleInputChange('selectedProject', project.id.toString())}
                  >
                    <FileText size={22} style={{ color: colors.primary }} />
                    <div>
                      <h4>{project.title}</h4>
                      <p>{project.country_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3 className="step-title">Choose Amount</h3>
            <div className="amount-grid">
              {predefinedAmounts.map(amount => (
                <button
                  key={amount}
                  className={`amount-card ${formData.amount === amount.toString() && !formData.customAmount ? 'selected' : ''}`}
                  onClick={() => {
                    handleInputChange('amount', amount.toString());
                    handleInputChange('customAmount', '');
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            <div className="custom-amount">
              <label>Custom Amount</label>
              <div className="amount-input">
                <DollarSign size={20} />
                <input
                  type="number"
                  value={formData.customAmount}
                  onChange={(e) => {
                    handleInputChange('customAmount', e.target.value);
                    handleInputChange('amount', '');
                  }}
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3 className="step-title">Your Details</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-field">
                <label>Country</label>
                <select
                  value={formData.donorCountry}
                  onChange={(e) => handleInputChange('donorCountry', e.target.value)}
                >
                  <option value="">Select country</option>
                  {allCountries.slice(0, 20).map(country => (
                    <option key={country.label} value={country.label}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
              />
              <label htmlFor="anonymous">Make donation anonymous</label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3 className="step-title">Payment Method</h3>
            
            {formData.selectedTransactionMethod?.type !== 'local_merchant' ? (
              <div className="payment-methods">
                {(() => {
                  const paypalMethods = transactionMethods.filter(m => m.type === 'paypal');
                  
                  if (paypalMethods.length > 0) {
                    const paypalMethod = paypalMethods[0];
                    return (
                      <div
                        key={paypalMethod.id}
                        className={`payment-card ${formData.selectedTransactionMethod?.id === paypalMethod.id ? 'selected' : ''}`}
                        onClick={() => handleInputChange('selectedTransactionMethod', paypalMethod)}
                      >
                        <div className="payment-header">
                          <div className="payment-icon">
                            <CreditCard size={26} />
                          </div>
                          <div>
                            <h4>PayPal Donate</h4>
                            <p>Quick and secure donation</p>
                          </div>
                        </div>
                        
                        {formData.selectedTransactionMethod?.id === paypalMethod.id && (
                          <div className="payment-details">
                            {paypalMethod.fields && paypalMethod.fields.map((field, index) => (
                              <div key={index} className="detail-row">
                                <span className="detail-label">{field.label}</span>
                                {field.label === 'Donation Link' ? (
                                  <div className="detail-value">
                                    <button
                                      className="paypal-donate-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(field.value, '_blank');
                                      }}
                                    >
                                      <ExternalLink size={16} />
                                      Donate Now
                                    </button>
                                  </div>
                                ) : (
                                  <div className="detail-value">
                                    {field.value}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(field.value, `${paypalMethod.id}-${index}`);
                                      }}
                                      className="copy-btn"
                                    >
                                      {copiedField === `${paypalMethod.id}-${index}` ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="payment-card unavailable">
                        <div className="payment-header">
                          <div className="payment-icon">
                            <CreditCard size={26} />
                          </div>
                          <div>
                            <h4>PayPal Donate</h4>
                            <p>Not available at the moment</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}

                {(() => {
                  const bankMethods = transactionMethods.filter(m => m.type === 'bank_transfer');
                  
                  if (bankMethods.length > 0) {
                    const bankMethod = bankMethods[0];
                    return (
                      <div
                        key={bankMethod.id}
                        className={`payment-card ${formData.selectedTransactionMethod?.id === bankMethod.id ? 'selected' : ''}`}
                        onClick={() => handleInputChange('selectedTransactionMethod', bankMethod)}
                      >
                        <div className="payment-header">
                          <div className="payment-icon">
                            <Building size={26} />
                          </div>
                          <div>
                            <h4>Bank Transfer</h4>
                            <p>Direct bank to bank transfer</p>
                          </div>
                        </div>
                        
                        {formData.selectedTransactionMethod?.id === bankMethod.id && (
                          <div className="payment-details">
                            {bankMethod.fields && bankMethod.fields.map((field, index) => (
                              <div key={index} className="detail-row">
                                <span className="detail-label">{field.label}</span>
                                <div className="detail-value">
                                  {field.value}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(field.value, `${bankMethod.id}-${index}`);
                                    }}
                                    className="copy-btn"
                                  >
                                    {copiedField === `${bankMethod.id}-${index}` ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="payment-card unavailable">
                        <div className="payment-header">
                          <div className="payment-icon">
                            <Building size={26} />
                          </div>
                          <div>
                            <h4>Bank Transfer</h4>
                            <p>Not available at the moment</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}

                <div
                  className="payment-card"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, selectedTransactionMethod: { type: 'local_merchant' } }));
                  }}
                >
                  <div className="payment-header">
                    <div className="payment-icon">
                      <Smartphone size={26} />
                    </div>
                    <div>
                      <h4>Local Payments</h4>
                      <p>Mobile money & local services</p>
                    </div>
                    <ArrowRight size={22} style={{ color: colors.primary }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="local-payments-view">
                <div className="local-header">
                  <button
                    className="back-to-main"
                    onClick={() => setFormData(prev => ({ ...prev, selectedTransactionMethod: null }))}
                  >
                    <ArrowLeft size={16} />
                    Back to Payment Methods
                  </button>
                </div>

                <div className="local-search">
                  <div className="search-input-container">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search local payment methods..."
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
                    {[...new Set(transactionMethods
                      .filter(method => method.country && method.type === 'local_merchant')
                      .map(method => method.country)
                    )].sort().map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="local-methods-grid">
                  {transactionMethods
                    .filter(method => {
                      if (method.type !== 'local_merchant') return false;
                      
                      const matchesSearch = !paymentSearchTerm || 
                        method.name.toLowerCase().includes(paymentSearchTerm.toLowerCase());
                      const matchesCountry = !paymentCountryFilter || 
                        method.country === paymentCountryFilter;
                      
                      return matchesSearch && matchesCountry;
                    })
                    .map(method => (
                      <div
                        key={method.id}
                        className={`local-method-card ${formData.selectedTransactionMethod?.id === method.id ? 'selected' : ''}`}
                        onClick={() => handleInputChange('selectedTransactionMethod', method)}
                      >
                        <div className="local-method-header">
                          {method.logo_url ? (
                            <img 
                              src={method.logo_url} 
                              alt={method.name}
                              className="local-method-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="local-method-icon-fallback"
                            style={{ display: method.logo_url ? 'none' : 'flex' }}
                          >
                            <Smartphone size={24} style={{ color: colors.primary }} />
                          </div>
                          <div className="local-method-info">
                            <h4>{method.name}</h4>
                            {method.country && (
                              <p className="local-method-country">
                                <MapPin size={12} />
                                {method.country}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {formData.selectedTransactionMethod?.id === method.id && (
                          <div className="payment-details">
                            {method.fields.map((field, index) => (
                              <div key={index} className="detail-row">
                                <span className="detail-label">{field.label}</span>
                                <div className="detail-value">
                                  {field.value}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(field.value, `${method.id}-${index}`);
                                    }}
                                    className="copy-btn"
                                  >
                                    {copiedField === `${method.id}-${index}` ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {transactionMethods.filter(method => {
                  if (method.type !== 'local_merchant') return false;
                  const matchesSearch = !paymentSearchTerm || 
                    method.name.toLowerCase().includes(paymentSearchTerm.toLowerCase());
                  const matchesCountry = !paymentCountryFilter || 
                    method.country === paymentCountryFilter;
                  return matchesSearch && matchesCountry;
                }).length === 0 && !dataLoading && (
                  <div className="no-local-methods">
                    <Smartphone size={32} style={{ color: colors.gray400 }} />
                    <p>No local payment methods found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={64} style={{ color: colors.success }} />
            </div>
            <h2 className="success-title">Thank You!</h2>
            <p className="success-message">
              Your donation intent of ${formData.customAmount || formData.amount} has been recorded. 
              Please complete the payment using the selected method.
            </p>
            <button className="success-btn" onClick={handleClose}>
              Complete
            </button>
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
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          animation: ${isClosing ? 'fadeOut' : 'fadeIn'} 0.2s ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          background: ${theme.colors.surface};
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          animation: ${isClosing ? 'scaleOut' : 'scaleIn'} 0.2s ease-out;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid ${theme.colors.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.colors.text};
          margin: 0;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: ${theme.colors.backgroundSecondary};
          color: ${theme.colors.textSecondary};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: ${theme.colors.border};
          color: ${theme.colors.text};
        }

        .modal-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .welcome-content {
          text-align: center;
          padding: 32px 0;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${withOpacity(colors.primary, 0.1)};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 700;
          color: ${theme.colors.text};
          margin: 0 0 12px;
        }

        .welcome-description {
          font-size: 16px;
          color: ${theme.colors.textSecondary};
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .step-title {
          font-size: 20px;
          font-weight: 600;
          color: ${theme.colors.text};
          margin: 0 0 24px;
          text-align: center;
        }

        .donation-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .donation-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: ${theme.colors.surface};
        }

        .donation-card:hover {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.02)};
        }

        .donation-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
        }

        .card-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
          margin: 0 0 4px;
        }

        .card-content p {
          font-size: 14px;
          color: ${theme.colors.textSecondary};
          margin: 0;
        }

        .selection-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .selection-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: ${theme.colors.surface};
        }

        .selection-card:hover {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.02)};
        }

        .selection-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
        }

        .selection-card span {
          font-size: 15px;
          font-weight: 500;
          color: ${theme.colors.text};
        }

        .project-card {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .project-card h4 {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.colors.text};
          margin: 0;
        }

        .project-card p {
          font-size: 13px;
          color: ${theme.colors.textSecondary};
          margin: 0;
        }

        .amount-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .amount-card {
          padding: 20px;
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          background: ${theme.colors.surface};
          font-size: 18px;
          font-weight: 600;
          color: ${theme.colors.text};
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .amount-card:hover {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.02)};
        }

        .amount-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
          color: ${colors.primary};
        }

        .custom-amount {
          margin-top: 16px;
        }

        .custom-amount label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.colors.text};
          margin-bottom: 8px;
        }

        .amount-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .amount-input svg {
          position: absolute;
          left: 12px;
          color: ${theme.colors.textSecondary};
          z-index: 1;
        }

        .amount-input input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid ${theme.colors.border};
          border-radius: 8px;
          font-size: 16px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          transition: border-color 0.2s ease;
        }

        .amount-input input:focus {
          outline: none;
          border-color: ${colors.primary};
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .form-field label {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.colors.text};
          margin-bottom: 8px;
        }

        .form-field input,
        .form-field select {
          padding: 12px;
          border: 2px solid ${theme.colors.border};
          border-radius: 8px;
          font-size: 15px;
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          transition: border-color 0.2s ease;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: ${colors.primary};
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          padding: 16px;
          background: ${withOpacity(colors.primary, 0.05)};
          border-radius: 8px;
        }

        .checkbox-row input {
          width: 18px;
          height: 18px;
          accent-color: ${colors.primary};
        }

        .checkbox-row label {
          font-size: 14px;
          color: ${theme.colors.text};
          cursor: pointer;
          margin: 0;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .local-payments-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .local-header {
          padding-bottom: 16px;
          border-bottom: 1px solid ${theme.colors.border};
        }

        .back-to-main {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          background: none;
          border: none;
          color: ${colors.primary};
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-to-main:hover {
          color: ${colors.primaryDark};
        }

        .local-search {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .local-methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          max-height: 300px;
          overflow-y: auto;
        }

        .local-method-card {
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          background: ${theme.colors.surface};
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .local-method-card:hover {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.02)};
        }

        .local-method-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
        }

        .local-method-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .local-method-logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid ${theme.colors.border};
        }

        .local-method-icon-fallback {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: ${withOpacity(colors.primary, 0.1)};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${withOpacity(colors.primary, 0.2)};
        }

        .local-method-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.colors.text};
          margin: 0 0 4px;
        }

        .local-method-country {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: ${theme.colors.textSecondary};
          margin: 0;
        }

        .no-local-methods {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 20px;
          text-align: center;
          color: ${theme.colors.textSecondary};
          background: ${theme.colors.backgroundSecondary};
          border-radius: 12px;
          border: 2px dashed ${theme.colors.border};
        }

        .no-local-methods p {
          margin: 0;
          font-size: 14px;
        }

        .payment-card.unavailable {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .payment-card.unavailable .payment-header div:last-child p {
          color: ${theme.colors.textMuted};
        }

        .debug-info {
          padding: 12px;
          background: ${withOpacity(colors.info, 0.1)};
          border-radius: 8px;
          border: 1px solid ${withOpacity(colors.info, 0.2)};
          font-size: 13px;
          color: ${colors.info};
        }

        .debug-info p {
          margin: 4px 0;
        }

        .paypal-donate-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, ${colors.info}, ${withOpacity(colors.info, 0.8)});
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px ${withOpacity(colors.info, 0.3)};
        }

        .paypal-donate-btn:hover {
          background: linear-gradient(135deg, ${withOpacity(colors.info, 0.9)}, ${colors.info});
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${withOpacity(colors.info, 0.4)};
        }

        .payment-card {
          border: 2px solid ${theme.colors.border};
          border-radius: 12px;
          background: ${theme.colors.surface};
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .payment-card:hover {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.02)};
        }

        .payment-card.selected {
          border-color: ${colors.primary};
          background: ${withOpacity(colors.primary, 0.05)};
        }

        .payment-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .payment-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: ${withOpacity(colors.primary, 0.1)};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.primary};
        }

        .payment-header h4 {
          font-size: 16px;
          font-weight: 600;
          color: ${theme.colors.text};
          margin: 0 0 4px;
        }

        .payment-header p {
          font-size: 13px;
          color: ${theme.colors.textSecondary};
          margin: 0;
        }

        .payment-details {
          padding: 0 20px 20px;
          border-top: 1px solid ${theme.colors.border};
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid ${theme.colors.borderLight};
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 13px;
          color: ${theme.colors.textSecondary};
          font-weight: 500;
        }

        .detail-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: ${theme.colors.text};
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .copy-btn {
          padding: 4px;
          border: none;
          background: ${withOpacity(colors.primary, 0.1)};
          color: ${colors.primary};
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background: ${withOpacity(colors.primary, 0.2)};
        }

        .success-content {
          text-align: center;
          padding: 32px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-icon {
          margin-bottom: 24px;
        }

        .success-title {
          font-size: 24px;
          font-weight: 700;
          color: ${theme.colors.text};
          margin: 0 0 12px;
        }

        .success-message {
          font-size: 16px;
          color: ${theme.colors.textSecondary};
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .success-btn {
          padding: 12px 32px;
          background: ${colors.success};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .success-btn:hover {
          background: ${withOpacity(colors.success, 0.9)};
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid ${theme.colors.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          background: ${theme.colors.backgroundSecondary};
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .step-indicator {
          font-size: 13px;
          color: ${theme.colors.textSecondary};
        }

        .footer-right {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
        }

        .btn-secondary {
          background: transparent;
          color: ${theme.colors.textSecondary};
          border: 1px solid ${theme.colors.border};
        }

        .btn-secondary:hover {
          background: ${theme.colors.backgroundSecondary};
          color: ${theme.colors.text};
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: ${colors.primary};
          color: white;
        }

        .btn-primary:hover {
          background: ${colors.primaryDark};
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-alert {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          background: ${withOpacity(colors.error, 0.1)};
          border: 1px solid ${withOpacity(colors.error, 0.2)};
          color: ${colors.error};
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }

        @keyframes scaleOut {
          from { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
          to { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
        }

        @media (max-width: 640px) {
          .modal-overlay {
            padding: 20px;
          }

          .modal-content {
            max-width: 100%;
            max-height: 95vh;
          }

          .modal-header {
            padding: 16px 20px 12px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-footer {
            padding: 16px 20px;
          }

          .selection-grid {
            grid-template-columns: 1fr;
          }

          .amount-grid {
            grid-template-columns: 1fr;
          }

          .welcome-icon {
            width: 64px;
            height: 64px;
          }

          .welcome-title {
            font-size: 20px;
          }

          .step-title {
            font-size: 18px;
          }
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h1 className="modal-title">
              {activeStep === 0 ? 'ACEF Donation' : steps[activeStep]}
            </h1>
            <button className="close-btn" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {renderStepContent()}
          </div>

          {/* Footer */}
          {activeStep !== 0 && activeStep !== 6 && (
            <div className="modal-footer">
              <div className="footer-left">
                <span className="step-indicator">
                  Step {activeStep} of {steps.length - 1}
                </span>
              </div>
              
              <div className="footer-right">
                <button
                  className="btn btn-secondary"
                  onClick={handleBack}
                  disabled={activeStep === 1}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      {activeStep === 5 ? 'Processing...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      {activeStep === 5 ? 'Submit' : 'Continue'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Welcome/Success Footer */}
          {(activeStep === 0 || activeStep === 6) && (
            <div className="modal-footer">
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {activeStep === 0 ? (
                  <button className="btn btn-primary" onClick={handleNext}>
                    Get Started
                    <ArrowRight size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DonationModal;