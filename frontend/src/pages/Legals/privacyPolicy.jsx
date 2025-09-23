import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../theme';

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-semibold" style={{ color: colors.text }}>
          Privacy Policy
        </h1>
        <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
          Last updated: August 2025
        </p>
      </header>

      <section className="space-y-6">
        <p style={{ color: colors.text, lineHeight: '1.7' }}>
          Africa Climate and Environment Foundation ("ACEF", "we", "our", or "us")
          respects your privacy and complies with the EU General Data Protection Regulation (GDPR) and other applicable data protection laws. This Privacy Policy explains how we collect, use, share, and protect personal information when you use our website and services.
        </p>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li style={{ color: colors.text, lineHeight: '1.6' }}>
              <strong>Information you provide:</strong> name, email address, organization, location, donation details, CV or application details for volunteering or jobs, and other information you submit through forms on our website.
            </li>
            <li style={{ color: colors.text, lineHeight: '1.6' }}>
              <strong>Automatically collected data:</strong> IP address, device and browser information, pages visited, referral source, and analytics data.
            </li>
            <li style={{ color: colors.text, lineHeight: '1.6' }}>
              <strong>Payment information:</strong> We do not store full payment card details. Payments are processed by GDPR-compliant third-party processors (e.g., Stripe, PayPal).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            2. Legal Bases for Processing
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            Under GDPR, we process your personal data on the following legal bases: consent, contract performance, legal obligations, and legitimate interests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            3. How We Use Information
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We use collected information to provide and improve our services, process donations, communicate with supporters, manage volunteering and partnership applications, personalize content, monitor usage, and comply with legal obligations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            4. Sharing and Disclosure
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We share data only with GDPR-compliant service providers, partner organizations, and legal authorities where required. We do not sell your personal data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            5. International Transfers
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            If we transfer personal data outside the European Economic Area, we ensure appropriate safeguards, such as Standard Contractual Clauses.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            6. Cookies and Tracking
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We use cookies for functionality and analytics. You can opt-out or adjust preferences via our Cookie Settings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            7. Data Retention
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We retain personal data only as long as necessary or as required by law, after which it is securely deleted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            8. Your GDPR Rights
          </h2>
          <div 
            className="bg-opacity-30 p-4 rounded-lg border"
            style={{ 
              backgroundColor: colors.accent + '20',
              borderColor: colors.accent + '40'
            }}
          >
            <ul className="list-disc pl-6 space-y-2">
              <li style={{ color: colors.text }}>Right of access</li>
              <li style={{ color: colors.text }}>Right to rectification</li>
              <li style={{ color: colors.text }}>Right to erasure</li>
              <li style={{ color: colors.text }}>Right to restrict processing</li>
              <li style={{ color: colors.text }}>Right to data portability</li>
              <li style={{ color: colors.text }}>Right to object</li>
              <li style={{ color: colors.text }}>Right to withdraw consent</li>
              <li style={{ color: colors.text }}>Right to lodge a complaint with a supervisory authority</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            9. Security
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We implement technical and organizational measures to secure personal data, including encryption, access controls, and regular security assessments.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-3" style={{ color: colors.text }}>
            10. Changes to This Policy
          </h2>
          <p style={{ color: colors.text, lineHeight: '1.7' }}>
            We may update this policy and will notify you of significant changes through our website or direct communication.
          </p>
        </div>

        <div 
          className="mt-8 p-4 rounded-lg border"
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
            Contact Information
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          </p>
          <p className="text-sm mt-2" style={{ color: colors.primary }}>
            Email: privacy@acef.org
          </p>
        </div>
      </section>
    </main>
  );
}