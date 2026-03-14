import { CodeBlockOperation, DiffPair } from '../types/diff.types';
/**
 * Groups consecutive code blocks based on their positions
 * Code blocks are considered consecutive if the next one starts where the previous one ends
 */
export declare const groupConsecutiveCodeBlocks: (codeBlocks: CodeBlockOperation[]) => CodeBlockOperation[][];
/**
 * Matches code block deletions with corresponding insertions
 * Creates DiffPair objects showing the relationship between old and new code blocks
 */
export declare const matchCodeBlockReplacements: (deletions: CodeBlockOperation[], insertions: CodeBlockOperation[]) => DiffPair[];
//# sourceMappingURL=codeBlockHandling.d.ts.map