
import React, { useState } from 'react';
import { User, View, DemoBooking, Availability } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { ProfileDropdown } from './ProfileDropdown';
import { LogoIcon } from './icons/LogoIcon';
import { BookDemoModal } from './BookDemoModal';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { BellIcon } from './icons/BellIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CircleStackIcon } from './icons/CircleStackIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

interface HeaderProps {
  activeView: View;
  user: User | null;
  onProfileClick: () => void;
  onLogout: () => void;
  onMenuClick: () => void;
  onNavigate: (view: View) => void;
  onBookDemo: (booking: Omit<DemoBooking, 'id' | 'status' | 'createdAt'>) => void;
  availability?: Availability;
  isSidebarOpen?: boolean;
}

const viewTitles: Record<string, string> = {
  home: '', // Handled by responsive logo
  pricing: 'Pricing & Plans',
  portfolio: 'Portfolio Summary',
  abstract: 'Abstract New Lease',
  'choose-template': 'Step 2: Choose Template',
  'review-template': 'Step 3: Select Fields',
  'configure-templates': 'Step 2: Configure Templates',
  'batch-review-templates': 'Step 3: Review & Customize Fields',
  history: 'My Leases',
  locations: 'Lease Locations',
  entities: 'Landlords & Tenants',
  reminders: 'Dues & Reminders',
  'lease-insights': 'AI Lease Insights',
  'client-chats': 'Messages',
  'assets': 'Assets',
  'lease-summaries': 'Lease Summaries',
  profile: 'Profile & Settings',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  'admin-dashboard': 'Admin Dashboard',
  'admin-analytics': 'Analytics',
  'admin-total-activity': 'Total Activity',
  'admin-review-queue': 'Review Queue',
  'admin-workbench': 'Reviewer Workbench',
  'admin-clients': 'Client Management',
  'admin-completed-reviews': 'Completed Reviews',
  'admin-client-detail': 'Client Leases',
  'admin-ai-leases': 'AI Processed Leases',
  'admin-bookings': 'Demo Bookings',
  'admin-reviewers': 'Reviewer Management',
  'admin-amendments': 'Amendment Queue',
  'admin-chats': 'Client Communications',
  'admin-lease-database': 'Lease Database',
  'reviewer-dashboard': 'Reviewer Dashboard',
  'reviewer-workbench': 'Reviewer Workbench',
  'reviewer-activity': 'My Activity History',
  'reviewer-amendments': 'Amendment Queue',
  'reviewer-chats': 'My Chats',
  // Marketing Pages
  'product-asset-mapping': 'Asset Mapping',
  'product-critical-events': 'Critical Event Reminders',
  'product-ai-abstraction': 'AI Powered Abstraction',
  'product-ai-assistant': 'AI Lease Assistant',
  'product-portfolio-intelligence': 'Portfolio Intelligence',
  'solution-lease-summaries': 'Lease Summaries',
  'solution-document-storage': 'Document Storage',
  'solution-expert-verification': 'Expert Verification',
  'solution-analytics': 'Insights & Analytics',
  'solution-due-diligence': 'Due Diligence',
};

