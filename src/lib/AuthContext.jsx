import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabaseApi } from '@/api/supabaseApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await supabaseApi.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkAppState = async () => {
    setIsLoadingPublicSettings(true);
    try {
      setAppPublicSettings(await supabaseApi.app.getPublicSettings());
    } catch (error) {
      console.error('Unable to load organization settings:', error);
      setAppPublicSettings({ id: null, public_settings: {} });
    } finally {
      setIsLoadingPublicSettings(false);
    }
    await checkUserAuth();
  };

  useEffect(() => {
    checkAppState();
    const { data: listener } = supabaseApi.auth.onAuthStateChange?.((event, session) => {
      if (!session) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        checkUserAuth();
      }
    }) || { data: null };
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    await supabaseApi.auth.logout();
    if (shouldRedirect) window.location.assign('/login');
  };

  const navigateToLogin = () => window.location.assign('/login');

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings,
      authError, appPublicSettings, authChecked, logout,
      navigateToLogin, checkUserAuth, checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
