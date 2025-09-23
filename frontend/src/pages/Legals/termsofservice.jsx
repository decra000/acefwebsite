import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../theme';

export default function TermsOfService() {
  const [backUrl, setBackUrl] = useState('/');
  const [backText, setBackText] = useState('Back to Home');
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    // Get referrer information from various sources
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    const section = urlParams.get('section');
    
    // Determine intelligent back navigation
    if (from) {
      // If we have explicit 'from' parameter
      let backPath = from;
      if (section) {
        backPath += `#${section}`;
      }
      setBackUrl(backPath);
      
      // Set contextual back text based on the source page
      const pageNames = {
        '/': 'Back to Home',
        '/donate': 'Back to Donations',
        '/about': 'Back to About',
        '/contact': 'Back to Contact',
        '/volunteer': 'Back to Volunteer',
        '/programs': 'Back to Programs',
        '/footer': 'Back to Footer'
      };
      
      setBackText(pageNames[from] || 'Back');
      if (section) {
        setBackText(prev => `${prev} (${section.replace('-', ' ')})`);
      }
    } else if (referrer && referrer.includes(window.location.origin)) {
      // If referrer is from same origin
      const referrerPath = new URL(referrer).pathname;
      const referrerHash = new URL(referrer).hash;
      
      setBackUrl(referrer);
      
      const pageNames = {
        '/': 'Back to Home',
        '/donate': 'Back to Donations',
        '/about': 'Back to About',
        '/contact': 'Back to Contact',
        '/volunteer': 'Back to Volunteer',
        '/programs': 'Back to Programs'
      };
      
      setBackText(pageNames[referrerPath] || 'Back');
      if (referrerHash) {
        const sectionName = referrerHash.replace('#', '').replace('-', ' ');
        setBackText(prev => `${prev} (${sectionName})`);
      }
    } else {
      // Default fallback
      setBackUrl('/');
      setBackText('Back to Home');
    }
  }, []);

  const handleBack = (e) => {
    e.preventDefault();
    
    // Try to use browser history first if available
    if (window.history.length > 1 && document.referrer) {
      window.history.back();
    } else {
      // Fallback to constructed URL
      window.location.href = backUrl;
    }
  };

  return (
    <main 
      className="container mx-auto p-6 max-w-4xl" 
      style={{ 
        marginTop: '70px',
        backgroundColor: colors.background,
        color: colors.text,
        minHeight: '100vh'
      }}
    >
      {/* Intelligent Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border"
          style={{
            color: colors.primary,
            backgroundColor: 'transparent',
            borderColor: colors.border
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.backgroundSecondary;
            e.target.style.borderColor = colors.primaryLight;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = colors.border;
          }}
        >
          <ArrowLeft size={16} />
          {backText}
        </button>
      </div>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <FileText size={24} style={{ color: colors.primary }} />
          </div>
          <h1 className="text-3xl font-semibold" style={{ color: colors.text }}>
            Terms of Service
          </h1>
        </div>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Effective date: August 2025
        </p>
      </header>

      <section className="space-y-8">
        {/* Introduction */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border
          }}
        >
          <p style={{ color: colors.text, lineHeight: '1.7', fontSize: '1.1rem' }}>
            These Terms of Service ("Terms") govern your access to and use of the Africa Climate and Environment Foundation (ACEF) website and services. By using our services, you agree to these Terms and acknowledge our GDPR-compliant Privacy Policy.
          </p>
        </div>

        {/* Acceptance of Terms */}
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2" style={{ color: colors.text }}>
            <Users size={20} style={{ color: colors.primary }} />
            1. Acceptance of Terms
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            By accessing or using ACEF's website, services, or participating in our programs, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, please do not use our services.
          </p>
        </div>

        {/* Use of Services */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            2. Use of Our Services
          </h2>
          <div className="space-y-3">
            <h3 className="font-medium" style={{ color: colors.text }}>Permitted Uses</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Access information about our environmental and climate programs
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Make donations to support our mission
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Apply for volunteer opportunities and job positions
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Subscribe to our newsletters and communications
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Participate in events and educational programs
              </li>
            </ul>
          </div>
        </div>

        {/* Data Protection Compliance */}
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2" style={{ color: colors.text }}>
            <Shield size={20} style={{ color: colors.primary }} />
            3. Data Protection Compliance
          </h2>
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: colors.accent + '15',
              borderColor: colors.accent + '30'
            }}
          >
            <p style={{ color: colors.text, lineHeight: '1.7' }}>
              ACEF processes personal data in accordance with the EU General Data Protection Regulation (GDPR) and other applicable data protection laws. Users in the European Union have specific rights outlined in our Privacy Policy, including the right to access, rectify, erase, restrict processing, data portability, and object to processing of their personal data.
            </p>
          </div>
        </div>

        {/* User Responsibilities */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            4. User Responsibilities
          </h2>
          <div className="space-y-3">
            <p style={{ color: colors.text, lineHeight: '1.7' }}>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Provide accurate and truthful information when registering or submitting forms
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Use our services for lawful purposes only
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Respect intellectual property rights
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Not attempt to disrupt or interfere with our services
              </li>
              <li style={{ color: colors.text, lineHeight: '1.6' }}>
                Maintain the confidentiality of any account credentials
              </li>
            </ul>
          </div>
        </div>

        {/* Donations and Payments */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            5. Donations and Payments
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7', marginBottom: '1rem' }}>
            All donations are processed securely through GDPR-compliant third-party payment processors. By making a donation, you confirm that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li style={{ color: colors.text, lineHeight: '1.6' }}>
              You are authorized to use the payment method provided
            </li>
            <li style={{ color: colors.text, lineHeight: '1.6' }}>
              Donations are voluntary and non-refundable unless required by law
            </li>
            <li style={{ color: colors.text, lineHeight: '1.6' }}>
              You understand how your donation will be used as described on our website
            </li>
          </ul>
        </div>

        {/* Intellectual Property */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            6. Intellectual Property
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            All content on our website, including text, images, logos, and materials, is owned by ACEF or our licensors and is protected by copyright and other intellectual property laws. You may view and print content for personal, non-commercial use only.
          </p>
        </div>

        {/* Privacy and Cookies */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            7. Privacy and Cookies
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            Our use of your personal data is governed by our Privacy Policy, which forms part of these Terms. We use cookies and similar technologies for functionality and analytics purposes. You can manage your cookie preferences through your browser settings or our cookie consent banner.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2" style={{ color: colors.text }}>
            <AlertTriangle size={20} style={{ color: colors.warning }} />
            8. Limitation of Liability
          </h2>
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: colors.warning + '10',
              borderColor: colors.warning + '30'
            }}
          >
            <p style={{ color: colors.text, lineHeight: '1.7' }}>
              ACEF provides services "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services, except as required by applicable law.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            9. Changes to These Terms
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We may update these Terms periodically. Material changes will be communicated through our website or direct notification. Your continued use of our services after changes take effect constitutes acceptance of the new Terms.
          </p>
        </div>

        {/* Governing Law */}
        <div>
          <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
            10. Governing Law
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            These Terms are governed by the laws of the jurisdictions in which ACEF operates. Any disputes will be resolved through appropriate legal channels in accordance with applicable law and GDPR requirements.
          </p>
        </div>

        {/* Contact Information */}
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border
          }}
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: colors.text }}>
            <FileText size={18} style={{ color: colors.primary }} />
            Contact Information
          </h3>
          <p className="mb-3" style={{ color: colors.textSecondary, lineHeight: '1.6' }}>
            If you have questions about these Terms of Service or need to report an issue, please contact us:
          </p>
          <div className="space-y-1">
            <p style={{ color: colors.primary, fontWeight: '500' }}>
              Email: info@acef.org
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Response time: Within 48 hours during business days
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-4 border-t" style={{ borderColor: colors.border }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            By using ACEF services, you acknowledge that you have read and understood these Terms of Service and our Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}