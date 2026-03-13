/**
 * @fileoverview Content processing utilities
 *
 * Provides utilities for transforming and optimizing content ranges.
 * Useful for merging overlapping diffs, extracting text, and optimizing
 * ranges for efficient rendering.
 */
import type { DiffRange } from '@/types/diff.types';

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
export function mergeConsecutiveRanges(ranges: DiffRange[]): DiffRange[] {
  if (ranges.length === 0) {
    return [];
  }

  // Sort by start position
  const sorted = [...ranges].sort((a, b) => a.from - b.from);

  const merged: DiffRange[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // If ranges are consecutive or overlapping, merge them
    if (next.from <= current.to) {
      current = {
        from: current.from,
        to: Math.max(current.to, next.to)
      };
    } else {
      // Otherwise, push current and start a new range
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}

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
export function extractTextContent(content: string, range: DiffRange): string {
  return content.substring(range.from, range.to);
}

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
export function optimizeRanges(ranges: DiffRange[]): DiffRange[] {
  // Filter out empty ranges (where from === to)
  const nonEmpty = ranges.filter(range => range.from < range.to);

  // Merge consecutive ranges
  return mergeConsecutiveRanges(nonEmpty);
}
