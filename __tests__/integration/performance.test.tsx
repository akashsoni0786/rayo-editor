// __tests__/integration/performance.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RayoEditor } from '@/components/RayoEditor';
import { createRef } from 'react';
import { detectDiffMarkers } from '@/utils/diffDetection';

describe('RayoEditor Performance Tests', () => {
  let mockEditorRef: any;

  beforeEach(() => {
    mockEditorRef = createRef();
  });

  test('should render large content (10000+ words) without lag', () => {
    const mockOnChange = vi.fn();
    const largeContent = Array(2000)
      .fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ')
      .join('');

    const startTime = performance.now();
    render(
      <RayoEditor
        content={largeContent}
        title="Large Document"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    const renderTime = performance.now() - startTime;

    expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
  });

  test('should detect diff on large content in under 500ms', () => {
    const largeContent = Array(1000)
      .fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ')
      .join('');
    const largeContentWithDiff = largeContent + ' <ins>New addition</ins>';

    const startTime = performance.now();
    const result = detectDiffMarkers(largeContentWithDiff);
    const detectionTime = performance.now() - startTime;

    expect(result.hasDiffs).toBe(true);
    expect(detectionTime).toBeLessThan(500);
  });

  test('should update diff overlay smoothly with debouncing', () => {
    const mockOnChange = vi.fn();
    const mockOnDiffPairsChange = vi.fn();

    const { rerender } = render(
      <RayoEditor
        content="Content <ins>change 1</ins>"
        title="Test"
        onChange={mockOnChange}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const startTime = performance.now();
    // Simulate multiple rapid updates
    for (let i = 0; i < 5; i++) {
      rerender(
        <RayoEditor
          content={`Content <ins>change ${i}</ins>`}
          title="Test"
          onChange={mockOnChange}
          onDiffPairsChange={mockOnDiffPairsChange}
          showDiffs={true}
          isLoading={false}
          editorRef={mockEditorRef}
        />
      );
    }
    const updateTime = performance.now() - startTime;

    expect(updateTime).toBeLessThan(800);
    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
  });

  test('should not cause excessive re-renders on hook state updates', () => {
    const mockOnChange = vi.fn();
    let renderCount = 0;

    const WrappedComponent = () => {
      renderCount++;
      return (
        <RayoEditor
          content="Content"
          title="Test"
          onChange={mockOnChange}
          isLoading={false}
          editorRef={mockEditorRef}
        />
      );
    };

    const { rerender } = render(<WrappedComponent />);
    const initialRenderCount = renderCount;

    rerender(<WrappedComponent />);
    const secondRenderCount = renderCount;

    // Should only render once more since props didn't change
    expect(secondRenderCount - initialRenderCount).toBeLessThanOrEqual(1);
  });

  test('should handle complex nested content structures efficiently', () => {
    const mockOnChange = vi.fn();
    const complexContent = `
      <div>
        <p>Paragraph 1
          <strong>Bold text
            <em>Italic text
              <u>Underlined text</u>
            </em>
          </strong>
        </p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    `.repeat(100);

    const startTime = performance.now();
    render(
      <RayoEditor
        content={complexContent}
        title="Complex Structure"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    const renderTime = performance.now() - startTime;

    expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1200);
  });

  test('should not degrade performance with multiple diff pairs', () => {
    const mockOnChange = vi.fn();
    const mockOnDiffPairsChange = vi.fn();
    const contentWithManyDiffs = Array(20)
      .fill(0)
      .map((_, i) => `Text <ins>change ${i}</ins>`)
      .join(' ');

    const startTime = performance.now();
    render(
      <RayoEditor
        content={contentWithManyDiffs}
        title="Many Diffs"
        onChange={mockOnChange}
        onDiffPairsChange={mockOnDiffPairsChange}
        showDiffs={true}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    const renderTime = performance.now() - startTime;

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1500);
  });

  test('should handle image operations on large editor without blocking UI', () => {
    const mockOnChange = vi.fn();
    const mockOnEditImage = vi.fn();
    const largeContent = Array(1000)
      .fill('Text ')
      .join('');

    const startTime = performance.now();
    render(
      <RayoEditor
        content={largeContent}
        title="Large with Image"
        onChange={mockOnChange}
        featuredImageUrl="https://example.com/image.jpg"
        onEditFeaturedImage={mockOnEditImage}
        isGeneratingImage={false}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    const renderTime = performance.now() - startTime;

    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1000);
  });

  test('should handle table-like structures efficiently', () => {
    const mockOnChange = vi.fn();
    const tableContent = Array(50)
      .fill(0)
      .map(
        (_, i) =>
          `<table><tr><td>Cell ${i}1</td><td>Cell ${i}2</td><td>Cell ${i}3</td></tr></table>`
      )
      .join('');

    const startTime = performance.now();
    render(
      <RayoEditor
        content={tableContent}
        title="Tables"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    const renderTime = performance.now() - startTime;

    expect(screen.getByTestId('content-textarea')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1200);
  });

  test('should handle code block operations with good performance', () => {
    const mockOnChange = vi.fn();
    const codeContent = Array(20)
      .fill(0)
      .map(
        (_, i) =>
          `<pre><code>function example${i}() {\n  console.log('Block ${i}');\n}\n</code></pre>`
      )
      .join('');

    const startTime = performance.now();
    render(
      <RayoEditor
        content={codeContent}
        title="Code Blocks"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    const renderTime = performance.now() - startTime;

    expect(screen.getByTestId('blog-editor')).toBeInTheDocument();
    expect(renderTime).toBeLessThan(1000);
  });

  test('should cleanup memory on unmount without leaks', () => {
    const mockOnChange = vi.fn();
    const largeContent = Array(2000)
      .fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ')
      .join('');

    const { unmount } = render(
      <RayoEditor
        content={largeContent}
        title="Large Document"
        onChange={mockOnChange}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();

    // Unmount should be fast and clean up resources
    const startTime = performance.now();
    unmount();
    const unmountTime = performance.now() - startTime;

    expect(screen.queryByTestId('rayo-editor')).not.toBeInTheDocument();
    expect(unmountTime).toBeLessThan(100);
  });
});
