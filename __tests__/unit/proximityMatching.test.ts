import { describe, test, expect } from 'vitest';
import { findOwnerTextPair, calculateProximity, groupConsecutiveItems } from '@/utils/proximityMatching';
import { DiffRange, DiffPair } from '@/types/diff.types';

describe('proximityMatching', () => {
  describe('calculateProximity', () => {
    test('should find owner text pair by proximity', () => {
      const range1 = { from: 0, to: 10 };
      const range2 = { from: 12, to: 20 };
      const dist = calculateProximity(range1, range2);
      expect(typeof dist).toBe('number');
    });

    test('should calculate distance between ranges', () => {
      const range1 = { from: 0, to: 10 };
      const range2 = { from: 20, to: 30 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(10); // gap of 10
    });

    test('should calculate zero distance when ranges are adjacent', () => {
      const range1 = { from: 0, to: 10 };
      const range2 = { from: 10, to: 20 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(0);
    });

    test('should handle overlapping ranges', () => {
      const range1 = { from: 0, to: 15 };
      const range2 = { from: 10, to: 25 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(5); // min(|0-25|, |10-15|) = min(25, 5) = 5
    });

    test('should handle identical ranges', () => {
      const range1 = { from: 5, to: 15 };
      const range2 = { from: 5, to: 15 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(10); // min(|5-15|, |5-15|) = 10
    });

    test('should handle ranges with gap in reverse order', () => {
      const range1 = { from: 20, to: 30 };
      const range2 = { from: 0, to: 10 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(10);
    });

    test('should return minimum distance for two possible gaps', () => {
      const range1 = { from: 10, to: 20 };
      const range2 = { from: 25, to: 40 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(5); // min(|10-40|, |25-20|) = min(30, 5) = 5
    });

    test('should handle single-point ranges', () => {
      const range1 = { from: 10, to: 10 };
      const range2 = { from: 20, to: 20 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(10);
    });

    test('should calculate distance with large numbers', () => {
      const range1 = { from: 1000000, to: 2000000 };
      const range2 = { from: 3000000, to: 4000000 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(1000000);
    });

    test('should handle zero-based ranges', () => {
      const range1 = { from: 0, to: 0 };
      const range2 = { from: 5, to: 10 };
      const dist = calculateProximity(range1, range2);
      expect(dist).toBe(5);
    });
  });

  describe('findOwnerTextPair', () => {
    test('should return null for empty text pairs', () => {
      const result = findOwnerTextPair(10, 20, []);
      expect(result).toBeNull();
    });

    test('should return single pair from array', () => {
      const pair: DiffPair = {
        redRange: { from: 0, to: 10 },
        greenRange: { from: 0, to: 10 }
      };
      const result = findOwnerTextPair(5, 15, [pair]);
      expect(result).toBe(pair);
    });

    test('should find closest pair by position', () => {
      const pair1: DiffPair = {
        redRange: { from: 0, to: 10 },
        greenRange: { from: 0, to: 10 }
      };
      const pair2: DiffPair = {
        redRange: { from: 50, to: 60 },
        greenRange: { from: 50, to: 60 }
      };
      const result = findOwnerTextPair(5, 15, [pair1, pair2]);
      expect(result).toBe(pair1);
    });

    test('should find closest pair among multiple options', () => {
      const pair1: DiffPair = {
        redRange: { from: 0, to: 10 },
        greenRange: { from: 0, to: 10 }
      };
      const pair2: DiffPair = {
        redRange: { from: 100, to: 120 },
        greenRange: { from: 100, to: 120 }
      };
      const pair3: DiffPair = {
        redRange: { from: 200, to: 210 },
        greenRange: { from: 200, to: 210 }
      };
      const result = findOwnerTextPair(105, 115, [pair1, pair2, pair3]);
      expect(result).toBe(pair2);
    });

    test('should handle pairs with only redRange', () => {
      const pair: DiffPair = {
        redRange: { from: 10, to: 20 },
        greenRange: undefined
      };
      const result = findOwnerTextPair(15, 25, [pair]);
      expect(result).toBe(pair);
    });

    test('should handle pairs with only greenRange', () => {
      const pair: DiffPair = {
        redRange: undefined,
        greenRange: { from: 10, to: 20 }
      };
      const result = findOwnerTextPair(15, 25, [pair]);
      expect(result).toBe(pair);
    });

    test('should handle pair with neither redRange nor greenRange', () => {
      const pair: DiffPair = {
        redRange: undefined,
        greenRange: undefined
      };
      const result = findOwnerTextPair(15, 25, [pair]);
      expect(result).toBe(pair);
    });

    test('should find pair closest to block start', () => {
      const pair1: DiffPair = {
        redRange: { from: 0, to: 10 },
        greenRange: { from: 0, to: 10 }
      };
      const pair2: DiffPair = {
        redRange: { from: 20, to: 30 },
        greenRange: { from: 20, to: 30 }
      };
      const result = findOwnerTextPair(25, 35, [pair1, pair2]);
      expect(result).toBe(pair2);
    });

    test('should handle three or more pairs', () => {
      const pairs: DiffPair[] = [
        { redRange: { from: 0, to: 10 }, greenRange: { from: 0, to: 10 } },
        { redRange: { from: 50, to: 60 }, greenRange: { from: 50, to: 60 } },
        { redRange: { from: 100, to: 110 }, greenRange: { from: 100, to: 110 } },
        { redRange: { from: 200, to: 210 }, greenRange: { from: 200, to: 210 } }
      ];
      const result = findOwnerTextPair(105, 115, pairs);
      expect(result).toBe(pairs[2]);
    });

    test('should return first pair when all distances are equal', () => {
      const pair1: DiffPair = {
        redRange: { from: 0, to: 10 },
        greenRange: { from: 0, to: 10 }
      };
      const pair2: DiffPair = {
        redRange: { from: 0, to: 10 },
        greenRange: { from: 0, to: 10 }
      };
      const result = findOwnerTextPair(5, 15, [pair1, pair2]);
      expect(result).toBe(pair1);
    });

    test('should handle large position values', () => {
      const pair1: DiffPair = {
        redRange: { from: 1000000, to: 1000010 },
        greenRange: { from: 1000000, to: 1000010 }
      };
      const pair2: DiffPair = {
        redRange: { from: 2000000, to: 2000010 },
        greenRange: { from: 2000000, to: 2000010 }
      };
      const result = findOwnerTextPair(1000005, 1000015, [pair1, pair2]);
      expect(result).toBe(pair1);
    });
  });

  describe('groupConsecutiveItems', () => {
    test('should return empty array for empty items', () => {
      const result = groupConsecutiveItems([]);
      expect(result).toEqual([]);
    });

    test('should group single item', () => {
      const items = [{ pos: 0, nodeSize: 10 }];
      const result = groupConsecutiveItems(items);
      expect(result).toEqual([items]);
    });

    test('should group consecutive items together', () => {
      const items = [
        { pos: 0, nodeSize: 10 },
        { pos: 10, nodeSize: 5 },
        { pos: 15, nodeSize: 8 }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(items);
    });

    test('should separate non-consecutive items into different groups', () => {
      const items = [
        { pos: 0, nodeSize: 10 },
        { pos: 20, nodeSize: 5 }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([items[0]]);
      expect(result[1]).toEqual([items[1]]);
    });

    test('should handle multiple groups', () => {
      const items = [
        { pos: 0, nodeSize: 10 },
        { pos: 10, nodeSize: 5 },
        { pos: 25, nodeSize: 10 },
        { pos: 35, nodeSize: 8 }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([items[0], items[1]]);
      expect(result[1]).toEqual([items[2], items[3]]);
    });

    test('should handle items with size zero', () => {
      const items = [
        { pos: 0, nodeSize: 0 },
        { pos: 0, nodeSize: 10 }
      ];
      const result = groupConsecutiveItems(items);
      // pos 0 + size 0 = 0, and second item starts at pos 0, so they're consecutive
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    test('should preserve item order within groups', () => {
      const item1 = { pos: 0, nodeSize: 10 };
      const item2 = { pos: 10, nodeSize: 5 };
      const item3 = { pos: 15, nodeSize: 8 };
      const items = [item1, item2, item3];
      const result = groupConsecutiveItems(items);
      expect(result[0][0]).toBe(item1);
      expect(result[0][1]).toBe(item2);
      expect(result[0][2]).toBe(item3);
    });

    test('should handle large item positions', () => {
      const items = [
        { pos: 1000000, nodeSize: 10 },
        { pos: 1000010, nodeSize: 5 },
        { pos: 2000000, nodeSize: 8 }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(1);
    });

    test('should handle items with large node sizes', () => {
      const items = [
        { pos: 0, nodeSize: 1000 },
        { pos: 1000, nodeSize: 5000 },
        { pos: 6000, nodeSize: 100 }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(3);
    });

    test('should work with custom type extending pos and nodeSize', () => {
      interface CustomItem {
        pos: number;
        nodeSize: number;
        id: string;
      }
      const items: CustomItem[] = [
        { pos: 0, nodeSize: 10, id: 'a' },
        { pos: 10, nodeSize: 5, id: 'b' },
        { pos: 20, nodeSize: 8, id: 'c' }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(2);
      expect(result[0][0].id).toBe('a');
      expect(result[1][0].id).toBe('c');
    });

    test('should handle single-item groups mixed with multi-item groups', () => {
      const items = [
        { pos: 0, nodeSize: 10 },
        { pos: 20, nodeSize: 5 },
        { pos: 25, nodeSize: 8 },
        { pos: 50, nodeSize: 10 }
      ];
      const result = groupConsecutiveItems(items);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(1);
      expect(result[1]).toHaveLength(2);
      expect(result[2]).toHaveLength(1);
    });
  });
});
