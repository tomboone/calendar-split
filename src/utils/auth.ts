/**
 * Google OAuth 2.0 authentication using implicit grant redirect flow
 * This approach doesn't require popups or third-party cookies.
 *
 * Note: Implicit flow tokens cannot be refreshed silently. When they expire
 * (typically after 1 hour), the user will need to sign in again.
 * We store tokens in localStorage to persist across browser sessions,
 * allowing the token to be reused until Google actually rejects it.
 */

import config from '../config/calendar.config';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

// Storage keys - using localStorage for persistence across sessions
const TOKEN_KEY = 'calendar_split_token';
const TOKEN_EXPIRY_KEY = 'calendar_split_token_expiry';
const AUTH_STATE_KEY = 'calendar_split_auth_state';

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the redirect URI based on current location
 */
function getRedirectUri(): string {
  return window.location.origin + window.location.pathname;
}

/**
 * Initiate OAuth 2.0 authorization flow using implicit grant with redirect
 * The token will be returned in the URL hash fragment
 */
export function initiateAuth(): void {
  const state = generateState();
  sessionStorage.setItem(AUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: getRedirectUri(),
    response_type: 'token',
    scope: SCOPES,
    state: state,
    include_granted_scopes: 'true',
  });

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Parse the token from URL hash after redirect
 * Returns the token if valid, null otherwise
 */
export function parseTokenFromUrl(): { token: string; expiresIn: number } | null {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) {
    return null;
  }

  // Parse hash parameters (remove leading #)
  const params = new URLSearchParams(hash.substring(1));

  // Check for error
  const error = params.get('error');
  if (error) {
    const errorDescription = params.get('error_description');
    throw new Error(errorDescription || error);
  }

  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');

  if (!accessToken || !expiresIn) {
    return null;
  }

  // Verify state to prevent CSRF
  const savedState = sessionStorage.getItem(AUTH_STATE_KEY);
  if (state !== savedState) {
    throw new Error('Invalid state parameter. Please try signing in again.');
  }

  // Clean up state
  sessionStorage.removeItem(AUTH_STATE_KEY);

  return {
    token: accessToken,
    expiresIn: parseInt(expiresIn, 10),
  };
}

/**
 * Store the token in localStorage for persistence across sessions
 */
export function storeToken(token: string, expiresIn: number): void {
  const expiryTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

/**
 * Clear the URL hash after processing
 */
export function clearUrlHash(): void {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

/**
 * Get stored access token
 * Returns the token even if "expired" - let the API reject it if invalid.
 * Google tokens sometimes remain valid slightly beyond their stated expiry.
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Check if token is expired based on stored expiry time
 * Note: We still return the token even if expired - the API will reject if truly invalid
 */
export function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) {
    return true;
  }
  return Date.now() > parseInt(expiry);
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(): number | null {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry) : null;
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(AUTH_STATE_KEY);
}

/**
 * Sign out - clear tokens and reload
 */
export function signOut(): void {
  clearAuth();
  window.location.reload();
}

/**
 * Check if there's a pending auth state (user initiated sign-in)
 */
export function hasPendingAuth(): boolean {
  return sessionStorage.getItem(AUTH_STATE_KEY) !== null;
}
