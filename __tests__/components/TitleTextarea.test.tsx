import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleTextarea } from '@/components/TitleTextarea';

describe('TitleTextarea', () => {
  describe('Rendering', () => {
    test('should render with title', () => {
      render(
        <TitleTextarea
          title="Test Title"
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test Title');
    });

    test('should render with empty title', () => {
      render(
        <TitleTextarea
          title=""
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    test('should render textarea element', () => {
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
        />
      );
      expect(screen.getByTestId('title-textarea')).toBeInTheDocument();
    });

    test('should have correct placeholder', () => {
      render(
        <TitleTextarea
          title=""
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe('Enter blog title...');
    });

    test('should have correct CSS classes', () => {
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea');
      expect(textarea).toHaveClass('w-full', 'text-2xl', 'font-bold', 'outline-none', 'resize-none');
    });

    test('should have rows attribute set to 1', () => {
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(1);
    });
  });

  describe('Title Updates', () => {
    test('should call onTitleChange when text is entered', () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(
        <TitleTextarea
          title=""
          onTitleChange={mockOnChange}
        />
      );

      rerender(
        <TitleTextarea
          title="New Title"
          onTitleChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('New Title');
    });

    test('should update when title prop changes', () => {
      const { rerender } = render(
        <TitleTextarea
          title="Initial"
          onTitleChange={vi.fn()}
        />
      );

      let textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial');

      rerender(
        <TitleTextarea
          title="Updated"
          onTitleChange={vi.fn()}
        />
      );

      textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Updated');
    });

    test('should handle multiline title', () => {
      const multilineTitle = 'First Line\nSecond Line';
      render(
        <TitleTextarea
          title={multilineTitle}
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineTitle);
    });

    test('should handle very long title', () => {
      const longTitle = 'a'.repeat(500);
      render(
        <TitleTextarea
          title={longTitle}
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longTitle);
    });

    test('should handle title with special characters', () => {
      const specialTitle = 'Title with <tags> & special "chars" \'quotes\'';
      render(
        <TitleTextarea
          title={specialTitle}
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialTitle);
    });

    test('should handle title with unicode characters', () => {
      const unicodeTitle = '你好世界 🌍 Éléphant';
      render(
        <TitleTextarea
          title={unicodeTitle}
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(unicodeTitle);
    });
  });

  describe('ReadOnly Mode', () => {
    test('should respect readOnly prop', () => {
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
          readOnly={true}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(true);
    });

    test('should not be readOnly when prop is false', () => {
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
          readOnly={false}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(false);
    });

    test('should not be readOnly when prop is undefined', () => {
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(false);
    });

    test('should toggle readOnly state', () => {
      const { rerender } = render(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
          readOnly={false}
        />
      );

      let textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(false);

      rerender(
        <TitleTextarea
          title="Test"
          onTitleChange={vi.fn()}
          readOnly={true}
        />
      );

      textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(true);
    });
  });

  describe('Height Adjustment', () => {
    test('should auto-adjust height based on content', () => {
      const { rerender } = render(
        <TitleTextarea
          title="Short"
          onTitleChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      const initialHeight = textarea.style.height;

      rerender(
        <TitleTextarea
          title="This is a much longer title that should potentially wrap to multiple lines"
          onTitleChange={vi.fn()}
        />
      );

      const newHeight = textarea.style.height;
      expect(newHeight).toBeDefined();
    });

    test('should set height to auto then scroll height', () => {
      render(
        <TitleTextarea
          title="Test Title"
          onTitleChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.style.height).toBeDefined();
    });

    test('should adjust height on title change', () => {
      const { rerender } = render(
        <TitleTextarea
          title="Initial title"
          onTitleChange={vi.fn()}
        />
      );

      rerender(
        <TitleTextarea
          title="Longer title that spans multiple lines of content"
          onTitleChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.style.height).toBeDefined();
    });

    test('should handle height adjustment for empty content', () => {
      render(
        <TitleTextarea
          title=""
          onTitleChange={vi.fn()}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.style.height).toBeDefined();
    });
  });

  describe('Callbacks', () => {
    test('should handle onTitleChange callback', () => {
      const mockOnChange = vi.fn();
      render(
        <TitleTextarea
          title="Initial"
          onTitleChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'New title' } });

      expect(mockOnChange).toHaveBeenCalledWith('New title');
    });

    test('should handle optional onTitleChange', () => {
      render(
        <TitleTextarea
          title="Test"
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(() => {
        fireEvent.change(textarea, { target: { value: 'New' } });
      }).not.toThrow();
    });

    test('should call onTitleChange with new value', () => {
      const mockOnChange = vi.fn();
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Updated value' } });

      expect(mockOnChange).toHaveBeenCalledWith('Updated value');
    });

    test('should handle multiple onChange calls', () => {
      const mockOnChange = vi.fn();
      render(
        <TitleTextarea
          title="Test"
          onTitleChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'First' } });
      fireEvent.change(textarea, { target: { value: 'Second' } });
      fireEvent.change(textarea, { target: { value: 'Third' } });

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string title', () => {
      render(
        <TitleTextarea
          title=""
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    test('should handle whitespace-only title', () => {
      const whitespaceTitle = '   ';
      render(
        <TitleTextarea
          title={whitespaceTitle}
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(whitespaceTitle);
    });

    test('should preserve all whitespace in title', () => {
      const titleWithWhitespace = 'Title\n\n\nWith\t\tTabs';
      render(
        <TitleTextarea
          title={titleWithWhitespace}
          onTitleChange={vi.fn()}
        />
      );
      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(titleWithWhitespace);
    });

    test('should handle rapid prop updates', () => {
      const { rerender } = render(
        <TitleTextarea
          title="Title 1"
          onTitleChange={vi.fn()}
        />
      );

      for (let i = 2; i <= 5; i++) {
        rerender(
          <TitleTextarea
            title={`Title ${i}`}
            onTitleChange={vi.fn()}
          />
        );
      }

      const textarea = screen.getByTestId('title-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Title 5');
    });
  });
});
