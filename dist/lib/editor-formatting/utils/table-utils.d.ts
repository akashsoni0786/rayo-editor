import { Editor } from '@tiptap/react';
import { TableAttributes } from '../types';
/**
 * Insert a table at the current cursor position
 */
export declare function insertTable(editor: Editor | null, options?: TableAttributes): boolean;
/**
 * Delete the current table
 */
export declare function deleteTable(editor: Editor | null): boolean;
/**
 * Add a row before the current row
 */
export declare function addTableRow(editor: Editor | null, position?: 'before' | 'after'): boolean;
/**
 * Add a column before or after the current column
 */
export declare function addTableColumn(editor: Editor | null, position?: 'before' | 'after'): boolean;
/**
 * Delete the current row
 */
export declare function deleteTableRow(editor: Editor | null): boolean;
/**
 * Delete the current column
 */
export declare function deleteTableColumn(editor: Editor | null): boolean;
/**
 * Merge selected cells
 */
export declare function mergeCells(editor: Editor | null): boolean;
/**
 * Split the current cell
 */
export declare function splitCell(editor: Editor | null): boolean;
/**
 * Set background color for the current cell
 */
export declare function setTableCellBackground(editor: Editor | null, color: string): boolean;
/**
 * Get attributes of the current table
 */
export declare function getTableAttributes(editor: Editor | null): TableAttributes | null;
/**
 * Check if the current selection is inside a table
 */
export declare function isInTable(editor: Editor | null): boolean;
/**
 * Check if a table can be inserted at the current position
 */
export declare function canInsertTable(editor: Editor | null): boolean;
/**
 * Toggle header row for the current table
 */
export declare function toggleHeaderRow(editor: Editor | null): boolean;
/**
 * Toggle header column for the current table
 */
export declare function toggleHeaderColumn(editor: Editor | null): boolean;
/**
 * Fix tables (repair invalid table structure)
 */
export declare function fixTables(editor: Editor | null): boolean;
/**
 * Go to next cell in table
 */
export declare function goToNextCell(editor: Editor | null): boolean;
/**
 * Go to previous cell in table
 */
export declare function goToPreviousCell(editor: Editor | null): boolean;
/**
 * Set cell alignment
 */
export declare function setCellAlignment(editor: Editor | null, align: 'left' | 'center' | 'right'): boolean;
/**
 * Set cell vertical alignment
 */
export declare function setCellVerticalAlignment(editor: Editor | null, align: 'top' | 'middle' | 'bottom'): boolean;
/**
 * Get table dimensions (rows and columns count)
 */
export declare function getTableDimensions(editor: Editor | null): {
    rows: number;
    cols: number;
} | null;
//# sourceMappingURL=table-utils.d.ts.map