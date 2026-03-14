// @ts-nocheck
import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon"
import { TableIcon } from "../../tiptap-icons/table-icon"

// --- Lib ---
import { isNodeInSchema } from "../../../lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button"
import { Button } from "../../tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../tiptap-ui-primitive/dropdown-menu"

export interface TableDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor
  /**
   * Whether the dropdown should be hidden when no table functionality is available
   * @default false
   */
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function canUseTable(editor: Editor | null): boolean {
  if (!editor) return false
  // Always return true if table is in schema, even if inside a table
  return isNodeInSchema('table', editor)
}

export function isTableActive(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive('table')
}

export function shouldShowTableDropdown(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  tableInSchema: boolean
  canUseTable: boolean
}): boolean {
  const { editor, tableInSchema } = params

  if (!tableInSchema || !editor) {
    return false
  }

  // Always show the table button, even when inside a table
  return true
}

export function useTableDropdownState(editor: Editor | null) {
  const [isOpen, setIsOpen] = React.useState(false)

  const tableInSchema = isNodeInSchema('table', editor)
  const canUseTableFeature = canUseTable(editor)
  const isActive = isTableActive(editor)

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
    tableInSchema,
    canUseTableFeature,
    isActive,
    handleOpenChange,
  }
}

export function TableDropdownMenu({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: TableDropdownMenuProps) {
  const editor = useTiptapEditor(providedEditor)

  const {
    isOpen,
    tableInSchema,
    canUseTableFeature,
    isActive,
    handleOpenChange,
  } = useTableDropdownState(editor)

  // Grid selector state
  const [gridSize, setGridSize] = React.useState({ rows: 10, cols: 10 })
  const [hovered, setHovered] = React.useState({ rows: 0, cols: 0 })

  const show = React.useMemo(() => {
    return shouldShowTableDropdown({
      editor,
      hideWhenUnavailable,
      tableInSchema,
      canUseTable: canUseTableFeature,
    })
  }, [editor, hideWhenUnavailable, tableInSchema, canUseTableFeature])

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      handleOpenChange(open, onOpenChange)
      // Reset grid when closing
      if (!open) {
        setGridSize({ rows: 10, cols: 10 })
        setHovered({ rows: 0, cols: 0 })
      }
    },
    [handleOpenChange, onOpenChange]
  )

  const handleCellHover = (row: number, col: number) => {
    // Expand grid if hovering on edge
    if (row === gridSize.rows) {
      setGridSize(prev => ({ ...prev, rows: Math.min(row + 1, 10) }))
    }
    if (col === gridSize.cols) {
      setGridSize(prev => ({ ...prev, cols: Math.min(col + 1, 10) }))
    }
    setHovered({ rows: row, cols: col })
  }

  const handleCellClick = (row: number, col: number) => {
    editor?.chain().focus().insertTable({ rows: row, cols: col, withHeaderRow: false }).run()
    setIsOpen(false)
  }

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  // Disable button when inside a table (use bubble menu instead)
  const isInTable = editor.isActive('table')
  const isDisabled = isInTable

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state="off"
          role="button"
          tabIndex={-1}
          aria-label="Insert Table"
          tooltip="Table"
          disabled={isDisabled}
          {...props}
        >
          <TableIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {/* Grid Selector - Only for inserting new tables */}
        <div style={{ padding: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Array.from({ length: gridSize.rows }, (_, rowIndex) => rowIndex + 1).map((row) => (
              <div key={`row-${row}`} style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: gridSize.cols }, (_, colIndex) => colIndex + 1).map((col) => (
                  <div
                    key={`col-${col}`}
                    onMouseDown={() => handleCellClick(row, col)}
                    onMouseOver={() => handleCellHover(row, col)}
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      backgroundColor: col <= hovered.cols && row <= hovered.rows ? '#5E33FF' : 'transparent',
                      transition: 'background-color 0.1s'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            {hovered.rows > 0 && hovered.cols > 0 ? `${hovered.rows} × ${hovered.cols}` : 'Select table size'}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableDropdownMenu