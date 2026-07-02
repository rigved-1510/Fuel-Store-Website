import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // View state: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('login');
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const user = await login(email, password);
        if (user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/profile';
        }
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await signup({ firstName, lastName, email, password });
        window.location.href = '/profile';
      }
    } catch (err) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    // Social OAuth is not yet implemented — show a notice
    setError(`${provider} sign-in is coming soon. Please use email & password.`);
  };

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col items-center justify-center p-margin-mobile relative select-none">
      
      {/* Centered Simplified Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-center items-center h-16 w-full max-w-7xl mx-auto">
          <Link to="/" className="text-headline-sm font-headline-sm font-bold tracking-tighter text-on-surface hover:text-secondary transition-colors">
            THE FUEL STORE
          </Link>
        </div>
      </header>

      {/* Main card box */}
      <main className="w-full max-w-[440px] mt-24 mb-lg z-10 animate-fade-in-up">
        <div className="bg-surface-container-lowest shadow-2xl rounded-2xl overflow-hidden border border-outline-variant/50">
          
          {/* Tabs */}
          <div className="flex border-b border-outline-variant/60">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`flex-grow py-4 text-label-md font-bold transition-all focus:outline-none ${
                activeTab === 'login'
                  ? 'border-b-2 border-secondary text-primary bg-surface-container-low/20'
                  : 'text-on-surface-variant hover:bg-surface-container-low/40'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`flex-grow py-4 text-label-md font-bold transition-all focus:outline-none ${
                activeTab === 'signup'
                  ? 'border-b-2 border-secondary text-primary bg-surface-container-low/20'
                  : 'text-on-surface-variant hover:bg-surface-container-low/40'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-lg space-y-md">
            
            {/* Logo Visual Icon */}
            <div className="flex justify-center py-sm">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-md">
                <Icon name="sports_soccer" className="text-on-secondary text-[28px] fill-1" style={{ fontVariationSettings: '"FILL" 1' }} />
              </div>
            </div>

            {/* Error Message */}
            {error ? (
              <div className="p-sm bg-error-container/20 text-error border border-error-container rounded-lg text-label-sm font-semibold flex items-center gap-xs">
                <Icon name="error" className="text-[18px]" />
                {error}
              </div>
            ) : null}

            {/* Forms */}
            <form onSubmit={handleSubmit} className="space-y-md">
              {activeTab === 'signup' ? (
                <div className="space-y-sm">
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="space-y-sm">
                      <label className="text-label-md font-bold text-on-surface-variant" htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/60 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
                      />
                    </div>
                    <div className="space-y-sm">
                      <label className="text-label-md font-bold text-on-surface-variant" htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/60 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-sm">
                <label className="text-label-md font-bold text-on-surface-variant" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/60 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
                />
              </div>

              <div className="space-y-sm">
                <div className="flex justify-between items-center">
                  <label className="text-label-md font-bold text-on-surface-variant" htmlFor="password">Password</label>
                  {activeTab === 'login' ? (
                    <a href="#forgot" className="text-[11px] font-bold text-secondary hover:underline">
                      Forgot Password?
                    </a>
                  ) : null}
                </div>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/60 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
                />
              </div>

              {activeTab === 'signup' ? (
                <div className="space-y-sm">
                  <label className="text-label-md font-bold text-on-surface-variant" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/60 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
                  />
                </div>
              ) : null}

              <Button
                type="submit"
                variant="secondary"
                isLoading={loading}
                className="w-full py-3 text-label-md"
              >
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-base">
              <div className="flex-grow border-t border-outline-variant/60"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-on-surface-variant">
                Or continue with
              </span>
              <div className="flex-grow border-t border-outline-variant/60"></div>
            </div>

            {/* Social options */}
            <div className="grid grid-cols-2 gap-sm">
              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="flex items-center justify-center gap-xs px-md py-sm border border-outline-variant hover:bg-surface-container-low rounded-lg transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-label-sm font-bold text-on-surface">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick('Apple')}
                className="flex items-center justify-center gap-xs px-md py-sm border border-outline-variant hover:bg-surface-container-low rounded-lg transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5 text-on-surface" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.06.75.79-.02 2.05-.88 3.5-.73 1.43.14 2.53.71 3.2 1.71-3.18 1.94-2.68 6.02.43 7.28-.63 1.58-1.5 3.24-2.19 3.96ZM12.03 7.25c-.02-2.13 1.73-3.93 3.82-4.04.18 2.37-2.16 4.21-3.82 4.04Z"></path>
                </svg>
                <span className="text-label-sm font-bold text-on-surface">Apple</span>
              </button>
            </div>

          </div>

          {/* Under Cards Badges */}
          <div className="bg-surface-container-low py-sm flex justify-center items-center gap-xs text-on-surface-variant/80 border-t border-outline-variant/30 select-none">
            <Icon name="verified_user" className="text-[18px] text-secondary" />
            <span className="text-label-sm font-semibold tracking-wider">
              OFFICIAL ENCRYPTED CHECKOUT
            </span>
          </div>

        </div>
      </main>

      {/* Simplified Footer copyright */}
      <footer className="w-full text-center text-label-sm text-on-surface-variant/70 border-t border-outline-variant/10 py-md mt-auto">
        © {new Date().getFullYear()} THE FUEL STORE Performance. All Rights Reserved.
      </footer>
    </div>
  );
}
