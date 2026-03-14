import { useEffect, useMemo, useCallback, useRef } from 'react';

interface RecoveredDraft {
  content: string;
  title?: string;
  timestamp: number;
}

interface UseAutoRecoveryOptions {
  /** Interval in milliseconds for auto-saving to localStorage (default: 30000 = 30s) */
  saveInterval?: number;
  /** Maximum age in milliseconds before recovery is considered stale (default: 86400000 = 24h) */
  maxAge?: number;
  /** Whether auto-recovery is enabled */
  enabled?: boolean;
}

interface UseAutoRecoveryReturn {
  /** Recovered draft data if available and not stale */
  recoveredDraft: RecoveredDraft | null;
  /** Whether a recovered draft is available */
  hasRecoveredDraft: boolean;
  /** Clear the stored recovery data (call after user accepts/rejects recovery) */
  clearRecovery: () => void;
  /** Manually trigger a save (useful before navigation) */
  saveNow: () => void;
  /** Time elapsed since the recovered draft was saved */
  recoveryAge: number | null;
}

/**
 * Hook for auto-saving blog content to localStorage and recovering on page load.
 *
 * This prevents data loss when:
 * - Browser crashes or is closed unexpectedly
 * - Network disconnection during editing
 * - Accidental page navigation
 *
 * @example
 * ```tsx
 * const { recoveredDraft, hasRecoveredDraft, clearRecovery } = useAutoRecovery(
 *   blogId,
 *   blog?.content || '',
 *   blog?.title,
 *   { enabled: !isStreaming }
 * );
 *
 * // Show recovery prompt
 * if (hasRecoveredDraft) {
 *   return (
 *     <RecoveryPrompt
 *       onAccept={() => {
 *         updateBlog({ content: recoveredDraft.content });
 *         clearRecovery();
 *       }}
 *       onReject={clearRecovery}
 *     />
 *   );
 * }
 * ```
 */
export function useAutoRecovery(
  blogId: string | undefined,
  content: string,
  title?: string,
  options: UseAutoRecoveryOptions = {}
): UseAutoRecoveryReturn {
  const {
    saveInterval = 30000, // 30 seconds
    maxAge = 86400000, // 24 hours
    enabled = true
  } = options;

  const storageKey = blogId ? `rayo_draft_recovery_${blogId}` : null;
  const lastSavedContentRef = useRef<string>('');
  const hasCheckedRecoveryRef = useRef(false);

  // Check for recovered draft on mount (only once)
  const recoveredDraft = useMemo<RecoveredDraft | null>(() => {
    if (!storageKey || hasCheckedRecoveryRef.current) return null;
    hasCheckedRecoveryRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const parsed = JSON.parse(saved) as RecoveredDraft;

      // Validate structure
      if (!parsed.content || !parsed.timestamp) return null;

      // Check if recovery is too old
      const age = Date.now() - parsed.timestamp;
      if (age > maxAge) {
        // Clean up stale recovery
        localStorage.removeItem(storageKey);
        return null;
      }

      // Only return if content differs from current (meaningful recovery)
      // Skip if content is essentially the same (minor whitespace differences)
      const normalizeContent = (c: string) => c.replace(/\s+/g, ' ').trim();
      if (normalizeContent(parsed.content) === normalizeContent(content)) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('[useAutoRecovery] Failed to parse recovered draft:', error);
      return null;
    }
  }, [storageKey, maxAge]); // Intentionally not including content to only check on mount

  // Calculate recovery age
  const recoveryAge = useMemo(() => {
    if (!recoveredDraft) return null;
    return Date.now() - recoveredDraft.timestamp;
  }, [recoveredDraft]);

  // Clear recovery data
  const clearRecovery = useCallback(() => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('[useAutoRecovery] Failed to clear recovery:', error);
      }
    }
  }, [storageKey]);

  // Save current content to localStorage
  const saveNow = useCallback(() => {
    if (!storageKey || !enabled || !content) return;

    // Skip if content hasn't changed since last save
    if (content === lastSavedContentRef.current) return;

    try {
      const draft: RecoveredDraft = {
        content,
        title,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      lastSavedContentRef.current = content;
    } catch (error) {
      // localStorage might be full or disabled
      console.error('[useAutoRecovery] Failed to save draft:', error);
    }
  }, [storageKey, enabled, content, title]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled || !storageKey) return;

    const interval = setInterval(saveNow, saveInterval);

    // Also save on beforeunload (page close/refresh)
    const handleBeforeUnload = () => {
      saveNow();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, storageKey, saveInterval, saveNow]);

  // Save when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      if (enabled && storageKey && content) {
        try {
          const draft: RecoveredDraft = {
            content,
            title,
            timestamp: Date.now()
          };
          localStorage.setItem(storageKey, JSON.stringify(draft));
        } catch (error) {
          // Ignore errors on unmount
        }
      }
    };
  }, [enabled, storageKey, content, title]);

  return {
    recoveredDraft,
    hasRecoveredDraft: recoveredDraft !== null,
    clearRecovery,
    saveNow,
    recoveryAge
  };
}

/**
 * Format recovery age as human-readable string
 */
export function formatRecoveryAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}
