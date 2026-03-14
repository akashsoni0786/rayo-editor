import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Styles ---
import "./font-family-dropdown-menu.scss"

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon"

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button"
import { Button } from "../../tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../../tiptap-ui-primitive/dropdown-menu"

export interface FontFamilyDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

interface FontOption {
  value: string
  label: string
  category: string
}

// Comprehensive font list organized by category
const fontOptions: FontOption[] = [
  // Default
  { value: '', label: 'Default', category: 'Default' },
  
  // Sans-serif fonts
  { value: 'Inter, sans-serif', label: 'Inter', category: 'Sans-serif' },
  { value: 'Arial, sans-serif', label: 'Arial', category: 'Sans-serif' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', category: 'Sans-serif' },
  { value: 'Roboto, sans-serif', label: 'Roboto', category: 'Sans-serif' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'Lato, sans-serif', label: 'Lato', category: 'Sans-serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Nunito, sans-serif', label: 'Nunito', category: 'Sans-serif' },
  { value: 'Poppins, sans-serif', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro', category: 'Sans-serif' },
  
  // Serif fonts
  { value: 'Times New Roman, serif', label: 'Times New Roman', category: 'Serif' },
  { value: 'Georgia, serif', label: 'Georgia', category: 'Serif' },
  { value: 'Merriweather, serif', label: 'Merriweather', category: 'Serif' },
  { value: 'Lora, serif', label: 'Lora', category: 'Serif' },
  { value: 'Playfair Display, serif', label: 'Playfair Display', category: 'Serif' },
  { value: 'Source Serif Pro, serif', label: 'Source Serif Pro', category: 'Serif' },
  { value: 'PT Serif, serif', label: 'PT Serif', category: 'Serif' },
  
  // Monospace fonts
  { value: 'Courier New, monospace', label: 'Courier New', category: 'Monospace' },
  { value: 'Monaco, monospace', label: 'Monaco', category: 'Monospace' },
  { value: 'Fira Code, monospace', label: 'Fira Code', category: 'Monospace' },
  { value: 'Source Code Pro, monospace', label: 'Source Code Pro', category: 'Monospace' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono', category: 'Monospace' },
  { value: 'Roboto Mono, monospace', label: 'Roboto Mono', category: 'Monospace' },
]

export function FontFamilyDropdownMenu({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: FontFamilyDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  const getCurrentFont = React.useCallback(() => {
    if (!editor) return fontOptions[0]

    const attrs = editor.getAttributes('textStyle')
    const fontFamily = attrs.fontFamily || ''
    
    // Find matching font from our options
    const foundFont = fontOptions.find(option => {
      if (fontFamily && option.value) {
        return fontFamily.includes(option.value.split(',')[0])
      }
      return fontFamily === option.value
    })
    
    return foundFont || fontOptions[0]
  }, [editor])

  const handleFontChange = (option: FontOption) => {
    if (!editor) return
    
    if (option.value === '') {
      editor.chain().focus().unsetFontFamily().run()
    } else {
      editor.chain().focus().setFontFamily(option.value).run()
    }
  }

  const canChangeFontFamily = React.useCallback((): boolean => {
    if (!editor) return false
    return editor.can().setFontFamily('Arial')
  }, [editor])

  const isDisabled = !canChangeFontFamily()
  const currentFont = getCurrentFont()
  const isFontActive = currentFont.value !== ''

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={isFontActive ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Change font family"
          aria-pressed={isFontActive}
          tooltip="Font family"
          className="font-family-dropdown-trigger"
          {...props}
        >
          <span 
            className="font-family-label"
            style={{ fontFamily: currentFont.value || 'inherit' }}
          >
            {currentFont.label}
          </span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="font-family-dropdown-content">
        <DropdownMenuGroup>
          {fontOptions.map((option) => (
            <DropdownMenuItem key={option.label} asChild>
              <Button
                type="button"
                data-style="ghost"
                data-active-state={option.value === currentFont.value ? "on" : "off"}
                onClick={() => handleFontChange(option)}
                className="dropdown-menu-item-button font-family-option"
              >
                <span 
                  className="font-family-option-label"
                  style={{ fontFamily: option.value || 'inherit' }}
                >
                  {option.label}
                </span>
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FontFamilyDropdownMenu