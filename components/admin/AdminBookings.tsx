
import React, { useState, useMemo } from 'react';
import { DemoBooking, Availability } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { DocumentDuplicateIcon } from '../icons/DocumentDuplicateIcon';

interface AdminBookingsProps {
  bookings: DemoBooking[];
  onUpdateStatus: (id: string, status: 'Confirmed' | 'Cancelled') => void;
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
}

const AvailabilityCalendarConfig: React.FC<{ 
    availability: Availability; 
    setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
}> = ({ availability, setAvailability }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

    // Helpers
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDateStr(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDateStr(null);
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysCount = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);
        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysCount; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [currentDate]);

    // --- Timezone Conversion Logic ---
    // Convert a given Local Date + Local Time to UTC Date + UTC Time
    const toUTC = (localDateStr: string, localTimeStr: string) => {
        const d = new Date(`${localDateStr}T${localTimeStr}:00`);
        const utcDate = d.toISOString().split('T')[0];
        const utcTime = d.toISOString().split('T')[1].substring(0, 5);
        return { utcDate, utcTime };
    };

    // Convert stored UTC Date + UTC Time to determine if it matches a Local Date + Local Time
    const isSlotSelected = (utcSlotsMap: Availability, localDateStr: string, localTimeStr: string): boolean => {
        const { utcDate, utcTime } = toUTC(localDateStr, localTimeStr);
        return utcSlotsMap[utcDate]?.includes(utcTime) || false;
    };

    const hasActiveSlotsForDay = (localDate: Date) => {
        const startOfDay = new Date(localDate);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(localDate);
        endOfDay.setHours(23,59,59,999);

        return (Object as any).entries(availability).some(([utcDateStr, slots]: [string, string[]]) => {
            return slots.some(utcTimeStr => {
                const d = new Date(`${utcDateStr}T${utcTimeStr}:00Z`);
                return d >= startOfDay && d <= endOfDay;
            });
        });
    };

    const toggleSlot = (localDateStr: string, localTimeStr: string) => {
        const { utcDate, utcTime } = toUTC(localDateStr, localTimeStr);

        setAvailability(prev => {
            const currentSlots = prev[utcDate] || [];
            let newSlots;
            if (currentSlots.includes(utcTime)) {
                newSlots = currentSlots.filter(s => s !== utcTime);
            } else {
                newSlots = [...currentSlots, utcTime].sort();
            }
            
            if (newSlots.length === 0) {
                const { [utcDate]: _, ...rest } = prev;
                return rest;
            }
            
            return { ...prev, [utcDate]: newSlots };
        });
    };

    const applyShortcut = (shortcut: 'all' | 'business' | 'morning' | 'afternoon' | 'clear' | 'copy_prev') => {
        if (!selectedDateStr) return;
        
        if (shortcut === 'copy_prev') {
            const [y, m, d] = selectedDateStr.split('-').map(Number);
            const currentObj = new Date(y, m - 1, d);
            const prevDateObj = new Date(currentObj);
            prevDateObj.setDate(prevDateObj.getDate() - 1);
            const prevDateStr = formatDate(prevDateObj);

            // Find all enabled local slots for previous day
            const prevEnabledLocalSlots = allPotentialSlots.filter(s => isSlotSelected(availability, prevDateStr, s));
            
            setAvailability(prev => {
                let next = { ...prev };
                prevEnabledLocalSlots.forEach(time => {
                    const { utcDate, utcTime } = toUTC(selectedDateStr, time);
                    if (!next[utcDate]) next[utcDate] = [];
                    if (!next[utcDate].includes(utcTime)) {
                        next[utcDate] = [...next[utcDate], utcTime].sort();
                    }
                });
                return next;
            });
            return;
        }

        let slotsToProcess: string[] = [];
        if (shortcut === 'all') {
            slotsToProcess = allPotentialSlots;
        } else if (shortcut === 'business') {
            slotsToProcess = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
        } else if (shortcut === 'morning') {
            slotsToProcess = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
        } else if (shortcut === 'afternoon') {
            slotsToProcess = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
        }

        if (shortcut === 'clear') {
            setAvailability(prev => {
                let next = { ...prev };
                allPotentialSlots.forEach(time => {
                    const { utcDate, utcTime } = toUTC(selectedDateStr, time);
                    if (next[utcDate]) {
                        next[utcDate] = next[utcDate].filter(t => t !== utcTime);
                        if (next[utcDate].length === 0) delete next[utcDate];
                    }
                });
                return next;
            });
        } else {
            setAvailability(prev => {
                let next = { ...prev };
                slotsToProcess.forEach(time => {
                    const { utcDate, utcTime } = toUTC(selectedDateStr, time);
                    if (!next[utcDate]) next[utcDate] = [];
                    if (!next[utcDate].includes(utcTime)) {
                        next[utcDate] = [...next[utcDate], utcTime].sort();
                    }
                });
                return next;
            });
        }
    };

    const allPotentialSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const activeSlotsCount = selectedDateStr ? allPotentialSlots.filter(s => isSlotSelected(availability, selectedDateStr, s)).length : 0;

    // Display string for the selected date - safely parsed
    const selectedDateDisplay = useMemo(() => {
        if (!selectedDateStr) return 'Select a date';
        const [y, m, d] = selectedDateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }, [selectedDateStr]);

    return (
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Availability Management
                </h3>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar View */}
                <div className="flex-1 max-w-md">
                    <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-text-main text-lg">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex gap-2 bg-surface-muted p-1 rounded-lg">
                            <button onClick={handlePrevMonth} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all"><ChevronLeftIcon className="w-5 h-5 text-text-light" /></button>
                            <button onClick={handleNextMonth} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all"><ChevronRightIcon className="w-5 h-5 text-text-light" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-3">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-xs font-bold text-text-light uppercase tracking-wider">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} />;
                            const dateStr = formatDate(day);
                            const hasSlots = hasActiveSlotsForDay(day);
                            const isSelected = selectedDateStr === dateStr;
                            
                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDateStr(dateStr)}
                                    className={`
                                        h-10 w-10 rounded-full flex flex-col items-center justify-center text-sm transition-all relative mx-auto
                                        ${isSelected ? 'bg-primary text-white shadow-md transform scale-105' : 'hover:bg-sky-50 text-text-main'}
                                        ${!isSelected && hasSlots ? 'border-2 border-green-400 font-bold bg-green-50/50' : 'border border-transparent'}
                                    `}
                                >
                                    <span>{day.getDate()}</span>
                                    {hasSlots && !isSelected && <span className="w-1.5 h-1.5 bg-green-500 rounded-full absolute bottom-1"></span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-light">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-green-400 bg-green-50"></div> Available</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Selected</div>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px bg-border my-2"></div>

                {/* Slot Configurator */}
                <div className="flex-1 flex flex-col">
                    <h4 className="font-semibold text-text-main mb-4 flex items-center justify-between">
                        <span>{selectedDateDisplay}</span>
                        {selectedDateStr && (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => applyShortcut('copy_prev')}
                                    className="p-1.5 text-xs text-primary hover:bg-sky-50 rounded border border-primary/20 flex items-center gap-1 transition-colors"
                                    title="Copy availability from previous day"
                                >
                                    <DocumentDuplicateIcon className="w-3 h-3" />
                                    Copy Prev
                                </button>
                                <span className="text-xs font-normal text-text-light bg-surface-muted px-2 py-1 rounded">
                                    {activeSlotsCount} slots active
                                </span>
                            </div>
                        )}
                    </h4>
                    
                    {selectedDateStr ? (
                        <div className="flex-1 flex flex-col">
                            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border border-dashed">
                                <button onClick={() => applyShortcut('all')} className="text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-full transition-colors">Select All</button>
                                <button onClick={() => applyShortcut('morning')} className="text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-full transition-colors">Morning</button>
                                <button onClick={() => applyShortcut('afternoon')} className="text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-full transition-colors">Afternoon</button>
                                <button onClick={() => applyShortcut('business')} className="text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors">Business Hours</button>
                                <button onClick={() => applyShortcut('clear')} className="text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors ml-auto">Clear</button>
                            </div>
                            
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                                {allPotentialSlots.map(slot => {
                                    const isSelected = isSlotSelected(availability, selectedDateStr, slot);
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => toggleSlot(selectedDateStr, slot)}
                                            className={`text-xs py-2 rounded-md border transition-all duration-200 ${
                                                isSelected 
                                                ? 'bg-green-500 border-green-500 text-white shadow-sm font-semibold transform scale-105' 
                                                : 'bg-white border-border text-text-light hover:border-primary hover:text-primary'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-surface-muted/30 rounded-xl border border-dashed border-border p-8 text-center">
                            <ClockIcon className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-text-main font-medium">No Date Selected</p>
                            <p className="text-sm text-text-light">Click a date on the calendar to configure availability.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({ bookings, onUpdateStatus, availability, setAvailability }) => {
  const sortedBookings = [...bookings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <ScrollAnimatedSection className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-text-main">Demo Bookings</h2>
                <p className="mt-1 text-text-light">Manage scheduled demos and calendar availability.</p>
            </div>
        </div>

        <AvailabilityCalendarConfig availability={availability} setAvailability={setAvailability} />

        <div className="bg-surface rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-text-main">Incoming Requests</h3>
            </div>
            {sortedBookings.length === 0 ? (
                <div className="text-center py-16">
                    <CalendarIcon className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-xl font-medium text-text-main">No bookings yet</h3>
                    <p className="mt-2 text-text-light">Requests for demos will appear here.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-surface-muted">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Prospect</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Requested Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border">
                            {sortedBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-surface-muted transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-main">{booking.name}</span>
                                            <span className="text-xs text-text-light">{booking.email}</span>
                                            <span className="text-xs text-primary font-medium">{booking.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-text-main">
                                            <CalendarIcon className="w-4 h-4 text-text-light" />
                                            <span>{booking.date.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-text-light mt-1">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{booking.timeSlot} ({booking.timeZone})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800 animate-pulse'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {booking.status === 'Pending' && (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => onUpdateStatus(booking.id, 'Confirmed')}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-md transition-colors border border-green-200"
                                                    title="Confirm Booking"
                                                >
                                                    <CheckIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => onUpdateStatus(booking.id, 'Cancelled')}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors border border-red-200"
                                                    title="Decline Booking"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {booking.status !== 'Pending' && (
                                            <span className="text-gray-400 text-xs italic">
                                                {booking.status === 'Confirmed' ? 'Scheduled' : 'Declined'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </ScrollAnimatedSection>
  );
};
