/**
 * BlogEditor Performance Tests
 *
 * These tests verify that performance-critical behaviors work correctly
 * BEFORE and AFTER optimization. They cover:
 * - Diff detection (innerHTML parsing → optimized approach)
 * - updateDiffRanges guard rails (re-entry, cooldown, fingerprinting)
 * - console.log removal (no debug logs in production)
 * - Scroll handler debouncing
 * - Mousemove handler throttling
 * - MutationObserver cascade prevention
 */
export {};
//# sourceMappingURL=BlogEditor.perf.test.d.ts.map