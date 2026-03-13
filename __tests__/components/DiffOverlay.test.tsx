import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiffOverlay } from '@/components/DiffOverlay';
import { DiffPair } from '@/types/diff.types';

const mockRect = {
  top: 0,
  left: 0,
  width: 100,
  bottom: 50,
  right: 100
};

const createMockPair = (overrides?: Partial<DiffPair>): DiffPair => ({
  rect: { ...mockRect },
  lastGreenRect: { ...mockRect },
  ...overrides
});

describe('DiffOverlay', () => {
  describe('Rendering', () => {
    test('should not render when diffPairs is empty', () => {
      render(
        <DiffOverlay
          diffPairs={[]}
          overlayHoleRect={null}
        />
      );
      expect(screen.queryByTestId('diff-overlay')).not.toBeInTheDocument();
    });

    test('should render when diffPairs has items', () => {
      const mockPair = createMockPair();
      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );
      expect(screen.getByTestId('diff-overlay')).toBeInTheDocument();
    });

    test('should render container with correct classes', () => {
      const mockPair = createMockPair();
      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );
      const container = screen.getByTestId('diff-overlay');
      expect(container).toHaveClass('fixed', 'inset-0', 'pointer-events-none');
    });

    test('should render container with correct z-index', () => {
      const mockPair = createMockPair();
      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );
      const container = screen.getByTestId('diff-overlay');
      expect(container.style.zIndex).toBe('40');
    });
  });

  describe('Diff Pairs', () => {
    test('should render single diff pair', () => {
      const mockPair = createMockPair();
      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );
      expect(screen.getByTestId('diff-pair-0')).toBeInTheDocument();
    });

    test('should render multiple diff pairs', () => {
      const pair1 = createMockPair({ rect: { ...mockRect, top: 0 } });
      const pair2 = createMockPair({ rect: { ...mockRect, top: 100 } });
      const pair3 = createMockPair({ rect: { ...mockRect, top: 200 } });

      render(
        <DiffOverlay
          diffPairs={[pair1, pair2, pair3]}
          overlayHoleRect={null}
        />
      );

      expect(screen.getByTestId('diff-pair-0')).toBeInTheDocument();
      expect(screen.getByTestId('diff-pair-1')).toBeInTheDocument();
      expect(screen.getByTestId('diff-pair-2')).toBeInTheDocument();
    });

    test('should apply correct classes to diff pair', () => {
      const mockPair = createMockPair();
      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );
      const pair = screen.getByTestId('diff-pair-0');
      expect(pair).toHaveClass('absolute', 'border-2', 'border-green-400');
    });

    test('should position diff pair correctly', () => {
      const mockPair = createMockPair({
        rect: { top: 50, left: 75, width: 200, bottom: 150, right: 275 }
      });

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pair = screen.getByTestId('diff-pair-0');
      expect(pair.style.top).toBe('50px');
      expect(pair.style.left).toBe('75px');
      expect(pair.style.width).toBe('200px');
      expect(pair.style.height).toBe('100px'); // bottom - top = 150 - 50
    });

    test('should calculate height correctly from rect', () => {
      const mockPair = createMockPair({
        rect: { top: 10, left: 0, width: 100, bottom: 100, right: 100 }
      });

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pair = screen.getByTestId('diff-pair-0');
      expect(pair.style.height).toBe('90px'); // 100 - 10
    });

    test('should handle diff pairs with large coordinates', () => {
      const mockPair = createMockPair({
        rect: { top: 5000, left: 6000, width: 300, bottom: 5500, right: 6300 }
      });

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pair = screen.getByTestId('diff-pair-0');
      expect(pair.style.top).toBe('5000px');
      expect(pair.style.left).toBe('6000px');
    });

    test('should handle diff pairs with zero-sized rectangles', () => {
      const mockPair = createMockPair({
        rect: { top: 100, left: 100, width: 0, bottom: 100, right: 100 }
      });

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pair = screen.getByTestId('diff-pair-0');
      expect(pair.style.height).toBe('0px');
    });
  });

  describe('Click Handling', () => {
    test('should call onPairClick when diff pair is clicked', () => {
      const mockOnClick = vi.fn();
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
          onPairClick={mockOnClick}
        />
      );

      const pairElement = screen.getByTestId('diff-pair-0');
      fireEvent.click(pairElement);
      expect(mockOnClick).toHaveBeenCalledWith(0);
    });

    test('should call onPairClick with correct index', () => {
      const mockOnClick = vi.fn();
      const pair1 = createMockPair();
      const pair2 = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[pair1, pair2]}
          overlayHoleRect={null}
          onPairClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('diff-pair-1'));
      expect(mockOnClick).toHaveBeenCalledWith(1);
    });

    test('should call onPairClick for each clicked pair', () => {
      const mockOnClick = vi.fn();
      const pair1 = createMockPair();
      const pair2 = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[pair1, pair2]}
          overlayHoleRect={null}
          onPairClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('diff-pair-0'));
      fireEvent.click(screen.getByTestId('diff-pair-1'));

      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, 0);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, 1);
    });

    test('should not call onPairClick if handler is not provided', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pairElement = screen.getByTestId('diff-pair-0');
      expect(() => {
        fireEvent.click(pairElement);
      }).not.toThrow();
    });
  });

  describe('Hover Handling', () => {
    test('should call onPairHover when diff pair is hovered', () => {
      const mockOnHover = vi.fn();
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
          onPairHover={mockOnHover}
        />
      );

      const pairElement = screen.getByTestId('diff-pair-0');
      fireEvent.mouseEnter(pairElement);
      expect(mockOnHover).toHaveBeenCalledWith(0);
    });

    test('should call onPairHover with correct index', () => {
      const mockOnHover = vi.fn();
      const pair1 = createMockPair();
      const pair2 = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[pair1, pair2]}
          overlayHoleRect={null}
          onPairHover={mockOnHover}
        />
      );

      fireEvent.mouseEnter(screen.getByTestId('diff-pair-1'));
      expect(mockOnHover).toHaveBeenCalledWith(1);
    });

    test('should not throw if onPairHover is not provided', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pairElement = screen.getByTestId('diff-pair-0');
      expect(() => {
        fireEvent.mouseEnter(pairElement);
      }).not.toThrow();
    });
  });

  describe('Overlay Hole', () => {
    test('should render overlay hole when provided', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
        />
      );

      expect(screen.getByTestId('overlay-hole')).toBeInTheDocument();
    });

    test('should not render overlay hole when not provided', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      expect(screen.queryByTestId('overlay-hole')).not.toBeInTheDocument();
    });

    test('should apply correct classes to overlay hole', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
        />
      );

      const hole = screen.getByTestId('overlay-hole');
      expect(hole).toHaveClass('absolute', 'pointer-events-auto');
    });

    test('should position overlay hole correctly', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
        />
      );

      const hole = screen.getByTestId('overlay-hole');
      expect(hole.style.top).toBe('100px');
      expect(hole.style.bottom).toBe('200px');
      expect(hole.style.left).toBe('0px');
      expect(hole.style.right).toBe('0px');
    });

    test('should set overlay hole z-index', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
        />
      );

      const hole = screen.getByTestId('overlay-hole');
      expect(hole.style.zIndex).toBe('50');
    });

    test('should handle overlay hole with large coordinates', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={{ top: 5000, bottom: 6000 }}
        />
      );

      const hole = screen.getByTestId('overlay-hole');
      expect(hole.style.top).toBe('5000px');
      expect(hole.style.bottom).toBe('6000px');
    });
  });

  describe('Props Combinations', () => {
    test('should render multiple pairs with overlay hole', () => {
      const pair1 = createMockPair();
      const pair2 = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[pair1, pair2]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
        />
      );

      expect(screen.getByTestId('diff-pair-0')).toBeInTheDocument();
      expect(screen.getByTestId('diff-pair-1')).toBeInTheDocument();
      expect(screen.getByTestId('overlay-hole')).toBeInTheDocument();
    });

    test('should work with all callbacks provided', () => {
      const mockOnClick = vi.fn();
      const mockOnHover = vi.fn();
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
          onPairClick={mockOnClick}
          onPairHover={mockOnHover}
        />
      );

      fireEvent.click(screen.getByTestId('diff-pair-0'));
      fireEvent.mouseEnter(screen.getByTestId('diff-pair-0'));

      expect(mockOnClick).toHaveBeenCalled();
      expect(mockOnHover).toHaveBeenCalled();
    });

    test('should render with minimal props', () => {
      const mockPair = createMockPair();

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      expect(screen.getByTestId('diff-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('diff-pair-0')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty diffPairs array', () => {
      render(
        <DiffOverlay
          diffPairs={[]}
          overlayHoleRect={{ top: 100, bottom: 200 }}
        />
      );

      expect(screen.queryByTestId('diff-overlay')).not.toBeInTheDocument();
      expect(screen.queryByTestId('overlay-hole')).not.toBeInTheDocument();
    });

    test('should handle very large number of diff pairs', () => {
      const pairs = Array.from({ length: 50 }, (_, i) =>
        createMockPair({ rect: { ...mockRect, top: i * 10 } })
      );

      render(
        <DiffOverlay
          diffPairs={pairs}
          overlayHoleRect={null}
        />
      );

      expect(screen.getByTestId('diff-pair-0')).toBeInTheDocument();
      expect(screen.getByTestId('diff-pair-49')).toBeInTheDocument();
    });

    test('should handle fractional pixel values', () => {
      const mockPair = createMockPair({
        rect: { top: 10.5, left: 20.75, width: 100.25, bottom: 60.5, right: 120.75 }
      });

      render(
        <DiffOverlay
          diffPairs={[mockPair]}
          overlayHoleRect={null}
        />
      );

      const pair = screen.getByTestId('diff-pair-0');
      expect(pair.style.top).toBe('10.5px');
      expect(pair.style.left).toBe('20.75px');
    });
  });
});
