import React, { useState, useEffect } from 'react';
import {
  Search, CheckCircle, AlertCircle, RefreshCw,
  DollarSign, ArrowRight, X, Heart, Globe, FileText, CreditCard, 
  Building, ArrowLeft, HandHeart, Smartphone, MapPin, ExternalLink, Copy, Check
} from 'lucide-react';
import { useTheme } from '../../theme';

const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const allCountries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","North Korea","South Korea","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

const steps = ['Welcome', 'Choose Type', 'Select Target', 'Amount', 'Your Info', 'Payment', 'Complete'];
const predefinedAmounts = [25, 50, 100, 250];

// Hero images for different donation types
const HERO_IMAGES = {
  welcome: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=400&fit=crop',
  general: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=400&fit=crop',
  country: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=400&fit=crop',
  project: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=400&fit=crop'
};

const DonationModal = ({ 
  open = true, 
  onClose = () => {}, 
  API_BASE = API_CONFIG.baseURL, 
  onDonationSubmitted = () => {} 
}) => {
  const { colors } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  
  const [countries, setCountries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentCountryFilter, setPaymentCountryFilter] = useState('');
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

  const withOpacity = (color, opacity) => {
    if (!color) return `rgba(0, 0, 0, ${opacity})`;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

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
        throw new Error(`Server returned ${contentType || 'unknown'} instead of JSON`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await makeApiRequest('/countries');
      const countryList = Array.isArray(data) ? data : (data.data || []);
      setCountries(countryList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setCountries([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await makeApiRequest('/projects');
      const projectList = Array.isArray(data) ? data : (data.data || []);
      const visible = projectList.filter(p => !p.is_hidden && p.status !== 'cancelled' && p.status !== 'completed');
      setProjects(visible);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    }
  };

  const fetchTransactionMethods = async () => {
    try {
      const data = await makeApiRequest('/transaction-details');
      const methods = Array.isArray(data) ? data : (data.data || []);
      setTransactionMethods(methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      setTransactionMethods([]);
    }
  };

  const submitDonation = async () => {
    try {
      setLoading(true);
      setError('');

      const donationAmount = parseFloat(formData.customAmount || formData.amount);

      const payload = {
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
        body: JSON.stringify(payload)
      });

      if (result.success) {
        onDonationSubmitted(result.data);
        setTimeout(() => setActiveStep(prev => prev + 1), 800);
      } else {
        throw new Error(result.message || 'Failed to submit donation');
      }

    } catch (error) {
      setError(error.message || 'Failed to submit donation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setDataLoading(true);
      Promise.all([
        fetchCountries(), 
        fetchProjects(), 
        fetchTransactionMethods()
      ]).finally(() => setDataLoading(false));
    }
  }, [open, API_BASE]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleNext = async () => {
    if (activeStep === 0 || validateStep()) {
      if (activeStep === 5) {
        await submitDonation();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
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
        donationType: '', selectedCountry: '', selectedProject: '',
        amount: '', customAmount: '', name: '', email: '', phone: '',
        donorCountry: '', isAnonymous: false, selectedTransactionMethod: null
      });
      setError('');
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const copyToClipboard = (text, fieldId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    (p.country_name && p.country_name.toLowerCase().includes(projectSearchTerm.toLowerCase()))
  );

  const getCurrentHeroImage = () => {
    if (activeStep === 0) return HERO_IMAGES.welcome;
    if (activeStep === 6) return HERO_IMAGES.welcome;
    if (formData.donationType) return HERO_IMAGES[formData.donationType] || HERO_IMAGES.general;
    return HERO_IMAGES.general;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="step-container">
            <div className="hero-image" style={{ backgroundImage: `url(${HERO_IMAGES.welcome})` }}>
              <div className="hero-overlay" />
              <div className="hero-content">
                <div className="hero-icon">
                  <HandHeart size={48} strokeWidth={1.5} />
                </div>
                <h2 className="hero-title">Make a Donation</h2>
                <p className="hero-description">
                  Support ACEF's mission to create lasting change across African communities.
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-container">
            <div className="step-content">
              <h3 className="step-title">How would you like to donate?</h3>
              <div className="donation-options">
                {[
                  { 
                    type: 'general', 
                    icon: Heart, 
                    title: 'General Support', 
                    desc: 'Support where needed most',
                    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'
                  },
                  { 
                    type: 'country', 
                    icon: Globe, 
                    title: 'Country Specific', 
                    desc: 'Focus on one country',
                    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop'
                  },
                  { 
                    type: 'project', 
                    icon: FileText, 
                    title: 'Specific Project', 
                    desc: 'Support a particular initiative',
                    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop'
                  }
                ].map(({ type, icon: Icon, title, desc, image }) => (
                  <div 
                    key={type}
                    className={`donation-card ${formData.donationType === type ? 'selected' : ''}`}
                    onClick={() => handleInputChange('donationType', type)}
                  >
                    <div className="donation-card-image" style={{ backgroundImage: `url(${image})` }}>
                      <div className="donation-card-overlay" />
                    </div>
                    <div className="donation-card-content">
                      <Icon size={24} strokeWidth={1.5} />
                      <div>
                        <h4>{title}</h4>
                        <p>{desc}</p>
                      </div>
                    </div>
                    <div className="card-indicator" />
                  </div>
                ))}
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
          <div className="step-container">
            <div className="step-content">
              <h3 className="step-title">
                {formData.donationType === 'country' ? 'Select Country' : 'Choose Project'}
              </h3>
              
              {formData.donationType === 'country' ? (
                <>
                  <div className="search-box">
                    <Search size={16} strokeWidth={2} />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="selection-grid">
                    {filteredCountries.map(country => (
                      <div
                        key={country.id}
                        className={`selection-card ${formData.selectedCountry === country.id.toString() ? 'selected' : ''}`}
                        onClick={() => handleInputChange('selectedCountry', country.id.toString())}
                      >
                        <MapPin size={18} strokeWidth={2} />
                        <span>{country.name}</span>
                        <div className="card-indicator-small" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="search-box">
                    <Search size={16} strokeWidth={2} />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearchTerm}
                      onChange={(e) => setProjectSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="selection-grid">
                    {filteredProjects.map(project => (
                      <div
                        key={project.id}
                        className={`selection-card project-card ${formData.selectedProject === project.id.toString() ? 'selected' : ''}`}
                        onClick={() => handleInputChange('selectedProject', project.id.toString())}
                      >
                        <FileText size={18} strokeWidth={2} />
                        <div>
                          <h4>{project.title}</h4>
                          <p>{project.country_name}</p>
                        </div>
                        <div className="card-indicator-small" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-container">
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
                    <span className="amount-symbol">$</span>
                    <span className="amount-value">{amount}</span>
                  </button>
                ))}
              </div>
              
              <div className="custom-amount">
                <label>Custom Amount</label>
                <div className="amount-input-wrapper">
                  <DollarSign size={18} strokeWidth={2} />
                  <input
                    type="number"
                    value={formData.customAmount}
                    onChange={(e) => {
                      handleInputChange('customAmount', e.target.value);
                      handleInputChange('amount', '');
                    }}
                    placeholder="Enter custom amount"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-container">
            <div className="step-content">
              <h3 className="step-title">Your Details</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-field">
                  <label>Phone Number <span className="optional">(Optional)</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="form-field">
                  <label>Country</label>
                  <select
                    value={formData.donorCountry}
                    onChange={(e) => handleInputChange('donorCountry', e.target.value)}
                  >
                    <option value="">Select your country</option>
                    {allCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
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
                <label htmlFor="anonymous">Make my donation anonymous</label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-container">
            <div className="step-content">
              <h3 className="step-title">Select Payment Method</h3>
              
              {formData.selectedTransactionMethod?.type !== 'local_merchant' ? (
                <div className="payment-methods">
                  {(() => {
                    const paypalMethods = transactionMethods.filter(m => m.type === 'paypal');
                    const bankMethods = transactionMethods.filter(m => m.type === 'bank_transfer');
                    
                    return (
                      <>
                        {paypalMethods.length > 0 && (
                          <div
                            className={`payment-card ${formData.selectedTransactionMethod?.id === paypalMethods[0].id ? 'selected' : ''}`}
                            onClick={() => handleInputChange('selectedTransactionMethod', paypalMethods[0])}
                          >
                            <div className="payment-header">
                              <div className="payment-icon">
                                <CreditCard size={22} strokeWidth={1.5} />
                              </div>
                              <div>
                                <h4>PayPal</h4>
                                <p>Quick and secure donation</p>
                              </div>
                            </div>
                            
                            {formData.selectedTransactionMethod?.id === paypalMethods[0].id && (
                              <div className="payment-details">
                                {paypalMethods[0].fields?.map((field, index) => (
                                  <div key={index} className="detail-row">
                                    <span className="detail-label">{field.label}</span>
                                    {field.label === 'Donation Link' ? (
                                      <button
                                        className="paypal-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(field.value, '_blank');
                                        }}
                                      >
                                        <ExternalLink size={14} />
                                        Open PayPal
                                      </button>
                                    ) : (
                                      <div className="detail-value">
                                        {field.value}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(field.value, `${paypalMethods[0].id}-${index}`);
                                          }}
                                          className="copy-btn"
                                        >
                                          {copiedField === `${paypalMethods[0].id}-${index}` ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {bankMethods.length > 0 && (
                          <div
                            className={`payment-card ${formData.selectedTransactionMethod?.id === bankMethods[0].id ? 'selected' : ''}`}
                            onClick={() => handleInputChange('selectedTransactionMethod', bankMethods[0])}
                          >
                            <div className="payment-header">
                              <div className="payment-icon">
                                <Building size={22} strokeWidth={1.5} />
                              </div>
                              <div>
                                <h4>Bank Transfer</h4>
                                <p>Direct bank to bank transfer</p>
                              </div>
                            </div>
                            
                            {formData.selectedTransactionMethod?.id === bankMethods[0].id && (
                              <div className="payment-details">
                                {bankMethods[0].fields?.map((field, index) => (
                                  <div key={index} className="detail-row">
                                    <span className="detail-label">{field.label}</span>
                                    <div className="detail-value">
                                      {field.value}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(field.value, `${bankMethods[0].id}-${index}`);
                                        }}
                                        className="copy-btn"
                                      >
                                        {copiedField === `${bankMethods[0].id}-${index}` ? <Check size={12} /> : <Copy size={12} />}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className="payment-card"
                          onClick={() => setFormData(prev => ({ ...prev, selectedTransactionMethod: { type: 'local_merchant' } }))}
                        >
                          <div className="payment-header">
                            <div className="payment-icon">
                              <Smartphone size={22} strokeWidth={1.5} />
                            </div>
                            <div>
                              <h4>Local Payment Methods</h4>
                              <p>Mobile money & local services</p>
                            </div>
                            <ArrowRight size={18} strokeWidth={2} />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="local-payments-view">
                  <button
                    className="back-to-main"
                    onClick={() => setFormData(prev => ({ ...prev, selectedTransactionMethod: null }))}
                  >
                    <ArrowLeft size={14} />
                    Back to Payment Methods
                  </button>

                  <div className="local-search">
                    <div className="search-box">
                      <Search size={16} strokeWidth={2} />
                      <input
                        type="text"
                        placeholder="Search payment methods..."
                        value={paymentSearchTerm}
                        onChange={(e) => setPaymentSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <select
                      value={paymentCountryFilter}
                      onChange={(e) => setPaymentCountryFilter(e.target.value)}
                      className="country-filter"
                    >
                      <option value="">All Countries</option>
                      {[...new Set(transactionMethods
                        .filter(m => m.country && m.type === 'local_merchant')
                        .map(m => m.country)
                      )].sort().map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div className="local-methods-grid">
                    {transactionMethods
                      .filter(m => {
                        if (m.type !== 'local_merchant') return false;
                        const matchesSearch = !paymentSearchTerm || 
                          m.name.toLowerCase().includes(paymentSearchTerm.toLowerCase());
                        const matchesCountry = !paymentCountryFilter || m.country === paymentCountryFilter;
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
                              <img src={method.logo_url} alt={method.name} className="method-logo" />
                            ) : (
                              <div className="method-icon-fallback">
                                <Smartphone size={20} strokeWidth={1.5} />
                              </div>
                            )}
                            <div>
                              <h4>{method.name}</h4>
                              {method.country && <p><MapPin size={10} /> {method.country}</p>}
                            </div>
                          </div>
                          
                          {formData.selectedTransactionMethod?.id === method.id && (
                            <div className="payment-details">
                              {method.fields?.map((field, index) => (
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
                                      {copiedField === `${method.id}-${index}` ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-container">
            <div className="hero-image success-hero" style={{ backgroundImage: `url(${HERO_IMAGES.welcome})` }}>
              <div className="hero-overlay success-overlay" />
              <div className="hero-content success-content">
                <div className="success-icon">
                  <CheckCircle size={56} strokeWidth={1.5} />
                </div>
                <h2 className="success-title">Thank You</h2>
                <p className="success-message">
                  Your donation of ${formData.customAmount || formData.amount} has been recorded.<br />
                  Please complete the payment using your selected method.
                </p>
                <button className="success-btn" onClick={handleClose}>
                  Close
                </button>
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          background: ${withOpacity(colors.black, 0.92)};
          animation: ${isClosing ? 'fadeOut' : 'fadeIn'} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          padding: 0;
        }

        .modal-content {
          width: 1200px;
          max-width: 100%;
          min-height: 80vh;
          background: ${colors.background};
          margin: 0 auto;
          animation: ${isClosing ? 'slideUp' : 'slideDown'} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 80px ${withOpacity(colors.black, 0.3)};
        }

        .modal-header {
          padding: 32px 48px;
          border-bottom: 1px solid ${colors.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: ${colors.background};
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .modal-title {
          font-size: 14px;
          font-weight: 400;
          color: ${colors.textSecondary};
          margin: 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border: 1px solid ${colors.border};
          background: transparent;
          color: ${colors.text};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .close-btn:hover {
          background: ${colors.text};
          color: ${colors.background};
          border-color: ${colors.text};
        }

        .modal-body {
          flex: 1;
        }

        .step-container {
          width: 100%;
        }

        .hero-image {
          position: relative;
          width: 100%;
          height: 500px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${withOpacity(colors.primary, 0.85)}, ${withOpacity(colors.primaryDark, 0.9)});
        }

        .success-overlay {
          background: linear-gradient(135deg, ${withOpacity(colors.success, 0.85)}, ${withOpacity(colors.primary, 0.9)});
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: ${colors.white};
          padding: 40px;
        }

        .hero-icon {
          width: 88px;
          height: 88px;
          background: ${withOpacity(colors.white, 0.15)};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          color: ${colors.white};
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-size: 48px;
          font-weight: 300;
          margin: 0 0 20px;
          letter-spacing: -0.5px;
        }

        .hero-description {
          font-size: 18px;
          font-weight: 300;
          line-height: 1.8;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .step-content {
          padding: 80px 48px;
          max-width: 720px;
          margin: 0 auto;
        }

        .step-title {
          font-size: 32px;
          font-weight: 300;
          color: ${colors.text};
          margin: 0 0 48px;
          text-align: center;
          letter-spacing: -0.3px;
        }

        .donation-options {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: ${colors.border};
        }

        .donation-card {
          display: flex;
          background: ${colors.background};
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border: none;
          overflow: hidden;
        }

        .donation-card-image {
          width: 200px;
          height: 150px;
          background-size: cover;
          background-position: center;
          position: relative;
          flex-shrink: 0;
        }

        .donation-card-overlay {
          position: absolute;
          inset: 0;
          background: ${withOpacity(colors.primary, 0.3)};
          transition: all 0.3s ease;
        }

        .donation-card:hover .donation-card-overlay {
          background: ${withOpacity(colors.primary, 0.5)};
        }

        .donation-card.selected .donation-card-overlay {
          background: ${withOpacity(colors.primary, 0.7)};
        }

        .donation-card-content {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 32px;
          flex: 1;
        }

        .donation-card:hover {
          background: ${colors.backgroundSecondary};
        }

        .donation-card.selected {
          background: ${colors.text};
        }

        .donation-card.selected .donation-card-content h4,
        .donation-card.selected .donation-card-content p {
          color: ${colors.background};
        }

        .donation-card.selected svg {
          color: ${colors.background} !important;
        }

        .card-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: ${colors.secondary};
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .donation-card.selected .card-indicator {
          opacity: 1;
        }

        .donation-card-content h4 {
          font-size: 18px;
          font-weight: 400;
          color: ${colors.text};
          margin: 0 0 4px;
        }

        .donation-card-content p {
          font-size: 14px;
          font-weight: 300;
          color: ${colors.textSecondary};
          margin: 0;
        }

        .search-box {
          position: relative;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 16px;
          color: ${colors.textMuted};
        }

        .search-box input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 1px solid ${colors.border};
          border-radius: 0;
          font-size: 14px;
          font-weight: 300;
          background: ${colors.background};
          color: ${colors.text};
          transition: all 0.25s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: ${colors.text};
        }

        .search-box input::placeholder {
          color: ${colors.textMuted};
        }

        .selection-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: ${colors.border};
          max-height: 500px;
          overflow-y: auto;
        }

        .selection-grid::-webkit-scrollbar {
          width: 6px;
        }

        .selection-grid::-webkit-scrollbar-track {
          background: ${colors.backgroundSecondary};
        }

        .selection-grid::-webkit-scrollbar-thumb {
          background: ${colors.textMuted};
        }

        .selection-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          background: ${colors.background};
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }

        .selection-card:hover {
          background: ${colors.backgroundSecondary};
        }

        .selection-card.selected {
          background: ${colors.text};
        }

        .selection-card.selected span,
        .selection-card.selected h4,
        .selection-card.selected p {
          color: ${colors.background};
        }

        .selection-card.selected svg {
          color: ${colors.background} !important;
        }

        .card-indicator-small {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: ${colors.secondary};
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .selection-card.selected .card-indicator-small {
          opacity: 1;
        }

        .selection-card span {
          font-size: 14px;
          font-weight: 400;
          color: ${colors.text};
        }

        .project-card {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .project-card h4 {
          font-size: 15px;
          font-weight: 400;
          color: ${colors.text};
          margin: 0;
        }

        .project-card p {
          font-size: 13px;
          font-weight: 300;
          color: ${colors.textSecondary};
          margin: 0;
        }

        .amount-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: ${colors.border};
          margin-bottom: 48px;
        }

        .amount-card {
          padding: 40px 32px;
          border: none;
          background: ${colors.background};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .amount-card:hover {
          background: ${colors.backgroundSecondary};
        }

        .amount-card.selected {
          background: ${colors.text};
        }

        .amount-symbol {
          font-size: 18px;
          font-weight: 300;
          color: ${colors.textSecondary};
        }

        .amount-card.selected .amount-symbol,
        .amount-card.selected .amount-value {
          color: ${colors.background};
        }

        .amount-value {
          font-size: 32px;
          font-weight: 300;
          color: ${colors.text};
        }

        .custom-amount label {
          display: block;
          font-size: 13px;
          font-weight: 400;
          color: ${colors.textSecondary};
          margin-bottom: 12px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .amount-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .amount-input-wrapper svg {
          position: absolute;
          left: 16px;
          color: ${colors.textMuted};
        }

        .amount-input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 1px solid ${colors.border};
          font-size: 16px;
          font-weight: 300;
          background: ${colors.background};
          color: ${colors.text};
          transition: all 0.25s ease;
        }

        .amount-input-wrapper input:focus {
          outline: none;
          border-color: ${colors.text};
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-field label {
          display: block;
          font-size: 13px;
          font-weight: 400;
          color: ${colors.textSecondary};
          margin-bottom: 12px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .optional {
          text-transform: lowercase;
          font-weight: 300;
          color: ${colors.textMuted};
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid ${colors.border};
          font-size: 15px;
          font-weight: 300;
          background: ${colors.background};
          color: ${colors.text};
          transition: all 0.25s ease;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: ${colors.text};
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 32px;
          padding: 20px;
          background: ${colors.backgroundSecondary};
          border: 1px solid ${colors.border};
        }

        .checkbox-row input {
          width: 18px;
          height: 18px;
          accent-color: ${colors.primary};
        }

        .checkbox-row label {
          font-size: 14px;
          font-weight: 300;
          color: ${colors.text};
          cursor: pointer;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: ${colors.border};
        }

        .payment-card {
          background: ${colors.background};
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
        }

        .payment-card:hover {
          background: ${colors.backgroundSecondary};
        }

        .payment-card.selected {
          background: ${colors.text};
        }

        .payment-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 28px 32px;
        }

        .payment-icon {
          width: 56px;
          height: 56px;
          background: ${colors.backgroundSecondary};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.text};
          transition: all 0.25s ease;
        }

        .payment-card.selected .payment-icon {
          background: ${colors.background};
          color: ${colors.text};
        }

        .payment-header h4 {
          font-size: 16px;
          font-weight: 400;
          color: ${colors.text};
          margin: 0 0 4px;
        }

        .payment-card.selected .payment-header h4,
        .payment-card.selected .payment-header p {
          color: ${colors.background};
        }

        .payment-header p {
          font-size: 13px;
          font-weight: 300;
          color: ${colors.textSecondary};
          margin: 0;
        }

        .payment-details {
          padding: 0 32px 28px;
          border-top: 1px solid ${colors.border};
        }

        .payment-card.selected .payment-details {
          border-top-color: ${withOpacity(colors.background, 0.2)};
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
        }

        .detail-label {
          font-size: 12px;
          font-weight: 400;
          color: ${colors.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-card.selected .detail-label {
          color: ${withOpacity(colors.background, 0.7)};
        }

        .detail-value {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 300;
          color: ${colors.text};
          font-family: 'Courier New', monospace;
        }

        .payment-card.selected .detail-value {
          color: ${colors.background};
        }

        .copy-btn {
          padding: 6px;
          border: 1px solid ${colors.border};
          background: transparent;
          color: ${colors.textSecondary};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .copy-btn:hover {
          background: ${colors.text};
          color: ${colors.background};
          border-color: ${colors.text};
        }

        .payment-card.selected .copy-btn {
          border-color: ${withOpacity(colors.background, 0.3)};
          color: ${colors.background};
        }

        .paypal-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: ${colors.info};
          color: ${colors.white};
          border: none;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .paypal-btn:hover {
          background: ${withOpacity(colors.info, 0.9)};
        }

        .local-payments-view {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .back-to-main {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 0;
          background: none;
          border: none;
          color: ${colors.textSecondary};
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.25s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .back-to-main:hover {
          color: ${colors.text};
        }

        .local-search {
          display: flex;
          gap: 16px;
        }

        .country-filter {
          min-width: 200px;
          padding: 14px 16px;
          border: 1px solid ${colors.border};
          font-size: 14px;
          font-weight: 300;
          background: ${colors.background};
          color: ${colors.text};
          transition: all 0.25s ease;
        }

        .country-filter:focus {
          outline: none;
          border-color: ${colors.text};
        }

        .local-methods-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: ${colors.border};
          max-height: 400px;
          overflow-y: auto;
        }

        .local-method-card {
          background: ${colors.background};
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .local-method-card:hover {
          background: ${colors.backgroundSecondary};
        }

        .local-method-card.selected {
          background: ${colors.text};
        }

        .local-method-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
        }

        .method-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .method-icon-fallback {
          width: 48px;
          height: 48px;
          background: ${colors.backgroundSecondary};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.text};
        }

        .local-method-card.selected .method-icon-fallback {
          background: ${colors.background};
          color: ${colors.text};
        }

        .local-method-header h4 {
          font-size: 15px;
          font-weight: 400;
          color: ${colors.text};
          margin: 0 0 4px;
        }

        .local-method-card.selected .local-method-header h4,
        .local-method-card.selected .local-method-header p {
          color: ${colors.background};
        }

        .local-method-header p {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 300;
          color: ${colors.textSecondary};
          margin: 0;
        }

        .success-content {
          text-align: center;
          padding: 60px 40px;
        }

        .success-icon {
          margin-bottom: 32px;
          color: ${colors.white};
        }

        .success-title {
          font-size: 48px;
          font-weight: 300;
          margin: 0 0 20px;
          letter-spacing: -0.5px;
        }

        .success-message {
          font-size: 18px;
          font-weight: 300;
          line-height: 1.8;
          margin: 0 0 40px;
        }

        .success-btn {
          padding: 16px 48px;
          background: ${colors.white};
          color: ${colors.primary};
          border: 1px solid ${colors.white};
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .success-btn:hover {
          background: transparent;
          color: ${colors.white};
        }

        .modal-footer {
          padding: 32px 48px;
          border-top: 1px solid ${colors.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: ${colors.background};
        }

        .step-indicator {
          font-size: 12px;
          font-weight: 400;
          color: ${colors.textMuted};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-right {
          display: flex;
          gap: 16px;
        }

        .btn {
          padding: 14px 28px;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid;
        }

        .btn-secondary {
          background: transparent;
          color: ${colors.textSecondary};
          border-color: ${colors.border};
        }

        .btn-secondary:hover {
          background: ${colors.text};
          color: ${colors.background};
          border-color: ${colors.text};
        }

        .btn-secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-primary {
          background: ${colors.text};
          color: ${colors.background};
          border-color: ${colors.text};
        }

        .btn-primary:hover {
          background: ${colors.primary};
          border-color: ${colors.primary};
          color: ${colors.white};
        }

        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .error-alert {
          margin: 0 48px 32px;
          padding: 16px 20px;
          background: ${withOpacity(colors.error, 0.1)};
          border: 1px solid ${colors.error};
          color: ${colors.error};
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 300;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-40px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes slideUp {
          from { 
            opacity: 1; 
            transform: translateY(0); 
          }
          to { 
            opacity: 0; 
            transform: translateY(-40px); 
          }
        }

        @media (max-width: 1200px) {
          .modal-content {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .modal-header,
          .modal-footer {
            padding: 24px 32px;
          }

          .step-content {
            padding: 60px 32px;
          }

          .hero-image {
            height: 400px;
          }

          .donation-card {
            flex-direction: column;
          }

          .donation-card-image {
            width: 100%;
            height: 200px;
          }

          .selection-grid,
          .local-methods-grid {
            grid-template-columns: 1fr;
          }

          .amount-grid {
            grid-template-columns: 1fr;
          }

          .local-search {
            flex-direction: column;
          }

          .country-filter {
            width: 100%;
          }

          .hero-title {
            font-size: 36px;
          }

          .step-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title">
              {activeStep === 0 ? 'ACEF Donation' : steps[activeStep]}
            </h1>
            <button className="close-btn" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {renderStepContent()}
          </div>

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
                  <ArrowLeft size={14} />
                  Back
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} />
                      {activeStep === 5 ? 'Processing' : 'Loading'}
                    </>
                  ) : (
                    <>
                      {activeStep === 5 ? 'Submit' : 'Continue'}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {(activeStep === 0 || activeStep === 6) && (
            <div className="modal-footer">

              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {activeStep === 0 && (
                  <button className="btn btn-primary" onClick={handleNext}>
                    Get Started
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DonationModal;