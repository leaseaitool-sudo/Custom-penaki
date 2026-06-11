import React, { useEffect, useRef } from 'react';
import { User, View } from '@/shared/types';
import { Cog6ToothIcon } from '@/shared/ui/Icons/Cog6ToothIcon';
import { ArrowLeftOnRectangleIcon } from '@/shared/ui/Icons/ArrowLeftOnRectangleIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
  onClose: () => void;
  onNavigate: (view: View) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onClose, onNavigate }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleNavigate = (view: View) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      <div className="py-1">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-text-main" role="none">
            {user.username}
          </p>
          <p className="truncate text-sm text-text-light" role="none">
            {user.email}
          </p>
        </div>
        <div className="py-1">
          <button onClick={() => handleNavigate('profile')} className="flex items-center w-full px-4 py-2 text-left text-sm text-text-light hover:bg-surface-muted hover:text-text-main" role="menuitem">
            <UserCircleIcon className="mr-3 h-5 w-5" />
            <span>Profile</span>
          </button>
          <button onClick={() => handleNavigate('profile')} className="flex items-center w-full px-4 py-2 text-left text-sm text-text-light hover:bg-surface-muted hover:text-text-main" role="menuitem">
            <Cog6ToothIcon className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
        <div className="py-1">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center w-full px-4 py-2 text-left text-sm text-text-light hover:bg-surface-muted hover:text-text-main"
            role="menuitem"
          >
            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};