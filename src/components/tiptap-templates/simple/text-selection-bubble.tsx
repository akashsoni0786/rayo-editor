import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- TipTap UI Components ---
import { MarkButton } from "../../tiptap-ui/mark-button"
import { TextAlignButton } from "../../tiptap-ui/text-align-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
} from "../../tiptap-ui/color-highlight-popover"
import { Button } from "../../tiptap-ui-primitive/button"
import { 
  ToolbarGroup, 
  ToolbarSeparator 
} from "../../tiptap-ui-primitive/toolbar"

// --- Hooks ---
import { useMobile } from "../../../hooks/use-mobile"

// --- Icons ---
import { LinkIcon } from "../../tiptap-icons/link-icon"
import { CheckIcon } from "../../tiptap-icons/check-icon"
import { XIcon } from "../../tiptap-icons/x-icon"
import { MagicIcon } from "../../tiptap-icons/magic-icon"

// --- AI Components ---
import { useAICompletion } from "../../tiptap-ui/ai/useAICompletion"
import { ArrowUp, RefreshCcw, CheckCheck, ArrowDownWideNarrow, WrapText, StepForward, Check, TextQuote, Trash2 } from 'lucide-react'

interface TextSelectionBubbleProps {
  editor: Editor
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
  {
    value: "longer",
    label: "Make longer",
    icon: WrapText,
  },
];

export const TextSelectionBubble: React.FC<TextSelectionBubbleProps> = ({
  editor
}) => {
  const isMobile = useMobile()
  const [isHighlightOpen, setIsHighlightOpen] = React.useState(false)
  const [showLinkDialog, setShowLinkDialog] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const linkInputRef = React.useRef<HTMLInputElement>(null)

  // AI States
  const [isAIOpen, setIsAIOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [savedSelection, setSavedSelection] = React.useState<{from: number, to: number} | null>(null)
  const { completion, complete, isLoading, hasCompletion } = useAICompletion()

  const handleLinkClick = () => {
    setShowLinkDialog(true)
    setLinkUrl('')
    setTimeout(() => {
      if (linkInputRef.current) {
        linkInputRef.current.focus()
      }
    }, 50)
  }

  const handleSaveLink = () => {
    if (linkUrl.trim()) {
      const href = linkUrl.trim()
      const normalizedHref = /^(https?:\/\/|ftp:\/\/|mailto:)/i.test(href) ? href : `https://${href}`
      editor.chain().focus().setLink({ href: normalizedHref, target: '_blank', rel: 'noopener noreferrer' }).run()
    }
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const handleCancelLink = () => {
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveLink()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelLink()
    }
  }

  // AI Functions
  const handleOptionSelect = async (option: string) => {
    const selection = savedSelection || editor.state.selection;
    const { from, to } = selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    await complete(selectedText, { body: { option } });
  };

  const handleContinueWriting = async () => {
    const { from } = editor.state.selection;
    const prevText = editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ');
    await complete(prevText, { body: { option: 'continue' } });
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;

    if (hasCompletion) {
      await complete(completion, {
        body: { option: 'zap', command: inputValue }
      });
    } else {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      
      await complete(selectedText || '', {
        body: { option: 'zap', command: inputValue }
      });
    }
    
    setInputValue('');
  };

  const handleReplace = () => {
    const { from, to } = editor.state.selection;
    editor.chain().focus().insertContentAt({ from, to }, completion).run();
    handleCloseAI();
  };

  const handleInsertBelow = () => {
    const { to } = editor.state.selection;
    editor.chain().focus().insertContentAt(to + 1, `\n\n${completion}`).run();
    handleCloseAI();
  };

  const handleCloseAI = () => {
    editor.chain().unsetHighlight().focus().run();
    setIsAIOpen(false);
    setInputValue('');
  };

  const addAIHighlight = () => {
    if (editor) {
      editor.chain().setHighlight({ color: 'rgba(168, 85, 247, 0.2)' }).run();
    }
  };

  const handleAIKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCloseAI();
    }
  };

  // Reset link dialog when selection changes
  React.useEffect(() => {
    const handleSelectionChange = () => {
      if (showLinkDialog && editor.state.selection.empty) {
        setShowLinkDialog(false)
        setLinkUrl('')
      }
    }
    
    editor.on('selectionUpdate', handleSelectionChange)
    return () => {
      editor.off('selectionUpdate', handleSelectionChange)
    }
  }, [editor, showLinkDialog])

  return (
    <div className="text-selection-bubble">
      {showLinkDialog ? (
        // Link edit mode - show only input and buttons
        <div className="text-selection-link-edit">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            placeholder="Enter URL..."
            className="link-input-inline"
          />
          <div className="link-buttons">
            <Button
              data-style="ghost"
              data-size="sm"
              onClick={handleSaveLink}
              disabled={!linkUrl.trim()}
              title="Add"
            >
              <CheckIcon className="tiptap-button-icon" />
            </Button>
            <Button
              data-style="ghost"
              data-size="sm"
              onClick={handleCancelLink}
              title="Cancel"
            >
              <XIcon className="tiptap-button-icon" />
            </Button>
          </div>
        </div>
      ) : isAIOpen ? (
        // AI Mode - show AI interface
        <div className="w-[350px] bg-white">
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
                  onKeyDown={handleAIKeyDown}
                  autoFocus
                  placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
                  className="w-full px-4 py-3 text-sm border-0 focus:outline-none focus:ring-0 placeholder-gray-500"
                  onFocus={() => addAIHighlight()}
                />
                <button
                  onClick={handleInputSubmit}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-700 disabled:bg-gray-300 flex items-center justify-center"
                >
                  <ArrowUp className="h-3 w-3 text-white" />
                </button>
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
                        onClick={handleCloseAI}
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
        // Normal mode - show all formatting options
        <>
          {/* Basic text formatting */}
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Color and highlighting */}
          <ToolbarGroup>
            {!isMobile ? (
              <ColorHighlightPopover />
            ) : (
              <ColorHighlightPopoverButton onClick={() => setIsHighlightOpen(!isHighlightOpen)} />
            )}
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Text alignment */}
          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Link */}
          <ToolbarGroup>
            <Button
              data-style="ghost"
              data-size="sm"
              onClick={handleLinkClick}
              aria-label="Add link"
            >
              <LinkIcon className="tiptap-button-icon" />
            </Button>
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Ask AI Button */}
          <ToolbarGroup>
            <Button
              data-style="ghost"
              data-size="sm"
              onMouseDown={(e) => {
                // Prevent losing selection
                e.preventDefault();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Add highlight first to keep bubble visible
                addAIHighlight();
                
                // Then open AI mode
                setTimeout(() => {
                  setIsAIOpen(true);
                }, 10);
              }}
              aria-label="Ask AI"
            >
              <MagicIcon className="tiptap-button-icon text-purple-500" />
            </Button>
          </ToolbarGroup>
        </>
      )}
    </div>
  )
}