import { describe, test, expect } from 'vitest';
import { DiffProcessingError, safeExecute } from '@/utils/errorHandling';

describe('errorHandling', () => {
  test('should create DiffProcessingError', () => {
    const error = new DiffProcessingError('Test error');
    expect(error.name).toBe('DiffProcessingError');
  });

  test('should execute safely with fallback', () => {
    const result = safeExecute(() => {
      throw new Error('test');
    }, []);
    expect(result).toEqual([]);
  });
});
