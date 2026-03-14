/**
 * Table Utility Functions
 *
 * Helper functions for working with tables in the TipTap editor
 */

import type { Editor } from '@tiptap/react'
import type { TableAttributes, TableCellAttributes } from '../types'

/**
 * Insert a table at the current cursor position
 */
export function insertTable(
  editor: Editor | null,
  options: TableAttributes = {}
): boolean {
  if (!editor) return false

  const { rows = 3, cols = 3, withHeaderRow = true } = options

  return editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow })
    .run()
}

/**
 * Delete the current table
 */
export function deleteTable(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().deleteTable()) {
    return false
  }

  return editor.chain().focus().deleteTable().run()
}

/**
 * Add a row before the current row
 */
export function addTableRow(
  editor: Editor | null,
  position: 'before' | 'after' = 'after'
): boolean {
  if (!editor) return false

  if (position === 'before') {
    if (!editor.can().addRowBefore()) return false
    return editor.chain().focus().addRowBefore().run()
  }

  if (!editor.can().addRowAfter()) return false
  return editor.chain().focus().addRowAfter().run()
}

/**
 * Add a column before or after the current column
 */
export function addTableColumn(
  editor: Editor | null,
  position: 'before' | 'after' = 'after'
): boolean {
  if (!editor) return false

  if (position === 'before') {
    if (!editor.can().addColumnBefore()) return false
    return editor.chain().focus().addColumnBefore().run()
  }

  if (!editor.can().addColumnAfter()) return false
  return editor.chain().focus().addColumnAfter().run()
}

/**
 * Delete the current row
 */
export function deleteTableRow(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().deleteRow()) return false
  return editor.chain().focus().deleteRow().run()
}

/**
 * Delete the current column
 */
export function deleteTableColumn(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().deleteColumn()) return false
  return editor.chain().focus().deleteColumn().run()
}

/**
 * Merge selected cells
 */
export function mergeCells(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().mergeCells()) return false
  return editor.chain().focus().mergeCells().run()
}

/**
 * Split the current cell
 */
export function splitCell(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().splitCell()) return false
  return editor.chain().focus().splitCell().run()
}

/**
 * Set background color for the current cell
 */
export function setTableCellBackground(
  editor: Editor | null,
  color: string
): boolean {
  if (!editor) return false

  return editor
    .chain()
    .focus()
    .updateAttributes('tableCell', { backgroundColor: color })
    .run()
}

/**
 * Get attributes of the current table
 */
export function getTableAttributes(editor: Editor | null): TableAttributes | null {
  if (!editor) return null

  if (!editor.isActive('table')) {
    return null
  }

  const { state } = editor
  const { selection } = state

  // Find the table node
  let tableNode = null
  state.doc.nodesBetween(selection.from, selection.to, (node) => {
    if (node.type.name === 'table') {
      tableNode = node
      return false
    }
    return true
  })

  if (!tableNode) return null

  return (tableNode as any).attrs as TableAttributes
}

/**
 * Check if the current selection is inside a table
 */
export function isInTable(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive('table')
}

/**
 * Check if a table can be inserted at the current position
 */
export function canInsertTable(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.can().insertTable({ rows: 3, cols: 3 })
}

/**
 * Toggle header row for the current table
 */
export function toggleHeaderRow(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().toggleHeaderRow()) return false
  return editor.chain().focus().toggleHeaderRow().run()
}

/**
 * Toggle header column for the current table
 */
export function toggleHeaderColumn(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().toggleHeaderColumn()) return false
  return editor.chain().focus().toggleHeaderColumn().run()
}

/**
 * Fix tables (repair invalid table structure)
 */
export function fixTables(editor: Editor | null): boolean {
  if (!editor) return false

  // @ts-expect-error - fixTables may not be typed
  if (!editor.can().fixTables?.()) return false
  // @ts-expect-error - fixTables may not be typed
  return editor.chain().focus().fixTables?.().run() || false
}

/**
 * Go to next cell in table
 */
export function goToNextCell(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().goToNextCell()) return false
  return editor.chain().focus().goToNextCell().run()
}

/**
 * Go to previous cell in table
 */
export function goToPreviousCell(editor: Editor | null): boolean {
  if (!editor) return false

  if (!editor.can().goToPreviousCell()) return false
  return editor.chain().focus().goToPreviousCell().run()
}

/**
 * Set cell alignment
 */
export function setCellAlignment(
  editor: Editor | null,
  align: 'left' | 'center' | 'right'
): boolean {
  if (!editor) return false

  return editor
    .chain()
    .focus()
    .updateAttributes('tableCell', { textAlign: align })
    .run()
}

/**
 * Set cell vertical alignment
 */
export function setCellVerticalAlignment(
  editor: Editor | null,
  align: 'top' | 'middle' | 'bottom'
): boolean {
  if (!editor) return false

  return editor
    .chain()
    .focus()
    .updateAttributes('tableCell', { verticalAlign: align })
    .run()
}

/**
 * Get table dimensions (rows and columns count)
 */
export function getTableDimensions(
  editor: Editor | null
): { rows: number; cols: number } | null {
  if (!editor || !editor.isActive('table')) return null

  const { state } = editor
  const { selection } = state

  let rowCount = 0
  let colCount = 0

  state.doc.nodesBetween(selection.from, selection.to, (node) => {
    if (node.type.name === 'table') {
      rowCount = node.childCount

      // Get column count from first row
      const firstRow = node.firstChild
      if (firstRow) {
        colCount = firstRow.childCount
      }

      return false
    }
    return true
  })

  return { rows: rowCount, cols: colCount }
}
