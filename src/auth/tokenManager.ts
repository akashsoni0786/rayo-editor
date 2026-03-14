/**
 * Token Manager - Full react-auth-kit Integration
 * 
 * This file uses ONLY react-auth-kit cookies for token storage.
 * No localStorage is used for tokens (only for flags like logged_out).
 * 
 * All 47+ files using tokenManager.getAccessToken() continue to work
 * without any changes - this is the bridge layer.
 */

interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
  role?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

interface Tokens {
  access_token: string;
  refresh_token?: string;
  provider_token?: string;
  expires_at?: number;
  expires_in?: number;
}

// Cookie names used by react-auth-kit
const AUTH_COOKIE_NAME = '_auth';
const AUTH_REFRESH_COOKIE_NAME = '_auth_refresh';
const AUTH_STATE_COOKIE_NAME = '_auth_state';
const AUTH_TYPE_COOKIE_NAME = '_auth_type';

/**
 * Helper function to get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      try {
        return decodeURIComponent(cookieValue);
      } catch {
        return cookieValue;
      }
    }
  }
  return null;
}

/**
 * Helper function to set cookie
 */
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/${secure}; SameSite=Lax`;
}

/**
 * Helper function to delete cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

class TokenManager {
  /**
   * Get access token from react-auth-kit cookie
   */
  getAccessToken(): string | null {
    const token = getCookie(AUTH_COOKIE_NAME);
    return token || null;
  }

  /**
   * Get refresh token from react-auth-kit cookie
   */
  getRefreshToken(): string | null {
    const token = getCookie(AUTH_REFRESH_COOKIE_NAME);
    return token || null;
  }

  /**
   * Get all tokens
   */
  getTokens(): Tokens | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;
    
    return {
      access_token: accessToken,
      refresh_token: this.getRefreshToken() || undefined,
    };
  }

  /**
   * Set tokens in react-auth-kit cookies
   */
  setTokens(tokens: Tokens): void {
    // Calculate expiration if needed
    if (tokens.expires_in && !tokens.expires_at) {
      tokens.expires_at = Math.floor(Date.now() / 1000) + tokens.expires_in;
    }

    // Set react-auth-kit cookies
    if (tokens.access_token) {
      setCookie(AUTH_COOKIE_NAME, tokens.access_token, 7); // 7 days
    }
    if (tokens.refresh_token) {
      setCookie(AUTH_REFRESH_COOKIE_NAME, tokens.refresh_token, 30); // 30 days
    }
    
    // Set token type
    setCookie(AUTH_TYPE_COOKIE_NAME, 'Bearer', 7);
  }

  /**
   * Clear all tokens from cookies
   */
  clearTokens(): void {
    // Clear all react-auth-kit cookies
    deleteCookie(AUTH_COOKIE_NAME);
    deleteCookie(AUTH_REFRESH_COOKIE_NAME);
    deleteCookie(AUTH_STATE_COOKIE_NAME);
    deleteCookie(AUTH_TYPE_COOKIE_NAME);
    
  }

  /**
   * Set user state in cookie (for react-auth-kit compatibility)
   */
  setUserState(user: any): void {
    if (user) {
      setCookie(AUTH_STATE_COOKIE_NAME, JSON.stringify(user), 7);
    }
  }

  /**
   * Get user state from cookie
   */
  getUserState(): any | null {
    const userStr = getCookie(AUTH_STATE_COOKIE_NAME);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Mark user as logged out (prevents auto-refresh)
   */
  setLoggedOut(): void {
    localStorage.setItem('logged_out', 'true');
  }

  /**
   * Check if user was explicitly logged out
   */
  wasLoggedOut(): boolean {
    return localStorage.getItem('logged_out') === 'true';
  }

  /**
   * Clear the logged out flag
   */
  clearLogoutFlag(): void {
    localStorage.removeItem('logged_out');
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) return true;

      const payload = this.getJWTPayload();
      if (payload?.exp) {
        const expiresAtMs = payload.exp * 1000;
        const isExpired = Date.now() >= expiresAtMs;
        return isExpired;
      }

      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Decode JWT payload
   */
  getJWTPayload(): JWTPayload | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;

      const jsonPayload = atob(paddedBase64);
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  getUserId(): string | null {
    const payload = this.getJWTPayload();
    return payload?.sub || null;
  }

  getUserEmail(): string | null {
    const payload = this.getJWTPayload();
    return payload?.email || null;
  }

  getUserRole(): string | null {
    const payload = this.getJWTPayload();
    return payload?.role || null;
  }

  getUserName(): string | null {
    const payload = this.getJWTPayload();
    return payload?.user_metadata?.full_name || payload?.user_metadata?.name || null;
  }

  getUserAvatar(): string | null {
    const payload = this.getJWTPayload();
    return payload?.user_metadata?.avatar_url || payload?.user_metadata?.picture || null;
  }

  getRefreshFailureCount(): number {
    const count = localStorage.getItem('token_refresh_failures');
    return count ? parseInt(count, 10) : 0;
  }
  
  incrementRefreshFailureCount(): number {
    const newCount = this.getRefreshFailureCount() + 1;
    localStorage.setItem('token_refresh_failures', newCount.toString());
    return newCount;
  }
  
  clearRefreshFailureCount(): void {
    localStorage.removeItem('token_refresh_failures');
  }

  /**
   * Update tokens from API response
   */
  updateTokensFromResponse(response: any): boolean {
    if (response && response.access_token) {
      const newTokens: Tokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token || this.getRefreshToken() || undefined,
        expires_in: response.expires_in,
        expires_at: response.expires_at,
      };
      
      this.setTokens(newTokens);
      return true;
    }
    return false;
  }
}

export const tokenManager = new TokenManager();
