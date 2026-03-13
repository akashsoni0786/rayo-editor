/**
 * Custom error class for diff processing failures
 *
 * Extends Error with additional context information for better debugging.
 * Useful for distinguishing diff processing errors from other exceptions.
 *
 * @example
 * ```tsx
 * try {
 *   processComplexDiff(content);
 * } catch (error) {
 *   if (error instanceof DiffProcessingError) {
 *     console.error('Diff error:', error.message);
 *     console.error('Context:', error.context);
 *   }
 * }
 * ```
 */
export class DiffProcessingError extends Error {
  /**
   * Create a new DiffProcessingError
   * @param message - Error message
   * @param context - Additional context object for debugging
   */
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'DiffProcessingError';
  }
}

/**
 * Safely execute a function with error handling and fallback
 *
 * Wraps function execution in try-catch and returns fallback value on error.
 * Logs warnings but doesn't throw, making it safe for non-critical operations.
 *
 * @template T - The return type of the function
 * @param fn - Function to execute safely
 * @param fallback - Fallback value if function throws
 * @returns Result of fn() or fallback value
 *
 * @example
 * ```tsx
 * const result = safeExecute(
 *   () => expensiveOperation(data),
 *   defaultValue
 * );
 * ```
 *
 * @example
 * Safe diff detection:
 * ```tsx
 * const markers = safeExecute(
 *   () => detectDiffMarkers(content),
 *   { hasDiffs: false, markers: [] }
 * );
 * ```
 */
export const safeExecute = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch (error) {
    console.warn('Error in diff processing:', error);
    return fallback;
  }
};
