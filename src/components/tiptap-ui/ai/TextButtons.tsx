// @ts-nocheck
import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, Code, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link } from 'lucide-react';
import { Button } from '../../ui/button';
import { MarkButton } from '../../tiptap-ui/mark-button';
import { TextAlignButton } from '../../tiptap-ui/text-align-button';
import { ColorHighlightPopover } from '../../tiptap-ui/color-highlight-popover';
import { LinkIcon } from '../../tiptap-icons/link-icon';
import { CheckIcon } from '../../tiptap-icons/check-icon';
import { XIcon } from '../../tiptap-icons/x-icon';
import { ToolbarGroup, ToolbarSeparator } from '../../tiptap-ui-primitive/toolbar';
import { useMobile } from '../../../hooks/use-mobile';
import { LinkButton } from './LinkSelector';

interface TextButtonsProps {
  editor: Editor;
  openLink?: boolean;
  onOpenLinkChange?: (open: boolean) => void;
}

export const TextButtons: React.FC<TextButtonsProps> = ({ editor, openLink, onOpenLinkChange }) => {
  const isMobile = useMobile();

  if (!editor) return null;

  return (
    <>
      {/* Basic text formatting */}
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="underline" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Link */}
      <ToolbarGroup>
        <LinkButton editor={editor} openLink={openLink} onOpenLinkChange={onOpenLinkChange} />
      </ToolbarGroup>
    </>
  );
};