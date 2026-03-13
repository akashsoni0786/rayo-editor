import { useState, useCallback } from 'react';

/**
 * Hook for processing and transforming editor content
 *
 * Manages content state with processing status tracking and error handling.
 * Useful for integrating with AI content transformation services or
 * implementing custom content processing pipelines.
 *
 * @param initialContent - Initial content state (default: empty string)
 * @returns Object with content state and processing utilities
 *
 * @returns {Object} Content processing state containing:
 *   - content: string - Current processed content
 *   - setContent: (content: string) => void - Directly set content
 *   - isProcessing: boolean - Whether processing is in progress
 *   - error: Error | null - Last processing error (if any)
 *   - processContent: (content: string) => void - Process and update content
 *
 * @example
 * ```tsx
 * const {
 *   content,
 *   isProcessing,
 *   error,
 *   processContent
 * } = useContentProcessing('Initial content');
 *
 * const handleAIEnhance = async () => {
 *   const enhanced = await fetch('/api/enhance', {
 *     method: 'POST',
 *     body: JSON.stringify({ content })
 *   }).then(r => r.json());
 *
 *   processContent(enhanced.content);
 * };
 *
 * return (
 *   <>
 *     {error && <div className="error">{error.message}</div>}
 *     <button onClick={handleAIEnhance} disabled={isProcessing}>
 *       {isProcessing ? 'Processing...' : 'Enhance'}
 *     </button>
 *   </>
 * );
 * ```
 *
 * @example
 * With RayoEditor:
 * ```tsx
 * const { content, isProcessing, processContent } = useContentProcessing('');
 *
 * return (
 *   <RayoEditor
 *     content={content}
 *     title=""
 *     onChange={processContent}
 *     isLoading={isProcessing}
 *     editorRef={editorRef}
 *   />
 * );
 * ```
 *
 * @example
 * Error handling:
 * ```tsx
 * const { content, isProcessing, error, processContent } = useContentProcessing();
 *
 * const safeProcess = useCallback((newContent: string) => {
 *   try {
 *     processContent(newContent);
 *   } catch (err) {
 *     console.error('Processing failed:', err);
 *   }
 * }, [processContent]);
 * ```
 */
export const useContentProcessing = (initialContent: string = '') => {
  const [content, setContent] = useState(initialContent);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processContent = useCallback((newContent: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setContent(newContent);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    content,
    setContent,
    isProcessing,
    error,
    processContent
  };
};
