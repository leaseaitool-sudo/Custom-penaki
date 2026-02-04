
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeftRightIcon } from './icons/ArrowLeftRightIcon';
import { ArrowUpDownIcon } from './icons/ArrowUpDownIcon';
import '../styles/InteractiveLeaseSlider.css';

const DataRow: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-3 border-b border-border">
        <span className="text-sm font-medium text-text-light">{label}</span>
        <span className="text-base font-semibold text-text-main text-right">{value}</span>
    </div>
);

// A simple hook to check for a media query
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => {
            setMatches(media.matches);
        };
        // Use the modern addEventListener/removeEventListener
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};


export const InteractiveLeaseSlider: React.FC = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDesktop = useMediaQuery('(min-width: 640px)'); // Tailwind's 'sm' breakpoint

    const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        const percentage = isDesktop
            ? ((clientX - rect.left) / rect.width) * 100
            : ((clientY - rect.top) / rect.height) * 100;

        setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }, [isDesktop]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteractionMove(e.clientX, e.clientY);
    }, [handleInteractionMove]);
    
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    }, [handleInteractionMove]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    const handleTouchEnd = useCallback(() => setIsDragging(false), []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) handleInteractionMove(e.clientX, e.clientY);
    }, [isDragging, handleInteractionMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (isDragging) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    }, [isDragging, handleInteractionMove]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
    
    const clipPathStyle = isDesktop
      ? `inset(0 ${100 - sliderPosition}% 0 0)`
      : `inset(${sliderPosition}% 0 0 0)`;

    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-4xl mx-auto aspect-[9/14] sm:aspect-[16/8] rounded-2xl shadow-2xl border border-border select-none overflow-hidden cursor-ns-resize sm:cursor-ew-resize"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* After Image (Structured Data) */}
            <div 
                className="absolute inset-0 z-10 lease-slider-after-image"
                style={{ '--clip-path': clipPathStyle } as React.CSSProperties}
            >
                <div className="bg-surface h-full p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-text-main border-b border-border pb-3 mb-4">Abstraction Result</h3>
                    <div className="space-y-2">
                        <DataRow label="Landlord" value="Global Property Group" />
                        <DataRow label="Tenant" value="Innovate Inc." />
                        <DataRow label="Lease Start" value="January 1, 2024" />
                        <DataRow label="Lease End" value="December 31, 2028" />
                        <DataRow label="Monthly Rent" value="€4,500.00" />
                        <DataRow label="Rent Escalation" value="3% Annually" />
                        <DataRow label="Renewal Option" value="2 x 5 Years" />
                    </div>
                </div>
            </div>

            {/* Before Image (Raw Text) */}
            <div className="absolute inset-0 bg-white p-6 sm:p-8 font-serif text-gray-700 text-justify leading-relaxed text-sm">
                <h3 className="text-center font-bold text-lg mb-4 text-gray-800">COMMERCIAL LEASE AGREEMENT</h3>
                <p className="mb-4">
                    This Commercial Lease Agreement ("Lease") is made and effective as of January 1, 2024, by and between <strong>Global Property Group</strong>, with a mailing address of 123 Skyscraper Ave, Frankfurt, Germany ("Landlord"), and <strong>Innovate Inc.</strong>, a Delaware corporation, with a primary office at 456 Tech Park, Berlin, Germany ("Tenant").
                </p>
                <p className="mb-4">
                    <strong>1. PREMISES.</strong> Landlord hereby rents to Tenant, and Tenant hereby rents from Landlord, the commercial property located at 789 Industrial Way, Munich, Germany (the "Premises").
                </p>
                <p className="mb-4">
                    <strong>2. TERM.</strong> The term of this Lease shall be for a period of five (5) years, commencing on January 1, 2024, and ending on December 31, 2028. Tenant is granted two (2) options to extend the lease term for a period of five (5) years each.
                </p>
                <p>
                    <strong>3. RENT.</strong> Tenant shall pay to Landlord a monthly rent of Four Thousand Five Hundred Euros (€4,500.00). The rent is subject to an annual escalation of three percent (3%) on each anniversary of the commencement date. All sums shall be payable in advance on the first day of each month.
                </p>
            </div>

            {/* Slider Handle */}
            <div 
                className="absolute bg-primary z-20 sm:w-1 sm:h-auto h-1 w-auto lease-slider-handle"
                style={{ '--slider-offset': `calc(${sliderPosition}% - 1px)` } as React.CSSProperties}
            >
                <div className="absolute bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white 
                                sm:h-10 sm:w-10 sm:top-1/2 sm:-translate-y-1/2 sm:-translate-x-1/2
                                h-10 w-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:left-auto sm:-translate-x-0 sm:-translate-y-0">
                    {isDesktop ? (
                        <ArrowLeftRightIcon className="w-6 h-6" />
                    ) : (
                        <ArrowUpDownIcon className="w-6 h-6" />
                    )}
                </div>
            </div>
        </div>
    );
};
