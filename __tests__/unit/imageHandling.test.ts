import { describe, test, expect, beforeEach } from 'vitest';
import {
  groupConsecutiveImages,
  matchImageReplacements
} from '@/utils/imageHandling';
import { ImageOperation } from '@/types/diff.types';

describe('imageHandling', () => {
  let mockImages: ImageOperation[];

  beforeEach(() => {
    mockImages = [
      { pos: 0, nodeSize: 10, rect: { top: 0, left: 0, width: 100, bottom: 100, right: 100 } },
      { pos: 10, nodeSize: 10, rect: { top: 100, left: 0, width: 100, bottom: 200, right: 100 } }
    ];
  });

  test('should group consecutive images', () => {
    const groups = groupConsecutiveImages(mockImages);
    expect(groups.length).toBeGreaterThan(0);
  });

  test('should match image replacements', () => {
    const deletions = mockImages;
    const insertions = mockImages;
    const pairs = matchImageReplacements(deletions, insertions);
    expect(pairs.length).toBeGreaterThan(0);
  });
});
