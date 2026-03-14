/**
 * Type definitions for editor formatting utilities
 */

// Image Types
export type ImageAlignment = 'left' | 'center' | 'right'

export interface ImageAttributes {
  src: string
  alt?: string
  title?: string
  width?: string | number
  height?: string | number
  dataAlign?: ImageAlignment
}

export interface ImageWithCaptionAttributes extends ImageAttributes {
  caption?: string
  captionPlacement?: 'above' | 'below'
}

// Table Types
export interface TableAttributes {
  rows?: number
  cols?: number
  withHeaderRow?: boolean
}

export interface TableCellAttributes {
  colspan?: number
  rowspan?: number
  backgroundColor?: string
  borderColor?: string
}

// Spacing Types
export interface SpacingOptions {
  /** Remove extra line breaks (more than 2 consecutive) */
  removeExtraLineBreaks?: boolean
  /** Remove empty paragraphs */
  removeEmptyParagraphs?: boolean
  /** Normalize whitespace (multiple spaces to single) */
  normalizeWhitespace?: boolean
  /** Trim leading/trailing whitespace */
  trimContent?: boolean
}

export interface ContentCleanupOptions extends SpacingOptions {
  /** Remove inline styles */
  removeInlineStyles?: boolean
  /** Remove empty spans */
  removeEmptySpans?: boolean
  /** Convert br tags to proper paragraphs */
  convertBrToParagraphs?: boolean
  /** Remove font tags and keep content */
  removeFontTags?: boolean
  /** Remove class attributes */
  removeClassAttributes?: boolean
}

// Editor Commands
export interface ImageCommand {
  setImage: (options: ImageAttributes) => boolean
  setImageAlignment: (alignment: ImageAlignment) => boolean
  setImageSize: (width: string | number, height?: string | number) => boolean
  setImageCaption: (caption: string) => boolean
  removeImage: () => boolean
}

export interface TableCommand {
  insertTable: (options: TableAttributes) => boolean
  deleteTable: () => boolean
  addRowBefore: () => boolean
  addRowAfter: () => boolean
  addColumnBefore: () => boolean
  addColumnAfter: () => boolean
  deleteRow: () => boolean
  deleteColumn: () => boolean
  mergeCells: () => boolean
  splitCell: () => boolean
  setCellBackground: (color: string) => boolean
}
