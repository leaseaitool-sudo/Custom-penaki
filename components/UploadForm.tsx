import React, { useState, useCallback } from 'react';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { XCircleIcon } from './icons/XCircleIcon';
import { ToggleSwitch } from './ToggleSwitch';

interface UploadFormProps {
  onContinueSingle: (formData: { files: File[]; name: string; processingMode: 'ai' | 'human' }) => void;
  onContinueMultiple: (formData: { file: File; name: string; processingMode: 'ai' | 'human' }[]) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onContinueSingle, onContinueMultiple }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'individual' | 'bundle'>('individual');
  const [bundleName, setBundleName] = useState('');
  const [processingMode, setProcessingMode] = useState<'ai' | 'human'>('ai');

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const newFilesArray = Array.from(newFiles);
    const pdfFiles = newFilesArray.filter(file => file.type === 'application/pdf');
    const nonPdfFiles = newFilesArray.filter(file => file.type !== 'application/pdf');

    if (nonPdfFiles.length > 0) {
      setError(`Only PDF files are accepted. ${nonPdfFiles.map(f => f.name).join(', ')} were ignored.`);
    } else {
      setError('');
    }

    setFiles(prevFiles => {
      const existingFileNames = new Set(prevFiles.map(f => f.name));
      const uniqueNewPdfs = pdfFiles.filter(newFile => !existingFileNames.has(newFile.name));
      return [...prevFiles, ...uniqueNewPdfs];
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = '';
  };
  
  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (files.length === 0) {
      setError('Please select at least one lease file to upload.');
      return;
    }
    
    // BUNDLE MODE LOGIC
    if (uploadMode === 'bundle') {
        if (!bundleName.trim()) {
            setError('Please provide a name for the lease bundle.');
            return;
        }
        onContinueSingle({ files, name: bundleName, processingMode });
        return;
    }

    // INDIVIDUAL MODE LOGIC
    if (files.length > 1) {
        // New multi-file flow
        const multipleLeasesData = files.map(file => ({
            file,
            name: file.name.replace(/\.pdf$/i, ''),
            processingMode,
        }));
        onContinueMultiple(multipleLeasesData);
    } else {
        // Single file flow (or only one file selected in individual mode)
        const leaseName = files.length > 0 ? files[0].name.replace(/\.pdf$/i, '') : '';
        onContinueSingle({ files: files.slice(0, 1), name: leaseName, processingMode });
    }
  };

  return (
    <ScrollAnimatedSection tag="div" className="max-w-3xl mx-auto bg-surface p-8 rounded-2xl border border-border shadow-xl">
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-muted rounded-lg border border-border">
                <div className="text-center">
                    <label className="block text-sm font-medium text-text-light mb-3">Upload Mode</label>
                    <ToggleSwitch 
                        labelLeft="Separate Leases"
                        labelRight="Lease Bundle"
                        value={uploadMode === 'bundle'}
                        onChange={(isBundle) => setUploadMode(isBundle ? 'bundle' : 'individual')}
                    />
                </div>
                 <div className="text-center">
                    <label className="block text-sm font-medium text-text-light mb-3">Processing Mode</label>
                    <ToggleSwitch 
                        labelLeft="AI Only"
                        labelRight="Human Review"
                        value={processingMode === 'human'}
                        onChange={(isHuman) => setProcessingMode(isHuman ? 'human' : 'ai')}
                    />
                </div>
            </div>

            {uploadMode === 'bundle' && (
                <div>
                    <label htmlFor="bundle-name" className="block text-sm font-medium text-text-light">Lease Bundle Name</label>
                    <input type="text" name="bundle-name" id="bundle-name" value={bundleName} onChange={e => setBundleName(e.target.value)} className="mt-2 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-surface-muted rounded-md" placeholder="e.g., Main St. Property 2024 Bundle" required />
                </div>
            )}

            <div>
              <label htmlFor="lease-file" className="block text-sm font-medium text-text-light mb-2">
                Lease Files (PDF only)
              </label>
              <div 
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md transition-colors ${isDragging ? 'border-primary bg-sky-50' : ''}`}
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-text-light">
                    <label htmlFor="lease-file" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-surface focus-within:ring-primary-focus">
                      <span>Upload files</span>
                      <input id="lease-file" name="lease-file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" multiple />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDFs up to 10MB each</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-light">Selected Files ({files.length}):</h3>
                <ul className="border border-border rounded-md divide-y divide-border max-h-60 overflow-y-auto">
                  {files.map(file => (
                        <li key={file.name} className="px-4 py-3 bg-surface-muted transition-all">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-main truncate pr-2">{file.name}</span>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveFile(file.name)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                aria-label={`Remove ${file.name}`}
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                        </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </fieldset>
        <div>
          <button type="submit" disabled={files.length === 0} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-focus transition-all duration-300 transform hover:scale-105 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed">
             Continue
          </button>
        </div>
      </form>
    </ScrollAnimatedSection>
  );
};