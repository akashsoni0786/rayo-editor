/**
 * Spacing and Content Cleanup Utilities
 *
 * Functions for cleaning up and normalizing content spacing in the editor
 */

import type { SpacingOptions, ContentCleanupOptions } from '../types'

/**
 * Normalize whitespace in text
 * - Replaces multiple spaces with single space
 * - Preserves line breaks
 * - Trims leading/trailing whitespace
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return ''

  // Replace multiple spaces (but not newlines) with single space
  let normalized = text.replace(/[^\S\n]+/g, ' ')

  // Normalize different types of line breaks
  normalized = normalized.replace(/\r\n/g, '\n')
  normalized = normalized.replace(/\r/g, '\n')

  return normalized
}

/**
 * Remove extra line breaks (more than specified maximum)
 */
export function removeExtraLineBreaks(text: string, maxConsecutive = 2): string {
  if (!text) return ''

  // Create regex for more than maxConsecutive newlines
  const regex = new RegExp(`\n{${maxConsecutive + 1},}`, 'g')
  const replacement = '\n'.repeat(maxConsecutive)

  return text.replace(regex, replacement)
}

/**
 * Clean up empty paragraphs from HTML
 */
export function cleanupEmptyParagraphs(html: string, keepMinimum = 1): string {
  if (!html) return ''

  // Match empty paragraphs (with optional whitespace)
  const emptyParagraphRegex = /<p[^>]*>\s*<\/p>/gi

  let result = html
  let emptyCount = 0

  // Count and replace empty paragraphs
  result = result.replace(emptyParagraphRegex, (match) => {
    emptyCount++
    if (emptyCount <= keepMinimum) {
      return match // Keep this one
    }
    return '' // Remove extra ones
  })

  return result
}

/**
 * Clean up HTML spacing with various options
 */
export function cleanupHtmlSpacing(
  html: string,
  options: SpacingOptions = {}
): string {
  if (!html) return ''

  const {
    removeExtraLineBreaks: shouldRemoveLineBreaks = true,
    normalizeWhitespace: shouldNormalizeWhitespace = true,
    removeEmptyParagraphs: shouldRemoveEmptyParagraphs = true,
    trimContent = true,
  } = options

  let result = html

  // Remove excessive empty paragraphs
  if (shouldRemoveEmptyParagraphs) {
    result = cleanupEmptyParagraphs(result, 1)
  }

  // Remove excessive &nbsp;
  result = result.replace(/(&nbsp;){3,}/g, '&nbsp;&nbsp;')

  // Normalize line breaks in text content
  if (shouldRemoveLineBreaks) {
    // Replace multiple <br> tags with single
    result = result.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
  }

  // Normalize whitespace between tags
  if (shouldNormalizeWhitespace) {
    // Remove whitespace between tags
    result = result.replace(/>\s+</g, '><')
    // But preserve some spacing in text content
    result = result.replace(/\s{2,}/g, ' ')
  }

  // Trim
  if (trimContent) {
    result = result.trim()
  }

  return result
}

/**
 * Format content with comprehensive cleanup
 */
export function formatContent(
  content: string,
  options: ContentCleanupOptions = {}
): string {
  if (!content) return ''

  const {
    removeExtraLineBreaks: shouldRemoveLineBreaks = true,
    normalizeWhitespace: shouldNormalizeWhitespace = true,
    removeEmptyParagraphs: shouldRemoveEmptyParagraphs = true,
    trimContent = true,
    removeInlineStyles = false,
    removeEmptySpans = true,
    convertBrToParagraphs = false,
    removeFontTags = true,
    removeClassAttributes = false,
  } = options

  let result = content

  // Remove font tags but keep content
  if (removeFontTags) {
    result = result.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, '$1')
  }

  // Remove empty spans
  if (removeEmptySpans) {
    result = result.replace(/<span[^>]*>\s*<\/span>/gi, '')
  }

  // Remove inline styles
  if (removeInlineStyles) {
    result = result.replace(/\s*style="[^"]*"/gi, '')
  }

  // Remove class attributes
  if (removeClassAttributes) {
    result = result.replace(/\s*class="[^"]*"/gi, '')
  }

  // Convert br to paragraphs
  if (convertBrToParagraphs) {
    // Replace double br with paragraph break
    result = result.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>')
  }

  // Apply spacing cleanup
  result = cleanupHtmlSpacing(result, {
    removeExtraLineBreaks: shouldRemoveLineBreaks,
    normalizeWhitespace: shouldNormalizeWhitespace,
    removeEmptyParagraphs: shouldRemoveEmptyParagraphs,
    trimContent,
  })

  return result
}

/**
 * Remove all formatting from text (strip HTML)
 */
export function stripHtml(html: string): string {
  if (!html) return ''

  // Create a temporary element to parse HTML
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Fallback for non-browser environments
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * Check if content is effectively empty
 */
export function isContentEmpty(content: string): boolean {
  if (!content) return true

  const stripped = stripHtml(content)
  return stripped.trim().length === 0
}

/**
 * Get word count from HTML content
 */
export function getWordCount(html: string): number {
  const text = stripHtml(html)
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length
}

/**
 * Get character count from HTML content
 */
export function getCharacterCount(html: string, includeSpaces = true): number {
  const text = stripHtml(html)
  if (includeSpaces) {
    return text.length
  }
  return text.replace(/\s/g, '').length
}
