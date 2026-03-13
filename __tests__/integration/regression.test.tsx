// __tests__/integration/regression.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RayoEditor } from '@/components/RayoEditor';
import { createRef } from 'react';

describe('RayoEditor Regression Tests - Edge Cases', () => {
  let mockEditorRef: any;

  beforeEach(() => {
    mockEditorRef = createRef();
  });

  test('should handle edge case: empty content gracefully', () => {
    const mockOnChange = vi.fn();
    render(
      <RayoEditor
        content=""
        title=""
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe('');
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: content with only diff markers', () => {
    const mockOnChange = vi.fn();
    render(
      <RayoEditor
        content="<ins>only insertion</ins>"
        title="Test"
        onChange={mockOnChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toContain('only insertion');
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: overlapping diff ranges', () => {
    const mockOnChange = vi.fn();
    const overlappingContent = 'Text <ins><del>overlapping</del></ins> diffs';

    render(
      <RayoEditor
        content={overlappingContent}
        title="Overlapping"
        onChange={mockOnChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe(overlappingContent);
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: special characters and Unicode/emojis', () => {
    const mockOnChange = vi.fn();
    const specialContent = 'Hello 🎉 <ins>café ñ 中文 العربية</ins> world';

    render(
      <RayoEditor
        content={specialContent}
        title="Special 特殊文字 🌟"
        onChange={mockOnChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toContain('café');
    expect(contentTextarea.value).toContain('🎉');
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: very long single line content', () => {
    const mockOnChange = vi.fn();
    const longLine =
      'A'.repeat(5000) +
      ' <ins>insertion</ins> ' +
      'B'.repeat(5000);

    render(
      <RayoEditor
        content={longLine}
        title="Long Line"
        onChange={mockOnChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value.length).toBeGreaterThan(10000);
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: deeply nested elements', () => {
    const mockOnChange = vi.fn();
    let deepContent = 'Text';
    for (let i = 0; i < 20; i++) {
      deepContent = `<div>${deepContent}</div>`;
    }

    render(
      <RayoEditor
        content={deepContent}
        title="Deep Nesting"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: rapid content updates', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <RayoEditor
        content="Content 0"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    // Simulate rapid updates
    for (let i = 1; i <= 10; i++) {
      rerender(
        <RayoEditor
          content={`Content ${i}`}
          title="Test"
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockEditorRef}
        />
      );
    }

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe('Content 10');
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: diff pairs with null/undefined ranges', () => {
    const mockOnChange = vi.fn();
    const mockOnDiffPairsChange = vi.fn();

    // Content that might generate edges cases in diff detection
    const edgeContent = ' <ins></ins> <del></del> ';

    render(
      <RayoEditor
        content={edgeContent}
        title="Edge Case Diffs"
        onChange={mockOnChange}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea).toBeInTheDocument();
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: component remount', () => {
    const mockOnChange = vi.fn();

    const { unmount, rerender } = render(
      <RayoEditor
        content="Content 1"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();
    unmount();

    // Remount with different ref
    const newRef = createRef();
    render(
      <RayoEditor
        content="Content 2"
        title="Test Remount"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={newRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe('Content 2');
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle edge case: external editor instance injection', () => {
    const mockOnChange = vi.fn();

    // Create a mock editor ref that simulates external injection
    const externalRef = createRef<any>();
    externalRef.current = {
      getEditor: () => ({
        getJSON: () => ({ type: 'doc', content: [] }),
        getText: () => 'External editor content',
      }),
    };

    render(
      <RayoEditor
        content="Content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={externalRef}
      />
    );

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
    expect(externalRef).toBeDefined();
  });
});
