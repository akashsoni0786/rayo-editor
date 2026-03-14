/**
 * Table Handling Utilities
 * Groups consecutive tables and matches table replacements for diff visualization
 */

import { TableOperation, DiffPair } from '../types/diff.types';

/**
 * Groups consecutive tables based on their positions
 * Tables are considered consecutive if the next table starts where the previous one ends
 */
export const groupConsecutiveTables = (tables: TableOperation[]): TableOperation[][] => {
  if (tables.length === 0) return [];

  const groups: TableOperation[][] = [];
  let current: TableOperation[] = [];

  for (const tbl of tables) {
    if (current.length === 0) {
      current.push(tbl);
    } else {
      const lastTbl = current[current.length - 1];
      // Check if this table is immediately after the last one
      if (tbl.pos === lastTbl.pos + lastTbl.nodeSize) {
        current.push(tbl);
      } else {
        groups.push(current);
        current = [tbl];
      }
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
};

/**
 * Matches table deletions with corresponding insertions
 * Creates DiffPair objects showing the relationship between old and new tables
 */
export const matchTableReplacements = (
  deletions: TableOperation[],
  insertions: TableOperation[]
): DiffPair[] => {
  const pairs: DiffPair[] = [];
  const usedInsertions = new Set<number>();

  for (const deletion of deletions) {
    const matchingInsertions: TableOperation[] = [];
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
        isTableReplacement: true
      });
    } else {
      // No matching insertion found - it's a pure deletion
      pairs.push({
        redRange: { from: deletion.pos, to: deletion.pos + deletion.nodeSize },
        greenRange: undefined,
        rect: deletion.rect,
        lastGreenRect: deletion.rect,
        isTableDeletion: true
      });
    }
  }

  return pairs;
};
