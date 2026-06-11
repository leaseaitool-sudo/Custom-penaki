import React, { useState } from 'react';
import { Lease } from '@/shared/types';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';

interface EscalationModalProps {
  lease: Lease;
  onClose: () => void;
  onSubmit: (leaseId: string, notes: string) => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  lease,
  onClose,
  onSubmit,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }
    setError('');
    setIsSubmitting(true);
    // Simulate a brief delay for UX
    setTimeout(() => {
        onSubmit(lease.id, notes);
        setIsSubmitting(false);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
            <div className="p-6">
            <h3 className="text-lg font-bold text-text-main">Request Review for Lease</h3>
            <p className="text-sm text-text-light mt-1 truncate" title={lease.name}>{lease.name}</p>
            <div className="mt-4">
                <label htmlFor="escalation-notes" className="block text-sm font-medium text-text-light">
                    Please describe the issue or discrepancy you found:
                </label>
                <textarea
                id="escalation-notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 block w-full px-3 py-2 bg-surface-muted border border-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., The rent commencement date on page 3 seems incorrect. It should be..."
                required
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="bg-surface-muted px-6 py-4 flex flex-col-reverse sm:flex-row-reverse rounded-b-xl gap-3">
            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 sm:w-auto sm:text-sm disabled:bg-gray-400"
            >
                {isSubmitting && <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                Submit for Review
            </button>
            <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md border border-border bg-surface px-4 py-2 text-base font-medium text-text-main shadow-sm hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto sm:text-sm"
            >
                Cancel
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};