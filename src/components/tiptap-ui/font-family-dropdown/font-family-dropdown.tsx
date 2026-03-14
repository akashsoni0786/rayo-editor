import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon"

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button"
import { Button } from "../../tiptap-ui-primitive/button"

export interface FontFamilyDropdownProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
  /** Custom font options to override defaults */
  customFonts?: FontOption[]
  /** Whether to show font previews in dropdown */
  showPreviews?: boolean
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

const categories = ['Default', 'Sans-serif', 'Serif', 'Monospace']

export function FontFamilyDropdown({
  editor: providedEditor,
  hideWhenUnavailable = false,
  customFonts,
  showPreviews = true,
  onOpenChange,
  ...props
}: FontFamilyDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchText, setSearchText] = React.useState("")
  const [selectedFont, setSelectedFont] = React.useState<FontOption>(fontOptions[0])
  const editor = useTiptapEditor(providedEditor)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  // Use custom fonts if provided, otherwise use defaults
  const availableFonts = customFonts || fontOptions

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
      if (!open) {
        setSearchText("")
      }
    },
    [onOpenChange]
  )

  // Update selected font when editor selection changes
  React.useEffect(() => {
    const updateSelectedFont = () => {
      if (!editor) return
      
      const attrs = editor.getAttributes('textStyle')
      const fontFamily = attrs.fontFamily || ''
      
      // Find matching font from available options
      const foundFont = availableFonts.find(option => {
        if (fontFamily && option.value) {
          return fontFamily.includes(option.value.split(',')[0])
        }
        return fontFamily === option.value
      })
      
      setSelectedFont(foundFont || availableFonts[0])
    }
    
    if (editor) {
      updateSelectedFont()
      
      const handleUpdate = () => updateSelectedFont()
      editor.on('selectionUpdate', handleUpdate)
      editor.on('transaction', handleUpdate)
      
      return () => {
        editor.off('selectionUpdate', handleUpdate)
        editor.off('transaction', handleUpdate)
      }
    }
  }, [editor])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleOnOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleOnOpenChange])

  // Apply selected font to text using official TipTap commands
  const handleFontChange = (option: FontOption) => {
    if (!editor) return
    
    if (option.value === '') {
      // Use official unsetFontFamily() command from TipTap documentation
      editor.chain().focus().unsetFontFamily().run()
    } else {
      // Use official setFontFamily() command from TipTap documentation
      editor.chain().focus().setFontFamily(option.value).run()
    }
    
    setSelectedFont(option)
    handleOnOpenChange(false)
  }

  // Filter fonts based on search text
  const getFilteredFonts = () => {
    if (!searchText) {
      return availableFonts
    }
    
    return availableFonts.filter(font => 
      font.label.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  if (!editor || !editor.isEditable) {
    return null
  }

  const filteredFonts = getFilteredFonts()

  return (
    <div className="font-family-dropdown-container" ref={dropdownRef}>
      <Button
        type="button"
        data-style="ghost"
        data-active-state={selectedFont.value ? "on" : "off"}
        role="button"
        tabIndex={-1}
        aria-label="Change font family"
        onClick={() => handleOnOpenChange(!isOpen)}
        tooltip="Font family"
        className="font-family-trigger"
        {...props}
      >
        <span 
          className="font-family-label"
          style={{ fontFamily: selectedFont.value || 'inherit' }}
        >
          {selectedFont.label}
        </span>
        <ChevronDownIcon className="tiptap-button-dropdown-small" />
      </Button>

      {isOpen && (
        <div className="font-family-dropdown">
          {/* Search Input */}
          <div className="font-search-container">
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="font-search-input"
              autoFocus
            />
          </div>

          {/* Font Options */}
          <div className="font-options-container">
            {searchText ? (
              // Show all matching fonts without categories when searching
              filteredFonts.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleFontChange(option)}
                  className={`font-option ${option.value === selectedFont.value ? 'is-active' : ''}`}
                  style={{ fontFamily: option.value || 'inherit' }}
                >
                  <span className="font-option-label">{option.label}</span>
                  {option.value === selectedFont.value && (
                    <span className="font-option-check">✓</span>
                  )}
                </button>
              ))
            ) : (
              // Show categorized list when not searching
              categories.map(category => {
                const fontsInCategory = availableFonts.filter(
                  font => font.category === category
                )
                
                if (fontsInCategory.length === 0) return null
                
                return (
                  <div key={category} className="font-category">
                    <div className="font-category-label">{category}</div>
                    {fontsInCategory.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleFontChange(option)}
                        className={`font-option ${option.value === selectedFont.value ? 'is-active' : ''}`}
                        style={{ fontFamily: option.value || 'inherit' }}
                      >
                        <span className="font-option-label">{option.label}</span>
                        {option.value === selectedFont.value && (
                          <span className="font-option-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Utility functions following TipTap documentation patterns
export const FontFamilyUtils = {
  /**
   * Check if a font family is active in the editor
   * @param editor TipTap editor instance
   * @param fontFamily Font family string to check
   */
  isFontFamilyActive: (editor: Editor | null, fontFamily: string): boolean => {
    if (!editor) return false
    const attrs = editor.getAttributes('textStyle')
    return attrs.fontFamily === fontFamily
  },

  /**
   * Apply font family using official TipTap command
   * @param editor TipTap editor instance
   * @param fontFamily Font family string to apply
   */
  setFontFamily: (editor: Editor | null, fontFamily: string): boolean => {
    if (!editor) return false
    return editor.chain().focus().setFontFamily(fontFamily).run()
  },

  /**
   * Remove font family using official TipTap command
   * @param editor TipTap editor instance
   */
  unsetFontFamily: (editor: Editor | null): boolean => {
    if (!editor) return false
    return editor.chain().focus().unsetFontFamily().run()
  },

  /**
   * Get current font family from editor
   * @param editor TipTap editor instance
   */
  getCurrentFontFamily: (editor: Editor | null): string => {
    if (!editor) return ''
    const attrs = editor.getAttributes('textStyle')
    return attrs.fontFamily || ''
  }
}

// Export as named export only