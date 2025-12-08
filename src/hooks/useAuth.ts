/**
 * Authentication hook for Google OAuth 2.0 (implicit grant with redirect)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initiateAuth,
  parseTokenFromUrl,
  storeToken,
  clearUrlHash,
  getStoredToken,
  signOut as authSignOut,
} from '../utils/auth';
import { AuthState } from '../types/calendar';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
    accessToken: undefined,
  });

  // Prevent double-execution in StrictMode
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = () => {
      // First, check if we have a token in the URL hash (redirect from Google)
      try {
        const tokenData = parseTokenFromUrl();
        if (tokenData) {
          storeToken(tokenData.token, tokenData.expiresIn);
          clearUrlHash();
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
            accessToken: tokenData.token,
          });
          return;
        }
      } catch (error) {
        // Error parsing token (e.g., invalid state, auth error from Google)
        clearUrlHash();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
          accessToken: undefined,
        });
        return;
      }

      // Check for existing valid token in session storage
      const storedToken = getStoredToken();
      if (storedToken) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: undefined,
          accessToken: storedToken,
        });
        return;
      }

      // No authentication
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
        accessToken: undefined,
      });
    };

    initializeAuth();
  }, []);

  const signIn = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    // This will redirect to Google - the page will reload when redirected back
    initiateAuth();
  }, []);

  const signOut = useCallback(() => {
    authSignOut();
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: undefined }));
  }, []);

  return {
    ...authState,
    signIn,
    signOut,
    clearError,
  };
}
