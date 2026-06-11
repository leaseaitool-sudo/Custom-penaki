
import React from 'react';
import { View } from '@/shared/types';
import { LogoIcon } from '@/shared/ui/Icons/LogoIcon';
import { TwitterIcon } from '@/shared/ui/Icons/TwitterIcon';
import { LinkedinIcon } from '@/shared/ui/Icons/LinkedinIcon';
import { GithubIcon } from '@/shared/ui/Icons/GithubIcon';

interface FooterProps {
  onNavigate: (view: View) => void;
}

const FooterLink: React.FC<{ view: View; onNavigate: (view: View) => void; children: React.ReactNode }> = ({ view, onNavigate, children }) => (
  <li>
    <button onClick={() => onNavigate(view)} className="text-text-light hover:text-primary transition-colors duration-200">
      {children}
    </button>
  </li>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-muted border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding Section */}
          <div className="space-y-4">
            <LogoIcon variant="horizontal" className="h-10" />
            <p className="text-text-light text-sm max-w-xs pl-1">
              Unlock Lease Intelligence, Instantly.
            </p>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-text-main tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <FooterLink view="home" onNavigate={onNavigate}>Home</FooterLink>
                <FooterLink view="abstract" onNavigate={onNavigate}>Abstract Lease</FooterLink>
                <FooterLink view="history" onNavigate={onNavigate}>My Leases</FooterLink>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-main tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-text-light hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-text-light hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-main tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <FooterLink view="terms" onNavigate={onNavigate}>Terms</FooterLink>
                <FooterLink view="privacy" onNavigate={onNavigate}>Privacy</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-text-light">&copy; {currentYear} Penaki. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-text-light hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <TwitterIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-text-light hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <GithubIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-text-light hover:text-gray-500">
              <span className="sr-only">LinkedIn</span>
              <LinkedinIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
