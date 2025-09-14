import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mt-2">Last updated: August 2025</p>
      </header>

      <section className="space-y-4">
        <p>
          Africa Climate and Environment Foundation ("ACEF", "we", "our", or "us")
          respects your privacy and complies with the EU General Data Protection Regulation (GDPR) and other applicable data protection laws. This Privacy Policy explains how we collect, use, share, and protect personal information when you use our website and services.
        </p>

        <h2 className="text-xl font-medium">1. Information We Collect</h2>
        <ul className="list-disc pl-6">
          <li>Information you provide: name, email address, organization, location, donation details, CV or application details for volunteering or jobs, and other information you submit through forms on our website.</li>
          <li>Automatically collected data: IP address, device and browser information, pages visited, referral source, and analytics data.</li>
          <li>Payment information: We do not store full payment card details. Payments are processed by GDPR-compliant third-party processors (e.g., Stripe, PayPal).</li>
        </ul>

        <h2 className="text-xl font-medium">2. Legal Bases for Processing</h2>
        <p>
          Under GDPR, we process your personal data on the following legal bases: consent, contract performance, legal obligations, and legitimate interests.
        </p>

        <h2 className="text-xl font-medium">3. How We Use Information</h2>
        <p>
          We use collected information to provide and improve our services, process donations, communicate with supporters, manage volunteering and partnership applications, personalize content, monitor usage, and comply with legal obligations.
        </p>

        <h2 className="text-xl font-medium">4. Sharing and Disclosure</h2>
        <p>
          We share data only with GDPR-compliant service providers, partner organizations, and legal authorities where required. We do not sell your personal data.
        </p>

        <h2 className="text-xl font-medium">5. International Transfers</h2>
        <p>
          If we transfer personal data outside the European Economic Area, we ensure appropriate safeguards, such as Standard Contractual Clauses.
        </p>

        <h2 className="text-xl font-medium">6. Cookies and Tracking</h2>
        <p>
          We use cookies for functionality and analytics. You can opt-out or adjust preferences via our Cookie Settings.
        </p>

        <h2 className="text-xl font-medium">7. Data Retention</h2>
        <p>
          We retain personal data only as long as necessary or as required by law, after which it is securely deleted.
        </p>

        <h2 className="text-xl font-medium">8. Your GDPR Rights</h2>
        <ul className="list-disc pl-6">
          <li>Right of access</li>
          <li>Right to rectification</li>
          <li>Right to erasure</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object</li>
          <li>Right to withdraw consent</li>
          <li>Right to lodge a complaint with a supervisory authority</li>
        </ul>

        <h2 className="text-xl font-medium">9. Security</h2>
        <p>
          We implement technical and organizational measures to secure personal data.
        </p>

        <h2 className="text-xl font-medium">10. Changes to This Policy</h2>
        <p>
          We may update this policy and will notify you of significant changes.
        </p>

        <footer className="mt-8 text-sm text-gray-600">
          <p>Contact: privacy@acef.org</p>
        </footer>
      </section>
    </main>
  );
}