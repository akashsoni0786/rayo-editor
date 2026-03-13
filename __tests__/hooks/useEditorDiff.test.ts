import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEditorDiff } from '@/hooks/useEditorDiff';
import { useRef } from 'react';

describe('useEditorDiff', () => {
  test('should initialize with empty diff pairs', () => {
    const { result } = renderHook(() => {
      const mockRef = useRef(null);
      return useEditorDiff(mockRef);
    });
    expect(result.current.diffPairs).toEqual([]);
  });

  test('should provide updateDiffRanges function', () => {
    const { result } = renderHook(() => {
      const mockRef = useRef(null);
      return useEditorDiff(mockRef);
    });
    expect(typeof result.current.updateDiffRanges).toBe('function');
  });

  test('should track active pair index', () => {
    const { result } = renderHook(() => {
      const mockRef = useRef(null);
      return useEditorDiff(mockRef);
    });
    expect(result.current.activePairIndex).toBeDefined();
  });

  test('should provide hover pair tracking', () => {
    const { result } = renderHook(() => {
      const mockRef = useRef(null);
      return useEditorDiff(mockRef);
    });
    expect(typeof result.current.setHoverPairIndex).toBe('function');
  });

  test('should provide overlay hole rect', () => {
    const { result } = renderHook(() => {
      const mockRef = useRef(null);
      return useEditorDiff(mockRef);
    });
    expect(result.current.overlayHoleRect === null || typeof result.current.overlayHoleRect === 'object').toBe(true);
  });
});
