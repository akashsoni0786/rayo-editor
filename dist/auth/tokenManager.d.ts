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
declare class TokenManager {
    /**
     * Get access token from react-auth-kit cookie
     */
    getAccessToken(): string | null;
    /**
     * Get refresh token from react-auth-kit cookie
     */
    getRefreshToken(): string | null;
    /**
     * Get all tokens
     */
    getTokens(): Tokens | null;
    /**
     * Set tokens in react-auth-kit cookies
     */
    setTokens(tokens: Tokens): void;
    /**
     * Clear all tokens from cookies
     */
    clearTokens(): void;
    /**
     * Set user state in cookie (for react-auth-kit compatibility)
     */
    setUserState(user: any): void;
    /**
     * Get user state from cookie
     */
    getUserState(): any | null;
    /**
     * Mark user as logged out (prevents auto-refresh)
     */
    setLoggedOut(): void;
    /**
     * Check if user was explicitly logged out
     */
    wasLoggedOut(): boolean;
    /**
     * Clear the logged out flag
     */
    clearLogoutFlag(): void;
    /**
     * Check if token is expired
     */
    isTokenExpired(): boolean;
    /**
     * Decode JWT payload
     */
    getJWTPayload(): JWTPayload | null;
    getUserId(): string | null;
    getUserEmail(): string | null;
    getUserRole(): string | null;
    getUserName(): string | null;
    getUserAvatar(): string | null;
    getRefreshFailureCount(): number;
    incrementRefreshFailureCount(): number;
    clearRefreshFailureCount(): void;
    /**
     * Update tokens from API response
     */
    updateTokensFromResponse(response: any): boolean;
}
export declare const tokenManager: TokenManager;
export {};
//# sourceMappingURL=tokenManager.d.ts.map