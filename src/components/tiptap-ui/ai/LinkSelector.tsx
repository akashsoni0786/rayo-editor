// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Check, Trash } from 'lucide-react';
import { CiLink } from "react-icons/ci";
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (_e) {
    return null;
  }
}

interface LinkSelectorProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LinkButtonProps {
  editor: Editor;
  openLink?: boolean;
  onOpenLinkChange?: (open: boolean) => void;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ editor, openLink, onOpenLinkChange }) => {
  if (!onOpenLinkChange) return null;
  
  return (
    <Button 
      size="sm" 
      variant="ghost" 
      className="rounded-none border-none"
      onClick={() => onOpenLinkChange(true)}
    >
      <CiLink className={cn("h-4 w-4", {
        "text-blue-500": editor.isActive("link"),
      })} />
    </Button>
  );
};

export const LinkSelector: React.FC<LinkSelectorProps> = ({ editor, open, onOpenChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus on input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  if (!editor) return null;

  return (
    <div className="w-60 p-0">
      <form
        onSubmit={(e) => {
          const target = e.currentTarget as HTMLFormElement;
          e.preventDefault();
          const input = target[0] as HTMLInputElement;
          const url = getUrlFromString(input.value);
          if (url) {
            const normalizedUrl = /^(https?:\/\/|ftp:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
            editor.chain().focus().setLink({ href: normalizedUrl, target: '_blank', rel: 'noopener noreferrer' }).run();
            onOpenChange(false);
          }
        }}
        className="flex p-1"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Paste a link"
          className="flex-1 bg-background p-1 text-sm outline-none"
          defaultValue={editor.getAttributes("link").href || ""}
        />
        {editor.getAttributes("link").href ? (
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
            onClick={() => {
              editor.chain().focus().unsetLink().run();
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              onOpenChange(false);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="h-8" type="submit">
            <Check className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
};