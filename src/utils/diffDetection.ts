/**
 * @fileoverview Diff detection utilities
 *
 * Provides functions for detecting, normalizing, and extracting diff markers
 * from HTML content. Supports multiple marker formats including HTML tags,
 * data attributes, and highlight colors.
 */
import { DiffMarkerResult, DiffMarker } from '@/types/diff.types';

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
export const detectDiffMarkers = (content: string): DiffMarkerResult => {
  try {
    const hasDiffs =
      /<(ins|del)\b/i.test(content) ||
      /data-color="#c7f0d6ff"/i.test(content) ||
      /data-color="#fecaca"/i.test(content) ||
      /data-pending-delete="true"/i.test(content) ||
      /data-pending-insert="true"/i.test(content);

    const markers: DiffMarker[] = [];

    if (!hasDiffs) {
      return { hasDiffs: false, markers: [] };
    }

    // Detect ins tags
    const insRegex = /<ins\b[^>]*>([\s\S]*?)<\/ins>/gi;
    let match;
    while ((match = insRegex.exec(content)) !== null) {
      markers.push({
        type: 'insertion',
        from: match.index,
        to: match.index + match[0].length
      });
    }

    // Detect del tags
    const delRegex = /<del\b[^>]*>([\s\S]*?)<\/del>/gi;
    while ((match = delRegex.exec(content)) !== null) {
      markers.push({
        type: 'deletion',
        from: match.index,
        to: match.index + match[0].length
      });
    }

    // Detect green highlights
    const greenRegex = /data-color="#c7f0d6ff"/i;
    if (greenRegex.test(content)) {
      markers.push({
        type: 'highlight',
        color: '#c7f0d6ff'
      });
    }

    // Detect red highlights
    const redRegex = /data-color="#fecaca"/i;
    if (redRegex.test(content)) {
      markers.push({
        type: 'highlight',
        color: '#fecaca'
      });
    }

    return { hasDiffs: true, markers };
  } catch (error) {
    console.warn('Diff detection failed:', error);
    return { hasDiffs: false, markers: [] };
  }
};

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
export const normalizeDiffText = (text: string): string => {
  try {
    return text
      .normalize('NFD')
      // Remove diacritics
      .replace(/[\u0300-\u036f]/g, '')
      // Normalize dashes
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
      // Normalize spaces
      .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
      // Normalize quotes
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      // Remove zero-width
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Collapse spaces
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.warn('Text normalization failed:', error);
    return text;
  }
};

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
export const extractDiffRanges = (_content: string) => {
  // Placeholder - will implement in next iteration
  return [];
};
