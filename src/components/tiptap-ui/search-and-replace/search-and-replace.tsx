import * as React from "react"
import { type Editor } from "@tiptap/react"
import { ChevronUp, ChevronDown, X } from "lucide-react"

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Lib ---
import { isNodeInSchema } from "../../../lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button"
import { Button } from "../../tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../../tiptap-ui-primitive/dropdown-menu"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"

export interface SearchAndReplaceProps extends Omit<ButtonProps, "type"> {
  editor?: Editor
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function useSearchAndReplaceState(editor: Editor | null) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [replaceTerm, setReplaceTerm] = React.useState("")
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [resultText, setResultText] = React.useState("")

  const updateResultText = React.useCallback(() => {
    if (!editor) {
      setResultText("")
      return
    }
    const storage = editor.storage.searchAndReplace

    // If no results, show empty
    if (!storage.results || storage.results.length === 0) {
      setResultText("")
      return
    }

    const text = `${storage.resultIndex + 1}/${storage.results.length}`
    setResultText(text)
  }, [editor])

  React.useEffect(() => {
    if (editor) {
      updateResultText()
    }
  }, [editor, updateResultText])

  const search = React.useCallback(
    (resetIndex = false) => {
      if (!editor) return

      if (resetIndex) {
        editor.commands.resetIndex()
      }
      editor.commands.setSearchTerm(searchTerm)
      editor.commands.setReplaceTerm(replaceTerm)
      editor.commands.setCaseSensitive(caseSensitive)
      updateResultText()
    },
    [editor, searchTerm, replaceTerm, caseSensitive, updateResultText]
  )

  const scrollToResult = React.useCallback(() => {
    if (!editor) return

    const { results, resultIndex } = editor.storage.searchAndReplace
    const result = results[resultIndex]

    if (!result) return

    // Set text selection to the current result
    editor.commands.setTextSelection(result)

    // Scroll into view
    const { node } = editor.view.domAtPos(editor.state.selection.anchor)
    if (node instanceof HTMLElement) {
      node.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    updateResultText()
  }, [editor, updateResultText])

  // Auto-search when search term changes
  React.useEffect(() => {
    if (!editor) return

    if (!searchTerm.trim()) {
      // Clear search in editor
      editor.commands.setSearchTerm("")
      editor.commands.resetIndex()
      setResultText("")
    } else {
      search(true)
    }
  }, [searchTerm, editor])

  // Update search when replace term changes
  React.useEffect(() => {
    if (replaceTerm.trim()) {
      search()
    }
  }, [replaceTerm])

  // Update search when case sensitivity changes
  React.useEffect(() => {
    if (searchTerm.trim()) {
      search(true)
    }
  }, [caseSensitive])

  const replace = React.useCallback(() => {
    if (!editor) return
    editor.commands.replace()
    scrollToResult()
  }, [editor, scrollToResult])

  const replaceAll = React.useCallback(() => {
    if (!editor) return
    editor.commands.replaceAll()
    setResultText("")
  }, [editor])

  const nextResult = React.useCallback(() => {
    if (!editor) return
    editor.commands.nextSearchResult()
    scrollToResult()
  }, [editor, scrollToResult])

  const previousResult = React.useCallback(() => {
    if (!editor) return
    editor.commands.previousSearchResult()
    scrollToResult()
  }, [editor, scrollToResult])

  const clear = React.useCallback(() => {
    if (!editor) return
    setSearchTerm("")
    setReplaceTerm("")
    editor.commands.setSearchTerm("")
    editor.commands.resetIndex()
    setResultText("")
  }, [editor])

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
    searchTerm,
    setSearchTerm,
    replaceTerm,
    setReplaceTerm,
    caseSensitive,
    setCaseSensitive,
    resultText,
    replace,
    replaceAll,
    nextResult,
    previousResult,
    clear,
    handleOpenChange,
  }
}

export function SearchAndReplace({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: SearchAndReplaceProps) {
  const editor = useTiptapEditor(providedEditor)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const {
    isOpen,
    searchTerm,
    setSearchTerm,
    replaceTerm,
    setReplaceTerm,
    caseSensitive,
    setCaseSensitive,
    resultText,
    replace,
    replaceAll,
    nextResult,
    previousResult,
    clear,
    handleOpenChange,
  } = useSearchAndReplaceState(editor)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      handleOpenChange(open, onOpenChange)
      // Focus the search input when opening
      if (open) {
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }
    },
    [handleOpenChange, onOpenChange]
  )

  // Add keyboard shortcut for Cmd+F / Ctrl+F
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+F (Mac) or Ctrl+F (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault() // Prevent default browser find
        handleOnOpenChange(true) // Open the find & replace dropdown
      }
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        handleOnOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleOnOpenChange, isOpen])

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-size="sm"
          data-active-state="off"
          role="button"
          tabIndex={-1}
          aria-label="Find and Replace"
          tooltip="Find & Replace"
          {...props}
        >
          <svg
            className="tiptap-button-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="M9 11h4" />
          </svg>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-96 p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search Section */}
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm font-semibold">Find</Label>
          <span className="text-xs font-medium text-gray-500">{resultText==""?"0/0":resultText}</span>
        </div>

        <div className="mb-4 flex w-full items-center gap-1">
          <Input
            ref={searchInputRef}
            className="flex-1 min-w-0 h-8 text-sm"
            placeholder="Search text..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') {
                e.preventDefault()
                nextResult()
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
          <ChevronUp
            size={16}
            strokeWidth={2}
            onClick={previousResult}
            className={`flex-shrink-0 cursor-pointer ${!searchTerm ? 'opacity-40 cursor-not-allowed' : 'hover:text-gray-700'}`}
            title="Previous"
          />
          <ChevronDown
            size={16}
            strokeWidth={2}
            onClick={nextResult}
            className={`flex-shrink-0 cursor-pointer ${!searchTerm ? 'opacity-40 cursor-not-allowed' : 'hover:text-gray-700'}`}
            title="Next"
          />
          <X
            size={16}
            strokeWidth={2}
            onClick={clear}
            className={`flex-shrink-0 cursor-pointer ${!searchTerm ? 'opacity-40 cursor-not-allowed' : 'hover:text-gray-700'}`}
            title="Clear"
          />
        </div>

        {/* Replace Section */}
        <Label className="mb-2 text-sm font-semibold">Replace</Label>
        <div className="mb-3 flex w-full items-center">
          <Input
            className="w-full h-8 text-sm"
            placeholder="Replace with..."
            type="text"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter' && searchTerm && replaceTerm) {
                e.preventDefault()
                replace()
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Case Sensitive Option */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="case-sensitive"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <Label htmlFor="case-sensitive" className="text-sm cursor-pointer">
            Case sensitive
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            className="flex-1 h-8 text-sm"
            data-size="sm"
            onClick={replace}
            disabled={!searchTerm || !replaceTerm}
          >
            Replace
          </Button>
          <Button
            className="flex-1 h-8 text-sm"
            data-size="sm"
            onClick={replaceAll}
            disabled={!searchTerm || !replaceTerm}
          >
            Replace All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SearchAndReplace
