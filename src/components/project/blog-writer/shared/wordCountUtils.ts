/**
 * Consistent word count calculation used across all components
 * Ensures Left Panel (BlogSidebar) and Chat Panel (AgentChatPanel) use exact same logic
 */

import type { Editor } from '@tiptap/react';

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
export const countWordsFromText = (plainText: string): number => {
  if (!plainText) return 0;

  const text = plainText.trim();
  if (!text) return 0;

  let wordCount = 0;

  // Split on whitespace - these are the main word units
  const tokens = text.split(/\s+/);

  // Unicode-aware regex: \p{L} matches any letter (Latin, Devanagari, Arabic, CJK, etc.)
  // \p{N} matches any numeric digit. This ensures non-English words are counted properly.
  const punctuationTrimStart = /^[^\p{L}\p{N}\-']+/u;
  const punctuationTrimEnd = /[^\p{L}\p{N}\-']+$/u;
  const hasLetterOrDigit = /[\p{L}\p{N}]/u;

  for (const token of tokens) {
    if (!token) continue;

    // Remove leading and trailing punctuation
    // But keep hyphens and apostrophes as they're part of word structure
    const trimmed = token.replace(punctuationTrimStart, '').replace(punctuationTrimEnd, '');

    if (!trimmed) continue;

    // Check if it contains hyphens - these split words
    // e.g., "mother-in-law" = 3 words, "up-to-date" = 3 words
    if (trimmed.includes('-')) {
      // Split by hyphen and count non-empty parts
      const parts = trimmed.split('-').filter(part => {
        // Each part should have at least one letter or digit (Unicode-aware)
        return hasLetterOrDigit.test(part);
      });
      wordCount += Math.max(1, parts.length);
    } else {
      // Single word (may have apostrophes like "don't", "it's", etc.)
      wordCount += 1;
    }
  }

  return wordCount;
};

/**
 * Calculate word count from editor using MS Word algorithm
 * @param editor - TipTap editor instance
 * @returns word count number
 */
export const calculateWordCount = (editor: Editor | null): number => {
  if (!editor) return 0;
  const text = editor.getText().trim();
  return countWordsFromText(text);
};

/**
 * Calculate word count from HTML content using MS Word algorithm
 * Removes HTML tags first, then counts using the same logic
 * @param htmlContent - HTML text to count
 * @returns word count number
 */
export const countWordsFromHtml = (htmlContent: string): number => {
  if (!htmlContent) return 0;
  // Remove HTML tags and keep only text content
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').trim();
  return countWordsFromText(plainText);
};
