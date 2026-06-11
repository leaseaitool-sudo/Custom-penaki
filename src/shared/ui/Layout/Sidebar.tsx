
import React, { useMemo, useState } from 'react';
import { View, User, Role, Lease, LeaseStatus } from '@/shared/types';
import { HomeIcon } from '@/shared/ui/Icons/HomeIcon';
import { PlusCircleIcon } from '@/shared/ui/Icons/PlusCircleIcon';
import { ListBulletIcon } from '@/shared/ui/Icons/ListBulletIcon';
import { ChartBarIcon } from '@/shared/ui/Icons/ChartBarIcon';
import { ClipboardDocumentListIcon } from '@/shared/ui/Icons/ClipboardDocumentListIcon';
import { UsersIcon } from '@/shared/ui/Icons/UsersIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { BriefcaseIcon } from '@/shared/ui/Icons/BriefcaseIcon';
import { LogoIcon } from '@/shared/ui/Icons/LogoIcon';
import { PresentationChartLineIcon } from '@/shared/ui/Icons/PresentationChartLineIcon';
import { DocumentPlusIcon } from '@/shared/ui/Icons/DocumentPlusIcon';
import { ChatBubbleLeftRightIcon } from '@/shared/ui/Icons/ChatBubbleLeftRightIcon';
import { MapPinIcon } from '@/shared/ui/Icons/MapPinIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { BellIcon } from '@/shared/ui/Icons/BellIcon';
import { CircleStackIcon } from '@/shared/ui/Icons/CircleStackIcon';
import { ChevronDownIcon } from '@/shared/ui/Icons/ChevronDownIcon';
import { SparklesIcon } from '@/shared/ui/Icons/SparklesIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { ArrowLeftOnRectangleIcon } from '@/shared/ui/Icons/ArrowLeftOnRectangleIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: User | null;
  leases?: Lease[];
  onLogin?: () => void;
}

const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode; activeView: View; onClick: (view: View) => void; badge?: number }> = ({ view, label, icon, activeView, onClick, badge }) => {
  const isActive = activeView === view;
  return (
    <li className="relative">
      <button onClick={() => onClick(view)} className={`flex items-center w-full p-3 rounded-lg text-base transition-all duration-200 overflow-hidden ${isActive ? 'bg-sky-100 text-primary font-semibold' : 'text-text-light hover:bg-slate-100 hover:text-text-main'}`}>
        <span className={`absolute left-0 h-6 w-1 bg-primary rounded-r-full transition-all duration-300 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0 scale-y-0'}`} aria-hidden="true"></span>
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
        <span className="ml-3 whitespace-nowrap flex-1 text-left transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:w-auto delay-75 md:delay-0">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            {badge}
          </span>
        )}
      </button>
    </li>
  );
};

const AccordionNav: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-3 rounded-lg text-base text-text-light hover:bg-slate-100 hover:text-text-main transition-all duration-200">
        <span className="font-semibold">{title}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-3">
          {children}
        </ul>
      )}
    </li>
  );
};

