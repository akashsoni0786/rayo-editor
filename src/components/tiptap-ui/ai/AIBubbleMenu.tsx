// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '../../tiptap-templates/simple/BubbleMenu';
import { Button } from '../../ui/button';
import { MagicIcon } from '../../tiptap-icons/magic-icon';
import { useAICompletion } from './useAICompletion';
import { ArrowUp, RefreshCcw, CheckCheck, ArrowDownWideNarrow, StepForward, Check, TextQuote, Trash2 } from 'lucide-react';
import './ai-bubble-menu.css';

interface AIBubbleMenuProps {
  editor: Editor;
}

const aiOptions = [
  {
    value: "improve",
    label: "Improve writing",
    icon: RefreshCcw,
  },
  {
    value: "fix",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
];

export const AIBubbleMenu: React.FC<AIBubbleMenuProps> = ({ editor }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { completion, complete, isLoading, hasCompletion } = useAICompletion();

  // Remove AI highlight when closing
  useEffect(() => {
    if (!isAIOpen && editor) {
      editor.chain().unsetHighlight().run();
    }
  }, [isAIOpen, editor]);

  const handleOptionSelect = async (option: string) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    
    // Extract project ID from URL
    const projectId = window.location.pathname.split('/')[2];
    
    await complete(selectedText, { body: { option, projectId } });
  };

  const handleContinueWriting = async () => {
    const { from } = editor.state.selection;
    // Get previous text for context (similar to getPrevText from Novel)
    const prevText = editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ');
    
    // Extract project ID from URL
    const projectId = window.location.pathname.split('/')[2];
    
    await complete(prevText, { body: { option: 'continue', projectId } });
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;

    // Extract project ID from URL
    const projectId = window.location.pathname.split('/')[2];

    if (hasCompletion) {
      // Continue with existing completion
      await complete(completion, {
        body: { option: 'zap', command: inputValue, projectId }
      });
    } else {
      // Get selected text and send for completion
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      
      await complete(selectedText || '', {
        body: { option: 'zap', command: inputValue, projectId }
      });
    }
    
    setInputValue('');
  };

  const handleReplace = () => {
    const { from, to } = editor.state.selection;
    editor.chain().focus().insertContentAt({ from, to }, completion).run();
    handleDiscard();
  };

  const handleInsertBelow = () => {
    const { to } = editor.state.selection;
    editor.chain().focus().insertContentAt(to + 1, `\n\n${completion}`).run();
    handleDiscard();
  };

  const handleDiscard = () => {
    editor.chain().unsetHighlight().focus().run();
    setIsAIOpen(false);
    setInputValue('');
  };

  const addAIHighlight = () => {
    if (editor) {
      editor.chain().setHighlight({ color: 'rgba(168, 85, 247, 0.2)' }).run();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleDiscard();
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: isAIOpen ? 'bottom-start' : 'top',
        maxWidth: 'none',
        hideOnClick: false,
        zIndex: 10000,
        onHidden: () => {
          setIsAIOpen(false);
          editor.chain().unsetHighlight().run();
        },
      }}
      shouldShow={({ editor, state, from, to }: any) => {
        const { selection } = state;
        const { empty } = selection;
        
        if (empty) return false;
        if (editor.isActive('link')) return false;
        if (editor.isActive('image') || editor.isActive('codeBlock')) return false;
        
        const text = state.doc.textBetween(from, to, ' ');
        return text.length > 0;
      }}
      className="ai-bubble-menu"
    >
      <div className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
        {isAIOpen ? (
          <div className="w-[350px]">
            {/* Completion Display */}
            {hasCompletion && (
              <div className="flex max-h-[400px]">
                <div className="overflow-y-auto w-full">
                  <div className="prose p-2 px-4 prose-sm">
                    <div className="whitespace-pre-wrap text-sm text-gray-700">{completion}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-purple-500">
                <MagicIcon className="mr-2 h-4 w-4 shrink-0" />
                AI is thinking
                <div className="ml-2 mt-1">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600" />
                </div>
              </div>
            )}

            {/* Input and Commands */}
            {!isLoading && (
              <>
                {/* Input Section */}
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
                    className="w-full px-4 py-3 text-sm border-0 focus:outline-none focus:ring-0 placeholder-gray-500"
                    onFocus={() => addAIHighlight()}
                  />
                  <Button
                    size="sm"
                    onClick={handleInputSubmit}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 top-1/2 h-6 w-6 p-0 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-700"
                  >
                    <ArrowUp className="h-3 w-3 text-white" />
                  </Button>
                </div>

                {/* Command Options */}
                {hasCompletion ? (
                  // Completion Commands
                  <div className="border-t border-gray-100">
                    <div className="px-2 py-2">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={handleReplace}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full"
                        >
                          <Check className="h-4 w-4 text-gray-500" />
                          Replace selection
                        </button>
                        <button
                          onClick={handleInsertBelow}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full"
                        >
                          <TextQuote className="h-4 w-4 text-gray-500" />
                          Insert below
                        </button>
                      </div>
                      <div className="border-t border-gray-100 my-2" />
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={handleDiscard}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Selection Commands
                  <div className="border-t border-gray-100">
                    <div className="px-2 py-2">
                      <div className="text-xs font-medium text-gray-500 px-4 py-2">Edit or review selection</div>
                      <div className="flex flex-col space-y-1">
                        {aiOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleOptionSelect(option.value)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full"
                          >
                            <option.icon className="h-4 w-4 text-purple-500" />
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 my-2" />
                      <div className="text-xs font-medium text-gray-500 px-4 py-2">Use AI to do more</div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={handleContinueWriting}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-md w-full"
                        >
                          <StepForward className="h-4 w-4 text-purple-500" />
                          Continue writing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <Button
            className="gap-1 rounded-none text-purple-500 border-0 hover:bg-purple-50"
            variant="ghost"
            onClick={() => {
              setIsAIOpen(true);
              addAIHighlight();
            }}
            size="sm"
          >
            <MagicIcon className="h-5 w-5" />
            Ask AI
          </Button>
        )}
      </div>
    </BubbleMenu>
  );
};