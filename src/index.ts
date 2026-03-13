/**
 * @fileoverview rayo-editor - A professional-grade rich text editor for React
 *
 * This module provides a complete rich text editing solution with:
 * - Full HTML editing with TipTap
 * - Diff highlighting and review UI
 * - Image and table support
 * - TypeScript definitions
 * - Comprehensive utilities
 *
 * @example
 * ```tsx
 * import { RayoEditor } from 'rayo-editor';
 * import 'rayo-editor/styles';
 *
 * <RayoEditor
 *   content={content}
 *   title={title}
 *   onChange={setContent}
 *   onTitleChange={setTitle}
 *   isLoading={false}
 *   editorRef={editorRef}
 * />
 * ```
 */

// Export components
/**
 * Main Rayo Editor component - a drop-in rich blog editor
 * Features diff highlighting, review UI, and full content control
 */
export { RayoEditor } from './components';

/**
 * Legacy BlogEditor component - alias for RayoEditor
 * Maintained for backward compatibility
 * @deprecated Use RayoEditor instead
 */
export { BlogEditor } from './components';

/**
 * Standalone title input component
 * Supports read-only mode and custom change callbacks
 */
export { TitleTextarea } from './components';

/**
 * Visual overlay for displaying diff highlights
 * Shows green additions and red deletions with interactive hover/click
 */
export { DiffOverlay } from './components';

/**
 * Accept/reject buttons for review operations
 * Positioned absolutely with configurable placement
 */
export { ReviewButtons } from './components';

/**
 * Image loading state indicator with Rive animation
 */
export { ImageGenerationLoader } from './components';

// Export hooks
/**
 * Hook for managing diff detection and overlay state
 * Tracks diff pairs, active indices, and hover states
 *
 * @example
 * ```tsx
 * const {
 *   diffPairs,
 *   activePairIndex,
 *   updateDiffRanges
 * } = useEditorDiff(editorRef, { focusMode: false });
 * ```
 */
export { useEditorDiff } from './hooks';

/**
 * Hook for processing and transforming editor content
 * Handles content state, processing flags, and error management
 *
 * @example
 * ```tsx
 * const { content, isProcessing, error, processContent } = useContentProcessing();
 * ```
 */
export { useContentProcessing } from './hooks';

// Export utilities
/**
 * Detect diff markers in HTML content
 * Returns markers for insertions, deletions, and highlights
 *
 * @example
 * ```tsx
 * const { hasDiffs, markers } = detectDiffMarkers(content);
 * ```
 */
export { detectDiffMarkers } from './utils';

/**
 * Normalize diff text for consistent comparison
 * Strips HTML tags and normalizes whitespace
 */
export { normalizeDiffText } from './utils';

/**
 * Extract diff ranges from content
 * Returns arrays of {from, to} positions for changes
 */
export { extractDiffRanges } from './utils';

/**
 * Merge consecutive or overlapping ranges
 * Optimizes ranges for rendering and processing
 */
export { mergeConsecutiveRanges } from './utils';

/**
 * Extract plain text from HTML content
 * Removes all tags and returns readable text
 */
export { extractTextContent } from './utils';

/**
 * Optimize ranges for rendering performance
 * Removes overlaps and sorts by position
 */
export { optimizeRanges } from './utils';

/**
 * Group consecutive images in content
 * Returns array of image operations with positions
 */
export { groupConsecutiveImages } from './utils';

/**
 * Match image replacements in diff pairs
 * Identifies old→new image mappings
 */
export { matchImageReplacements } from './utils';

/**
 * Calculate proximity score between text segments
 * Returns 0-1 similarity score
 */
export { calculateProximity } from './utils';

/**
 * Find the best matching text pair from candidates
 * Uses proximity matching for robust matching
 */
export { findOwnerTextPair } from './utils';

/**
 * Group consecutive items by similarity
 * Returns grouped arrays of related items
 */
export { groupConsecutiveItems } from './utils';

/**
 * Custom error class for diff processing failures
 * Extends Error with original error chain
 */
export { DiffProcessingError } from './utils';

/**
 * Safely execute a function with error handling
 * Returns result or null if error occurs
 *
 * @example
 * ```tsx
 * const result = safeExecute(() => riskyOperation());
 * ```
 */
export { safeExecute } from './utils';

// Export types
/**
 * Props for the RayoEditor component
 * Includes all configuration, state, and callback options
 */
export type { RayoEditorProps } from './types/editor.types';

/**
 * Reference object for BlogSimpleEditor instance
 * Provides access to underlying TipTap editor
 */
export type { BlogSimpleEditorRef } from './types/editor.types';

/**
 * Props for the TitleTextarea component
 */
export type { TitleTextareaProps } from './types/editor.types';

/**
 * Props for the DiffOverlay component
 */
export type { DiffOverlayProps } from './types/editor.types';

/**
 * Props for the ReviewButtons component
 */
export type { ReviewButtonsProps } from './types/editor.types';

/**
 * Represents a text range with start and end positions
 */
export type { DiffRange } from './types/diff.types';

/**
 * Represents a pair of diff ranges (old and new content)
 */
export type { DiffPair } from './types/diff.types';

/**
 * Rectangle coordinates for positioning overlays
 */
export type { DiffRect } from './types/diff.types';

/**
 * Marker indicating a diff location in content
 */
export type { DiffMarker } from './types/diff.types';

/**
 * Result object from diff marker detection
 */
export type { DiffMarkerResult } from './types/diff.types';

/**
 * Operation representing an image change
 */
export type { ImageOperation } from './types/diff.types';

/**
 * Operation representing a table change
 */
export type { TableOperation } from './types/diff.types';

/**
 * Operation representing a code block change
 */
export type { CodeBlockOperation } from './types/diff.types';

/**
 * Highlight information for rendering
 */
export type { HighlightInfo } from './types/diff.types';
