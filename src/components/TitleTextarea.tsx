import React, { useRef, useEffect, useCallback } from 'react';
import { TitleTextareaProps } from '@/types/editor.types';

export const TitleTextarea: React.FC<TitleTextareaProps> = ({ title, onTitleChange, readOnly }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [title, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={title}
      onChange={(e) => {
        onTitleChange?.(e.target.value);
        adjustHeight();
      }}
      placeholder="Enter blog title..."
      className="w-full text-2xl font-bold outline-none resize-none"
      readOnly={readOnly}
      rows={1}
      data-testid="title-textarea"
    />
  );
};