const SubNavItem: React.FC<{ label: string; icon?: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <li>
    <button onClick={onClick} className="flex items-center w-full p-2 rounded-md text-sm text-text-light hover:text-primary hover:bg-sky-50 transition-colors">
      {icon && React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4 mr-2 opacity-70' })}
      <span>{label}</span>
    </button>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen, currentUser, leases = [], onLogin }) => {
  const handleNavigation = (view: View) => {
    setActiveView(view);
    // Automatically collapse the sidebar on navigation for mobile
    setIsOpen(false);
  };

  const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN;
  const isDeployAdmin = currentUser?.role === Role.ADMIN;
  const isAdmin = isSuperAdmin || isDeployAdmin;
  const isReviewer = currentUser?.role === Role.REVIEWER;
  const isAppMode = !!currentUser;

  // Calculate Active Reminders (Due Today or < 5 Days)
  const reminderCount = useMemo(() => {
    if (isAdmin || isReviewer) return 0;
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeLeases = leases.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData);

    activeLeases.forEach(lease => {
      let hasRentData = false;
      lease.abstractedData.forEach(section => {
        if (section.title.toLowerCase().includes('rent') || section.title.toLowerCase().includes('payment')) {
          const dueDay = 1;
          let targetDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
          if (targetDate < today) {
            targetDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
          }

          const diffTime = targetDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 5) {
            hasRentData = true;
          }
        }
      });
      if (hasRentData) count++;
    });
    return count;
  }, [leases, isAdmin, isReviewer]);

  const renderNavItems = () => {
    if (isAdmin) {
      return (
        <>
          {isSuperAdmin && (
            <>
              <NavItem view="deploy-admins" label="Deploy Admins" icon={<BuildingOfficeIcon className="w-6 h-6 text-purple-600" />} activeView={activeView} onClick={handleNavigation} />
              <div className="my-2 border-t border-border/60 mx-3"></div>
            </>
          )}
          <NavItem view="admin-dashboard" label="Dashboard" icon={<ChartBarIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-lease-database" label="Lease Database" icon={<CircleStackIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-analytics" label="Analytics" icon={<PresentationChartLineIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-total-activity" label="Total Activity" icon={<TableCellsIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-chats" label="Client Communications" icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />

          <NavItem view="admin-review-queue" label="Review Queue" icon={<ClipboardDocumentListIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-amendments" label="Amendments" icon={<DocumentPlusIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-clients" label="Client Management" icon={<UsersIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-reviewers" label="Team Management" icon={<BriefcaseIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-ai-leases" label="AI Leases" icon={<DocumentTextIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="admin-completed-reviews" label="Completed Reviews" icon={<CheckBadgeIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
        </>
      );
    }
    if (isReviewer) {
      return (
        <>
          <NavItem view="reviewer-dashboard" label="Reviewer Desk" icon={<BriefcaseIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="reviewer-chats" label="My Chats" icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="reviewer-amendments" label="Amendment Queue" icon={<DocumentPlusIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="reviewer-activity" label="My Activity" icon={<CheckBadgeIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
        </>
      );
    }

    if (isAppMode) {
      return (
        <>
          <NavItem view="abstract" label="Abstract Lease" icon={<PlusCircleIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="portfolio" label="Portfolio" icon={<PresentationChartLineIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="lease-summaries" label="Summaries" icon={<DocumentTextIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="assets" label="Assets" icon={<BuildingOfficeIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="history" label="My Leases" icon={<ListBulletIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="locations" label="Locations" icon={<MapPinIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
          <NavItem view="entities" label="Landlords & Tenants" icon={<UsersIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />

          <NavItem view="client-chats" label="Messages" icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
        </>
      );
    }

    // Marketing Mode (Not logged in)
    return (
      <>
        <AccordionNav title="Products">
          <SubNavItem label="Asset Mapping" icon={<MapPinIcon />} onClick={() => handleNavigation('product-asset-mapping')} />
          <SubNavItem label="Critical Event Reminders" icon={<BellIcon />} onClick={() => handleNavigation('product-critical-events')} />
          <SubNavItem label="AI Powered Abstraction" icon={<SparklesIcon />} onClick={() => handleNavigation('product-ai-abstraction')} />
          <SubNavItem label="AI Lease Assistant" icon={<ChatBubbleLeftRightIcon />} onClick={() => handleNavigation('product-ai-assistant')} />
          <SubNavItem label="Portfolio Intelligence" icon={<ChartBarIcon />} onClick={() => handleNavigation('product-portfolio-intelligence')} />
        </AccordionNav>
        <AccordionNav title="Solutions">
          <SubNavItem label="Lease Summaries" icon={<DocumentTextIcon />} onClick={() => handleNavigation('solution-lease-summaries')} />
          <SubNavItem label="Document Storage" icon={<CircleStackIcon />} onClick={() => handleNavigation('solution-document-storage')} />
          <SubNavItem label="CRE Expert Verification" icon={<CheckBadgeIcon />} onClick={() => handleNavigation('solution-expert-verification')} />
          <SubNavItem label="Insights & Analytics" icon={<PresentationChartLineIcon />} onClick={() => handleNavigation('solution-analytics')} />
          <SubNavItem label="Due Diligence" icon={<MagnifyingGlassIcon />} onClick={() => handleNavigation('solution-due-diligence')} />
        </AccordionNav>

        <div className="border-t border-border my-2"></div>

        <NavItem view="pricing" label="Pricing" icon={<CurrencyEuroIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />
        <NavItem view="home" label="Home" icon={<HomeIcon className="w-6 h-6" />} activeView={activeView} onClick={handleNavigation} />

        <li className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => {
              if (onLogin) onLogin();
              setIsOpen(false);
            }}
            className="flex items-center w-full p-3 rounded-lg text-base text-text-light hover:bg-slate-100 hover:text-primary transition-all duration-200 font-bold pl-4"
          >
            Log In
          </button>
        </li>
      </>
    );
  };

  let sidebarClasses = '';

  if (isAppMode) {
    sidebarClasses = `
        fixed top-0 left-0 h-full z-[70] 
        bg-surface border-r border-border shadow-2xl 
        transition-all duration-300 ease-in-out
        w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 
        md:w-20 
        md:hover:w-72
        group
      `;
  } else {
    sidebarClasses = `fixed top-0 right-0 h-full z-[70] transition-transform duration-300 ease-in-out bg-surface border-l border-border w-72 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
  }

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-[60] ${isAppMode ? 'md:hidden' : ''}`}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className="h-full px-4 py-6 overflow-y-auto flex flex-col overflow-x-hidden">
          <div className="flex items-center justify-between mb-8 pl-1 min-h-[40px]">
            <div className="flex items-center whitespace-nowrap overflow-hidden">
              {isAppMode ? (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <LogoIcon variant="icon" className="h-8 w-8" />
                  </div>
                  <span className="font-bold text-xl text-text-main opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">Penaki</span>
                </div>
              ) : (
                <LogoIcon variant="horizontal" className="h-8" />
              )}
              <div className="flex flex-col ml-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                {isSuperAdmin && <span className="text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded shadow-sm">SUPER ADMIN</span>}
                {isDeployAdmin && <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded shadow-sm">ADMIN</span>}
                {isReviewer && <span className="text-[10px] font-bold bg-secondary text-white px-1.5 py-0.5 rounded shadow-sm">REVIEWER</span>}
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} className={`p-1 rounded-full hover:bg-slate-100 text-slate-400 ${isAppMode ? 'md:hidden' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="space-y-1">{renderNavItems()}</ul>
        </div>
      </aside>
    </>
  );
};
