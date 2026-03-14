import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon"
import { BoldIcon } from "../../tiptap-icons/bold-icon"
import { ItalicIcon } from "../../tiptap-icons/italic-icon"
import { UnderlineIcon } from "../../tiptap-icons/underline-icon"
import { StrikeIcon } from "../../tiptap-icons/strike-icon"

// --- Tiptap UI ---
import {
  MarkButton,
  type Mark,
  canToggleMark,
  isMarkActive,
} from "../mark-button/mark-button"

// --- Lib ---
import { isMarkInSchema } from "../../../lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button"
import { Button } from "../../tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../../tiptap-ui-primitive/dropdown-menu"

export interface TextFormatDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor
  /**
   * The text formatting options to display in the dropdown.
   */
  formats?: Mark[]
  /**
   * Whether the dropdown should be hidden when no formatting options are available
   * @default false
   */
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const textFormatOptions = [
  {
    mark: "bold" as Mark,
    label: "Bold",
    icon: BoldIcon,
    shortcut: "Ctrl+B",
  },
  {
    mark: "italic" as Mark,
    label: "Italic", 
    icon: ItalicIcon,
    shortcut: "Ctrl+I",
  },
  {
    mark: "underline" as Mark,
    label: "Underline",
    icon: UnderlineIcon,
    shortcut: "Ctrl+U",
  },
  {
    mark: "strike" as Mark,
    label: "Strikethrough",
    icon: StrikeIcon,
    shortcut: "Ctrl+Shift+S",
  },
]

export function canSetAnyTextFormat(
  editor: Editor | null,
  formats: Mark[]
): boolean {
  if (!editor) return false
  return formats.some((format) => canToggleMark(editor, format))
}

export function isAnyTextFormatActive(
  editor: Editor | null,
  formats: Mark[]
): boolean {
  if (!editor) return false
  return formats.some((format) => isMarkActive(editor, format))
}

export function getFilteredTextFormatOptions(
  availableFormats: Mark[]
): typeof textFormatOptions {
  return textFormatOptions.filter((option) =>
    availableFormats.includes(option.mark)
  )
}

export function shouldShowTextFormatDropdown(params: {
  editor: Editor | null
  formats: Mark[]
  hideWhenUnavailable: boolean
  formatsInSchema: boolean
  canSetAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, formatsInSchema, canSetAny } = params

  if (!formatsInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable) {
    if (!canSetAny) {
      return false
    }
  }

  return true
}

export function useTextFormatDropdownState(
  editor: Editor | null,
  availableFormats: Mark[]
) {
  const [isOpen, setIsOpen] = React.useState(false)

  const formatsInSchema = React.useMemo(
    () => availableFormats.some((format) => isMarkInSchema(format, editor)),
    [editor, availableFormats]
  )

  const filteredFormats = React.useMemo(
    () => getFilteredTextFormatOptions(availableFormats),
    [availableFormats]
  )

  const canSetAny = canSetAnyTextFormat(editor, availableFormats)
  const isAnyActive = isAnyTextFormatActive(editor, availableFormats)

  const handleOpenChange = React.useCallback(
    (open: boolean, callback?: (isOpen: boolean) => void) => {
      setIsOpen(open)
      callback?.(open)
    },
    []
  )

  return {
    isOpen,
    setIsOpen,
    formatsInSchema,
    filteredFormats,
    canSetAny,
    isAnyActive,
    handleOpenChange,
  }
}

export function useActiveTextFormatIcon(
  editor: Editor | null,
  filteredFormats: typeof textFormatOptions
) {
  return React.useCallback(() => {
    const activeOption = filteredFormats.find((option) =>
      isMarkActive(editor, option.mark)
    )

    return activeOption ? (
      <activeOption.icon className="tiptap-button-icon" />
    ) : (
      <BoldIcon className="tiptap-button-icon" />
    )
  }, [editor, filteredFormats])
}

export function TextFormatDropdownMenu({
  editor: providedEditor,
  formats = ["bold", "italic", "underline", "strike"],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: TextFormatDropdownMenuProps) {
  const editor = useTiptapEditor(providedEditor)

  const {
    isOpen,
    formatsInSchema,
    filteredFormats,
    canSetAny,
    isAnyActive,
    handleOpenChange,
  } = useTextFormatDropdownState(editor, formats)

  const getActiveIcon = useActiveTextFormatIcon(editor, filteredFormats)

  const show = React.useMemo(() => {
    return shouldShowTextFormatDropdown({
      editor,
      formats,
      hideWhenUnavailable,
      formatsInSchema,
      canSetAny,
    })
  }, [editor, formats, hideWhenUnavailable, formatsInSchema, canSetAny])

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => handleOpenChange(open, onOpenChange),
    [handleOpenChange, onOpenChange]
  )

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={isAnyActive ? "on" : "off"}
          role="button"
          tabIndex={-1}
          aria-label="Text formatting options"
          tooltip="Text Format"
          {...props}
        >
          {getActiveIcon()}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          {filteredFormats.map((option) => (
            <DropdownMenuItem key={option.mark} asChild>
              <MarkButton
                editor={editor}
                type={option.mark}
                text={option.label}
                hideWhenUnavailable={hideWhenUnavailable}
                tooltip=""
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TextFormatDropdownMenu