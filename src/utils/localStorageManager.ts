/**
 * LocalStorage Manager - Handles quota exceeded errors and cache management
 * Provides intelligent cache cleanup and storage optimization
 */

interface CacheEntry {
  key: string;
  size: number;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  category: 'outline' | 'title' | 'keyword' | 'category' | 'sources' | 'auth' | 'other';
}

interface StorageStats {
  totalSize: number;
  totalEntries: number;
  availableSpace: number;
  quotaExceeded: boolean;
}

class LocalStorageManager {
  private static instance: LocalStorageManager;
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB conservative limit
  private readonly CACHE_PRIORITIES = {
    // Auth data - highest priority
    'user': 'high' as const,
    'token': 'high' as const,
    'logged_out': 'high' as const,
    
    // Current session data - high priority
    'primary_keyword_': 'high' as const,
    'blog_title_': 'high' as const,
    'word_count_': 'high' as const,
    
    // Generated content - medium priority
    'outline_data_': 'medium' as const,
    'title_suggestions_': 'medium' as const,
    'category_data_': 'medium' as const,
    'sources_collection_': 'medium' as const,
    
    // Suggestions and temporary data - low priority
    'outline_suggestions_': 'low' as const,
    'secondary_keywords_': 'low' as const,
    'geo_location_cache': 'low' as const,
    'blog_monitoring_': 'low' as const,
  };

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  /**
   * Safe setItem with automatic cleanup on quota exceeded
   */
  setItem(key: string, value: string, priority: 'high' | 'medium' | 'low' = 'medium'): boolean {
    try {
      // Try to set the item directly first
      localStorage.setItem(key, value);
      console.log(`✅ [LocalStorage] Successfully stored: ${key} (${this.formatBytes(value.length)})`);
      return true;
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        console.warn(`⚠️ [LocalStorage] Quota exceeded for key: ${key}`);
        return this.handleQuotaExceeded(key, value, priority);
      } else {
        console.error(`❌ [LocalStorage] Error storing ${key}:`, error);
        return false;
      }
    }
  }

  /**
   * Safe getItem with error handling
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`❌ [LocalStorage] Error reading ${key}:`, error);
      return null;
    }
  }

  /**
   * Safe removeItem with error handling
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ [LocalStorage] Removed: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ [LocalStorage] Error removing ${key}:`, error);
      return false;
    }
  }

  /**
   * Handle quota exceeded by cleaning up storage
   */
  private handleQuotaExceeded(key: string, value: string, priority: 'high' | 'medium' | 'low'): boolean {
    console.log(`🧹 [LocalStorage] Starting cleanup for quota exceeded...`);
    
    const stats = this.getStorageStats();
    console.log(`📊 [LocalStorage] Current usage: ${this.formatBytes(stats.totalSize)} (${stats.totalEntries} entries)`);
    
    // Calculate space needed
    const spaceNeeded = value.length;
    const currentUsage = stats.totalSize;
    const targetUsage = Math.max(
      currentUsage - spaceNeeded,
      this.MAX_STORAGE_SIZE * 0.6 // Clean to 60% capacity
    );
    
    const spaceToFree = currentUsage - targetUsage;
    console.log(`🎯 [LocalStorage] Need to free: ${this.formatBytes(spaceToFree)}`);
    
    // Get cleanup candidates
    const candidates = this.getCleanupCandidates();
    let freedSpace = 0;
    let itemsRemoved = 0;
    
    // Remove items by priority (low -> medium -> high, but never high priority items)
    const priorityOrder: Array<'low' | 'medium'> = ['low', 'medium'];
    
    for (const targetPriority of priorityOrder) {
      if (freedSpace >= spaceToFree) break;
      
      const itemsToRemove = candidates
        .filter(item => item.priority === targetPriority)
        .sort((a, b) => a.timestamp - b.timestamp); // Oldest first
      
      for (const item of itemsToRemove) {
        if (freedSpace >= spaceToFree) break;
        
        if (this.removeItem(item.key)) {
          freedSpace += item.size;
          itemsRemoved++;
          console.log(`🗑️ [LocalStorage] Removed ${item.category} cache: ${item.key} (${this.formatBytes(item.size)})`);
        }
      }
    }
    
    console.log(`✅ [LocalStorage] Cleanup complete: freed ${this.formatBytes(freedSpace)}, removed ${itemsRemoved} items`);
    
    // Try to store the item again
    try {
      localStorage.setItem(key, value);
      console.log(`✅ [LocalStorage] Successfully stored after cleanup: ${key}`);
      return true;
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        console.error(`❌ [LocalStorage] Still quota exceeded after cleanup for: ${key}`);
        // If it's low priority, just skip it
        if (priority === 'low') {
          console.log(`⏭️ [LocalStorage] Skipping low priority item: ${key}`);
          return false;
        }
        // For medium/high priority, try more aggressive cleanup
        return this.aggressiveCleanup(key, value, priority);
      } else {
        console.error(`❌ [LocalStorage] Error after cleanup:`, error);
        return false;
      }
    }
  }

  /**
   * More aggressive cleanup for important data
   */
  private aggressiveCleanup(key: string, value: string, priority: 'high' | 'medium' | 'low'): boolean {
    console.log(`🔥 [LocalStorage] Starting aggressive cleanup...`);
    
    const candidates = this.getCleanupCandidates();
    let freedSpace = 0;
    
    // Remove all low and medium priority items if we need to store high priority
    const targetPriorities = priority === 'high' ? ['low', 'medium'] : ['low'];
    
    for (const targetPriority of targetPriorities) {
      const itemsToRemove = candidates.filter(item => item.priority === targetPriority);
      
      for (const item of itemsToRemove) {
        if (this.removeItem(item.key)) {
          freedSpace += item.size;
        }
      }
    }
    
    console.log(`🔥 [LocalStorage] Aggressive cleanup freed: ${this.formatBytes(freedSpace)}`);
    
    // Final attempt
    try {
      localStorage.setItem(key, value);
      console.log(`✅ [LocalStorage] Successfully stored after aggressive cleanup: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ [LocalStorage] Failed even after aggressive cleanup:`, error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): StorageStats {
    let totalSize = 0;
    let totalEntries = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
            totalEntries++;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating storage stats:', error);
    }
    
    return {
      totalSize,
      totalEntries,
      availableSpace: Math.max(0, this.MAX_STORAGE_SIZE - totalSize),
      quotaExceeded: totalSize > this.MAX_STORAGE_SIZE
    };
  }

  /**
   * Get cleanup candidates with metadata
   */
  private getCleanupCandidates(): CacheEntry[] {
    const candidates: CacheEntry[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        const value = localStorage.getItem(key);
        if (!value) continue;
        
        const size = key.length + value.length;
        const priority = this.getKeyPriority(key);
        const category = this.getKeyCategory(key);
        const timestamp = this.extractTimestamp(value);
        
        candidates.push({
          key,
          size,
          timestamp,
          priority,
          category
        });
      }
    } catch (error) {
      console.error('Error getting cleanup candidates:', error);
    }
    
    return candidates;
  }

  /**
   * Determine priority of a cache key
   */
  private getKeyPriority(key: string): 'high' | 'medium' | 'low' {
    for (const [prefix, priority] of Object.entries(this.CACHE_PRIORITIES)) {
      if (key.startsWith(prefix)) {
        return priority;
      }
    }
    return 'low'; // Default to low priority
  }

  /**
   * Determine category of a cache key
   */
  private getKeyCategory(key: string): CacheEntry['category'] {
    if (key.includes('outline')) return 'outline';
    if (key.includes('title')) return 'title';
    if (key.includes('keyword')) return 'keyword';
    if (key.includes('category')) return 'category';
    if (key.includes('sources')) return 'sources';
    if (key.includes('user') || key.includes('token') || key.includes('auth')) return 'auth';
    return 'other';
  }

  /**
   * Extract timestamp from cached data
   */
  private extractTimestamp(value: string): number {
    try {
      const parsed = JSON.parse(value);
      return parsed.timestamp || parsed.created_at || Date.now();
    } catch {
      return Date.now(); // Fallback to current time
    }
  }

  /**
   * Check if error is quota exceeded
   */
  private isQuotaExceededError(error: any): boolean {
    return error?.name === 'QuotaExceededError' || 
           error?.code === 22 || 
           error?.message?.includes('quota') ||
           error?.message?.includes('storage');
  }

  /**
   * Format bytes for human readable output
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Cleanup old cache entries proactively
   */
  cleanupOldEntries(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    console.log(`🧹 [LocalStorage] Cleaning up entries older than ${maxAge / (24 * 60 * 60 * 1000)} days`);
    
    const candidates = this.getCleanupCandidates();
    const cutoffTime = Date.now() - maxAge;
    let removedCount = 0;
    let freedSpace = 0;
    
    for (const candidate of candidates) {
      if (candidate.timestamp < cutoffTime && candidate.priority !== 'high') {
        if (this.removeItem(candidate.key)) {
          removedCount++;
          freedSpace += candidate.size;
        }
      }
    }
    
    if (removedCount > 0) {
      console.log(`✅ [LocalStorage] Cleaned up ${removedCount} old entries, freed ${this.formatBytes(freedSpace)}`);
    }
  }

  /**
   * Get storage usage report
   */
  getUsageReport(): void {
    const stats = this.getStorageStats();
    const candidates = this.getCleanupCandidates();
    
    console.group('📊 LocalStorage Usage Report');
    console.log(`Total Size: ${this.formatBytes(stats.totalSize)}`);
    console.log(`Total Entries: ${stats.totalEntries}`);
    console.log(`Available Space: ${this.formatBytes(stats.availableSpace)}`);
    console.log(`Usage: ${((stats.totalSize / this.MAX_STORAGE_SIZE) * 100).toFixed(1)}%`);
    
    // Group by category
    const byCategory = candidates.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = { count: 0, size: 0 };
      acc[item.category].count++;
      acc[item.category].size += item.size;
      return acc;
    }, {} as Record<string, { count: number; size: number }>);
    
    console.log('\nBy Category:');
    Object.entries(byCategory).forEach(([category, data]) => {
      console.log(`  ${category}: ${data.count} items, ${this.formatBytes(data.size)}`);
    });
    
    console.groupEnd();
  }
}

// Export singleton instance
export const localStorageManager = LocalStorageManager.getInstance();

// Convenience functions for backward compatibility
export const safeSetItem = (key: string, value: string, priority?: 'high' | 'medium' | 'low') => 
  localStorageManager.setItem(key, value, priority);

export const safeGetItem = (key: string) => 
  localStorageManager.getItem(key);

export const safeRemoveItem = (key: string) => 
  localStorageManager.removeItem(key);

// Auto-cleanup on module load
localStorageManager.cleanupOldEntries();
