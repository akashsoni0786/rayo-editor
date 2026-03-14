import React from 'react';

export const MagicIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21L12 17.77L5.82 21L7 14.14l-5-4.87L8.91 8.26L12 2z" />
    <path d="m5 3 1 1" />
    <path d="m19 3-1 1" />
    <path d="m5 21 1-1" />
    <path d="m19 21-1-1" />
  </svg>
);