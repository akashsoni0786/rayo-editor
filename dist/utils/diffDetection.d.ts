import { DiffMarkerResult } from '../types/diff.types';
/**
 * Detect diff markers in HTML content
 *
 * Identifies insertions, deletions, and highlights using multiple detection methods:
 * - <ins> and <del> HTML tags
 * - data-color attributes for green (#c7f0d6ff) and red (#fecaca) highlights
 * - data-pending-insert and data-pending-delete attributes
 *
 * @param content - HTML content to scan for diff markers
 * @returns Result object with hasDiffs flag and array of markers found
 *
 * @example
 * ```tsx
 * const content = '<ins>new text</ins> and <del>old text</del>';
 * const { hasDiffs, markers } = detectDiffMarkers(content);
 * console.log(hasDiffs); // true
 * console.log(markers.length); // 2
 * ```
 *
 * @example
 * Check for specific highlight colors:
 * ```tsx
 * const { hasDiffs, markers } = detectDiffMarkers(content);
 * const greenMarkers = markers.filter(m => m.color === '#c7f0d6ff');
 * const redMarkers = markers.filter(m => m.color === '#fecaca');
 * ```
 */
export declare const detectDiffMarkers: (content: string) => DiffMarkerResult;
/**
 * Normalize diff text for consistent comparison
 *
 * Performs Unicode normalization and standardization:
 * - Removes diacritics (é → e, ñ → n)
 * - Normalizes dash variants (em-dash, en-dash → hyphen)
 * - Standardizes whitespace (non-breaking space, em-space → regular space)
 * - Normalizes quote variants (curly quotes → straight quotes)
 * - Removes zero-width characters
 * - Collapses multiple spaces into single space
 *
 * @param text - Text to normalize
 * @returns Normalized text suitable for comparison
 *
 * @example
 * ```tsx
 * const text = 'Café — hello\u00A0world';
 * const normalized = normalizeDiffText(text);
 * console.log(normalized); // 'Cafe - hello world'
 * ```
 *
 * @example
 * Compare diff texts reliably:
 * ```tsx
 * const oldText = 'Résumé – 2026';
 * const newText = 'Resume - 2026';
 * normalizeDiffText(oldText) === normalizeDiffText(newText); // true
 * ```
 */
export declare const normalizeDiffText: (text: string) => string;
/**
 * Extract diff ranges from HTML content
 *
 * Parses content to find all diff ranges and returns them as position pairs.
 * Can filter by type to get only insertions, deletions, or all changes.
 *
 * @param _content - HTML content to extract ranges from
 * @param _type - Optional filter: 'all' (default), 'green' (additions), 'red' (deletions)
 * @returns Array of {from, to} ranges indicating diff locations
 *
 * @example
 * ```tsx
 * const content = '<ins>new</ins> text <del>old</del>';
 * const ranges = extractDiffRanges(content);
 * // Returns positions of insertions and deletions
 * ```
 *
 * @example
 * Filter by type:
 * ```tsx
 * const additions = extractDiffRanges(content, 'green');
 * const deletions = extractDiffRanges(content, 'red');
 * ```
 */
export declare const extractDiffRanges: (_content: string) => never[];
//# sourceMappingURL=diffDetection.d.ts.map