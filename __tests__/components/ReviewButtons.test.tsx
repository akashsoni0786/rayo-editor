import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewButtons } from '@/components/ReviewButtons';

describe('ReviewButtons', () => {
  test('should render accept and reject buttons', () => {
    render(
      <ReviewButtons
        onAccept={vi.fn()}
        onReject={vi.fn()}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByTestId('accept-button')).toBeInTheDocument();
    expect(screen.getByTestId('reject-button')).toBeInTheDocument();
  });

  test('should call onAccept when accept button is clicked', () => {
    const mockOnAccept = vi.fn();

    render(
      <ReviewButtons
        onAccept={mockOnAccept}
        onReject={vi.fn()}
        position={{ top: 0, left: 0 }}
      />
    );

    const button = screen.getByTestId('accept-button');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(mockOnAccept).toHaveBeenCalled();
  });

  test('should call onReject when reject button is clicked', () => {
    const mockOnReject = vi.fn();

    render(
      <ReviewButtons
        onAccept={vi.fn()}
        onReject={mockOnReject}
        position={{ top: 0, left: 0 }}
      />
    );

    const button = screen.getByTestId('reject-button');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(mockOnReject).toHaveBeenCalled();
  });

  test('should respect position prop', () => {
    render(
      <ReviewButtons
        onAccept={vi.fn()}
        onReject={vi.fn()}
        position={{ top: 100, left: 200 }}
      />
    );

    const buttonContainer = screen.getByTestId('review-buttons');
    expect(buttonContainer).toHaveStyle({
      top: '100px',
      left: '200px'
    });
  });
});
