import React, { useState } from 'react';
import { User, View, Role } from '../types';
import { isAdminEmail } from '../utils/auth';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  onSignUp: (user: User) => void;
  onNavigate: (view: View) => void;
  initialView?: 'login' | 'signup';
  users: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onSignUp, onNavigate, initialView = 'login', users }) => {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    // This is a mock login. In a real app, you'd also check the password hash.
    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
        setError('An account with this email already exists.');
        return;
    }
    const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
        setError('This username is already taken. Please choose another.');
        return;
    }

    setError('');
    
    const role = isAdminEmail(email) ? Role.ADMIN : Role.USER;
    onSignUp({ username, email, role });
  };
  
  const handleNavigate = (view: View) => {
    onNavigate(view);
    onClose();
  }

  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-surface-muted border border-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-main">{isLoginView ? 'Welcome Back' : 'Create an Account'}</h2>
              <p className="text-sm text-text-light">{isLoginView ? 'Sign in to continue.' : 'Start abstracting leases in seconds.'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm">{error}</div>}

          {isLoginView ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email-login" className="block text-sm font-medium text-text-light">Email Address</label>
                <input type="email" name="email-login" id="email-login" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClasses} placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-text-light">Password</label>
                <input type="password" name="password-login" id="password-login" value={password} onChange={e => setPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" required />
              </div>
              <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary transition-all btn-gradient">
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label htmlFor="username-signup" className="block text-sm font-medium text-text-light">Full Name</label>
                <input type="text" name="username-signup" id="username-signup" value={username} onChange={e => setUsername(e.target.value)} className={commonInputClasses} placeholder="John Doe" required />
              </div>
              <div>
                <label htmlFor="email-signup" className="block text-sm font-medium text-text-light">Email Address</label>
                <input type="email" name="email-signup" id="email-signup" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClasses} placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password-signup" className="block text-sm font-medium text-text-light">Password</label>
                <input type="password" name="password-signup" id="password-signup" value={password} onChange={e => setPassword(e.target.value)} className={commonInputClasses} placeholder="Minimum 8 characters" required />
              </div>
              <div>
                <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-text-light">Confirm Password</label>
                <input type="password" name="confirm-password-signup" id="confirm-password-signup" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" required />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary transition-all btn-gradient">
                  Create Account
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-primary hover:underline">
              {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>

          {!isLoginView && (
             <p className="mt-6 text-center text-xs text-text-light">
                By creating an account, you agree to our <br />
                <button onClick={() => handleNavigate('terms')} className="font-medium text-primary hover:underline">Terms of Service</button> and <button onClick={() => handleNavigate('privacy')} className="font-medium text-primary hover:underline">Privacy Policy</button>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
