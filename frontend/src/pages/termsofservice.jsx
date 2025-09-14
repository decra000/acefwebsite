import React from 'react';

export default function TermsOfService() {
  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="text-sm text-gray-600 mt-2">Effective date: August 2025</p>
      </header>

      <section className="space-y-4">
        <p>
          These Terms govern your access to and use of the ACEF website and services. By using our services, you agree to these Terms and acknowledge our GDPR-compliant Privacy Policy.
        </p>

        <h2 className="text-xl font-medium">Data Protection Compliance</h2>
        <p>
          ACEF processes personal data in accordance with GDPR. Users in the EU have specific rights outlined in our Privacy Policy.
        </p>

        <footer className="mt-6 text-sm text-gray-600">
          <p>Contact: info@acef.org</p>
        </footer>
      </section>
    </main>
  );
}