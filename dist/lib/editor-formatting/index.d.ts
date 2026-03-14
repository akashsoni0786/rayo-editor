/**
 * Comprehensive Editor Formatting Utilities
 *
 * This module provides all the formatting utilities needed for the TipTap editor including:
 * - Image resizing and alignment
 * - Image with caption support
 * - Table formatting
 * - Spacing normalization
 * - Content cleanup utilities
 *
 * @example
 * ```tsx
 * import {
 *   ResizableImageWithCaptionExtension,
 *   TableFormattingExtension,
 *   SpacingNormalizationExtension,
 *   setImageAlignment,
 *   formatContent,
 * } from '@/lib/editor-formatting'
 *
 * // Use in TipTap editor
 * const editor = useEditor({
 *   extensions: [
 *     StarterKit,
 *     ResizableImageWithCaptionExtension.configure({
 *       defaultAlignment: 'center',
 *       defaultCaptionPlacement: 'below',
 *     }),
 *     TableFormattingExtension.configure({
 *       resizable: true,
 *       headerBackgroundColor: '#f8f9fa',
 *     }),
 *     SpacingNormalizationExtension.configure({
 *       cleanupOnPaste: true,
 *       maxConsecutiveEmptyLines: 2,
 *     }),
 *   ],
 * })
 * ```
 *
 * @example
 * ```tsx
 * // Image alignment
 * setImageAlignment(editor, 'left')   // Float left
 * setImageAlignment(editor, 'center') // Center
 * setImageAlignment(editor, 'right')  // Float right
 *
 * // Image sizing
 * setImageSize(editor, '50%')         // 50% width
 * setImageSize(editor, 300, 200)      // 300x200 pixels
 *
 * // Image caption
 * setImageCaption(editor, 'My caption')
 * ```
 *
 * @example
 * ```tsx
 * // Table operations
 * insertTable(editor, { rows: 3, cols: 3, withHeaderRow: true })
 * addTableRow(editor, 'after')
 * addTableColumn(editor, 'before')
 * mergeCells(editor)
 * setTableCellBackground(editor, '#f0f0f0')
 * ```
 *
 * @example
 * ```tsx
 * // Content cleanup
 * const cleanedHtml = formatContent(dirtyHtml, {
 *   removeExtraLineBreaks: true,
 *   normalizeWhitespace: true,
 *   removeEmptyParagraphs: true,
 *   removeInlineStyles: true,
 * })
 * ```
 */
export { ResizableImageWithCaptionExtension } from './extensions/resizable-image-caption-extension';
export type { ResizableImageWithCaptionOptions } from './extensions/resizable-image-caption-extension';
export { TableFormattingExtension } from './extensions/table-formatting-extension';
export type { TableFormattingOptions } from './extensions/table-formatting-extension';
export { SpacingNormalizationExtension } from './extensions/spacing-normalization-extension';
export type { SpacingNormalizationOptions } from './extensions/spacing-normalization-extension';
export { ResizableImageWithCaption } from './nodes/resizable-image-caption-node';
export { cleanupHtmlSpacing, normalizeWhitespace, removeExtraLineBreaks, cleanupEmptyParagraphs, formatContent, stripHtml, isContentEmpty, getWordCount, getCharacterCount, } from './utils/spacing-utils';
export { setImageAlignment, setImageSize, setImageCaption, removeImage, getImageAttributes, isImageSelected, insertImage, calculateResponsiveSize, pixelsToPercentage, percentageToPixels, parseWidthValue, isValidImageUrl, getImageDimensions, } from './utils/image-utils';
export { insertTable, deleteTable, addTableRow, addTableColumn, deleteTableRow, deleteTableColumn, mergeCells, splitCell, setTableCellBackground, getTableAttributes, isInTable, canInsertTable, toggleHeaderRow, toggleHeaderColumn, fixTables, goToNextCell, goToPreviousCell, setCellAlignment, setCellVerticalAlignment, getTableDimensions, } from './utils/table-utils';
export type { ImageAlignment, ImageAttributes, ImageWithCaptionAttributes, TableAttributes, TableCellAttributes, SpacingOptions, ContentCleanupOptions, ImageCommand, TableCommand, } from './types';
//# sourceMappingURL=index.d.ts.map