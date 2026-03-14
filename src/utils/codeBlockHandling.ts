/**
 * Code Block Handling Utilities
 * Groups consecutive code blocks and matches code block replacements for diff visualization
 */

import { CodeBlockOperation, DiffPair } from '../types/diff.types';

/**
 * Groups consecutive code blocks based on their positions
 * Code blocks are considered consecutive if the next one starts where the previous one ends
 */
export const groupConsecutiveCodeBlocks = (
  codeBlocks: CodeBlockOperation[]
): CodeBlockOperation[][] => {
  if (codeBlocks.length === 0) return [];

  const groups: CodeBlockOperation[][] = [];
  let current: CodeBlockOperation[] = [];

  for (const codeBlock of codeBlocks) {
    if (current.length === 0) {
      current.push(codeBlock);
    } else {
      const lastCodeBlock = current[current.length - 1];
      // Check if this code block is immediately after the last one
      if (codeBlock.pos === lastCodeBlock.pos + lastCodeBlock.nodeSize) {
        current.push(codeBlock);
      } else {
        groups.push(current);
        current = [codeBlock];
      }
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
};

/**
 * Matches code block deletions with corresponding insertions
 * Creates DiffPair objects showing the relationship between old and new code blocks
 */
export const matchCodeBlockReplacements = (
  deletions: CodeBlockOperation[],
  insertions: CodeBlockOperation[]
): DiffPair[] => {
  const pairs: DiffPair[] = [];
  const usedInsertions = new Set<number>();

  for (const deletion of deletions) {
    const matchingInsertions: CodeBlockOperation[] = [];
    let expectedPos = deletion.pos + deletion.nodeSize;

    // Try to find consecutive insertions that follow this deletion
    for (let i = 0; i < insertions.length; i++) {
      if (usedInsertions.has(i)) continue;

      if (insertions[i].pos === expectedPos) {
        matchingInsertions.push(insertions[i]);
        usedInsertions.add(i);
        expectedPos = insertions[i].pos + insertions[i].nodeSize;
      }
    }

    // If we found matching insertions, create a replacement pair
    if (matchingInsertions.length > 0) {
      pairs.push({
        redRange: { from: deletion.pos, to: deletion.pos + deletion.nodeSize },
        greenRange: {
          from: matchingInsertions[0].pos,
          to: matchingInsertions[matchingInsertions.length - 1].pos +
            matchingInsertions[matchingInsertions.length - 1].nodeSize
        },
        rect: deletion.rect,
        lastGreenRect: matchingInsertions[matchingInsertions.length - 1].rect,
        isCodeBlockReplacement: true
      });
    } else {
      // No matching insertion found - it's a pure deletion
      pairs.push({
        redRange: { from: deletion.pos, to: deletion.pos + deletion.nodeSize },
        greenRange: undefined,
        rect: deletion.rect,
        lastGreenRect: deletion.rect,
        isCodeBlockDeletion: true
      });
    }
  }

  return pairs;
};
