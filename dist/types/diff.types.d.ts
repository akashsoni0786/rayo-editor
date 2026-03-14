/**
 * Diff types for table and code block handling
 */
export interface Range {
    from: number;
    to: number;
}
export interface Rect {
    top: number;
    left: number;
    width: number;
    bottom: number;
    right: number;
}
export interface TableOperation {
    pos: number;
    nodeSize: number;
    rect: Rect;
}
export interface CodeBlockOperation {
    pos: number;
    nodeSize: number;
    rect: Rect;
}
export interface DiffPair {
    redRange?: Range;
    greenRange?: Range;
    rect: Rect;
    lastGreenRect: Rect;
    isImageDeletion?: boolean;
    isImageReplacement?: boolean;
    isTableDeletion?: boolean;
    isTableReplacement?: boolean;
    isCodeBlockDeletion?: boolean;
    isCodeBlockReplacement?: boolean;
}
//# sourceMappingURL=diff.types.d.ts.map