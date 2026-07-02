import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  signupUser,
  getProfile,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

const USER_KEY  = 'fuel_store_user';
const TOKEN_KEY = 'fuel_store_token';

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);

  // ─── On mount: restore session & re-validate with backend ─────────
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser  = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Re-fetch profile to validate token is still live and get fresh data
        const freshUser = await getProfile();
        setUser(freshUser);
        setIsAuthenticated(true);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      } catch (_) {
        // Token expired or invalid — clear everything
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ─── LOGIN ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedInUser, token } = await loginUser(email, password);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      localStorage.setItem(TOKEN_KEY, token);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── SIGNUP ───────────────────────────────────────────────────────
  // Accepts { firstName, lastName, email, password, phone? }
  const signup = async ({ firstName, lastName, email, password, phone }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser, token } = await signupUser({ firstName, lastName, email, password, phone });
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_KEY, token);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── UPDATE PROFILE ───────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const updatedUser = await apiUpdateProfile(profileData);
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────
  const changePassword = async (passwordData) => {
    setError(null);
    try {
      const result = await apiChangePassword(passwordData);
      // Backend issues a new token on password change; update it
      if (result?.token) {
        localStorage.setItem(TOKEN_KEY, result.token);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────
  const logout = async () => {
    await logoutUser(); // Tell the server (best-effort)
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
