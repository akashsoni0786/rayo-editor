import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface EditorErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

const EditorErrorFallback: React.FC<EditorErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F2F3F7]">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#182234] mb-2">
          Editor Error
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Something went wrong with the editor. Your changes have been auto-saved.
        </p>
        {error?.message && (
          <p className="text-xs text-gray-400 mb-4 font-mono bg-gray-50 p-2 rounded">
            {error.message}
          </p>
        )}
        <button
          onClick={() => {
            resetError?.();
            window.location.reload();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5E33FF] text-white rounded-lg hover:bg-[#4D2AD9] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Editor
        </button>
      </div>
    </div>
  );
};

export default EditorErrorFallback;
