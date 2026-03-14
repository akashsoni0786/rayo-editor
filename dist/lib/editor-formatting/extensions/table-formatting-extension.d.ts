import { Extension } from '@tiptap/core';
export interface TableFormattingOptions {
    /** Default cell padding */
    cellPadding?: string;
    /** Default border color */
    borderColor?: string;
    /** Default header background color */
    headerBackgroundColor?: string;
    /** Enable resizable columns */
    resizable?: boolean;
    /** Allow nested tables */
    allowNested?: boolean;
    /** HTML attributes */
    HTMLAttributes?: Record<string, unknown>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        tableFormatting: {
            /**
             * Set cell background color
             */
            setCellBackgroundColor: (color: string) => ReturnType;
            /**
             * Set cell text alignment
             */
            setCellTextAlign: (align: 'left' | 'center' | 'right') => ReturnType;
            /**
             * Set cell vertical alignment
             */
            setCellVerticalAlign: (align: 'top' | 'middle' | 'bottom') => ReturnType;
            /**
             * Set table width
             */
            setTableWidth: (width: string) => ReturnType;
            /**
             * Set table alignment
             */
            setTableAlign: (align: 'left' | 'center' | 'right') => ReturnType;
            /**
             * Clear cell formatting
             */
            clearCellFormatting: () => ReturnType;
        };
    }
}
export declare const TableFormattingExtension: Extension<TableFormattingOptions, any>;
export default TableFormattingExtension;
//# sourceMappingURL=table-formatting-extension.d.ts.map