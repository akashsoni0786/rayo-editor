import React from 'react';

export const LoadingCircle: React.FC<{ className?: string }> = ({ 
  className = 'h-3 w-3' 
}) => (
  <div 
    className={`animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 ${className}`}
    role="status"
    aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
);