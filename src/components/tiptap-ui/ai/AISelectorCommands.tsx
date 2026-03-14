// @ts-nocheck
import React from 'react';
import { Editor } from '@tiptap/react';
import { RefreshCcw, CheckCheck, ArrowDownWideNarrow, WrapText, StepForward } from 'lucide-react';
import { Button } from '../../ui/button';

const aiOptions = [
  {
    value: 'improve',
    label: 'Improve writing',
    icon: RefreshCcw,
  },
  {
    value: 'fix',
    label: 'Fix grammar',
    icon: CheckCheck,
  },
  {
    value: 'shorter',
    label: 'Make shorter',
    icon: ArrowDownWideNarrow,
  },
  {
    value: 'longer',
    label: 'Make longer',
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  editor: Editor;
  onSelect: (text: string, option: string) => void;
}

export const AISelectorCommands: React.FC<AISelectorCommandsProps> = ({ editor, onSelect }) => {
  const handleOptionSelect = (option: string) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    onSelect(selectedText, option);
  };

  const handleContinueWriting = () => {
    const { from } = editor.state.selection;
    // Get previous text for context (similar to getPrevText from Novel)
    const prevText = editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ');
    onSelect(prevText, 'continue');
  };

  return (
    <div className="ai-selector-commands p-2 space-y-2">
      {/* Edit or review selection */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-500 px-2 py-1">Edit or review selection</div>
        {aiOptions.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => handleOptionSelect(option.value)}
            className="w-full justify-start gap-2 h-8 px-2 hover:bg-gray-100"
          >
            <option.icon className="h-4 w-4 text-purple-600" />
            {option.label}
          </Button>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-2" />

      {/* Use AI to do more */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-500 px-2 py-1">Use AI to do more</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleContinueWriting}
          className="w-full justify-start gap-2 h-8 px-2 hover:bg-gray-100"
        >
          <StepForward className="h-4 w-4 text-purple-600" />
          Continue writing
        </Button>
      </div>
    </div>
  );
};