import React, { useState } from 'react';
import { RayoEditorProps } from '@/types/editor.types';
import { TitleTextarea } from './TitleTextarea';
import { DiffOverlay } from './DiffOverlay';
import { ReviewButtons } from './ReviewButtons';
import { useEditorDiff } from '@/hooks/useEditorDiff';

export const BlogEditor: React.FC<RayoEditorProps> = ({
  content,
  title,
  onChange,
  onTitleChange,
  isLoading,
  showDiffs,
  focusMode,
  readOnly,
  editorRef,
}) => {
  const [buttonPosition] = useState({ top: 0, left: 0 });
  const { diffPairs, overlayHoleRect, setActivePairIndex } = useEditorDiff(editorRef);

  return (
    <div
      className={`rayo-blog-editor ${focusMode ? 'focus-mode' : ''}`}
      data-testid="blog-editor"
    >
      <div className="mb-6" data-testid="title-section">
        <TitleTextarea
          title={title}
          onTitleChange={onTitleChange}
          readOnly={readOnly}
        />
      </div>

      <div className="relative" data-testid="content-section">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-96 p-4 border rounded font-mono text-sm"
          placeholder="Blog content..."
          readOnly={readOnly}
          data-testid="content-textarea"
        />

        {showDiffs && diffPairs.length > 0 && (
          <>
            <DiffOverlay
              diffPairs={diffPairs}
              overlayHoleRect={overlayHoleRect}
              onPairClick={setActivePairIndex}
            />
            <ReviewButtons
              onAccept={() => onChange(content)}
              onReject={() => onChange(content)}
              position={buttonPosition}
            />
          </>
        )}
      </div>

      {isLoading && (
        <div className="mt-4 p-4 bg-gray-100 rounded" data-testid="loading-state">
          Loading...
        </div>
      )}
    </div>
  );
};
