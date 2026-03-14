import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  /** Text to display below the loading spinner */
  text?: string;
  /** Whether to center the loading spinner in its container */
  center?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Optional className for the text */
  textClassName?: string;
}

export function Loading({
  text,
  center = true,
  className,
  textClassName
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        center && 'justify-center h-[calc(100vh-200px)]',
        className
      )}
    >
      <div className="w-60 h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
      {text && (
        <p className={cn('mt-4 text-sm text-gray-500', textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
}
