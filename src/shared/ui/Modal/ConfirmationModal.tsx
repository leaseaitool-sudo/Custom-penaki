import React from 'react';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText = "Yes",
  cancelText = "No",
  isConfirming = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-main">{title}</h3>
          <div className="mt-2 text-sm text-text-light">
            {message}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>
        <div className="bg-surface-muted px-6 py-4 flex flex-row-reverse rounded-b-xl">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
          >
            {isConfirming && <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-border bg-surface px-4 py-2 text-base font-medium text-text-main shadow-sm hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};