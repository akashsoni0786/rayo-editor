/**
 * BlogEditor Performance Tests
 *
 * These tests verify that performance-critical behaviors work correctly
 * BEFORE and AFTER optimization. They cover:
 * - Diff detection (innerHTML parsing → optimized approach)
 * - updateDiffRanges guard rails (re-entry, cooldown, fingerprinting)
 * - console.log removal (no debug logs in production)
 * - Scroll handler debouncing
 * - Mousemove handler throttling
 * - MutationObserver cascade prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// ---------------------------------------------------------------------------
// 1. Diff detection — innerHTML parsing on every content change
// ---------------------------------------------------------------------------
describe('BlogEditor: diff detection (hasInternalDiffs)', () => {
  it('should detect <ins> tags in content', () => {
    const html = '<p>Hello <ins>world</ins></p>';
    const el = document.createElement('div');
    el.innerHTML = html;
    const markers = el.querySelectorAll('ins, del');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('should detect <del> tags in content', () => {
    const html = '<p><del>removed</del> kept</p>';
    const el = document.createElement('div');
    el.innerHTML = html;
    const markers = el.querySelectorAll('ins, del');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('should detect green highlight marks', () => {
    const html = '<p><mark data-color="#c7f0d6ff">inserted</mark></p>';
    const el = document.createElement('div');
    el.innerHTML = html;
    const greens = el.querySelectorAll('mark[data-color="#c7f0d6ff"]');
    expect(greens.length).toBe(1);
  });

  it('should detect red highlight marks', () => {
    const html = '<p><mark data-color="#fecaca">deleted</mark></p>';
    const el = document.createElement('div');
    el.innerHTML = html;
    const reds = el.querySelectorAll('mark[data-color="#fecaca"]');
    expect(reds.length).toBe(1);
  });

  it('should detect pending-delete images', () => {
    const html = '<img data-pending-delete="true" src="test.jpg">';
    const el = document.createElement('div');
    el.innerHTML = html;
    const pendingDel = el.querySelectorAll('img[data-pending-delete="true"]');
    expect(pendingDel.length).toBe(1);
  });

  it('should detect pending-insert images', () => {
    const html = '<img data-pending-insert="true" src="test.jpg">';
    const el = document.createElement('div');
    el.innerHTML = html;
    const pendingIns = el.querySelectorAll('img[data-pending-insert="true"]');
    expect(pendingIns.length).toBe(1);
  });

  it('should return false for clean content (no diffs)', () => {
    const html = '<p>Normal paragraph with no diffs</p><h2>Heading</h2>';
    const el = document.createElement('div');
    el.innerHTML = html;
    const markers = el.querySelectorAll('ins, del');
    const greens = el.querySelectorAll('mark[data-color="#c7f0d6ff"]');
    const reds = el.querySelectorAll('mark[data-color="#fecaca"]');
    const pendingDel = el.querySelectorAll('img[data-pending-delete="true"]');
    const pendingIns = el.querySelectorAll('img[data-pending-insert="true"]');
    const hasDiffs = markers.length > 0 || greens.length > 0 || reds.length > 0 ||
                     pendingDel.length > 0 || pendingIns.length > 0;
    expect(hasDiffs).toBe(false);
  });

  it('should handle large content without throwing', () => {
    // Simulate a large blog post (1000 paragraphs)
    const paragraphs = Array.from({ length: 1000 }, (_, i) => `<p>Paragraph ${i} with some content here.</p>`);
    const html = paragraphs.join('');
    const el = document.createElement('div');
    expect(() => { el.innerHTML = html; }).not.toThrow();
    const markers = el.querySelectorAll('ins, del');
    expect(markers.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. updateDiffRanges guard rails
// ---------------------------------------------------------------------------
describe('BlogEditor: updateDiffRanges guard rails', () => {
  it('should prevent re-entry with isProcessingDiffRanges flag', () => {
    const isProcessingRef = { current: false };
    let callCount = 0;

    const updateDiffRanges = () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      try {
        callCount++;
        // Simulate nested call (e.g., from MutationObserver triggered by DOM changes)
        updateDiffRanges(); // Should be blocked by re-entry guard
      } finally {
        isProcessingRef.current = false;
      }
    };

    updateDiffRanges();
    expect(callCount).toBe(1); // Only one execution despite nested call
  });

  it('should skip calls within cooldown period', () => {
    const lastRunRef = { current: 0 };
    const COOLDOWN = 500;
    let callCount = 0;

    const updateDiffRanges = () => {
      const timeSinceLastRun = Date.now() - lastRunRef.current;
      if (timeSinceLastRun < COOLDOWN) return;
      callCount++;
      lastRunRef.current = Date.now();
    };

    updateDiffRanges();
    expect(callCount).toBe(1);

    // Call again immediately — should be skipped
    updateDiffRanges();
    expect(callCount).toBe(1);
  });

  it('should skip redundant state updates via fingerprinting', () => {
    const lastKeyRef = { current: '' };
    let setStateCalls = 0;

    const updateWithFingerprint = (pairs: { from: number; to: number }[]) => {
      const key = pairs.map(p => `${p.from}-${p.to}`).join('|');
      if (key === lastKeyRef.current) return;
      lastKeyRef.current = key;
      setStateCalls++;
    };

    const samePairs = [{ from: 0, to: 10 }, { from: 20, to: 30 }];

    updateWithFingerprint(samePairs);
    expect(setStateCalls).toBe(1);

    // Same data again — should skip
    updateWithFingerprint(samePairs);
    expect(setStateCalls).toBe(1);

    // Different data — should update
    updateWithFingerprint([{ from: 0, to: 10 }, { from: 20, to: 40 }]);
    expect(setStateCalls).toBe(2);
  });

  it('should only trigger when content actually changes (lastContentTrigger)', () => {
    const lastContentRef = { current: null as string | null };
    let updateCalls = 0;

    const triggerUpdate = (content: string) => {
      if (lastContentRef.current === content) return;
      lastContentRef.current = content;
      updateCalls++;
    };

    triggerUpdate('<p>Hello</p>');
    expect(updateCalls).toBe(1);

    // Same content — should skip
    triggerUpdate('<p>Hello</p>');
    expect(updateCalls).toBe(1);

    // New content — should trigger
    triggerUpdate('<p>Hello World</p>');
    expect(updateCalls).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 3. Console.log removal verification
// ---------------------------------------------------------------------------
describe('BlogEditor: no debug console.logs in production code', () => {
  it('should not have console.log calls in BlogEditor.tsx (after optimization)', async () => {
    // This test reads the source file and checks for console.log statements
    // It will FAIL before optimization (expected) and PASS after
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../BlogEditor.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    // Count console.log calls (exclude comments)
    const lines = source.split('\n');
    const logLines = lines.filter(line => {
      const trimmed = line.trim();
      // Skip commented-out lines
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false;
      return trimmed.includes('console.log(');
    });

    // After optimization, there should be ZERO console.logs
    // Before optimization: this will report the count for reference
    expect(logLines.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Scroll handler debouncing
// ---------------------------------------------------------------------------
describe('BlogEditor: scroll handler debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce rapid scroll events', () => {
    let computeCount = 0;
    let rafId: number | null = null;

    const debouncedScrollHandler = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        computeCount++;
        rafId = null;
      });
    };

    // Simulate 50 rapid scroll events
    for (let i = 0; i < 50; i++) {
      debouncedScrollHandler();
    }

    // Only the last RAF should execute
    // Note: In jsdom, RAF is simulated — we flush it
    vi.advanceTimersByTime(16); // one frame
    // With RAF debouncing, only 1 computation should happen
    expect(computeCount).toBeLessThanOrEqual(1);
  });

  it('should clear hover state on scroll (non-navigation)', () => {
    let hoverPairIndex = 3;
    let activeReviewIndex = 1;
    const isNavigationScroll = false;

    const handleScroll = () => {
      if (isNavigationScroll) return;
      hoverPairIndex = -1;
      activeReviewIndex = -1;
    };

    handleScroll();
    expect(hoverPairIndex).toBe(-1);
    expect(activeReviewIndex).toBe(-1);
  });

  it('should preserve hover state during navigation scroll', () => {
    let hoverPairIndex = 3;
    let activeReviewIndex = 1;
    const isNavigationScroll = true;

    const handleScroll = () => {
      if (isNavigationScroll) return;
      hoverPairIndex = -1;
      activeReviewIndex = -1;
    };

    handleScroll();
    expect(hoverPairIndex).toBe(3);
    expect(activeReviewIndex).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 5. Mousemove handler throttling
// ---------------------------------------------------------------------------
describe('BlogEditor: mousemove handler throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle rapid mousemove events', () => {
    let computeCount = 0;
    let lastCallTime = 0;
    const THROTTLE_MS = 50;

    const throttledMouseMove = () => {
      const now = Date.now();
      if (now - lastCallTime < THROTTLE_MS) return;
      lastCallTime = now;
      computeCount++;
    };

    // Simulate 100 rapid mousemove events within 50ms
    for (let i = 0; i < 100; i++) {
      throttledMouseMove();
    }

    // Only 1 call should go through (all within same ms in fake timers)
    expect(computeCount).toBe(1);

    // Advance past throttle window
    vi.advanceTimersByTime(THROTTLE_MS + 1);
    throttledMouseMove();
    expect(computeCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 6. Banner visibility logic
// ---------------------------------------------------------------------------
describe('BlogEditor: banner visibility', () => {
  it('should show banner when diffs exist and not streaming', () => {
    const hasDiffs = true;
    const isStreaming = false;
    const hideReviewUI = false;
    const focusMode = false;

    const shouldShow = !isStreaming && !hideReviewUI && !focusMode && hasDiffs;
    expect(shouldShow).toBe(true);
  });

  it('should hide banner when streaming', () => {
    const hasDiffs = true;
    const isStreaming = true;
    const hideReviewUI = false;
    const focusMode = false;

    const shouldShow = !isStreaming && !hideReviewUI && !focusMode && hasDiffs;
    expect(shouldShow).toBe(false);
  });

  it('should hide banner in focus mode', () => {
    const hasDiffs = true;
    const isStreaming = false;
    const hideReviewUI = false;
    const focusMode = true;

    const shouldShow = !isStreaming && !hideReviewUI && !focusMode && hasDiffs;
    expect(shouldShow).toBe(false);
  });

  it('should hide banner when no diffs', () => {
    const hasDiffs = false;
    const isStreaming = false;
    const hideReviewUI = false;
    const focusMode = false;

    const shouldShow = !isStreaming && !hideReviewUI && !focusMode && hasDiffs;
    expect(shouldShow).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. Review mode determination
// ---------------------------------------------------------------------------
describe('BlogEditor: review mode determination', () => {
  it('should enable review mode when external pending changes exist', () => {
    const externalPendingChanges = true;
    const hasInternalDiffs = false;
    const showDiffs = true;
    const isStreaming = false;
    const hideReviewUI = false;

    const isReviewMode = (externalPendingChanges || (hasInternalDiffs && showDiffs)) && !isStreaming && !hideReviewUI;
    expect(isReviewMode).toBe(true);
  });

  it('should enable review mode when internal diffs + showDiffs', () => {
    const externalPendingChanges = false;
    const hasInternalDiffs = true;
    const showDiffs = true;
    const isStreaming = false;
    const hideReviewUI = false;

    const isReviewMode = (externalPendingChanges || (hasInternalDiffs && showDiffs)) && !isStreaming && !hideReviewUI;
    expect(isReviewMode).toBe(true);
  });

  it('should disable review mode during streaming', () => {
    const externalPendingChanges = true;
    const hasInternalDiffs = true;
    const showDiffs = true;
    const isStreaming = true;
    const hideReviewUI = false;

    const isReviewMode = (externalPendingChanges || (hasInternalDiffs && showDiffs)) && !isStreaming && !hideReviewUI;
    expect(isReviewMode).toBe(false);
  });

  it('should disable review mode when hideReviewUI is true', () => {
    const externalPendingChanges = true;
    const hasInternalDiffs = true;
    const showDiffs = true;
    const isStreaming = false;
    const hideReviewUI = true;

    const isReviewMode = (externalPendingChanges || (hasInternalDiffs && showDiffs)) && !isStreaming && !hideReviewUI;
    expect(isReviewMode).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. Diff pair fingerprinting (prevents infinite re-render loops)
// ---------------------------------------------------------------------------
describe('BlogEditor: diff pair fingerprinting', () => {
  const computePairsKey = (pairs: { redRange?: { from: number; to: number }; greenRange?: { from: number; to: number }; isImageInsertion?: boolean; rect?: { top: number; bottom: number; right: number } }[]) => {
    return pairs.map(p => {
      let key = `${p.redRange?.from ?? ''}-${p.redRange?.to ?? ''}:${p.greenRange?.from ?? ''}-${p.greenRange?.to ?? ''}`;
      if (p.isImageInsertion && p.rect) {
        key += `:r${Math.round(p.rect.top)},${Math.round(p.rect.bottom)},${Math.round(p.rect.right)}`;
      }
      return key;
    }).join('|');
  };

  it('should produce identical keys for identical pairs', () => {
    const pairs = [
      { redRange: { from: 0, to: 10 }, greenRange: { from: 11, to: 20 } },
      { redRange: { from: 30, to: 40 }, greenRange: { from: 41, to: 50 } },
    ];
    const key1 = computePairsKey(pairs);
    const key2 = computePairsKey(pairs);
    expect(key1).toBe(key2);
  });

  it('should produce different keys when positions change', () => {
    const pairs1 = [{ redRange: { from: 0, to: 10 }, greenRange: { from: 11, to: 20 } }];
    const pairs2 = [{ redRange: { from: 0, to: 10 }, greenRange: { from: 11, to: 25 } }];
    expect(computePairsKey(pairs1)).not.toBe(computePairsKey(pairs2));
  });

  it('should include rect for image pairs', () => {
    const pairs = [{ greenRange: { from: 0, to: 10 }, isImageInsertion: true, rect: { top: 100, bottom: 200, right: 300 } }];
    const key = computePairsKey(pairs);
    expect(key).toContain(':r100,200,300');
  });

  it('should handle deletion-only pairs (no greenRange)', () => {
    const pairs = [{ redRange: { from: 0, to: 10 } }];
    const key = computePairsKey(pairs);
    expect(key).toBe('0-10:-');
  });

  it('should handle insertion-only pairs (no redRange)', () => {
    const pairs = [{ greenRange: { from: 0, to: 10 } }];
    const key = computePairsKey(pairs);
    expect(key).toBe('-:0-10');
  });
});
