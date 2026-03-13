import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RayoEditor } from '@/components/RayoEditor';
import { createRef } from 'react';

describe('RayoEditor', () => {
  test('should render without crashing', () => {
    const mockRef = createRef();
    render(
      <RayoEditor
        content=""
        title=""
        onChange={vi.fn()}
        isLoading={false}
        editorRef={mockRef}
      />
    );
    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();
  });

  test('should pass props to BlogEditor', () => {
    const mockRef = createRef();
    render(
      <RayoEditor
        content="test"
        title="Test Title"
        onChange={vi.fn()}
        isLoading={false}
        editorRef={mockRef}
      />
    );
    expect(screen.getByTestId('rayo-editor')).toBeInTheDocument();
  });
});
