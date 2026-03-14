import React from 'react';
import { Editor } from '@tiptap/react';
import { Check, TextQuote, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface AICompletionCommandsProps {
  editor: Editor;
  completion: string;
  onDiscard: () => void;
}

export const AICompletionCommands: React.FC<AICompletionCommandsProps> = ({ 
  editor, 
  completion, 
  onDiscard 
}) => {
  const handleReplace = () => {
    const { from, to } = editor.state.selection;
    
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, completion)
      .run();
    
    onDiscard(); // Close the AI panel
  };

  const handleInsertBelow = () => {
    const { to } = editor.state.selection;
    
    editor
      .chain()
      .focus()
      .insertContentAt(to + 1, `\n\n${completion}`)
      .run();
    
    onDiscard(); // Close the AI panel
  };

  return (
    <div className="ai-completion-commands p-2 space-y-1 border-t border-gray-200">
      {/* Replace selection */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReplace}
        className="w-full justify-start gap-2 h-8 px-2 hover:bg-gray-100"
      >
        <Check className="h-4 w-4 text-gray-500" />
        Replace selection
      </Button>

      {/* Insert below */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInsertBelow}
        className="w-full justify-start gap-2 h-8 px-2 hover:bg-gray-100"
      >
        <TextQuote className="h-4 w-4 text-gray-500" />
        Insert below
      </Button>

      {/* Separator */}
      <div className="border-t border-gray-200 my-2" />

      {/* Discard */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDiscard}
        className="w-full justify-start gap-2 h-8 px-2 hover:bg-gray-100 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
        Discard
      </Button>
    </div>
  );
};