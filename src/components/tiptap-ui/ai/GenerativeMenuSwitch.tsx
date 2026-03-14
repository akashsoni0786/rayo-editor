import React, { useEffect, Fragment, ReactNode } from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import { Button } from '../../ui/button';
import { MagicIcon } from '../../tiptap-icons/magic-icon';
import { AISelector } from './AISelector';
import { LinkSelector } from './LinkSelector';
import { ToolbarSeparator } from '../../tiptap-ui-primitive/toolbar';

interface GenerativeMenuSwitchProps {
  editor: Editor;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openLink?: boolean;
  onOpenLinkChange?: (open: boolean) => void;
}

export const GenerativeMenuSwitch: React.FC<GenerativeMenuSwitchProps> = ({
  editor,
  children,
  open,
  onOpenChange,
  openLink = false,
  onOpenLinkChange
}) => {
  // Reset AI state when selection changes or disappears - debounced to reduce flicker
  useEffect(() => {
    const { selection } = editor.state;
    const { empty } = selection;
    
    // Only reset if selection is truly empty (not just changing)
    if (empty) {
      // Use timeout to debounce rapid selection changes
      const timeoutId = setTimeout(() => {
        onOpenChange(false);
        onOpenLinkChange?.(false);
      }, 50); // 50ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [editor.state.selection.empty, onOpenChange, onOpenLinkChange]); // Use .empty instead of coordinates

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        placement: "bottom-start",
        maxWidth: 'none',
        hideOnClick: false,
        interactive: true,
        appendTo: 'parent', // Keep within editor container
        zIndex: 50, // Lower z-index to stay within editor
        animation: 'fade', // Use fade instead of default animation
        duration: [150, 100], // Faster show/hide to reduce flicker
        popperOptions: {
          strategy: 'absolute', // Use absolute instead of fixed
          modifiers: [
            {
              name: 'flip',
              enabled: false, // Disable flip to prevent position jumping
            },
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                boundary: 'clippingParents',
                padding: 8,
                altAxis: true, // Allow overflow on secondary axis
              },
            },
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
            {
              name: 'computeStyles',
              options: {
                adaptive: false, // Disable adaptive positioning
                gpuAcceleration: true, // Use GPU acceleration
              },
            },
          ],
        },
        onHidden: () => {
          onOpenChange(false);
          onOpenLinkChange?.(false);
        },
      }}
      shouldShow={({ editor, state, from, to }) => {
        // CRITICAL: Don't show if editor is in read-only mode
        // This must be first check before anything else
        if (!editor.isEditable) {
          return false;
        }

        // Don't show during AI streaming (content being modified by AI agent)
        // .editor-streaming-mode is applied BEFORE operations begin (when isStreaming=true),
        // so it catches the timing window that .show-diffs misses
        if (editor.view.dom.closest('.editor-streaming-mode')) {
          return false;
        }

        // Don't show during review/diff mode (when editor is inside a show-diffs container)
        // This prevents the bubble menu from appearing when text is auto-selected during review
        if (editor.view.dom.closest('.show-diffs')) {
          return false;
        }

        const { selection } = state;
        const { empty } = selection;

        // Don't show if selection is empty
        if (empty) return false;

        // Don't show if a link is active
        if (editor.isActive('link')) return false;

        // Don't show if we're in a node that shouldn't have bubble menu
        if (editor.isActive('image') || editor.isActive('codeBlock')) {
          return false;
        }

        // Get text content of the selection
        const text = state.doc.textBetween(from, to, ' ');
        return text.length > 0;
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md shadow-2xl"
      style={{
        background: 'linear-gradient(178deg, #FFF0E8 0%, #F5EAFF 100%)',
        zIndex: 50, // Match the tippy z-index
        position: 'relative',
        maxWidth: '400px', // Fixed width instead of viewport
        maxHeight: '300px', // Smaller height
        overflow: 'auto'
      }}
    >
      {/* Always show AI selector directly on text selection */}
      <AISelector editor={editor} open={open} onOpenChange={onOpenChange} />
    </BubbleMenu>
  );
};