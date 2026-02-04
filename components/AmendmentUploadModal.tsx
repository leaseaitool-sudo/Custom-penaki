
import React, { useState } from 'react';
import { Lease } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AmendmentUploadModalProps {
  lease: Lease;
  onClose: () => void;
  onSubmit: (file: File, name: string) => void;
}

export const AmendmentUploadModal: React.FC<AmendmentUploadModalProps> = ({ lease, onClose, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) setName(`Amendment - ${selectedFile.name.replace('.pdf', '')}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && name) {
      setIsSubmitting(true);
      setTimeout(() => {
          onSubmit(file, name);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-xl font-bold text-text-main">Add Amendment</h3>
            <button onClick={onClose} className="text-text-light hover:text-text-main">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-text-light mb-1">Amendment Name</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-3 py-2 border border-border rounded-md bg-surface-muted focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., First Extension Agreement"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-light mb-2">Document (PDF)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50">
                    {file ? (
                        <div className="flex flex-col items-center">
                            <DocumentArrowDownIcon className="w-10 h-10 text-primary mb-2" />
                            <p className="text-sm font-bold text-text-main">{file.name}</p>
                            <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline mt-2">Remove</button>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <DocumentArrowDownIcon className="w-10 h-10 text-gray-400 mb-2 mx-auto" />
                            <span className="text-primary font-medium hover:underline">Click to upload</span>
                            <span className="text-text-light"> or drag and drop</span>
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                        </label>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-text-light hover:bg-surface-muted">Cancel</button>
                <button 
                    type="submit" 
                    disabled={!file || !name || isSubmitting} 
                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                    Process Amendment
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
