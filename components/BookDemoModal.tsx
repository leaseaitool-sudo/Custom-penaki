
import React, { useState, useEffect, useMemo } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { DemoBooking, Availability } from '../types';

interface BookDemoModalProps {
  onClose: () => void;
  onBook: (booking: Omit<DemoBooking, 'id' | 'status' | 'createdAt'>) => void;
  availability?: Availability;
}

type Step = 'details' | 'calendar' | 'confirmation';

export const BookDemoModal: React.FC<BookDemoModalProps> = ({ onClose, onBook, availability }) => {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    // Detect user's timezone
    try {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) {
        setTimeZone('UTC');
    }
  }, []);

  const handleNextToCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.company) {
        setStep('calendar');
    }
  };

  const handleBookMeeting = () => {
      if (selectedDate && selectedSlot) {
          onBook({
              name: formData.name,
              email: formData.email,
              company: formData.company,
              date: selectedDate,
              timeSlot: selectedSlot,
              timeZone: timeZone,
          });
          setStep('confirmation');
      }
  };

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate Calendar Grid
  const calendarDays = useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysCount = daysInMonth(year, month);
      const startDay = startDayOfMonth(year, month);
      const days = [];

      // Empty slots for previous month
      for (let i = 0; i < startDay; i++) {
          days.push(null);
      }

      // Days of current month
      for (let i = 1; i <= daysCount; i++) {
          days.push(new Date(year, month, i));
      }

      return days;
  }, [currentDate]);

  // Generate Time Slots based on selected date and Timezone
  const timeSlots = useMemo(() => {
      if (!selectedDate) return [];
      
      const availableLocalSlots: string[] = [];

      if (availability && Object.keys(availability).length > 0) {
          // Iterate over all configured UTC slots and convert to User Local Time
          (Object as any).entries(availability).forEach(([utcDateStr, slots]: [string, string[]]) => {
              slots.forEach(utcTimeStr => {
                  // Construct UTC Date Object
                  const utcDateTime = new Date(`${utcDateStr}T${utcTimeStr}:00Z`);
                  
                  // Check if this UTC timestamp translates to the Selected User Local Date
                  // We compare the components (Year, Month, Day) in the User's timezone
                  const userYear = selectedDate.getFullYear();
                  const userMonth = selectedDate.getMonth();
                  const userDay = selectedDate.getDate();

                  // Get components of the UTC time in the User's Timezone
                  // Use a fresh date object to avoid mutating the original comparison logic
                  // Note: This relies on the browser's local timezone being the user's timezone
                  const slotInLocal = new Date(utcDateTime);
                  
                  if (
                      slotInLocal.getFullYear() === userYear &&
                      slotInLocal.getMonth() === userMonth &&
                      slotInLocal.getDate() === userDay
                  ) {
                      // Format to HH:mm
                      const hour = String(slotInLocal.getHours()).padStart(2, '0');
                      const minute = String(slotInLocal.getMinutes()).padStart(2, '0');
                      availableLocalSlots.push(`${hour}:${minute}`);
                  }
              });
          });
          
          // Deduplicate and sort
          return Array.from(new Set(availableLocalSlots)).sort();
      } else {
          // Fallback defaults if no config (Mock Data)
          return ['09:00', '10:00', '11:00', '14:00', '15:00'];
      }
  }, [selectedDate, availability]);

  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
      return selectedDate && 
             date.getDate() === selectedDate.getDate() &&
             date.getMonth() === selectedDate.getMonth() &&
             date.getFullYear() === selectedDate.getFullYear();
  };

  const isPast = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
  };
  
  const hasAvailability = (date: Date) => {
      if (!availability || Object.keys(availability).length === 0) return true; // Default open if no config
      
      // Check if ANY UTC slot converts to this local date
      // Optimization: This scans all slots for every day render. 
      // For a small app this is fine. For production, optimize with a map.
      return (Object as any).entries(availability).some(([utcDateStr, slots]: [string, string[]]) => {
          return slots.some(utcTimeStr => {
              const utcDateTime = new Date(`${utcDateStr}T${utcTimeStr}:00Z`);
              return utcDateTime.getFullYear() === date.getFullYear() &&
                     utcDateTime.getMonth() === date.getMonth() &&
                     utcDateTime.getDate() === date.getDate();
          });
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 h-full" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Modal Panel - Centering Fix */}
      <div className="relative bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh] h-auto m-auto animate-slide-up z-10">
        <div className="p-6 border-b border-border flex justify-between items-center bg-white sticky top-0 z-20">
            <h3 className="text-xl font-bold text-text-main">
                {step === 'details' && 'Book a Demo'}
                {step === 'calendar' && 'Select a Time'}
                {step === 'confirmation' && 'Booking Confirmed'}
            </h3>
            <button onClick={onClose} className="text-text-light hover:text-text-main transition-colors p-2 rounded-full hover:bg-surface-muted -mr-2">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {step === 'details' && (
                <form onSubmit={handleNextToCalendar} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-light mb-1">Full Name</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-border bg-surface-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Jane Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light mb-1">Work Email</label>
                        <input 
                            required 
                            type="email" 
                            className="w-full px-4 py-3 rounded-lg border border-border bg-surface-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="jane@company.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light mb-1">Company Name</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-border bg-surface-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Acme Real Estate"
                            value={formData.company}
                            onChange={e => setFormData({...formData, company: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 mt-4 btn-gradient">
                        Schedule Demo
                    </button>
                </form>
            )}

            {step === 'calendar' && (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Calendar Side */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-text-main text-lg">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-surface-muted text-text-light transition-colors">
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-surface-muted text-text-light transition-colors">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-xs font-bold text-text-light uppercase py-1">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} />;
                                const isAvailable = hasAvailability(day);
                                const disabled = isPast(day) || !isAvailable;
                                const selected = isSelected(day);
                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => !disabled && setSelectedDate(day)}
                                        disabled={disabled}
                                        className={`
                                            h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 mx-auto font-medium
                                            ${selected ? 'bg-primary text-white shadow-md transform scale-110' : ''}
                                            ${!selected && !disabled ? 'hover:bg-sky-100 text-text-main cursor-pointer' : ''}
                                            ${disabled ? 'text-gray-300 cursor-not-allowed opacity-50' : ''}
                                            ${isToday(day) && !selected ? 'ring-1 ring-primary text-primary' : ''}
                                        `}
                                    >
                                        {day.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 flex items-center gap-2 text-xs text-text-light bg-surface-muted p-2.5 rounded-lg border border-border">
                            <ClockIcon className="w-4 h-4" />
                            <span>Your timezone: {timeZone}</span>
                        </div>
                    </div>

                    {/* Time Slots Side */}
                    <div className="md:w-48 flex flex-col border-t md:border-t-0 md:border-l border-border md:pl-8 pt-6 md:pt-0">
                        <h4 className="font-semibold text-text-main mb-4">
                            {selectedDate 
                                ? selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                                : 'Select a date'}
                        </h4>
                        
                        {!selectedDate ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-light text-sm italic min-h-[200px]">
                                <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                                Please select a date to see available times.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {timeSlots.length > 0 ? (
                                    timeSlots.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`
                                                w-full py-2.5 px-3 rounded-lg text-sm font-medium border transition-all duration-200
                                                ${selectedSlot === slot 
                                                    ? 'bg-primary text-white border-primary shadow-sm' 
                                                    : 'bg-white border-border text-text-main hover:border-primary hover:text-primary'}
                                            `}
                                        >
                                            {slot}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-text-light italic">No slots available for this date.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 'confirmation' && (
                <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-check-pop">
                        <CheckBadgeIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-text-main mb-2">Meeting Scheduled!</h4>
                    <p className="text-text-light max-w-sm mx-auto mb-6">
                        We have sent a calendar invitation to <strong>{formData.email}</strong>.
                    </p>
                    
                    <div className="bg-surface-muted p-5 rounded-xl border border-border inline-block text-left mb-8 min-w-[280px]">
                        <div className="flex items-center gap-3 mb-3">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            <span className="font-medium text-text-main">
                                {selectedDate?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ClockIcon className="w-5 h-5 text-primary" />
                            <span className="font-medium text-text-main">{selectedSlot} ({timeZone})</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-focus transition-colors shadow-md">
                        Done
                    </button>
                </div>
            )}
        </div>

        {/* Footer Actions for Calendar Step */}
        {step === 'calendar' && (
            <div className="p-4 sm:px-8 border-t border-border bg-surface-muted flex justify-between items-center rounded-b-2xl">
                <button 
                    onClick={() => setStep('details')}
                    className="text-text-light font-medium hover:text-text-main transition-colors px-4 py-2"
                >
                    Back
                </button>
                <button 
                    onClick={handleBookMeeting}
                    disabled={!selectedDate || !selectedSlot}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-primary-focus transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-gradient"
                >
                    Confirm Booking
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
