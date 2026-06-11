
import React from 'react';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';

export const TermsPage: React.FC = () => {
  return (
    <ScrollAnimatedSection className="max-w-4xl mx-auto bg-surface p-8 sm:p-12 rounded-2xl border border-border shadow-xl">
      <h2 className="text-3xl font-bold text-text-main mb-6 border-b border-border pb-4">Terms of Service</h2>
      <div className="space-y-6 text-text-light prose max-w-none">
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

        <h3 className="text-xl font-semibold text-text-main">1. Acceptance of Terms</h3>
        <p>
          By accessing or using the Penaki service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use this Service.
        </p>

        <h3 className="text-xl font-semibold text-text-main">2. Description of Service</h3>
        <p>
          The Service uses artificial intelligence to extract and present data from lease documents uploaded by you. The results are provided for informational purposes and are not a substitute for professional legal or financial advice.
        </p>

        <h3 className="text-xl font-semibold text-text-main">3. User Responsibilities</h3>
        <p>
          You are responsible for the legality, accuracy, and appropriateness of all data and content you upload. You agree not to upload any material that is unlawful, confidential without proper authority, or infringing on intellectual property rights.
        </p>

        <h3 className="text-xl font-semibold text-text-main">4. Disclaimer of Warranties</h3>
        <p>
          The Service is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not warrant that the service will be error-free, uninterrupted, or that the extracted data will be 100% accurate. You are solely responsible for verifying the accuracy of the information provided by the Service.
        </p>

        <h3 className="text-xl font-semibold text-text-main">5. Limitation of Liability</h3>
        <p>
          In no event shall Penaki, its affiliates, or its licensors be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.
        </p>

        <h3 className="text-xl font-semibold text-text-main">6. Changes to Terms</h3>
        <p>
          We reserve the right to modify these Terms at any time. We will provide notice of any significant changes. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
        </p>
      </div>
    </ScrollAnimatedSection>
  );
};
