import axios from 'axios';
import { tokenManager } from '../auth/tokenManager';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Global logout function - called on ANY 401 error
 * This is the single point of logout for the entire app
 */
function performGlobalLogout() {
  console.log('🚨 [API] 401 Unauthorized - Performing global logout');
  
  // Mark as logged out to prevent any auto-refresh attempts
  tokenManager.setLoggedOut();
  
  // Clear all tokens from cookies
  tokenManager.clearTokens();
  
  // Clear user data from localStorage
  localStorage.removeItem('user');
  
  // Redirect to auth page
  window.location.href = '/auth';
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const celeryApi = axios.create({
  baseURL: import.meta.env.VITE_CELERY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const tokens = tokenManager.getTokens();
  if (tokens?.access_token) {
    // Ensure headers object exists and is properly typed
    config.headers = config.headers || {};
    // Set authorization header
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
  }
  return config;
});

// Add request interceptor to celeryApi for auth token
celeryApi.interceptors.request.use((config) => {
  const tokens = tokenManager.getTokens();
  if (tokens?.access_token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('🔴 [API INTERCEPTOR] Error caught:', {
      status: error.response?.status,
      url: error.config?.url,
      hasResponse: !!error.response
    });

    const originalRequest = error.config;

    // If error is 401 Unauthorized OR CORS blocked 401 (status undefined but network error)
    // When CORS blocks a 401, we get: status: undefined, hasResponse: false, ERR_NETWORK
    const is401 = error.response?.status === 401;
    const isCorsBlocked401 = !error.response && error.code === 'ERR_NETWORK';
    
    if (is401 || isCorsBlocked401) {
      console.log('🔴 [API INTERCEPTOR] 401 or CORS-blocked 401 detected!', { is401, isCorsBlocked401 });
      // If we already tried to refresh, logout immediately
      if (originalRequest._retry) {
        console.log('🚨 [API] 401 after retry - logging out');
        performGlobalLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh token ONCE
        const tokens = tokenManager.getTokens();
        if (tokens?.refresh_token) {
          console.log('🔄 [API] Attempting token refresh...');
          
          const { data } = await axios.post<TokenResponse>(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`,
            {
              refresh_token: tokens.refresh_token,
            }
          );

          // Only update if we got a valid token
          if (data?.access_token) {
            console.log('✅ [API] Token refresh successful');
            tokenManager.setTokens({
              ...tokens,
              access_token: data.access_token,
              refresh_token: data.refresh_token || tokens.refresh_token,
            });

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return axios(originalRequest);
          } else {
            // No valid token in response - logout
            console.log('🚨 [API] No valid token in refresh response - logging out');
            performGlobalLogout();
          }
        } else {
          // No refresh token available - logout
          console.log('🚨 [API] No refresh token available - logging out');
          performGlobalLogout();
        }
      } catch (refreshError: unknown) {
        console.error('❌ [API] Token refresh failed:', refreshError);
        
        // ANY error during refresh = logout
        // This includes 401, 403, network errors, etc.
        performGlobalLogout();
      }
    }

    return Promise.reject(error);
  }
);
