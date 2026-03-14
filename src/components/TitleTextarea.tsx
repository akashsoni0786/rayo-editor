import React, { useRef, useEffect, useCallback } from 'react';

export const TitleTextarea: React.FC<{
  title: string;
  onTitleChange?: (title: string) => void;
  readOnly?: boolean;
}> = ({ title, onTitleChange, readOnly }) => {
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(adjustHeight);
    });

    const container = textarea.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => resizeObserver.disconnect();
  }, [adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={title}
      onChange={(e) => {
        onTitleChange?.(e.target.value);
        adjustHeight();
      }}
      onInput={adjustHeight}
      placeholder="Enter blog title..."
      className="w-full text-[26px] font-bold leading-[140%] tracking-[-0.02em] text-[#182234] bg-transparent border-none outline-none focus:outline-none placeholder-gray-300 resize-none overflow-hidden"
      style={{ height: 'auto', paddingTop: '0px' }}
      readOnly={readOnly}
      rows={1}
      data-testid="title-textarea"
    />
  );
};
