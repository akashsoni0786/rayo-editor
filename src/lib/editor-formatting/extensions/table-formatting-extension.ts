/**
 * Table Formatting Extension
 *
 * Extends TipTap table functionality with enhanced formatting:
 * - Cell background colors
 * - Border customization
 * - Table alignment
 * - Responsive table handling
 */

import { Extension } from '@tiptap/core'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

export interface TableFormattingOptions {
  /** Default cell padding */
  cellPadding?: string
  /** Default border color */
  borderColor?: string
  /** Default header background color */
  headerBackgroundColor?: string
  /** Enable resizable columns */
  resizable?: boolean
  /** Allow nested tables */
  allowNested?: boolean
  /** HTML attributes */
  HTMLAttributes?: Record<string, unknown>
}

// Extended Table Cell with additional attributes
const ExtendedTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {}
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },

      borderColor: {
        default: null,
        parseHTML: (element) => element.style.borderColor || null,
        renderHTML: (attributes) => {
          if (!attributes.borderColor) return {}
          return {
            style: `border-color: ${attributes.borderColor}`,
          }
        },
      },

      textAlign: {
        default: 'left',
        parseHTML: (element) => element.style.textAlign || 'left',
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {}
          return {
            style: `text-align: ${attributes.textAlign}`,
          }
        },
      },

      verticalAlign: {
        default: 'top',
        parseHTML: (element) => element.style.verticalAlign || 'top',
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {}
          return {
            style: `vertical-align: ${attributes.verticalAlign}`,
          }
        },
      },
    }
  },
})

// Extended Table Header with styling
const ExtendedTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      backgroundColor: {
        default: '#f8f9fa',
        parseHTML: (element) => element.style.backgroundColor || '#f8f9fa',
        renderHTML: (attributes) => {
          return {
            style: `background-color: ${attributes.backgroundColor || '#f8f9fa'}`,
          }
        },
      },

      textAlign: {
        default: 'left',
        parseHTML: (element) => element.style.textAlign || 'left',
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {}
          return {
            style: `text-align: ${attributes.textAlign}`,
          }
        },
      },
    }
  },
})

// Extended Table with additional attributes
const ExtendedTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      tableWidth: {
        default: '100%',
        parseHTML: (element) => element.style.width || '100%',
        renderHTML: (attributes) => {
          return {
            style: `width: ${attributes.tableWidth}`,
          }
        },
      },

      tableAlign: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          const marginStyle =
            attributes.tableAlign === 'center'
              ? 'margin-left: auto; margin-right: auto;'
              : attributes.tableAlign === 'right'
                ? 'margin-left: auto;'
                : ''
          return {
            'data-align': attributes.tableAlign,
            style: marginStyle,
          }
        },
      },

      borderCollapse: {
        default: 'collapse',
        parseHTML: (element) => element.style.borderCollapse || 'collapse',
        renderHTML: (attributes) => {
          return {
            style: `border-collapse: ${attributes.borderCollapse}`,
          }
        },
      },
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableFormatting: {
      /**
       * Set cell background color
       */
      setCellBackgroundColor: (color: string) => ReturnType
      /**
       * Set cell text alignment
       */
      setCellTextAlign: (align: 'left' | 'center' | 'right') => ReturnType
      /**
       * Set cell vertical alignment
       */
      setCellVerticalAlign: (align: 'top' | 'middle' | 'bottom') => ReturnType
      /**
       * Set table width
       */
      setTableWidth: (width: string) => ReturnType
      /**
       * Set table alignment
       */
      setTableAlign: (align: 'left' | 'center' | 'right') => ReturnType
      /**
       * Clear cell formatting
       */
      clearCellFormatting: () => ReturnType
    }
  }
}

export const TableFormattingExtension = Extension.create<TableFormattingOptions>({
  name: 'tableFormatting',

  addOptions() {
    return {
      cellPadding: '8px',
      borderColor: '#dee2e6',
      headerBackgroundColor: '#f8f9fa',
      resizable: true,
      allowNested: false,
      HTMLAttributes: {},
    }
  },

  addExtensions() {
    return [
      ExtendedTable.configure({
        resizable: this.options.resizable,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'formatted-table',
          style: `border-collapse: collapse; width: 100%;`,
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'formatted-table-row',
        },
      }),
      ExtendedTableHeader.configure({
        HTMLAttributes: {
          class: 'formatted-table-header',
          style: `
            background-color: ${this.options.headerBackgroundColor};
            padding: ${this.options.cellPadding};
            border: 1px solid ${this.options.borderColor};
            font-weight: 600;
          `,
        },
      }),
      ExtendedTableCell.configure({
        HTMLAttributes: {
          class: 'formatted-table-cell',
          style: `
            padding: ${this.options.cellPadding};
            border: 1px solid ${this.options.borderColor};
          `,
        },
      }),
    ]
  },

  addCommands() {
    return {
      setCellBackgroundColor:
        (color: string) =>
        ({ chain }) => {
          return chain().updateAttributes('tableCell', { backgroundColor: color }).run()
        },

      setCellTextAlign:
        (align: 'left' | 'center' | 'right') =>
        ({ chain }) => {
          return chain().updateAttributes('tableCell', { textAlign: align }).run()
        },

      setCellVerticalAlign:
        (align: 'top' | 'middle' | 'bottom') =>
        ({ chain }) => {
          return chain().updateAttributes('tableCell', { verticalAlign: align }).run()
        },

      setTableWidth:
        (width: string) =>
        ({ chain }) => {
          return chain().updateAttributes('table', { tableWidth: width }).run()
        },

      setTableAlign:
        (align: 'left' | 'center' | 'right') =>
        ({ chain }) => {
          return chain().updateAttributes('table', { tableAlign: align }).run()
        },

      clearCellFormatting:
        () =>
        ({ chain }) => {
          return chain()
            .updateAttributes('tableCell', {
              backgroundColor: null,
              borderColor: null,
              textAlign: 'left',
              verticalAlign: 'top',
            })
            .run()
        },
    }
  },
})

export default TableFormattingExtension
