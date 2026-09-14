import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase, supabaseApi } from '@/api/supabaseApi';

const AuthContext = createContext();

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: null,
    public_settings: {},
  });

  const authCheckInProgress = useRef(false);
  const refreshFailureHandled = useRef(false);

  const clearLocalSession = async () => {
    if (refreshFailureHandled.current) return;

    refreshFailureHandled.current = true;

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.warn('Could not clear local Supabase session:', error);
    }

    setUser(null);
    setIsAuthenticated(false);
  };

  const checkUserAuth = async () => {
    if (authCheckInProgress.current) return;

    authCheckInProgress.current = true;

    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const currentUser = await withTimeout(
        supabaseApi.auth.me(),
        10000
      );

      if (currentUser) {
        refreshFailureHandled.current = false;
        setUser(currentUser);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required',
        });
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);

      const status = error?.status;
      const message = String(error?.message || '').toLowerCase();
      const code = String(error?.code || '').toLowerCase();

      const isRateLimited =
        status === 429 ||
        message.includes('too many requests') ||
        message.includes('rate limit') ||
        code === '429';

      if (isRateLimited) {
        console.warn(
          'Supabase Auth refresh was rate-limited. Clearing the local session.'
        );

        await clearLocalSession();

        setAuthError({
          type: 'auth_required',
          message: 'Your session expired. Please sign in again.',
        });
      } else if (status === 401 || status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required',
        });
      } else {
        console.warn('Authentication check failed:', error);

        setAuthError({
          type: 'auth_required',
          message: 'Please sign in to continue',
        });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
      authCheckInProgress.current = false;
    }
  };

  const checkAppState = async () => {
    setIsLoadingPublicSettings(false);

    try {
      if (supabaseApi.app?.getPublicSettings) {
        const settings = await withTimeout(
          supabaseApi.app.getPublicSettings(),
          5000
        );

        if (settings) {
          setAppPublicSettings(settings);
        }
      }
    } catch (error) {
      console.warn(
        'Organization settings unavailable; continuing without them:',
        error
      );
    }

    await checkUserAuth();
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      await checkAppState();
    };

    initialize();

    let subscription;

    try {
      const authListener = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          if (event === 'SIGNED_OUT' || !session) {
            setUser(null);
            setIsAuthenticated(false);
            return;
          }

          if (event === 'SIGNED_IN') {
            refreshFailureHandled.current = false;
            checkUserAuth();
            return;
          }

          if (event === 'USER_UPDATED') {
            checkUserAuth();
          }

          if (event === 'TOKEN_REFRESHED') {
            refreshFailureHandled.current = false;
          }
        }
      );

      subscription = authListener?.data?.subscription;
    } catch (error) {
      console.warn('Auth state listener unavailable:', error);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    refreshFailureHandled.current = true;

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.warn('Local logout failed:', error);
    }

    try {
      await supabaseApi.auth.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    if (shouldRedirect) {
      window.location.assign('/login');
    }
  };

  const navigateToLogin = () => {
    window.location.assign('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};