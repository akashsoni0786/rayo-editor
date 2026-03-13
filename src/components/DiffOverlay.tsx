import React from 'react';
import { DiffOverlayProps } from '@/types/editor.types';

export const DiffOverlay: React.FC<DiffOverlayProps> = ({
  diffPairs,
  overlayHoleRect,
  onPairHover,
  onPairClick
}) => {
  if (diffPairs.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      data-testid="diff-overlay"
      style={{ zIndex: 40 }}
    >
      {diffPairs.map((pair, idx) => (
        <div
          key={idx}
          className="absolute border-2 border-green-400"
          style={{
            top: `${pair.rect.top}px`,
            left: `${pair.rect.left}px`,
            width: `${pair.rect.width}px`,
            height: `${pair.rect.bottom - pair.rect.top}px`
          }}
          onMouseEnter={() => onPairHover?.(idx)}
          onClick={() => onPairClick?.(idx)}
          data-testid={`diff-pair-${idx}`}
        />
      ))}

      {overlayHoleRect && (
        <div
          className="absolute pointer-events-auto"
          style={{
            top: `${overlayHoleRect.top}px`,
            bottom: `${overlayHoleRect.bottom}px`,
            left: 0,
            right: 0,
            zIndex: 50
          }}
          data-testid="overlay-hole"
        />
      )}
    </div>
  );
};
