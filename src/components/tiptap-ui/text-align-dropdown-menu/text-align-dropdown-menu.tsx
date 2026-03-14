import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon"
import { AlignCenterIcon } from "../../tiptap-icons/align-center-icon"
import { AlignJustifyIcon } from "../../tiptap-icons/align-justify-icon"
import { AlignLeftIcon } from "../../tiptap-icons/align-left-icon"
import { AlignRightIcon } from "../../tiptap-icons/align-right-icon"

// --- Tiptap UI ---
import {
  TextAlignButton,
  type TextAlign,
  checkTextAlignExtension,
  isTextAlignActive,
  canSetTextAlign,
} from "../text-align-button/text-align-button"

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

export interface TextAlignDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor
  /**
   * The text alignment options to display in the dropdown.
   */
  alignments?: TextAlign[]
  /**
   * Whether the dropdown should be hidden when no alignment options are available
   * @default false
   */
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const textAlignOptions = [
  {
    align: "left" as TextAlign,
    label: "Align left",
    icon: AlignLeftIcon,
  },
  {
    align: "center" as TextAlign,
    label: "Align center", 
    icon: AlignCenterIcon,
  },
  {
    align: "right" as TextAlign,
    label: "Align right",
    icon: AlignRightIcon,
  },
  {
    align: "justify" as TextAlign,
    label: "Align justify",
    icon: AlignJustifyIcon,
  },
]

export function canSetAnyTextAlign(
  editor: Editor | null,
  alignments: TextAlign[]
): boolean {
  if (!editor) return false
  const alignAvailable = checkTextAlignExtension(editor)
  return alignments.some((align) => canSetTextAlign(editor, align, alignAvailable))
}

export function isAnyTextAlignActive(
  editor: Editor | null,
  alignments: TextAlign[]
): boolean {
  if (!editor) return false
  return alignments.some((align) => isTextAlignActive(editor, align))
}

export function getFilteredTextAlignOptions(
  availableAlignments: TextAlign[]
): typeof textAlignOptions {
  return textAlignOptions.filter((option) =>
    availableAlignments.includes(option.align)
  )
}

export function shouldShowTextAlignDropdown(params: {
  editor: Editor | null
  alignments: TextAlign[]
  hideWhenUnavailable: boolean
  alignInSchema: boolean
  canSetAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, alignInSchema, canSetAny } = params

  if (!alignInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable) {
    if (!canSetAny) {
      return false
    }
  }

  return true
}

export function useTextAlignDropdownState(
  editor: Editor | null,
  availableAlignments: TextAlign[]
) {
  const [isOpen, setIsOpen] = React.useState(false)

  const alignInSchema = React.useMemo(
    () => checkTextAlignExtension(editor),
    [editor]
  )

  const filteredAlignments = React.useMemo(
    () => getFilteredTextAlignOptions(availableAlignments),
    [availableAlignments]
  )

  const canSetAny = canSetAnyTextAlign(editor, availableAlignments)
  const isAnyActive = isAnyTextAlignActive(editor, availableAlignments)

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
    alignInSchema,
    filteredAlignments,
    canSetAny,
    isAnyActive,
    handleOpenChange,
  }
}

export function useActiveTextAlignIcon(
  editor: Editor | null,
  filteredAlignments: typeof textAlignOptions
) {
  return React.useCallback(() => {
    const activeOption = filteredAlignments.find((option) =>
      isTextAlignActive(editor, option.align)
    )

    return activeOption ? (
      <activeOption.icon className="tiptap-button-icon" />
    ) : (
      <AlignLeftIcon className="tiptap-button-icon" />
    )
  }, [editor, filteredAlignments])
}

export function TextAlignDropdownMenu({
  editor: providedEditor,
  alignments = ["left", "center", "right", "justify"],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: TextAlignDropdownMenuProps) {
  const editor = useTiptapEditor(providedEditor)

  const {
    isOpen,
    alignInSchema,
    filteredAlignments,
    canSetAny,
    isAnyActive,
    handleOpenChange,
  } = useTextAlignDropdownState(editor, alignments)

  const getActiveIcon = useActiveTextAlignIcon(editor, filteredAlignments)

  const show = React.useMemo(() => {
    return shouldShowTextAlignDropdown({
      editor,
      alignments,
      hideWhenUnavailable,
      alignInSchema,
      canSetAny,
    })
  }, [editor, alignments, hideWhenUnavailable, alignInSchema, canSetAny])

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
          aria-label="Text alignment options"
          tooltip="Text Align"
          {...props}
        >
          {getActiveIcon()}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          {filteredAlignments.map((option) => (
            <DropdownMenuItem key={option.align} asChild>
              <TextAlignButton
                editor={editor}
                align={option.align}
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

export default TextAlignDropdownMenu