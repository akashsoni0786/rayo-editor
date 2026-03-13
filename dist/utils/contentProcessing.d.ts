import { DiffRange } from '../types/diff.types';
/**
 * Merges consecutive or overlapping ranges into single ranges
 *
 * Sorts ranges by start position and combines any that touch or overlap.
 * Useful for consolidating multiple small diffs into larger blocks.
 *
 * @param ranges - Array of DiffRange objects to merge
 * @returns Array of merged DiffRange objects (sorted by position)
 *
 * @example
 * ```tsx
 * const ranges = [
 *   { from: 0, to: 5 },
 *   { from: 5, to: 10 },  // consecutive
 *   { from: 8, to: 15 }   // overlapping
 * ];
 * const merged = mergeConsecutiveRanges(ranges);
 * // Returns: [{ from: 0, to: 15 }]
 * ```
 *
 * @example
 * Optimize diff highlighting:
 * ```tsx
 * const diffRanges = detectAndExtractDiffs(content);
 * const optimized = mergeConsecutiveRanges(diffRanges);
 * renderHighlights(optimized);
 * ```
 */
export declare function mergeConsecutiveRanges(ranges: DiffRange[]): DiffRange[];
/**
 * Extracts text content from a given range within a string
 *
 * Simple substring extraction based on position range.
 * Returns empty string if range is invalid or out of bounds.
 *
 * @param content - The full text content
 * @param range - The range defining start and end positions
 * @returns The extracted text substring
 *
 * @example
 * ```tsx
 * const text = 'Hello World';
 * const range = { from: 0, to: 5 };
 * extractTextContent(text, range); // 'Hello'
 * ```
 */
export declare function extractTextContent(content: string, range: DiffRange): string;
/**
 * Optimizes ranges by merging consecutive ranges and filtering out empty ranges
 *
 * Performs two optimizations:
 * 1. Filters out empty ranges where from === to
 * 2. Merges all consecutive/overlapping ranges
 *
 * Use before rendering to ensure efficient diff highlighting.
 *
 * @param ranges - Array of DiffRange objects to optimize
 * @returns Array of optimized DiffRange objects (minimal, non-overlapping)
 *
 * @example
 * ```tsx
 * const ranges = [
 *   { from: 0, to: 0 },   // empty - filtered
 *   { from: 5, to: 10 },
 *   { from: 10, to: 15 }  // consecutive - merged
 * ];
 * const optimized = optimizeRanges(ranges);
 * // Returns: [{ from: 5, to: 15 }]
 * ```
 *
 * @example
 * Before rendering highlights:
 * ```tsx
 * const detected = extractDiffRanges(content);
 * const optimized = optimizeRanges(detected);
 * return <DiffOverlay ranges={optimized} />;
 * ```
 */
export declare function optimizeRanges(ranges: DiffRange[]): DiffRange[];
//# sourceMappingURL=contentProcessing.d.ts.map