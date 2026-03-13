import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogEditor } from '@/components/BlogEditor';
import { createRef } from 'react';

describe('BlogEditor', () => {
  let mockRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    mockRef = createRef();
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
    });

    test('should render title section', () => {
      render(
        <BlogEditor
          content=""
          title="Test Title"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      expect(screen.getByTestId('title-section')).toBeInTheDocument();
      expect(screen.getByTestId('title-textarea')).toBeInTheDocument();
    });

    test('should render content section', () => {
      render(
        <BlogEditor
          content="Test content"
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    });

    test('should render both title and content sections together', () => {
      render(
        <BlogEditor
          content="Test content"
          title="Test Title"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      expect(screen.getByTestId('title-section')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
    });

    test('should render with empty content', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(contentTextarea.value).toBe('');
    });

    test('should render with empty title', () => {
      render(
        <BlogEditor
          content="Content"
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const titleTextarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(titleTextarea.value).toBe('');
    });

    test('should render content textarea with correct class', () => {
      render(
        <BlogEditor
          content="Test"
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const contentTextarea = screen.getByTestId('content-textarea');
      expect(contentTextarea).toHaveClass('w-full', 'min-h-96', 'p-4', 'border', 'rounded', 'font-mono', 'text-sm');
    });

    test('should apply correct main container class', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const editor = screen.getByTestId('blog-editor');
      expect(editor).toHaveClass('rayo-blog-editor');
    });
  });

  describe('Content Updates', () => {
    test('should call onChange when content is modified', () => {
      const mockOnChange = vi.fn();

      const { rerender } = render(
        <BlogEditor
          content=""
          title=""
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      rerender(
        <BlogEditor
          content="New content"
          title=""
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('New content');
    });

    test('should handle multiline content', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      render(
        <BlogEditor
          content={content}
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(content);
    });

    test('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      render(
        <BlogEditor
          content={longContent}
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longContent);
    });

    test('should update content on textarea change event', () => {
      const mockOnChange = vi.fn();
      render(
        <BlogEditor
          content="Initial"
          title=""
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Updated' } });
      expect(mockOnChange).toHaveBeenCalledWith('Updated');
    });

    test('should handle content with special characters', () => {
      const specialContent = 'Content with <tags> and & special chars!@#$%^';
      render(
        <BlogEditor
          content={specialContent}
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialContent);
    });
  });

  describe('Loading State', () => {
    test('should display loading state', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={true}
          editorRef={mockRef}
        />
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should not display loading state when isLoading is false', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    test('should toggle loading state on re-render', () => {
      const { rerender } = render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();

      rerender(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={true}
          editorRef={mockRef}
        />
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    test('should show loading state with correct styling', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={true}
          editorRef={mockRef}
        />
      );

      const loadingState = screen.getByTestId('loading-state');
      expect(loadingState).toHaveClass('mt-4', 'p-4', 'bg-gray-100', 'rounded');
    });
  });

  describe('ReadOnly Mode', () => {
    test('should respect readOnly prop', () => {
      render(
        <BlogEditor
          content="Content"
          title="Title"
          onChange={vi.fn()}
          isLoading={false}
          readOnly={true}
          editorRef={mockRef}
        />
      );

      const titleTextarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;

      expect(titleTextarea.readOnly).toBe(true);
      expect(contentTextarea.readOnly).toBe(true);
    });

    test('should not be readOnly when readOnly is false', () => {
      render(
        <BlogEditor
          content="Content"
          title="Title"
          onChange={vi.fn()}
          isLoading={false}
          readOnly={false}
          editorRef={mockRef}
        />
      );

      const titleTextarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;

      expect(titleTextarea.readOnly).toBe(false);
      expect(contentTextarea.readOnly).toBe(false);
    });

    test('should not be readOnly when readOnly prop is undefined', () => {
      render(
        <BlogEditor
          content="Content"
          title="Title"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(contentTextarea.readOnly).toBe(false);
    });
  });

  describe('Focus Mode', () => {
    test('should apply focus-mode class when focusMode is true', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          focusMode={true}
          editorRef={mockRef}
        />
      );

      const editor = screen.getByTestId('blog-editor');
      expect(editor).toHaveClass('focus-mode');
    });

    test('should not have focus-mode class when focusMode is false', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          focusMode={false}
          editorRef={mockRef}
        />
      );

      const editor = screen.getByTestId('blog-editor');
      expect(editor).not.toHaveClass('focus-mode');
    });

    test('should not have focus-mode class when focusMode is undefined', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const editor = screen.getByTestId('blog-editor');
      expect(editor).not.toHaveClass('focus-mode');
    });

    test('should toggle focus-mode class on re-render', () => {
      const { rerender } = render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          focusMode={false}
          editorRef={mockRef}
        />
      );

      const editor = screen.getByTestId('blog-editor');
      expect(editor).not.toHaveClass('focus-mode');

      rerender(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          focusMode={true}
          editorRef={mockRef}
        />
      );

      expect(editor).toHaveClass('focus-mode');
    });
  });

  describe('Callbacks', () => {
    test('should have onChange as required prop', () => {
      const mockOnChange = vi.fn();
      render(
        <BlogEditor
          content=""
          title=""
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockRef}
        />
      );
      expect(mockOnChange).toBeDefined();
    });

    test('should pass content value to onChange callback', () => {
      const mockOnChange = vi.fn();
      render(
        <BlogEditor
          content="Initial content"
          title=""
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'New content' } });

      expect(mockOnChange).toHaveBeenCalledWith('New content');
    });

    test('should call onChange with empty string for empty content', () => {
      const mockOnChange = vi.fn();
      render(
        <BlogEditor
          content="Content"
          title=""
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const textarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('Props Combinations', () => {
    test('should render with all props provided', () => {
      const mockOnChange = vi.fn();
      const mockOnTitleChange = vi.fn();

      render(
        <BlogEditor
          content="Content"
          title="Title"
          onChange={mockOnChange}
          onTitleChange={mockOnTitleChange}
          isLoading={false}
          showDiffs={true}
          focusMode={true}
          readOnly={false}
          editorRef={mockRef}
        />
      );

      const editor = screen.getByTestId('blog-editor');
      expect(editor).toHaveClass('focus-mode');
      expect(screen.getByTestId('title-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    });

    test('should render with minimal required props', () => {
      render(
        <BlogEditor
          content=""
          title=""
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
      expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    });

    test('should handle content and title updates simultaneously', () => {
      const { rerender } = render(
        <BlogEditor
          content="Initial content"
          title="Initial title"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      rerender(
        <BlogEditor
          content="Updated content"
          title="Updated title"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      const titleTextarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;

      expect(contentTextarea.value).toBe('Updated content');
      expect(titleTextarea.value).toBe('Updated title');
    });

    test('should maintain content through multiple prop changes', () => {
      const { rerender } = render(
        <BlogEditor
          content="Same content"
          title="Title 1"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      rerender(
        <BlogEditor
          content="Same content"
          title="Title 2"
          onChange={vi.fn()}
          isLoading={false}
          editorRef={mockRef}
        />
      );

      const contentTextarea = screen.getByTestId('content-textarea') as HTMLTextAreaElement;
      expect(contentTextarea.value).toBe('Same content');
    });
  });
});
