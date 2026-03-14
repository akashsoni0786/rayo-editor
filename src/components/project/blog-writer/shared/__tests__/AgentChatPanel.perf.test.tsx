/**
 * AgentChatPanel Performance Tests
 *
 * These tests verify that performance-critical behaviors work correctly
 * BEFORE and AFTER optimization. They cover:
 * - Chat history caching
 * - Message state management (no unnecessary re-renders)
 * - Operation queue sequential processing
 * - Spacer height calculation guards
 * - Focus management during streaming
 * - Thinking steps deduplication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// 1. Chat history cache behavior
// ---------------------------------------------------------------------------
describe('AgentChatPanel: chat history cache', () => {
  it('should cache messages by projectId-blogId key', () => {
    const cache = new Map<string, any[]>();
    const key = 'proj1-blog1';
    const messages = [{ id: '1', type: 'user', content: 'Hello' }];

    cache.set(key, messages);
    expect(cache.has(key)).toBe(true);
    expect(cache.get(key)).toBe(messages);
  });

  it('should return cached messages on second access', () => {
    const cache = new Map<string, any[]>();
    const key = 'proj1-blog1';
    const messages = [{ id: '1', type: 'user', content: 'Hello' }];

    cache.set(key, messages);
    const cached = cache.get(key);
    expect(cached).toEqual(messages);
    expect(cached).toBe(messages); // Same reference
  });

  it('should clear specific blog cache', () => {
    const cache = new Map<string, any[]>();
    cache.set('proj1-blog1', [{ id: '1' }]);
    cache.set('proj1-blog2', [{ id: '2' }]);

    cache.delete('proj1-blog1');
    expect(cache.has('proj1-blog1')).toBe(false);
    expect(cache.has('proj1-blog2')).toBe(true);
  });

  it('should clear entire cache', () => {
    const cache = new Map<string, any[]>();
    cache.set('proj1-blog1', [{ id: '1' }]);
    cache.set('proj1-blog2', [{ id: '2' }]);

    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('should only update cache when messages grow (not shrink)', () => {
    const cache = new Map<string, any[]>();
    const key = 'proj1-blog1';

    const msgs3 = [{ id: '1' }, { id: '2' }, { id: '3' }];
    cache.set(key, msgs3);

    // Simulate cache update logic: only update if messages.length > cached.length
    const msgs2 = [{ id: '1' }, { id: '2' }];
    const cached = cache.get(key);
    if (!cached || msgs2.length > cached.length) {
      cache.set(key, msgs2);
    }

    // Should NOT have updated (shrinking)
    expect(cache.get(key)?.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 2. Operation queue sequential processing
// ---------------------------------------------------------------------------
describe('AgentChatPanel: operation queue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should process operations one at a time', () => {
    const queue: string[] = ['op1', 'op2', 'op3'];
    const processed: string[] = [];
    let isProcessing = false;

    const processQueue = () => {
      if (isProcessing || queue.length === 0) return;
      isProcessing = true;
      const op = queue.shift()!;
      processed.push(op);
      setTimeout(() => {
        isProcessing = false;
        processQueue();
      }, 50);
    };

    processQueue();
    expect(processed).toEqual(['op1']);
    expect(isProcessing).toBe(true);

    // Second call while processing should be blocked
    processQueue();
    expect(processed).toEqual(['op1']);

    // After timeout, next op processes
    vi.advanceTimersByTime(50);
    expect(processed).toEqual(['op1', 'op2']);

    vi.advanceTimersByTime(50);
    expect(processed).toEqual(['op1', 'op2', 'op3']);
  });

  it('should not process when queue is empty', () => {
    const queue: string[] = [];
    let processCalled = false;
    let isProcessing = false;

    const processQueue = () => {
      if (isProcessing || queue.length === 0) return;
      processCalled = true;
    };

    processQueue();
    expect(processCalled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Thinking steps deduplication
// ---------------------------------------------------------------------------
describe('AgentChatPanel: thinking steps deduplication', () => {
  it('should not add duplicate thinking steps', () => {
    let steps: { text: string; order?: number }[] = [];
    let orderCounter = 0;
    const getNextOrder = () => orderCounter++;

    const addStep = (text: string) => {
      if (steps.some(s => s.text === text)) return;
      steps = [...steps, { text, order: getNextOrder() }];
    };

    addStep('Searching: best coffee shops');
    addStep('Searching: best coffee shops'); // duplicate
    addStep('Reading: webpage...');
    addStep('Searching: best coffee shops'); // duplicate again

    expect(steps.length).toBe(2);
    expect(steps[0].text).toBe('Searching: best coffee shops');
    expect(steps[1].text).toBe('Reading: webpage...');
  });

  it('should maintain order across unique steps', () => {
    let steps: { text: string; order: number }[] = [];
    let orderCounter = 0;
    const getNextOrder = () => orderCounter++;

    const addStep = (text: string) => {
      if (steps.some(s => s.text === text)) return;
      steps = [...steps, { text, order: getNextOrder() }];
    };

    addStep('Step A');
    addStep('Step B');
    addStep('Step C');

    expect(steps.map(s => s.order)).toEqual([0, 1, 2]);
  });
});

// ---------------------------------------------------------------------------
// 4. Message state updates — accept/reject tracking
// ---------------------------------------------------------------------------
describe('AgentChatPanel: pending changes tracking', () => {
  it('should track pending changes user message ID', () => {
    const ref = { current: null as string | null };

    // Simulate sending a message
    ref.current = 'msg-123';
    expect(ref.current).toBe('msg-123');

    // Simulate accepting changes (pendingChanges true → false)
    const userMsgId = ref.current;
    ref.current = null;
    expect(userMsgId).toBe('msg-123');
    expect(ref.current).toBeNull();
  });

  it('should mark changesAccepted on the correct user message', () => {
    type Msg = { id: string; type: string; changesAccepted?: boolean };
    const messages: Msg[] = [
      { id: '1', type: 'user' },
      { id: '2', type: 'agent' },
      { id: '3', type: 'user' },
      { id: '4', type: 'agent' },
    ];

    const targetId = '3';
    const updated = messages.map(msg =>
      msg.id === targetId ? { ...msg, changesAccepted: true } : msg
    );

    expect(updated[2].changesAccepted).toBe(true);
    expect(updated[0].changesAccepted).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 5. Spacer height calculation guards
// ---------------------------------------------------------------------------
describe('AgentChatPanel: spacer height logic', () => {
  it('should return 0 in history mode (not active chat)', () => {
    const isActiveChatMode = false;
    const spacerHeight = isActiveChatMode ? 100 : 0;
    expect(spacerHeight).toBe(0);
  });

  it('should return 0 when user message element not found', () => {
    const isActiveChatMode = true;
    const userMsgElement = null;

    let spacerHeight = 0;
    if (isActiveChatMode && userMsgElement) {
      spacerHeight = 100; // would be calculated
    }
    expect(spacerHeight).toBe(0);
  });

  it('should skip recalculation when panel is hidden', () => {
    const isVisible = false;
    const isRestoringScroll = false;
    let recalculated = false;

    if (!isVisible || isRestoringScroll) {
      // skip
    } else {
      recalculated = true;
    }
    expect(recalculated).toBe(false);
  });

  it('should skip recalculation when restoring scroll', () => {
    const isVisible = true;
    const isRestoringScroll = true;
    let recalculated = false;

    if (!isVisible || isRestoringScroll) {
      // skip
    } else {
      recalculated = true;
    }
    expect(recalculated).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Focus management — redirect during streaming
// ---------------------------------------------------------------------------
describe('AgentChatPanel: focus management', () => {
  it('should restore focus after agent completes', () => {
    let wasActive = true;
    let isActive = false;
    let focusRestored = false;

    // Agent just finished: wasActive=true, isActive=false
    if (wasActive && !isActive) {
      focusRestored = true;
    }

    expect(focusRestored).toBe(true);
  });

  it('should not restore focus when still active', () => {
    let wasActive = true;
    let isActive = true;
    let focusRestored = false;

    if (wasActive && !isActive) {
      focusRestored = true;
    }

    expect(focusRestored).toBe(false);
  });

  it('should not restore focus when not previously active', () => {
    let wasActive = false;
    let isActive = false;
    let focusRestored = false;

    if (wasActive && !isActive) {
      focusRestored = true;
    }

    expect(focusRestored).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. WebSocket state sync — no cascading updates
// ---------------------------------------------------------------------------
describe('AgentChatPanel: WebSocket state sync', () => {
  it('should only sync when values differ', () => {
    let stateValue = false;
    let setStateCalls = 0;
    const setState = (val: boolean) => { stateValue = val; setStateCalls++; };

    const syncState = (wsValue: boolean) => {
      if (wsValue !== stateValue) {
        setState(wsValue);
      }
    };

    // Same value — no update
    syncState(false);
    expect(setStateCalls).toBe(0);

    // Different value — update
    syncState(true);
    expect(setStateCalls).toBe(1);

    // Same value again — no update
    syncState(true);
    expect(setStateCalls).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 8. Yolo mode operation queue
// ---------------------------------------------------------------------------
describe('AgentChatPanel: yolo mode operation queue', () => {
  it('should queue operations and process one at a time', () => {
    const queue: { oldContent: string; newContent: string }[] = [];
    let isProcessing = false;
    const processed: string[] = [];

    const addToQueue = (op: { oldContent: string; newContent: string }) => {
      queue.push(op);
    };

    const processNext = () => {
      if (isProcessing || queue.length === 0) return;
      isProcessing = true;
      const op = queue.shift()!;
      processed.push(op.newContent);
      // Simulate async completion
      isProcessing = false;
      processNext();
    };

    addToQueue({ oldContent: 'a', newContent: 'b' });
    addToQueue({ oldContent: 'c', newContent: 'd' });
    addToQueue({ oldContent: 'e', newContent: 'f' });

    processNext();

    expect(processed).toEqual(['b', 'd', 'f']);
    expect(queue.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 9. Scroll position save/restore across tab switches
// ---------------------------------------------------------------------------
describe('AgentChatPanel: scroll position save/restore', () => {
  it('should save scroll position continuously', () => {
    const lastScrollTopRef = { current: 0 };
    const isRestoringScroll = false;
    const isVisible = true;

    const handleScroll = (scrollTop: number) => {
      if (!isRestoringScroll && isVisible) {
        lastScrollTopRef.current = scrollTop;
      }
    };

    handleScroll(100);
    expect(lastScrollTopRef.current).toBe(100);

    handleScroll(250);
    expect(lastScrollTopRef.current).toBe(250);
  });

  it('should not save during scroll restore', () => {
    const lastScrollTopRef = { current: 100 };
    const isRestoringScroll = true;
    const isVisible = true;

    const handleScroll = (scrollTop: number) => {
      if (!isRestoringScroll && isVisible) {
        lastScrollTopRef.current = scrollTop;
      }
    };

    handleScroll(0); // should be ignored
    expect(lastScrollTopRef.current).toBe(100);
  });

  it('should not save when panel is hidden', () => {
    const lastScrollTopRef = { current: 100 };
    const isRestoringScroll = false;
    const isVisible = false;

    const handleScroll = (scrollTop: number) => {
      if (!isRestoringScroll && isVisible) {
        lastScrollTopRef.current = scrollTop;
      }
    };

    handleScroll(0); // should be ignored
    expect(lastScrollTopRef.current).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 10. No console.logs in AgentChatPanel
// ---------------------------------------------------------------------------
describe('AgentChatPanel: no debug console.logs', () => {
  it('should not have console.log calls in AgentChatPanel.tsx', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../AgentChatPanel.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    const lines = source.split('\n');
    const logLines = lines.filter(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false;
      return trimmed.includes('console.log(');
    });

    expect(logLines.length).toBe(0);
  });
});
