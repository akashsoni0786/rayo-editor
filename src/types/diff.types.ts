// src/types/diff.types.ts

export interface DiffRange {
  from: number;
  to: number;
}

export interface DiffRect {
  top: number;
  left: number;
  width: number;
  bottom: number;
  right: number;
}

export interface DiffPair {
  // Content ranges
  redRange?: DiffRange;
  greenRange?: DiffRange;

  // Visual positioning
  rect: DiffRect;
  lastGreenRect: DiffRect;

  // Content type flags
  isTextOnly?: boolean;
  isImageDeletion?: boolean;
  isImageInsertion?: boolean;
  isImageReplacement?: boolean;
  isTableDeletion?: boolean;
  isTableInsertion?: boolean;
  isTableReplacement?: boolean;
  isCodeBlockDeletion?: boolean;
  isCodeBlockInsertion?: boolean;
  isCodeBlockReplacement?: boolean;

  // Combination flags
  includesImageDeletion?: boolean;
  includesImageInsertion?: boolean;
  isImageReplacedByText?: boolean;
  isTextReplacedByImage?: boolean;

  includesTableDeletion?: boolean;
  includesTableInsertion?: boolean;
  isTableReplacedByText?: boolean;
  isTextReplacedByTable?: boolean;
  tableIsBeforeText?: boolean;

  includesCodeBlockDeletion?: boolean;
  includesCodeBlockInsertion?: boolean;
  isCodeBlockReplacedByText?: boolean;
  isTextReplacedByCode?: boolean;
  codeBlockIsBeforeText?: boolean;

  includesTextInsertion?: boolean;
  imageIsLastInPair?: boolean;
  firstGreenBlockEnd?: number;

  // Image count
  newImagesCount?: number;
}

export interface DiffMarker {
  type: 'insertion' | 'deletion' | 'highlight';
  color?: string;
  from?: number;
  to?: number;
}

export interface DiffMarkerResult {
  hasDiffs: boolean;
  markers: DiffMarker[];
}

export interface ImageOperation {
  pos: number;
  nodeSize: number;
  rect: DiffRect;
  pendingDelete?: boolean;
  pendingInsert?: boolean;
}

export interface TableOperation {
  pos: number;
  nodeSize: number;
  rect: DiffRect;
  pendingDelete?: boolean;
  pendingInsert?: boolean;
}

export interface CodeBlockOperation {
  pos: number;
  nodeSize: number;
  rect: DiffRect;
  language?: string;
  pendingDelete?: boolean;
  pendingInsert?: boolean;
}

export interface HighlightInfo {
  from: number;
  to: number;
  color: '#c7f0d6ff' | '#fecaca';
  rect: DiffRect;
}
