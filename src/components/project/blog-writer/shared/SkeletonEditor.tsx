import React from 'react';

interface SkeletonEditorProps {
  streamingPhase: string;
  streamingProgress: number;
  isGeneratingImage?: boolean;
  imageProgress?: number;
  imagePhase?: string;
  thinkingPreview?: string;
}

const SkeletonEditor: React.FC<SkeletonEditorProps> = ({
  streamingPhase,
  streamingProgress,
  isGeneratingImage = false,
  imageProgress = 0,
  imagePhase = '',
  thinkingPreview = ''
}) => {
  const isThinkingPhase = streamingPhase === 'thinking';
  const isContentPhase = streamingPhase === 'content';

  return (
    <div className="h-full w-full p-6 animate-pulse">
      {/* Featured Image Skeleton - Only show if image generation is active */}
      {isGeneratingImage && (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center justify-center h-48 bg-gradient-to-r from-[#F9D3DF] to-white rounded">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full animate-bounce"></div>
              <div className="text-sm text-gray-500 font-medium">
                Generating featured image... {imageProgress}%
              </div>
              {imagePhase && (
                <div className="text-xs text-gray-400 mt-1">{imagePhase}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Skeleton - 7 lines with custom widths */}
      <div className="space-y-3">
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-full animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-1/2 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-4/5 animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-full animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-[35%] animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-full animate-pulse"></div>
        <div className="h-6 bg-gradient-to-r from-[#F9D3DF] to-white rounded w-[30%] animate-pulse"></div>
      </div>

      {/* Thinking Preview Overlay - Shows during thinking phase */}
      {isThinkingPhase && thinkingPreview && (
        <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-2"></div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium mb-1">AI is thinking...</div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {thinkingPreview}
                <span className="inline-block w-[2px] h-4 ml-1 bg-purple-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SkeletonEditor;