const UserAvatar: React.FC<{ user: User, onLogout: () => void, onNavigate: (view: View) => void }> = ({ user, onLogout, onNavigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary hover:bg-primary-focus text-white font-bold text-sm transition-all duration-200"
        aria-label="Open profile menu"
      >
        {getInitials(user.username).toUpperCase()}
      </button>
      {isDropdownOpen && (
        <ProfileDropdown 
          user={user} 
          onLogout={onLogout} 
          onClose={() => setIsDropdownOpen(false)} 
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

const MenuItem: React.FC<{ icon: React.ReactNode, title: string, description?: string, onClick: () => void }> = ({ icon, title, description, onClick }) => (
    <div 
        onClick={onClick}
        className="group/item flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
    >
        <div className="mt-1 p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
        </div>
        <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover/item:text-indigo-600 transition-colors">{title}</h4>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ activeView, user, onProfileClick, onLogout, onMenuClick, onNavigate, onBookDemo, availability, isSidebarOpen }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Identify if the current view is a marketing/public page where we want the full nav menu
  const isMarketingView = 
      activeView === 'home' || 
      activeView === 'pricing' ||
      activeView.startsWith('product-') || 
      activeView.startsWith('solution-') ||
      activeView === 'terms' ||
      activeView === 'privacy';

  // Dynamic height class based on mode
  const headerHeightClass = isMarketingView ? 'h-16 sm:h-20 md:h-24' : 'h-16';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-[1920px] mx-auto">
        <div className={`flex justify-between items-center ${headerHeightClass}`}>
          
          {/* LEFT: Logo + Desktop Nav */}
          <div className="flex items-center gap-3 sm:gap-8 md:gap-12">
            
            {/* Sidebar Trigger - LEFT (Only visible when Logged In on Mobile) */}
            <button
                onClick={onMenuClick}
                className={`text-slate-500 hover:text-primary transition-colors p-1 -ml-1 ${!user ? 'hidden' : 'block md:hidden'}`}
                aria-label="Toggle sidebar"
            >
                <Bars3Icon className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>

            {/* Logo - Hidden on Desktop only if User is Logged In AND Sidebar is Present (collapsed or expanded) */}
            {/* If in app mode (user logged in), we hide logo to prevent duplication with sidebar unless on mobile */}
            <div 
                className={`flex-shrink-0 cursor-pointer ${user && !isMarketingView ? 'md:hidden' : ''}`} 
                onClick={() => onNavigate(user ? 'abstract' : 'home')}
            >
                <LogoIcon variant="horizontal" className="h-8 sm:h-10 md:h-12" />
            </div>

            {isMarketingView ? (
                /* Desktop Mega Menu (Marketing) */
                <nav className="hidden md:flex items-center gap-2">
                    {/* Products Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 px-4 py-2 text-base font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50">
                            Products
                            <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        </button>
                        
                        <div className="absolute left-0 top-full pt-4 w-[320px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out transform origin-top-left">
                            <div className="bg-white rounded-xl shadow-2xl border border-slate-100 p-2 overflow-hidden ring-1 ring-black/5">
                                <MenuItem icon={<MapPinIcon />} title="Asset Mapping" onClick={() => onNavigate('product-asset-mapping')} />
                                <MenuItem icon={<BellIcon />} title="Critical Event Reminders" onClick={() => onNavigate('product-critical-events')} />
                                <MenuItem icon={<SparklesIcon />} title="AI Powered Lease Abstraction" onClick={() => onNavigate('product-ai-abstraction')} />
                                <MenuItem icon={<ChatBubbleLeftRightIcon />} title="AI Lease Assistant" onClick={() => onNavigate('product-ai-assistant')} />
                                <MenuItem icon={<ChartPieIcon />} title="Portfolio Intelligence" onClick={() => onNavigate('product-portfolio-intelligence')} />
                            </div>
                        </div>
                    </div>

                    {/* Solutions Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 px-4 py-2 text-base font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50">
                            Solutions
                            <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        </button>
                        
                        <div className="absolute left-0 top-full pt-4 w-[320px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out transform origin-top-left">
                            <div className="bg-white rounded-xl shadow-2xl border border-slate-100 p-2 overflow-hidden ring-1 ring-black/5">
                                <MenuItem icon={<DocumentTextIcon />} title="Lease Summaries" onClick={() => onNavigate('solution-lease-summaries')} />
                                <MenuItem icon={<CircleStackIcon />} title="Document Storage" onClick={() => onNavigate('solution-document-storage')} />
                                <MenuItem icon={<CheckBadgeIcon />} title="CRE Expert Verification" onClick={() => onNavigate('solution-expert-verification')} />
                                <MenuItem icon={<PresentationChartLineIcon />} title="Lease Insights & Analytics" onClick={() => onNavigate('solution-analytics')} />
                                <MenuItem icon={<MagnifyingGlassIcon />} title="Due Diligence" onClick={() => onNavigate('solution-due-diligence')} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Pricing Link */}
                    <button 
                        onClick={() => onNavigate('pricing')}
                        className="flex items-center gap-1.5 px-4 py-2 text-base font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50"
                    >
                        Pricing
                    </button>
                </nav>
            ) : (
                /* Context Title for App Views (Desktop only) */
                <h1 className="text-xl font-bold text-text-main hidden md:block ml-2 py-1">
                    <span key={activeView} className="animate-fade-in">
                        {viewTitles[activeView] || viewTitles[activeView as string]}
                    </span>
                </h1>
            )}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                    <UserAvatar user={user} onLogout={onLogout} onNavigate={onNavigate} />
                </div>
              ) : (
                <>
                    <button
                        onClick={onProfileClick}
                        className="hidden md:block text-base font-bold text-slate-600 hover:text-primary transition-colors px-4 py-2"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsDemoModalOpen(true)}
                        className="text-xs sm:text-sm md:text-base font-bold text-white bg-primary hover:bg-primary-focus hover:shadow-lg transition-all duration-200 px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-sm transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                    >
                        Request Demo
                    </button>
                    
                    {/* Menu button - RIGHT (Only visible on Mobile when Logged OUT - Marketing) */}
                    <button
                        onClick={onMenuClick}
                        className={`text-slate-500 hover:text-primary transition-colors duration-200 p-1 md:hidden ml-2 ${user ? 'hidden' : 'block'}`}
                        aria-label="Toggle sidebar"
                    >
                        <Bars3Icon className="h-8 w-8" />
                    </button>
                </>
              )}
          </div>
        </div>
      </div>
      {isDemoModalOpen && <BookDemoModal onClose={() => setIsDemoModalOpen(false)} onBook={onBookDemo} availability={availability} />}
    </header>
  );
};
