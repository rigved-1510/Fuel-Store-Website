import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { GoogleLogin } from "@react-oauth/google";

export function LoginPage() {
  const { login, signup, loginWithGoogle } = useAuth();
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
            <div className="grid place-items-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const user = await loginWithGoogle(
                      credentialResponse.credential
                    );

                    if (user.role === "admin") {
                      window.location.href = "/admin";
                    } else {
                      window.location.href = "/profile";
                    }
                  } catch (err) {
                    setError(err.message || "Google Sign-In failed.");
                  }
                }}
                onError={() => {
                  setError("Google Sign-In failed.");
                }}
              />
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
