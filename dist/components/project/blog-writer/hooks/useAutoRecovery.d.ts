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
export declare function useAutoRecovery(blogId: string | undefined, content: string, title?: string, options?: UseAutoRecoveryOptions): UseAutoRecoveryReturn;
/**
 * Format recovery age as human-readable string
 */
export declare function formatRecoveryAge(ageMs: number): string;
export {};
//# sourceMappingURL=useAutoRecovery.d.ts.map