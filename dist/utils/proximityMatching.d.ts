import { DiffRange, DiffPair } from '../types/diff.types';
/**
 * Calculate proximity score between two text ranges
 *
 * Calculates the minimum distance between two ranges in characters.
 * Returns 0 if ranges are adjacent or overlapping, larger values indicate
 * greater distance.
 *
 * @param range1 - First text range
 * @param range2 - Second text range
 * @returns Distance in characters (0 means adjacent/overlapping)
 *
 * @example
 * ```tsx
 * const range1 = { from: 0, to: 10 };
 * const range2 = { from: 10, to: 20 };
 * calculateProximity(range1, range2); // 0 - adjacent
 *
 * const range3 = { from: 100, to: 110 };
 * calculateProximity(range1, range3); // 90 - far apart
 * ```
 */
export declare const calculateProximity: (range1: DiffRange, range2: DiffRange) => number;
/**
 * Find the best matching diff pair for a given block position
 *
 * Searches for the diff pair closest to the specified block position.
 * Useful for associating non-text blocks (images, tables) with their
 * corresponding text changes.
 *
 * @param blockPos - Position of the block to match
 * @param _blockEndPos - End position of the block (unused)
 * @param textPairs - Array of DiffPair objects to search
 * @returns The closest DiffPair or null if none found
 *
 * @example
 * ```tsx
 * const pairs = [
 *   { redRange: { from: 0, to: 10 }, greenRange: { from: 0, to: 15 } },
 *   { redRange: { from: 50, to: 60 }, greenRange: { from: 50, to: 65 } }
 * ];
 * const imagePos = 52;
 * const owner = findOwnerTextPair(imagePos, 62, pairs);
 * // Returns the second pair as it's closest to imagePos
 * ```
 */
export declare const findOwnerTextPair: (blockPos: number, _blockEndPos: number, textPairs: DiffPair[]) => DiffPair | null;
/**
 * Group consecutive items by position
 *
 * Groups items that appear consecutively in content based on pos and nodeSize.
 * Items are consecutive if: item.pos === previous.pos + previous.nodeSize
 *
 * @template T - Item type (must have pos and nodeSize properties)
 * @param items - Array of items to group
 * @returns Array of groups, each containing consecutive items
 *
 * @example
 * ```tsx
 * const items = [
 *   { pos: 0, nodeSize: 10 },
 *   { pos: 10, nodeSize: 5 },   // consecutive
 *   { pos: 20, nodeSize: 10 }   // separate group
 * ];
 * const groups = groupConsecutiveItems(items);
 * // Returns: [[item1, item2], [item3]]
 * ```
 *
 * @example
 * Group items by position:
 * ```typescript
 * const items = [{ pos: 5, nodeSize: 20 }, { pos: 25, nodeSize: 15 }];
 * const groups = groupConsecutiveItems(items);
 * ```
 */
export declare const groupConsecutiveItems: <T extends {
    pos: number;
    nodeSize: number;
}>(items: T[]) => T[][];
//# sourceMappingURL=proximityMatching.d.ts.map