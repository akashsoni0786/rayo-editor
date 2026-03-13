/**
 * @fileoverview Image handling utilities
 *
 * Provides utilities for grouping and matching image operations in diffs.
 * Useful for detecting image replacements and grouping consecutive images.
 */
import { ImageOperation, DiffPair } from '@/types/diff.types';

/**
 * Group consecutive images in content
 *
 * Identifies images that appear consecutively in content and groups them together.
 * Useful for batch processing image changes or detecting image sequences.
 *
 * @param images - Array of ImageOperation objects
 * @returns Array of groups, where each group contains consecutive images
 *
 * @example
 * ```tsx
 * const images = [
 *   { pos: 0, nodeSize: 10, rect: {...} },
 *   { pos: 10, nodeSize: 12, rect: {...} },  // consecutive
 *   { pos: 25, nodeSize: 10, rect: {...} }   // separate group
 * ];
 * const groups = groupConsecutiveImages(images);
 * // Returns: [[image1, image2], [image3]]
 * ```
 */
export const groupConsecutiveImages = (images: ImageOperation[]): ImageOperation[][] => {
  if (images.length === 0) return [];

  const groups: ImageOperation[][] = [];
  let current: ImageOperation[] = [];

  for (const img of images) {
    if (current.length === 0) {
      current.push(img);
    } else {
      const lastImg = current[current.length - 1];
      // Check if consecutive
      if (img.pos === lastImg.pos + lastImg.nodeSize) {
        current.push(img);
      } else {
        groups.push(current);
        current = [img];
      }
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
};

/**
 * Match image replacements in diff pairs
 *
 * Identifies images that were deleted and replaced with new images.
 * Matches insertions immediately following deletions as replacements.
 * Handles multiple image replacements in sequence.
 *
 * @param deletions - Array of deleted ImageOperation objects
 * @param insertions - Array of inserted ImageOperation objects
 * @returns Array of DiffPair objects representing image changes
 *
 * @example
 * ```tsx
 * const deleted = [{ pos: 0, nodeSize: 10, rect: {...} }];
 * const inserted = [{ pos: 10, nodeSize: 12, rect: {...} }];
 * const pairs = matchImageReplacements(deleted, inserted);
 * // Returns: [{ redRange, greenRange, isImageReplacement: true }]
 * ```
 *
 * @example
 * Handle image deletion without replacement:
 * ```tsx
 * const deleted = [{ pos: 0, nodeSize: 10, rect: {...} }];
 * const inserted: ImageOperation[] = [];
 * const pairs = matchImageReplacements(deleted, inserted);
 * // Returns: [{ redRange, greenRange: undefined, isImageDeletion: true }]
 * ```
 */
export const matchImageReplacements = (
  deletions: ImageOperation[],
  insertions: ImageOperation[]
): DiffPair[] => {
  const pairs: DiffPair[] = [];
  const usedInsertions = new Set<number>();

  for (const deletion of deletions) {
    const matchingInsertions: ImageOperation[] = [];
    let expectedPos = deletion.pos + deletion.nodeSize;

    for (let i = 0; i < insertions.length; i++) {
      if (usedInsertions.has(i)) continue;
      if (insertions[i].pos === expectedPos) {
        matchingInsertions.push(insertions[i]);
        usedInsertions.add(i);
        expectedPos = insertions[i].pos + insertions[i].nodeSize;
      }
    }

    if (matchingInsertions.length > 0) {
      // Image replacement
      pairs.push({
        redRange: { from: deletion.pos, to: deletion.pos + deletion.nodeSize },
        greenRange: {
          from: matchingInsertions[0].pos,
          to: matchingInsertions[matchingInsertions.length - 1].pos +
            matchingInsertions[matchingInsertions.length - 1].nodeSize
        },
        rect: deletion.rect,
        lastGreenRect: matchingInsertions[matchingInsertions.length - 1].rect,
        isImageReplacement: true,
        newImagesCount: matchingInsertions.length
      });
    } else {
      // Image deletion only
      pairs.push({
        redRange: { from: deletion.pos, to: deletion.pos + deletion.nodeSize },
        greenRange: undefined,
        rect: deletion.rect,
        lastGreenRect: deletion.rect,
        isImageDeletion: true
      });
    }
  }

  return pairs;
};
