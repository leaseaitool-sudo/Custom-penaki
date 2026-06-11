
import React from 'react';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';

export const PrivacyPage: React.FC = () => {
  return (
    <ScrollAnimatedSection className="max-w-4xl mx-auto bg-surface p-8 sm:p-12 rounded-2xl border border-border shadow-xl">
      <h2 className="text-3xl font-bold text-text-main mb-6 border-b border-border pb-4">Privacy Policy</h2>
      <div className="space-y-6 text-text-light prose max-w-none">
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

        <h3 className="text-xl font-semibold text-text-main">1. Introduction</h3>
        <p>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information and data when you use the Penaki service ("Service").
        </p>

        <h3 className="text-xl font-semibold text-text-main">2. Information We Collect</h3>
        <p>
          We collect information you provide directly to us, such as your name, email address, and password when you create an account. We also collect the content, including lease documents, that you upload to the Service for processing.
        </p>

        <h3 className="text-xl font-semibold text-text-main">3. Use of Information</h3>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our Service.</li>
            <li>Process your documents and deliver the abstracted data.</li>
            <li>Communicate with you, including sending service-related notices.</li>
            <li>Protect the security and integrity of our Service.</li>
        </ul>

        <h3 className="text-xl font-semibold text-text-main">4. Data Security and Confidentiality</h3>
        <p>
          We implement industry-standard security measures to protect your information. Your uploaded documents are treated as confidential. We do not use your documents or the data extracted from them for any purpose other than providing the Service to you. Specifically, your data is never used to train our or any third-party AI models.
        </p>

        <h3 className="text-xl font-semibold text-text-main">5. Data Sharing</h3>
        <p>
          We do not sell, trade, or otherwise transfer your personally identifiable information or your uploaded documents to outside parties. This does not include trusted third parties who assist us in operating our Service (e.g., cloud hosting providers), so long as those parties agree to keep this information confidential.
        </p>
        
        <h3 className="text-xl font-semibold text-text-main">6. Your Rights</h3>
        <p>
          You have the right to access, update, or delete your personal information and your uploaded documents at any time through your account settings or by contacting us directly.
        </p>
      </div>
    </ScrollAnimatedSection>
  );
};
