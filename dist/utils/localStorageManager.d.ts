/**
 * LocalStorage Manager - Handles quota exceeded errors and cache management
 * Provides intelligent cache cleanup and storage optimization
 */
interface StorageStats {
    totalSize: number;
    totalEntries: number;
    availableSpace: number;
    quotaExceeded: boolean;
}
declare class LocalStorageManager {
    private static instance;
    private readonly MAX_STORAGE_SIZE;
    private readonly CACHE_PRIORITIES;
    static getInstance(): LocalStorageManager;
    /**
     * Safe setItem with automatic cleanup on quota exceeded
     */
    setItem(key: string, value: string, priority?: 'high' | 'medium' | 'low'): boolean;
    /**
     * Safe getItem with error handling
     */
    getItem(key: string): string | null;
    /**
     * Safe removeItem with error handling
     */
    removeItem(key: string): boolean;
    /**
     * Handle quota exceeded by cleaning up storage
     */
    private handleQuotaExceeded;
    /**
     * More aggressive cleanup for important data
     */
    private aggressiveCleanup;
    /**
     * Get storage statistics
     */
    getStorageStats(): StorageStats;
    /**
     * Get cleanup candidates with metadata
     */
    private getCleanupCandidates;
    /**
     * Determine priority of a cache key
     */
    private getKeyPriority;
    /**
     * Determine category of a cache key
     */
    private getKeyCategory;
    /**
     * Extract timestamp from cached data
     */
    private extractTimestamp;
    /**
     * Check if error is quota exceeded
     */
    private isQuotaExceededError;
    /**
     * Format bytes for human readable output
     */
    private formatBytes;
    /**
     * Cleanup old cache entries proactively
     */
    cleanupOldEntries(maxAge?: number): void;
    /**
     * Get storage usage report
     */
    getUsageReport(): void;
}
export declare const localStorageManager: LocalStorageManager;
export declare const safeSetItem: (key: string, value: string, priority?: "high" | "medium" | "low") => boolean;
export declare const safeGetItem: (key: string) => string | null;
export declare const safeRemoveItem: (key: string) => boolean;
export {};
//# sourceMappingURL=localStorageManager.d.ts.map