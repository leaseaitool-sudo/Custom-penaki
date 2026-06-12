import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { LogoIcon } from '@/shared/ui/Icons/LogoIcon';

interface LoginPageProps {
  onAuthSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const errorMsg = await signIn(email, password);
    setIsSubmitting(false);

    if (errorMsg) {
      setError(errorMsg);
    } else {
      onAuthSuccess?.();
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
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

    setError('');
    setIsSubmitting(true);

    const errorMsg = await signUp(email, password, username);
    setIsSubmitting(false);

    if (errorMsg) {
      setError(errorMsg);
    } else {
      onAuthSuccess?.();
    }
  };

  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-surface-muted border border-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <LogoIcon variant="horizontal" className="h-8 sm:h-10 text-primary" />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
             <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-text-main">
          {isLoginView ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="mt-2 text-sm text-text-light">
          {isLoginView ? 'Sign in to access your dashboard.' : 'Start managing your leases efficiently.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {isLoginView ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email-login" className="block text-sm font-medium text-text-main">Email Address</label>
                <input type="email" name="email-login" id="email-login" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClasses} placeholder="you@example.com" required disabled={isSubmitting} />
              </div>
              <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-text-main">Password</label>
                <input type="password" name="password-login" id="password-login" value={password} onChange={e => setPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" required disabled={isSubmitting} />
              </div>
              <div>
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label htmlFor="username-signup" className="block text-sm font-medium text-text-main">Full Name</label>
                <input type="text" name="username-signup" id="username-signup" value={username} onChange={e => setUsername(e.target.value)} className={commonInputClasses} placeholder="John Doe" required disabled={isSubmitting} />
              </div>
              <div>
                <label htmlFor="email-signup" className="block text-sm font-medium text-text-main">Email Address</label>
                <input type="email" name="email-signup" id="email-signup" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClasses} placeholder="you@example.com" required disabled={isSubmitting} />
              </div>
              <div>
                <label htmlFor="password-signup" className="block text-sm font-medium text-text-main">Password</label>
                <input type="password" name="password-signup" id="password-signup" value={password} onChange={e => setPassword(e.target.value)} className={commonInputClasses} placeholder="Minimum 8 characters" required disabled={isSubmitting} />
              </div>
              <div>
                <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-text-main">Confirm Password</label>
                <input type="password" name="confirm-password-signup" id="confirm-password-signup" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={commonInputClasses} placeholder="••••••••" required disabled={isSubmitting} />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-primary hover:text-primary-hover hover:underline">
              {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
