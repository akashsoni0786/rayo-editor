// __tests__/integration/fullFlow.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RayoEditor } from '@/components/RayoEditor';
import { createRef } from 'react';

describe('RayoEditor Full Flow Integration Tests', () => {
  let mockEditorRef: any;

  beforeEach(() => {
    mockEditorRef = createRef();
  });

  test('should render RayoEditor component with default props', () => {
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
    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should flow content updates through onChange callback', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <RayoEditor
        content="Initial content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    rerender(
      <RayoEditor
        content="Updated content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe('Updated content');
  });

  test('should flow title updates through onTitleChange callback', () => {
    const mockOnTitleChange = vi.fn();
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <RayoEditor
        content=""
        title="Original Title"
        onChange={mockOnChange}
        onTitleChange={mockOnTitleChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    rerender(
      <RayoEditor
        content=""
        title="New Title"
        onChange={mockOnChange}
        onTitleChange={mockOnTitleChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const titleTextarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
    expect(titleTextarea.value).toBe('New Title');
  });

  test('should detect and display diff pairs correctly', () => {
    const mockOnChange = vi.fn();
    const mockOnDiffPairsChange = vi.fn();
    render(
      <RayoEditor
        content="Original <ins>added</ins> text"
        title="Test"
        onChange={mockOnChange}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should trigger accept changes callback when changes exist', () => {
    const mockOnChange = vi.fn();
    const mockOnAccept = vi.fn();
    const mockOnDiffPairsChange = vi.fn();

    render(
      <RayoEditor
        content="Text <ins>added</ins>"
        title="Test"
        onChange={mockOnChange}
        onAcceptChanges={mockOnAccept}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should trigger reject changes callback when changes exist', () => {
    const mockOnChange = vi.fn();
    const mockOnReject = vi.fn();
    const mockOnDiffPairsChange = vi.fn();

    render(
      <RayoEditor
        content="Text <del>removed</del>"
        title="Test"
        onChange={mockOnChange}
        onRejectChanges={mockOnReject}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should handle multiple diff pairs correctly', () => {
    const mockOnChange = vi.fn();
    const mockOnDiffPairsChange = vi.fn();
    render(
      <RayoEditor
        content="First <ins>change</ins> and second <del>removal</del>"
        title="Test"
        onChange={mockOnChange}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should display loading state when isLoading is true', () => {
    const mockOnChange = vi.fn();
    render(
      <RayoEditor
        content="Content"
        title="Test"
        onChange={mockOnChange}
        isLoading={true}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  test('should prevent editing in read-only mode', () => {
    const mockOnChange = vi.fn();
    render(
      <RayoEditor
        content="Protected content"
        title="Protected title"
        onChange={mockOnChange}
        isLoading={false}
        readOnly={true}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.readOnly).toBe(true);
  });

  test('should display featured image when provided', () => {
    const mockOnChange = vi.fn();
    const mockOnEditImage = vi.fn();
    const { container } = render(
      <RayoEditor
        content="Content with image"
        title="Test"
        onChange={mockOnChange}
        featuredImageUrl="https://example.com/image.jpg"
        onEditFeaturedImage={mockOnEditImage}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should show streaming state animation', () => {
    const mockOnChange = vi.fn();
    render(
      <RayoEditor
        content="Streaming content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        isStreaming={true}
        showToolbarAnimation={true}
        streamingPhase="analyzing"
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should display agent thinking state', () => {
    const mockOnChange = vi.fn();
    render(
      <RayoEditor
        content="Content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        isAgentThinking={true}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should toggle focus mode display', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <RayoEditor
        content="Content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        focusMode={false}
        editorRef={mockEditorRef}
      />
    );

    const editor = screen.getByTestId('blog-editor');
    expect(editor.className).not.toContain('focus-mode');

    rerender(
      <RayoEditor
        content="Content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        focusMode={true}
        editorRef={mockEditorRef}
      />
    );

    expect(editor.className).toContain('focus-mode');
  });

  test('should handle multiple content updates in sequence', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <RayoEditor
        content="Content 1"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe('Content 1');

    rerender(
      <RayoEditor
        content="Content 2"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(contentTextarea.value).toBe('Content 2');

    rerender(
      <RayoEditor
        content="Content 3"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(contentTextarea.value).toBe('Content 3');
  });

  test('should cleanup on component unmount', () => {
    const mockOnChange = vi.fn();
    const { unmount } = render(
      <RayoEditor
        content="Content"
        title="Test"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();
    unmount();
    expect(screen.queryByTestId('rayo-editor')).not.toBeInTheDocument();
  });
});
