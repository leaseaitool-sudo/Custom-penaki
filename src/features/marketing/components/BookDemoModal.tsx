/**
 * BookDemoModal — Calendly placeholder.
 *
 * The old custom booking form + availability calendar has been removed.
 * This component is kept as a lightweight bridge so all existing
 * `<BookDemoModal onClose={...} />` call-sites compile without changes.
 *
 * TODO: Replace the button below with a Calendly inline widget
 * or window.open('https://calendly.com/your-link') once the
 * Calendly account is configured.
 */

import React from 'react';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';

interface BookDemoModalProps {
    onClose: () => void;
    /** Legacy props — kept for call-site compatibility. Not used. */
    onBook?: (...args: any[]) => any;
    availability?: any;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({ onClose }) => {
    const handleOpenCalendly = () => {
        // TODO: replace with your Calendly link
        window.open('https://calendly.com', '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center gap-6 animate-slide-up z-10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                    aria-label="Close"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book a Demo</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        Schedule a personalized demo with our team and see how Penaki AI can transform your lease management workflow.
                    </p>
                </div>

                <button
                    onClick={handleOpenCalendly}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                    Schedule on Calendly →
                </button>

                <p className="text-xs text-gray-400 text-center">
                    You'll be taken to Calendly to pick a time that works for you.
                </p>
            </div>
        </div>
    );
};
