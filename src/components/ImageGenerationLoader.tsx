import React from 'react';

export const ImageGenerationLoader: React.FC<{ isLoading?: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center p-4" data-testid="image-loader">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      <span className="ml-2">Generating image...</span>
    </div>
  );
};
