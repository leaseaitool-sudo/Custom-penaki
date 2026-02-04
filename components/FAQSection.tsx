
import React, { useState } from 'react';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const faqData = [
  {
    question: 'What file types are supported?',
    answer: 'Currently, we only support PDF (.pdf) files. We are working on expanding our support to include other document formats in the future.',
  },
  {
    question: 'How long does processing take?',
    answer: 'Processing times can vary based on the document\'s length and complexity. The initial AI pass is fast, usually in 2 minutes. The subsequent human verification step can take from 12 to 36 hours for very complex documents. You can track the real-time status of your submission under the "My Leases" tab.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption for your documents both in transit and at rest. Your data is processed securely and is never used for training models or shared with third parties.',
  },
  {
    question: 'What if the results are incorrect?',
    answer: 'We stand by our 99% accuracy guarantee. If an upload fails, please ensure the file is a valid, non-corrupted PDF and is under our size limit of 10MB. Before any data is delivered to you, it undergoes a rigorous review by our human experts to correct any potential AI discrepancies. This ensures you receive reliable, verified information every time.',
  },
];

const FAQItem: React.FC<{
  item: { question: string; answer: string };
  isOpen: boolean;
  onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-border">
      <button
        onClick={onClick}
        className="flex justify-between items-center w-full py-5 text-left"
      >
        <span className="text-lg font-medium text-text-main">{item.question}</span>
        <ChevronDownIcon
          className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
            <p className="pb-5 text-text-light">{item.answer}</p>
        </div>
      </div>
    </div>
  );
};


export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <ScrollAnimatedSection className="py-16 sm:py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <QuestionMarkCircleIcon className="w-12 h-12 mx-auto text-primary opacity-80 mb-4" />
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-base sm:text-lg text-text-light">
                        Find answers to common questions about our platform.
                    </p>
                </div>
                <div className="bg-surface p-4 sm:p-8 rounded-2xl border border-border shadow-lg">
                    {faqData.map((item, index) => (
                        <FAQItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </ScrollAnimatedSection>
    )
}
