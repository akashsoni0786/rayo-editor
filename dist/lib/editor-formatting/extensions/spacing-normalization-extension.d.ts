import { Extension } from '@tiptap/core';
import { SpacingOptions } from '../types';
export interface SpacingNormalizationOptions extends SpacingOptions {
    /** Auto-cleanup on paste */
    cleanupOnPaste?: boolean;
    /** Auto-cleanup on input */
    cleanupOnInput?: boolean;
    /** Maximum consecutive empty lines */
    maxConsecutiveEmptyLines?: number;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        spacingNormalization: {
            /**
             * Normalize all spacing in the document
             */
            normalizeSpacing: () => ReturnType;
            /**
             * Remove all empty paragraphs
             */
            removeEmptyParagraphs: () => ReturnType;
            /**
             * Remove extra line breaks (more than max allowed)
             */
            removeExtraLineBreaks: () => ReturnType;
            /**
             * Clean up the entire document
             */
            cleanupDocument: () => ReturnType;
        };
    }
}
export declare const SpacingNormalizationExtension: Extension<SpacingNormalizationOptions, any>;
export default SpacingNormalizationExtension;
//# sourceMappingURL=spacing-normalization-extension.d.ts.map