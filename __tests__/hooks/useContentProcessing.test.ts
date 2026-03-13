import { describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContentProcessing } from '@/hooks/useContentProcessing';

describe('useContentProcessing', () => {
  describe('Initialization', () => {
    test('should initialize processing state', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      expect(result.current.isProcessing === false).toBe(true);
    });

    test('should initialize with provided content', () => {
      const { result } = renderHook(() => useContentProcessing('initial content'));
      expect(result.current.content).toBe('initial content');
    });

    test('should initialize with empty string by default', () => {
      const { result } = renderHook(() => useContentProcessing());
      expect(result.current.content).toBe('');
    });

    test('should initialize error state as null', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      expect(result.current.error).toBeNull();
    });

    test('should provide processContent function', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      expect(typeof result.current.processContent).toBe('function');
    });

    test('should provide setContent function', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      expect(typeof result.current.setContent).toBe('function');
    });

    test('should return correct initial state object structure', () => {
      const { result } = renderHook(() => useContentProcessing('test'));
      expect(result.current).toHaveProperty('content');
      expect(result.current).toHaveProperty('setContent');
      expect(result.current).toHaveProperty('isProcessing');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('processContent');
    });
  });

  describe('Content Updates', () => {
    test('should handle content updates with setContent', () => {
      const { result } = renderHook(() => useContentProcessing('initial'));
      act(() => {
        result.current.setContent('updated');
      });
      expect(result.current.content).toBe('updated');
    });

    test('should process content with processContent', () => {
      const { result } = renderHook(() => useContentProcessing('initial'));
      act(() => {
        result.current.processContent('new content');
      });
      expect(result.current.content).toBe('new content');
    });

    test('should handle empty string content', () => {
      const { result } = renderHook(() => useContentProcessing('initial'));
      act(() => {
        result.current.processContent('');
      });
      expect(result.current.content).toBe('');
    });

    test('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent(longContent);
      });
      expect(result.current.content).toBe(longContent);
    });

    test('should handle multiline content', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent(multilineContent);
      });
      expect(result.current.content).toBe(multilineContent);
    });

    test('should handle content with special characters', () => {
      const specialContent = '<script>alert("test")</script>&<>"\'';
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent(specialContent);
      });
      expect(result.current.content).toBe(specialContent);
    });

    test('should handle content with unicode characters', () => {
      const unicodeContent = '你好世界🌍emoji文字';
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent(unicodeContent);
      });
      expect(result.current.content).toBe(unicodeContent);
    });

    test('should handle rapid content updates', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('update1');
        result.current.processContent('update2');
        result.current.processContent('update3');
      });
      expect(result.current.content).toBe('update3');
    });
  });

  describe('Processing State', () => {
    test('should provide error state', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      expect(result.current.error === null || typeof result.current.error === 'object').toBe(true);
    });

    test('should start with isProcessing false', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      expect(result.current.isProcessing).toBe(false);
    });

    test('should set error to null after processing', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('content');
      });
      expect(result.current.error).toBeNull();
    });

    test('should maintain processing state false after processContent', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('test content');
      });
      expect(result.current.isProcessing).toBe(false);
    });

    test('should handle processContent with same content twice', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('same');
      });
      expect(result.current.content).toBe('same');
      act(() => {
        result.current.processContent('same');
      });
      expect(result.current.content).toBe('same');
    });
  });

  describe('Function References', () => {
    test('should maintain stable processContent reference', () => {
      const { result, rerender } = renderHook(() => useContentProcessing(''));
      const firstRef = result.current.processContent;
      rerender();
      const secondRef = result.current.processContent;
      expect(firstRef).toBe(secondRef);
    });

    test('should allow calling processContent multiple times', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('first');
      });
      expect(result.current.content).toBe('first');
      act(() => {
        result.current.processContent('second');
      });
      expect(result.current.content).toBe('second');
      act(() => {
        result.current.processContent('third');
      });
      expect(result.current.content).toBe('third');
    });

    test('should allow direct setContent calls', () => {
      const { result } = renderHook(() => useContentProcessing('initial'));
      act(() => {
        result.current.setContent('direct update');
      });
      expect(result.current.content).toBe('direct update');
    });
  });

  describe('Mixed Operations', () => {
    test('should handle mix of setContent and processContent', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.setContent('via setContent');
      });
      expect(result.current.content).toBe('via setContent');
      act(() => {
        result.current.processContent('via processContent');
      });
      expect(result.current.content).toBe('via processContent');
    });

    test('should maintain correct state across multiple operations', () => {
      const { result } = renderHook(() => useContentProcessing('initial'));
      expect(result.current.content).toBe('initial');
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();

      act(() => {
        result.current.processContent('updated');
      });
      expect(result.current.content).toBe('updated');
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('should handle state updates with different content types', () => {
      const { result } = renderHook(() => useContentProcessing(''));

      act(() => {
        result.current.processContent('string');
      });
      expect(result.current.content).toBe('string');

      act(() => {
        result.current.processContent('');
      });
      expect(result.current.content).toBe('');

      act(() => {
        result.current.processContent('   ');
      });
      expect(result.current.content).toBe('   ');
    });
  });

  describe('Edge Cases', () => {
    test('should handle whitespace-only content', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('   ');
      });
      expect(result.current.content).toBe('   ');
    });

    test('should handle newline-only content', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('\n\n\n');
      });
      expect(result.current.content).toBe('\n\n\n');
    });

    test('should handle content with tabs and spaces', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('\t\t\n   \n\t');
      });
      expect(result.current.content).toBe('\t\t\n   \n\t');
    });

    test('should handle numeric string content', () => {
      const { result } = renderHook(() => useContentProcessing(''));
      act(() => {
        result.current.processContent('123456789');
      });
      expect(result.current.content).toBe('123456789');
    });

    test('should initialize with various initial values', () => {
      const testCases = [
        { input: '', expected: '' },
        { input: 'simple', expected: 'simple' },
        { input: '   ', expected: '   ' },
        { input: 'multi\nline', expected: 'multi\nline' }
      ];

      testCases.forEach(({ input, expected }) => {
        const { result } = renderHook(() => useContentProcessing(input));
        expect(result.current.content).toBe(expected);
      });
    });
  });
});
