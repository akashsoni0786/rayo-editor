import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageGenerationLoader } from '@/components/ImageGenerationLoader';

describe('ImageGenerationLoader', () => {
  test('should not render when isLoading is false', () => {
    render(<ImageGenerationLoader isLoading={false} />);
    expect(screen.queryByTestId('image-loader')).not.toBeInTheDocument();
  });

  test('should not render when isLoading is undefined', () => {
    render(<ImageGenerationLoader />);
    expect(screen.queryByTestId('image-loader')).not.toBeInTheDocument();
  });

  test('should render when isLoading is true', () => {
    render(<ImageGenerationLoader isLoading={true} />);
    expect(screen.getByTestId('image-loader')).toBeInTheDocument();
  });

  test('should display loading text', () => {
    render(<ImageGenerationLoader isLoading={true} />);
    expect(screen.getByText('Generating image...')).toBeInTheDocument();
  });

  test('should have spinner animation', () => {
    const { container } = render(<ImageGenerationLoader isLoading={true} />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
