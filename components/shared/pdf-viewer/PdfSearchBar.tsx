import React from 'react';
import { MagnifyingGlassIcon } from '../../icons/MagnifyingGlassIcon';
import { ChevronLeftIcon } from '../../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { XCircleIcon } from '../../icons/XCircleIcon';

interface PdfSearchBarProps {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    query: string;
    setQuery: (v: string) => void;
    isSearching: boolean;
    resultCount: number;
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
}

export const PdfSearchBar: React.FC<PdfSearchBarProps> = ({
    isOpen, setIsOpen, query, setQuery, isSearching, resultCount, currentIndex, onNext, onPrev, onClose, inputRef
}) => {
    return (
        <div className={`absolute top-28 right-4 z-[100] bg-surface shadow-xl border border-border rounded-full flex items-center transition-all duration-300 ease-in-out ${isOpen ? 'p-1.5 gap-2 rounded-lg' : 'p-2'}`}>
            {!isOpen ? (
                <button onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }} className="text-text-light hover:text-primary transition-colors p-1" title="Search Document">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
            ) : (
                <>
                <div className="flex items-center bg-surface-muted rounded-md px-2 py-1 border border-border relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-text-light mr-2" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none text-sm w-32 text-text-main placeholder-slate-400"
                    />
                    {isSearching && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    )}
                </div>
                <div className="flex items-center text-xs font-medium text-text-light min-w-[40px] justify-center whitespace-nowrap">
                    {resultCount > 0 ? `${currentIndex + 1} / ${resultCount}` : '0 / 0'}
                </div>
                <div className="h-4 w-px bg-border mx-1"></div>
                <button onClick={onPrev} disabled={resultCount === 0} className="p-1 rounded hover:bg-surface-muted text-text-light hover:text-text-main disabled:opacity-30"><ChevronLeftIcon className="w-4 h-4" /></button>
                <button onClick={onNext} disabled={resultCount === 0} className="p-1 rounded hover:bg-surface-muted text-text-light hover:text-text-main disabled:opacity-30"><ChevronRightIcon className="w-4 h-4" /></button>
                <button onClick={onClose} className="p-1 rounded hover:bg-red-50 text-text-light hover:text-red-500 ml-1"><XCircleIcon className="w-4 h-4" /></button>
                </>
            )}
        </div>
    );
};
