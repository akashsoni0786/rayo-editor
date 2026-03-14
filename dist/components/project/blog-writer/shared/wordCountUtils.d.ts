import { Editor } from '@tiptap/react';
/**
 * Core MS Word algorithm for counting words from plain text
 * This is the single source of truth for word counting logic
 *
 * MS Word Rules:
 * - Words separated by spaces
 * - Hyphenated words count as multiple words (mother-in-law = 3 words)
 * - Numbers count as words
 * - Contractions count as 1 word (don't, it's, etc.)
 * - Leading/trailing punctuation is ignored
 *
 * @param plainText - Text to count (already extracted from HTML or editor)
 * @returns word count number
 */
export declare const countWordsFromText: (plainText: string) => number;
/**
 * Calculate word count from editor using MS Word algorithm
 * @param editor - TipTap editor instance
 * @returns word count number
 */
export declare const calculateWordCount: (editor: Editor | null) => number;
/**
 * Calculate word count from HTML content using MS Word algorithm
 * Removes HTML tags first, then counts using the same logic
 * @param htmlContent - HTML text to count
 * @returns word count number
 */
export declare const countWordsFromHtml: (htmlContent: string) => number;
//# sourceMappingURL=wordCountUtils.d.ts.map