import { SpacingOptions, ContentCleanupOptions } from '../types';
/**
 * Normalize whitespace in text
 * - Replaces multiple spaces with single space
 * - Preserves line breaks
 * - Trims leading/trailing whitespace
 */
export declare function normalizeWhitespace(text: string): string;
/**
 * Remove extra line breaks (more than specified maximum)
 */
export declare function removeExtraLineBreaks(text: string, maxConsecutive?: number): string;
/**
 * Clean up empty paragraphs from HTML
 */
export declare function cleanupEmptyParagraphs(html: string, keepMinimum?: number): string;
/**
 * Clean up HTML spacing with various options
 */
export declare function cleanupHtmlSpacing(html: string, options?: SpacingOptions): string;
/**
 * Format content with comprehensive cleanup
 */
export declare function formatContent(content: string, options?: ContentCleanupOptions): string;
/**
 * Remove all formatting from text (strip HTML)
 */
export declare function stripHtml(html: string): string;
/**
 * Check if content is effectively empty
 */
export declare function isContentEmpty(content: string): boolean;
/**
 * Get word count from HTML content
 */
export declare function getWordCount(html: string): number;
/**
 * Get character count from HTML content
 */
export declare function getCharacterCount(html: string, includeSpaces?: boolean): number;
//# sourceMappingURL=spacing-utils.d.ts.map