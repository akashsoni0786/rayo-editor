// __tests__/unit/contentProcessing.test.ts
import { describe, test, expect } from 'vitest';
import {
  mergeConsecutiveRanges,
  extractTextContent,
  optimizeRanges
} from '@/utils/contentProcessing';
import type { DiffRange } from '@/types/diff.types';

describe('mergeConsecutiveRanges', () => {
  test('should merge adjacent ranges', () => {
    const ranges: DiffRange[] = [
      { from: 0, to: 5 },
      { from: 5, to: 10 }
    ];
    const result = mergeConsecutiveRanges(ranges);
    expect(result).toEqual([{ from: 0, to: 10 }]);
  });

  test('should merge overlapping ranges', () => {
    const ranges: DiffRange[] = [
      { from: 0, to: 8 },
      { from: 5, to: 10 }
    ];
    const result = mergeConsecutiveRanges(ranges);
    expect(result).toEqual([{ from: 0, to: 10 }]);
  });

  test('should keep separate ranges unchanged', () => {
    const ranges: DiffRange[] = [
      { from: 0, to: 5 },
      { from: 10, to: 15 }
    ];
    const result = mergeConsecutiveRanges(ranges);
    expect(result).toEqual([
      { from: 0, to: 5 },
      { from: 10, to: 15 }
    ]);
  });

  test('should handle empty array', () => {
    const ranges: DiffRange[] = [];
    const result = mergeConsecutiveRanges(ranges);
    expect(result).toEqual([]);
  });
});

describe('extractTextContent', () => {
  test('should extract text within range', () => {
    const content = 'Hello World';
    const range: DiffRange = { from: 0, to: 5 };
    const result = extractTextContent(content, range);
    expect(result).toBe('Hello');
  });

  test('should handle range at end of content', () => {
    const content = 'Hello World';
    const range: DiffRange = { from: 6, to: 11 };
    const result = extractTextContent(content, range);
    expect(result).toBe('World');
  });
});

describe('optimizeRanges', () => {
  test('should merge and filter ranges', () => {
    const ranges: DiffRange[] = [
      { from: 0, to: 5 },
      { from: 5, to: 10 },
      { from: 20, to: 20 }
    ];
    const result = optimizeRanges(ranges);
    expect(result).toEqual([{ from: 0, to: 10 }]);
  });
});
