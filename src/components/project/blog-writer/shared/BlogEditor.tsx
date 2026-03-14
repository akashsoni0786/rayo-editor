import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BlogSimpleEditor, BlogSimpleEditorRef } from '../../../tiptap-templates/simple/blog-simple-editor';
import CustomEditorSkeleton from '../../../shared/editor/CustomEditorSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { useRive } from '@rive-app/react-canvas';
import glowRiv from '../../../../assests/riv_animations/glow.riv';
import ImageGenerationLoader from './ImageGenerationLoader';

export interface BlogEditorProps {
  editorRef: React.RefObject<BlogSimpleEditorRef>;
  content: string;
  isLoading: boolean;
  title: string;
  onChange: (content: string) => void;
  onTitleChange?: (title: string) => void;
  isStreaming?: boolean;
  isAgentThinking?: boolean;
  streamingPhase?: string;
  showToolbarAnimation?: boolean;
  readOnly?: boolean;
  onAriScoreChange?: (score: number) => void;
  disableAutoScroll?: boolean;
  onUserScrollChange?: (isScrolledUp: boolean) => void;
  // Review props
  pendingChanges?: boolean;
  onAcceptChanges?: () => void;
  onRejectChanges?: () => void;
  editedLinesCount?: number;
  hideReviewUI?: boolean;
  showDiffs?: boolean;
  // Focus mode - hides toolbar and accept/reject banner
  focusMode?: boolean;
  // Individual change handlers (for per-change accept/discard)
  // Unified handlers - work for ALL content types (text, image, code block, table, list, and any combination)
  onAcceptSingleChange?: (greenRange: {from: number, to: number}, redRange?: {from: number, to: number}) => void;
  onRejectSingleChange?: (greenRange: {from: number, to: number}, redRange?: {from: number, to: number}) => void;
  // Callback to notify parent of diffPairs changes (for minimap integration)
  onDiffPairsChange?: (diffPairs: any[]) => void;
  // Featured image URL to display between title and content (non-editable)
  featuredImageUrl?: string;
  // Callback when user clicks edit on the featured image
  onEditFeaturedImage?: () => void;
  // Whether a featured image is currently being generated
  isGeneratingImage?: boolean;
  // Pass to enable Media Library image picker in toolbar
  projectId?: string;
  images?: any[];
  isLoadingImages?: boolean;
  onUpload?: (formData: FormData) => Promise<any>;
  // AI request handler - Rayo_dev handles auth + endpoint, rayo-editor handles UI
  onAIRequest?: (payload: { text: string; option: string; projectId: string; beforeContext?: string; afterContext?: string }) => Promise<Response>;
}

const DiscardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.25 15.75V2.25H12.5325L15.75 5.4675V15.75H2.25ZM2.25 15.75H15.75M5.99625 2.25V5.99625M5.99625 2.25H11.9962M11.9962 2.25V5.99625M5.25 15.75V9H12.75V15.75" stroke="#AFB0B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AcceptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M9 15.75V15.75C5.27175 15.75 2.25 12.7282 2.25 9V9C2.25 5.27175 5.27175 2.25 9 2.25V2.25C12.7282 2.25 15.75 5.27175 15.75 9V9C15.75 12.7282 12.7282 15.75 9 15.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M12 7.5L8.25 11.25L6 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

);

// Title textarea component with resize observer to handle container width changes
const TitleTextarea: React.FC<{
  title: string;
  onTitleChange?: (title: string) => void;
  readOnly?: boolean;
}> = ({ title, onTitleChange, readOnly }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Adjust height on mount and when title changes
  useEffect(() => {
    adjustHeight();
  }, [title, adjustHeight]);

  // Use ResizeObserver to adjust height when container width changes (e.g., focus mode toggle)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce the resize to avoid excessive recalculations during animation
      requestAnimationFrame(adjustHeight);
    });

    // Observe the textarea's parent container for width changes
    const container = textarea.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => resizeObserver.disconnect();
  }, [adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={title}
      onChange={(e) => {
        onTitleChange?.(e.target.value);
        adjustHeight();
      }}
      onInput={adjustHeight}
      placeholder="Enter blog title..."
      className="w-full text-[26px] font-bold leading-[140%] tracking-[-0.02em] text-[#182234] bg-transparent border-none outline-none focus:outline-none placeholder-gray-300 resize-none overflow-hidden"
      style={{ height: '100%', paddingTop: '6px' }}
      readOnly={readOnly}
      rows={1}
    />
  );
};

const BlogEditor: React.FC<BlogEditorProps> = ({
  editorRef,
  content,
  isLoading,
  title,
  onChange,
  onTitleChange,
  isStreaming = false,
  isAgentThinking: _isAgentThinking = false,
  streamingPhase = '',
  showToolbarAnimation = false,
  readOnly = false,
  onAriScoreChange,
  disableAutoScroll = false,
  onUserScrollChange,
  pendingChanges: externalPendingChanges = false,
  onAcceptChanges,
  onRejectChanges,
  editedLinesCount = 0,
  hideReviewUI = false,
  showDiffs = true,
  focusMode = false,
  onAcceptSingleChange,
  onRejectSingleChange,
  onDiffPairsChange,
  featuredImageUrl,
  onEditFeaturedImage,
  isGeneratingImage = false,
  projectId,
  images,
  isLoadingImages,
  onUpload,
  onAIRequest,
}) => {
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(-1);
  const [diffRanges, setDiffRanges] = useState<{from: number, to: number, rect: {top: number, left: number, width: number, bottom: number, right: number}}[]>([]);
  // Track diff pairs (red-green combinations) for per-change buttons
  // Each pair contains the red range (old content) and green range (new content) as a single unit
  // greenRange can be undefined for deletion-only cases (removing content with no replacement)
  // isImageDeletion flag indicates this is an image marked for deletion (with red overlay)
  // isImageReplacement flag indicates this is an image replacement (old with pendingDelete + new with pendingInsert)
  // isImageInsertion flag indicates this is a standalone image insertion (new image only)
  // newImagesCount indicates how many new images replace the old one (for multi-image replacements)
  // isTextOnly flag indicates this pair contains only text changes (no images) - used to prevent image re-renders on text hover
  // isCodeBlockDeletion flag indicates this is a code block marked for deletion (with red overlay)
  // isCodeBlockInsertion flag indicates this is a standalone code block insertion
  // isTableDeletion flag indicates this is a table marked for deletion (with red overlay)
  // isTableInsertion flag indicates this is a standalone table insertion
  // isTableReplacement flag indicates this is a table replacement (old table deleted, new table inserted)
  //   - In replacement mode, action buttons appear ONLY on green table (not on red)
  const [diffPairs, setDiffPairs] = useState<{
    redRange?: {from: number, to: number},
    greenRange?: {from: number, to: number},
    rect: {top: number, left: number, width: number, bottom: number, right: number},
    lastGreenRect: {top: number, left: number, width: number, bottom: number, right: number},
    isImageDeletion?: boolean,
    isImageReplacement?: boolean,
    isImageInsertion?: boolean,
    isTextOnly?: boolean,
    newImagesCount?: number,
    isCodeBlockDeletion?: boolean,
    isCodeBlockInsertion?: boolean,
    isCodeBlockReplacement?: boolean,
    includesCodeBlockInsertion?: boolean,
    codeBlockIsBeforeText?: boolean, // When code block comes before text, use text positioning
    isCodeBlockReplacedByText?: boolean, // Code block being replaced by plain text (code→text replacement)
    includesCodeBlockDeletion?: boolean, // Text + code block deletion grouped together (code→text replacement)
    isTextReplacedByCode?: boolean, // Text being replaced by code block (text→code replacement)
    isTableDeletion?: boolean,
    isTableInsertion?: boolean,
    isTableReplacement?: boolean,
    includesTableInsertion?: boolean, // Text + table grouped together
    tableIsBeforeText?: boolean, // When table comes before text, use text positioning
    isTableReplacedByText?: boolean, // Table being replaced by plain text (not another table)
    includesTableDeletion?: boolean, // Text + table deletion grouped together (table→text replacement)
    isTextReplacedByTable?: boolean, // Text being replaced by table (text→table replacement)
    isImageReplacedByText?: boolean, // Image being replaced by plain text/HTML (not another image)
    includesImageDeletion?: boolean, // Image + text grouped together (image→text replacement)
    isTextReplacedByImage?: boolean, // Text being replaced by image (text→image replacement)
    includesImageInsertion?: boolean, // Text + image insertion grouped together (text→image replacement)
    imageIsLastInPair?: boolean, // Whether the image is the LAST element in the pair (for button positioning)
    includesTextInsertion?: boolean, // Image replacement + text insertion grouped together (image→image+text)
    firstGreenBlockEnd?: number // End position of first continuous block of green ranges (for button positioning)
  }[]>([]);
  const [activePairIndex, setActivePairIndex] = useState<number>(-1);
  // Track hover state separately from active/selected pair
  const [hoverPairIndex, setHoverPairIndex] = useState<number>(-1);
  // Track text-only hover separately via ref to avoid re-renders that cause image blinking
  const textOnlyHoverIndexRef = useRef<number>(-1);
  // Force update function for text-only hover buttons (without causing full re-render)
  const [textHoverUpdateCounter, forceTextHoverUpdate] = useState(0);
  // Track previous hover pair index to avoid unnecessary DOM updates
  const prevHoverPairIndexRef = useRef<number>(-1);
  // Store overlay rect in state to avoid DOM queries during render (prevents image re-render)
  const [overlayHoleRect, setOverlayHoleRect] = useState<{top: number, bottom: number} | null>(null);
  // Track last mouse position for re-evaluating hover on scroll
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  // Track if we had diffs to prevent banner from blinking during accept/reject transitions
  const hadDiffsRef = useRef(false);
  const bannerHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Rive animation for glow background
  const { RiveComponent: GlowRive } = useRive({
    src: glowRiv,
    autoplay: true,
    stateMachines: 'State Machine 1',
  });
  const [hasInternalDiffs, setHasInternalDiffs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveringButtonsRef = useRef(false);
  const isHoveringImageRef = useRef(false);
  // Track if we've already auto-scrolled to the first comparison (only once per review session)
  const hasAutoScrolledRef = useRef(false);
  // Track if we're currently processing to prevent infinite updateDiffRanges loops
  const isProcessingDiffRangesRef = useRef(false);
  // Cooldown: timestamp of last updateDiffRanges completion.
  // Transaction-triggered calls are skipped within 500ms to prevent infinite loops
  // caused by syncPendingAttributes DOM changes → ProseMirror transaction → re-trigger.
  const lastDiffRangesRunRef = useRef(0);
  // Track the content prop value that was last used to trigger updateDiffRanges
  const lastContentTriggerRef = useRef<string | null>(null);
  // Fingerprint of last computed diff pairs to skip redundant state updates (prevents infinite loops)
  const lastDiffPairsKeyRef = useRef<string>('');
  // Flag to auto-scroll to the next comparison after accepting/rejecting a pair
  const pendingScrollToNextRef = useRef<number | null>(null);
  // Flag to suppress scroll handler's hover-clear during programmatic navigation scroll
  const isNavigationScrollRef = useRef(false);
  // Track if hover was triggered by navigation buttons (skip overlay for navigation hover)
  const isNavigationHoverRef = useRef(false);

  // Track previous content to avoid regex checks on every keystroke
  const prevContentRef = useRef<string | null>(null);

  // Monitor document for any ins/del tags, highlight marks, or images with pending delete/insert to auto-enable review mode
  // Uses lightweight regex instead of innerHTML parsing, but only when content structurally changes
  // (not on every keystroke) to avoid expensive regex operations during normal typing
  useEffect(() => {
    // Skip if content hasn't changed from last check
    if (prevContentRef.current === content) return;

    // Debounce regex checks: only run after 300ms of no changes to avoid hammering on rapid typing
    let debounceTimer: NodeJS.Timeout | null = null;
    debounceTimer = setTimeout(() => {
      const hasDiffMarkers =
        /<(ins|del)\b/i.test(content) ||
        /data-color="#c7f0d6ff"/i.test(content) ||
        /data-color="#fecaca"/i.test(content) ||
        /data-pending-delete="true"/i.test(content) ||
        /data-pending-insert="true"/i.test(content);

      // Only update state if hasDiffMarkers actually changed
      setHasInternalDiffs(hasDiffMarkers);
      prevContentRef.current = content;
      debounceTimer = null;
    }, 300);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [content]);

  const isReviewMode = (externalPendingChanges || (hasInternalDiffs && showDiffs)) && !isStreaming && !hideReviewUI;

  const updateDiffRanges = useCallback(() => {
    if (!editorRef.current || !containerRef.current) return;
    const editor = editorRef.current.getEditor();
    if (!editor) return;

    // Prevent re-entry while already processing
    if (isProcessingDiffRangesRef.current) {
      return;
    }
    isProcessingDiffRangesRef.current = true;

    // Use try-finally to ensure the flag is always reset
    try {

    type RangeType = {from: number, to: number};
    type RectType = {top: number, left: number, width: number, bottom: number, right: number};

    const ranges: any[] = [];
    const pairs: any[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    // Grouping logic: Group all adjacent changes (ins/del) into a single focus unit
    let currentRange: any = null;

    // Track individual red-green pairs
    // Each pair = one red section followed by one green section (or just green if no red)
    type DiffPair = {
      redRanges: RangeType[],
      greenRanges: RangeType[],
      rect: RectType
    };
    let currentPair: DiffPair | null = null;
    let lastWasGreen = false;

    // Helper to finalize a pair and add to pairs array
    const finalizePair = (pair: DiffPair) => {


      // Handle pairs with green content (normal case: replacement or insertion)
      if (pair.greenRanges.length > 0) {
        const mergedRed = pair.redRanges.length > 0 ? {
          from: Math.min(...pair.redRanges.map(r => r.from)),
          to: Math.max(...pair.redRanges.map(r => r.to))
        } : undefined;
        const mergedGreen = {
          from: Math.min(...pair.greenRanges.map(r => r.from)),
          to: Math.max(...pair.greenRanges.map(r => r.to))
        };



        // Skip if red and green content are identical (no actual change)
        if (mergedRed) {
          try {
            const redText = editor.state.doc.textBetween(mergedRed.from, mergedRed.to, ' ').trim();
            const greenText = editor.state.doc.textBetween(mergedGreen.from, mergedGreen.to, ' ').trim();

            // Normalize text for comparison - handle Unicode variations
            const normalizeText = (text: string) => {
              return text
                .normalize('NFC')
                // Normalize different types of dashes to regular hyphen
                .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
                // Normalize different types of spaces
                .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
                // Normalize quotes
                .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
                .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
                // Remove zero-width characters
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                // Collapse multiple spaces
                .replace(/\s+/g, ' ')
                .trim();
            };

            const normalizedRed = normalizeText(redText);
            const normalizedGreen = normalizeText(greenText);

            if (normalizedRed === normalizedGreen) {
              // Check if the green range has link marks (inline structural change like link added/removed)
              let greenHasLinks = false;
              try {
                editor.state.doc.nodesBetween(mergedGreen.from, mergedGreen.to, (n) => {
                  if (n.isText && n.marks.some((m: any) => m.type.name === 'link')) {
                    greenHasLinks = true;
                  }
                  return !greenHasLinks;
                });
              } catch {}

              // Also check if red range has links that green doesn't (link removal)
              let redHasLinks = false;
              if (!greenHasLinks) {
                try {
                  editor.state.doc.nodesBetween(mergedRed.from, mergedRed.to, (n) => {
                    if (n.isText && n.marks.some((m: any) => m.type.name === 'link')) {
                      redHasLinks = true;
                    }
                    return !redHasLinks;
                  });
                } catch {}
              }

              const hasInlineStructuralChange = greenHasLinks || redHasLinks;

              // IMPORTANT: Don't skip if there are code block or table insertions!
              // The text may be identical, but there's a code block/table that was added
              // We need to create the text pair so it can be combined with the code block/table
              if (hasAnyCodeBlockInsertions || hasAnyTableInsertions) {

              } else if (hasInlineStructuralChange) {

              } else {

                return; // Skip this pair - content is identical and no blocks
              }
            } else {

            }
          } catch (e) {

          }
        }

        // Get position of the LAST green range's end for button placement
        const lastGreenRange = pair.greenRanges[pair.greenRanges.length - 1];
        let lastGreenRect = pair.rect;
        try {
          const lastGreenEnd = editor.view.coordsAtPos(lastGreenRange.to);
          const lastGreenStart = editor.view.coordsAtPos(lastGreenRange.from);
          lastGreenRect = {
            top: lastGreenStart.top - containerRect.top,
            left: lastGreenStart.left - containerRect.left,
            width: lastGreenEnd.right - lastGreenStart.left,
            right: lastGreenEnd.right - containerRect.left,
            bottom: lastGreenEnd.bottom - containerRect.top
          };
        } catch (e) {}

        // Find end of first continuous block of green ranges (gap > 50 = new block)
        let firstGreenBlockEnd = mergedGreen.to;
        if (pair.greenRanges.length > 1) {
          const sorted = [...pair.greenRanges].sort((a, b) => a.from - b.from);
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].from - sorted[i - 1].to > 50) {
              firstGreenBlockEnd = sorted[i - 1].to;
              break;
            }
          }
        }

        const newPair = {
          redRange: mergedRed,
          greenRange: mergedGreen,
          rect: pair.rect,
          lastGreenRect: lastGreenRect,
          isTextOnly: true, // Text-only pair (no images)
          firstGreenBlockEnd,
        };

        pairs.push(newPair);
      }
      // Handle pairs with ONLY red content (deletion case: content to be removed with no replacement)
      else if (pair.redRanges.length > 0) {
        const mergedRed = {
          from: Math.min(...pair.redRanges.map(r => r.from)),
          to: Math.max(...pair.redRanges.map(r => r.to))
        };

        // For deletion-only, use red range's end position for button placement
        const lastRedRange = pair.redRanges[pair.redRanges.length - 1];
        let lastRedRect = pair.rect;
        try {
          const lastRedEnd = editor.view.coordsAtPos(lastRedRange.to);
          const lastRedStart = editor.view.coordsAtPos(lastRedRange.from);
          lastRedRect = {
            top: lastRedStart.top - containerRect.top,
            left: lastRedStart.left - containerRect.left,
            width: lastRedEnd.right - lastRedStart.left,
            right: lastRedEnd.right - containerRect.left,
            bottom: lastRedEnd.bottom - containerRect.top
          };
        } catch (e) {}

        const newPair = {
          redRange: mergedRed,
          greenRange: undefined, // No green content - this is a deletion
          rect: pair.rect,
          lastGreenRect: lastRedRect, // Use red rect for button placement
          isTextOnly: true // Text-only pair (no images)
        };

        pairs.push(newPair);
      }
    };

    // Track images marked for deletion (pendingDelete: true) and insertion (pendingInsert: true)
    const imageDeletions: {pos: number, nodeSize: number, rect: RectType}[] = [];
    const imageInsertions: {pos: number, nodeSize: number, rect: RectType}[] = [];

    // Track code blocks marked for deletion (pendingDelete: true) and insertion (pendingInsert: true)
    const codeBlockDeletions: {pos: number, nodeSize: number, rect: RectType}[] = [];
    const codeBlockInsertions: {pos: number, nodeSize: number, rect: RectType}[] = [];

    // Track tables marked for deletion (pendingDelete: true) and insertion (pendingInsert: true)
    const tableDeletions: {pos: number, nodeSize: number, rect: RectType}[] = [];
    const tableInsertions: {pos: number, nodeSize: number, rect: RectType}[] = [];

    // PRELIMINARY SCAN: Check if there are any code block or table insertions in the document
    // This is needed BEFORE processing text highlights to know if we should skip identical pairs
    let hasAnyCodeBlockInsertions = false;
    let hasAnyTableInsertions = false;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'codeBlock' && node.attrs.pendingInsert === true) {
        hasAnyCodeBlockInsertions = true;
      }
      if (node.type.name === 'table' && node.attrs.pendingInsert === true) {
        hasAnyTableInsertions = true;
      }
      return !(hasAnyCodeBlockInsertions && hasAnyTableInsertions); // Stop when both found
    });


    editor.state.doc.descendants((node, pos) => {
      const isImageNode = node.type.name === 'image' || node.type.name === 'resizableImage';
      const isCodeBlockNode = node.type.name === 'codeBlock';
      const isTableNode = node.type.name === 'table';

      // Check for images with pendingDelete attribute
      if (isImageNode && node.attrs.pendingDelete === true) {
        try {
          // Try to get the actual DOM wrapper element for accurate rect (includes caption + padding)
          const domNode = editor.view.nodeDOM(pos);
          let rect: RectType;

          if (domNode && domNode instanceof HTMLElement) {
            // Find the wrapper element (.image-view--pending-delete) for full bounds
            // The domNode from nodeDOM is the NodeViewWrapper, which should have the class
            let wrapper: Element = domNode;

            // If domNode itself has the class, use it
            if (domNode.classList.contains('image-view--pending-delete')) {
              wrapper = domNode;
            } else {
              // Try to find it as a child or parent
              const childWrapper = domNode.querySelector('.image-view--pending-delete');
              const parentWrapper = domNode.closest('.image-view--pending-delete');
              wrapper = childWrapper || parentWrapper || domNode.closest('.image-view') || domNode;
            }

            // Use the body element (where the outline/border is) for tight rect alignment
            // Expand by 13px (outline-offset:10px + outline:3px) to match the visual border edge
            const bodyEl = wrapper.querySelector('.image-view__body');
            const targetEl = bodyEl || wrapper;
            const elRect = targetEl.getBoundingClientRect();
            const borderOffset = bodyEl ? 13 : 0;


            rect = {
              top: elRect.top - containerRect.top - borderOffset,
              left: elRect.left - containerRect.left - borderOffset,
              width: elRect.width + borderOffset * 2,
              right: elRect.left - containerRect.left + elRect.width + borderOffset,
              bottom: elRect.bottom - containerRect.top + borderOffset
            };

          } else {
            // Fallback to coordsAtPos
            const start = editor.view.coordsAtPos(pos);
            const end = editor.view.coordsAtPos(pos + node.nodeSize);
            rect = {
              top: start.top - containerRect.top,
              left: start.left - containerRect.left,
              width: end.right - start.left,
              right: start.left - containerRect.left + (end.right - start.left), // Use left + width for accurate right
              bottom: end.bottom - containerRect.top
            };
          }
          imageDeletions.push({ pos, nodeSize: node.nodeSize, rect });
        } catch (e) {}
      }
      // Check for images with pendingInsert attribute (new image in replacement or standalone insertion)
      if (isImageNode && node.attrs.pendingInsert === true) {
        try {
          // Try to get the actual DOM wrapper element for accurate rect (includes caption + padding)
          const domNode = editor.view.nodeDOM(pos);
          let rect: RectType;

          if (domNode && domNode instanceof HTMLElement) {
            // Find the wrapper element (.image-view--pending-insert) for full bounds
            // The domNode from nodeDOM is the NodeViewWrapper, which should have the class
            let wrapper: Element = domNode;

            // If domNode itself has the class, use it
            if (domNode.classList.contains('image-view--pending-insert')) {
              wrapper = domNode;
            } else {
              // Try to find it as a child or parent
              const childWrapper = domNode.querySelector('.image-view--pending-insert');
              const parentWrapper = domNode.closest('.image-view--pending-insert');
              wrapper = childWrapper || parentWrapper || domNode.closest('.image-view') || domNode;
            }

            // Use the body element (where the outline/border is) for tight rect alignment
            // Expand by 13px (outline-offset:10px + outline:3px) to match the visual border edge
            const bodyEl = wrapper.querySelector('.image-view__body');
            const targetEl = bodyEl || wrapper;
            const elRect = targetEl.getBoundingClientRect();
            const borderOffset = bodyEl ? 13 : 0;


            rect = {
              top: elRect.top - containerRect.top - borderOffset,
              left: elRect.left - containerRect.left - borderOffset,
              width: elRect.width + borderOffset * 2,
              right: elRect.left - containerRect.left + elRect.width + borderOffset,
              bottom: elRect.bottom - containerRect.top + borderOffset
            };

          } else {
            // Fallback to coordsAtPos
            const start = editor.view.coordsAtPos(pos);
            const end = editor.view.coordsAtPos(pos + node.nodeSize);
            rect = {
              top: start.top - containerRect.top,
              left: start.left - containerRect.left,
              width: end.right - start.left,
              right: end.right - containerRect.left,
              bottom: end.bottom - containerRect.top
            };
          }
          imageInsertions.push({ pos, nodeSize: node.nodeSize, rect });
        } catch (e) {}
      }

      // Check for code blocks with pendingDelete attribute
      if (isCodeBlockNode && node.attrs.pendingDelete === true) {
        try {
          const domNode = editor.view.nodeDOM(pos);
          let rect: RectType;

          if (domNode && domNode instanceof HTMLElement) {
            // Find the pre element for full bounds
            const preElement = domNode.tagName === 'PRE' ? domNode : domNode.querySelector('pre') || domNode;
            const preRect = preElement.getBoundingClientRect();
            rect = {
              top: preRect.top - containerRect.top,
              left: preRect.left - containerRect.left,
              width: preRect.width,
              right: preRect.right - containerRect.left,
              bottom: preRect.bottom - containerRect.top
            };
          } else {
            // Fallback to coordsAtPos
            const start = editor.view.coordsAtPos(pos);
            const end = editor.view.coordsAtPos(pos + node.nodeSize);
            rect = {
              top: start.top - containerRect.top,
              left: start.left - containerRect.left,
              width: end.right - start.left,
              right: end.right - containerRect.left,
              bottom: end.bottom - containerRect.top
            };
          }
          codeBlockDeletions.push({ pos, nodeSize: node.nodeSize, rect });
        } catch (e) {}
      }

      // Check for code blocks with pendingInsert attribute
      if (isCodeBlockNode && node.attrs.pendingInsert === true) {
        try {
          const domNode = editor.view.nodeDOM(pos);
          let rect: RectType;

          if (domNode && domNode instanceof HTMLElement) {
            const preElement = domNode.tagName === 'PRE' ? domNode : domNode.querySelector('pre') || domNode;
            const preRect = preElement.getBoundingClientRect();
            rect = {
              top: preRect.top - containerRect.top,
              left: preRect.left - containerRect.left,
              width: preRect.width,
              right: preRect.right - containerRect.left,
              bottom: preRect.bottom - containerRect.top
            };
          } else {
            const start = editor.view.coordsAtPos(pos);
            const end = editor.view.coordsAtPos(pos + node.nodeSize);
            rect = {
              top: start.top - containerRect.top,
              left: start.left - containerRect.left,
              width: end.right - start.left,
              right: end.right - containerRect.left,
              bottom: end.bottom - containerRect.top
            };
          }
          codeBlockInsertions.push({ pos, nodeSize: node.nodeSize, rect });
        } catch (e) {}
      }

      // Check for tables with pendingDelete attribute
      if (isTableNode && node.attrs.pendingDelete === true) {
        try {
          const domNode = editor.view.nodeDOM(pos);
          let rect: RectType;

          if (domNode && domNode instanceof HTMLElement) {
            const tableElement = domNode.tagName === 'TABLE' ? domNode : domNode.querySelector('table') || domNode;
            const tableRect = tableElement.getBoundingClientRect();
            rect = {
              top: tableRect.top - containerRect.top,
              left: tableRect.left - containerRect.left,
              width: tableRect.width,
              right: tableRect.right - containerRect.left,
              bottom: tableRect.bottom - containerRect.top
            };
          } else {
            // Fallback to coordsAtPos
            const start = editor.view.coordsAtPos(pos);
            const end = editor.view.coordsAtPos(pos + node.nodeSize);
            rect = {
              top: start.top - containerRect.top,
              left: start.left - containerRect.left,
              width: end.right - start.left,
              right: end.right - containerRect.left,
              bottom: end.bottom - containerRect.top
            };
          }
          tableDeletions.push({ pos, nodeSize: node.nodeSize, rect });
        } catch (e) {}
      }

      // Check for tables with pendingInsert attribute
      if (isTableNode && node.attrs.pendingInsert === true) {
        try {
          const domNode = editor.view.nodeDOM(pos);
          let rect: RectType;

          if (domNode && domNode instanceof HTMLElement) {
            const tableElement = domNode.tagName === 'TABLE' ? domNode : domNode.querySelector('table') || domNode;
            const tableRect = tableElement.getBoundingClientRect();
            rect = {
              top: tableRect.top - containerRect.top,
              left: tableRect.left - containerRect.left,
              width: tableRect.width,
              right: tableRect.right - containerRect.left,
              bottom: tableRect.bottom - containerRect.top
            };
          } else {
            const start = editor.view.coordsAtPos(pos);
            const end = editor.view.coordsAtPos(pos + node.nodeSize);
            rect = {
              top: start.top - containerRect.top,
              left: start.left - containerRect.left,
              width: end.right - start.left,
              right: end.right - containerRect.left,
              bottom: end.bottom - containerRect.top
            };
          }
          tableInsertions.push({ pos, nodeSize: node.nodeSize, rect });
        } catch (e) {}
      }

      // Fallback: Detect blocks with links as green content when highlight marks are missing.
      // If current pair has red ranges and this block has links without any highlight marks,
      // treat the entire block as green content for the diff pair.
      // Covers: heading, paragraph, bulletList, orderedList (which contain link-only list items)
      const isLinkCandidate = (node.type.name === 'heading' || node.type.name === 'paragraph' ||
        node.type.name === 'bulletList' || node.type.name === 'orderedList') && node.content.size > 0;
      if (isLinkCandidate && currentPair && currentPair.redRanges.length > 0) {
        let blockHasLinks = false;
        let blockHasRedMarks = false;
        let blockHasGreenMarks = false;
        node.descendants((child: any) => {
          if (child.isText) {
            if (child.marks.some((m: any) => m.type.name === 'link')) blockHasLinks = true;
            if (child.marks.some((m: any) => m.type.name === 'highlight' && m.attrs.color === '#fecaca')) blockHasRedMarks = true;
            if (child.marks.some((m: any) => m.type.name === 'highlight' && m.attrs.color === '#c7f0d6ff')) blockHasGreenMarks = true;
          }
        });
        // Add as green if block has links, no red marks, and isn't already fully green-highlighted
        if (blockHasLinks && !blockHasRedMarks && !blockHasGreenMarks) {
          try {
            const hFrom = pos + 1;
            const hTo = pos + node.nodeSize - 1;
            const hStart = editor.view.coordsAtPos(hFrom);
            const hEnd = editor.view.coordsAtPos(hTo);
            const hRect = {
              top: hStart.top - containerRect.top,
              left: hStart.left - containerRect.left,
              width: hEnd.right - hStart.left,
              right: hEnd.right - containerRect.left,
              bottom: hEnd.bottom - containerRect.top
            };
            currentPair.greenRanges.push({ from: hFrom, to: hTo });
            lastWasGreen = true;
            currentPair.rect.top = Math.min(currentPair.rect.top, hRect.top);
            currentPair.rect.left = Math.min(currentPair.rect.left, hRect.left);
            currentPair.rect.right = Math.max(currentPair.rect.right, hRect.right);
            currentPair.rect.bottom = Math.max(currentPair.rect.bottom, hRect.bottom);
            currentPair.rect.width = currentPair.rect.right - currentPair.rect.left;
          } catch (_e) {}
        }
      }

      const highlightMark = node.marks.find(m => m.type.name === 'highlight');
      const hasDiff = node.marks.some(m => ['diffInsertion', 'diffDeletion', 'highlight'].includes(m.type.name));
      const isGreen = highlightMark && highlightMark.attrs.color === '#c7f0d6ff';
      const isRed = highlightMark && highlightMark.attrs.color === '#fecaca';

      // Debug: Log highlights found
      if (highlightMark) {

      }

      if (hasDiff && (isGreen || isRed)) {
        try {
          const start = editor.view.coordsAtPos(pos);
          const end = editor.view.coordsAtPos(pos + node.nodeSize);

          const rect = {
            top: start.top - containerRect.top,
            left: start.left - containerRect.left,
            width: end.right - start.left,
            right: end.right - containerRect.left,
            bottom: end.bottom - containerRect.top
          };

          // Logic: A new pair starts when:
          // 1. We see RED after GREEN (new comparison starting)
          // 2. No current pair exists
          // 3. We see RED and current pair is RED-only (deletion) with a position gap
          //    (indicates a separate deletion operation with non-diff content between them)
          let shouldStartNewPair = !currentPair || (isRed && lastWasGreen);

          if (!shouldStartNewPair && currentPair && isRed && currentPair.greenRanges.length === 0 && currentPair.redRanges.length > 0) {
            const lastRedEnd = currentPair.redRanges[currentPair.redRanges.length - 1].to;
            // If there's a significant gap (>2 positions) between last red and current red,
            // check if the gap contains actual non-highlighted text.
            // Structural nodes (listItem, paragraph boundaries) create position gaps
            // but shouldn't split the pair if there's no text content between them.
            if (pos - lastRedEnd > 2) {
              // Check if the gap has any non-highlighted text content
              let hasNonHighlightedText = false;
              try {
                editor.state.doc.nodesBetween(lastRedEnd, pos, (gapNode) => {
                  if (gapNode.isText && gapNode.text?.trim()) {
                    // Check if this text has a highlight mark
                    const hasHighlight = gapNode.marks.some(m => m.type.name === 'highlight');
                    if (!hasHighlight) {
                      hasNonHighlightedText = true;
                      return false; // stop iterating
                    }
                  }
                  return true;
                });
              } catch (e) { /* ignore */ }
              if (hasNonHighlightedText) {
                shouldStartNewPair = true;
              }
            }
          }

          if (shouldStartNewPair) {
            // Finalize previous pair if exists
            if (currentPair) {
              finalizePair(currentPair);
            }
            // Start new pair
            currentPair = {
              redRanges: [],
              greenRanges: [],
              rect: { ...rect }
            };
          }

          // Add to current pair (currentPair is guaranteed non-null after shouldStartNewPair block)
          if (currentPair) {
            if (isRed) {
              currentPair.redRanges.push({ from: pos, to: pos + node.nodeSize });
              lastWasGreen = false;
            }
            if (isGreen) {
              currentPair.greenRanges.push({ from: pos, to: pos + node.nodeSize });
              lastWasGreen = true;
            }

            // Update rect bounds
            currentPair.rect.top = Math.min(currentPair.rect.top, rect.top);
            currentPair.rect.left = Math.min(currentPair.rect.left, rect.left);
            currentPair.rect.right = Math.max(currentPair.rect.right, rect.right);
            currentPair.rect.bottom = Math.max(currentPair.rect.bottom, rect.bottom);
            currentPair.rect.width = currentPair.rect.right - currentPair.rect.left;
          }

          // If current mark is part of the previous range block, merge them
          if (currentRange && (pos <= currentRange.to + 1)) {
             currentRange.to = pos + node.nodeSize;
             currentRange.rect.right = Math.max(currentRange.rect.right, rect.right);
             currentRange.rect.bottom = Math.max(currentRange.rect.bottom, rect.bottom);
             currentRange.rect.width = currentRange.rect.right - currentRange.rect.left;
          } else {
             if (currentRange) ranges.push(currentRange);
             currentRange = { from: pos, to: pos + node.nodeSize, rect };
          }
        } catch (e) {}
      } else if (currentRange && node.isText && node.text?.trim() === '') {
         // Allow whitespace nodes between diff parts
         currentRange.to = pos + node.nodeSize;
      } else if (currentRange) {
         // Non-diff, non-whitespace content - this breaks the current diff block
         ranges.push(currentRange);
         currentRange = null;
      }  
      return true;
    });

    if (currentRange) ranges.push(currentRange);

    // Finalize last pair
    if (currentPair) {
      const pairToFinalize = currentPair as { redRanges: {from: number, to: number}[], greenRanges: {from: number, to: number}[], rect: RectType };

      finalizePair(currentPair);
    }



    // === PROXIMITY HELPER for multiple operations ===
    // When multiple text pairs exist (from multiple find_replace ops),
    // this helps determine which block element belongs to which text pair.
    const hasMultipleTextPairs = pairs.filter(p => p.isTextOnly).length > 1;

    const findOwnerTextPair = (blockPos: number, blockEndPos: number) => {
      const textPairs = pairs.filter(p => p.isTextOnly);
      if (textPairs.length <= 1) return textPairs[0] || null;

      for (const pair of textPairs) {
        const pairStart = Math.min(pair.redRange?.from ?? Infinity, pair.greenRange?.from ?? Infinity);
        const pairEnd = Math.max(pair.redRange?.to ?? 0, pair.greenRange?.to ?? 0);
        if (blockPos >= pairStart - 10 && blockEndPos <= pairEnd + 10) {
          return pair;
        }
      }
      return null;
    };

    // Handle image operations - pair up deletions with insertions for replacements
    // Supports all combinations:
    // - Single old → single new
    // - Single old → multiple new
    // - Multiple old → single new
    // - Multiple old → multiple new
    // - Deletions only (no insertions)
    // - Insertions only (no deletions)

    // Sort by position
    const sortedDeletions = [...imageDeletions].sort((a, b) => a.pos - b.pos);
    const sortedInsertions = [...imageInsertions].sort((a, b) => a.pos - b.pos);

    // Group consecutive deletions together
    const deletionGroups: typeof imageDeletions[] = [];
    let currentDelGroup: typeof imageDeletions = [];

    for (const del of sortedDeletions) {
      if (currentDelGroup.length === 0) {
        currentDelGroup.push(del);
      } else {
        const lastDel = currentDelGroup[currentDelGroup.length - 1];
        // Check if this deletion immediately follows the previous one
        if (del.pos === lastDel.pos + lastDel.nodeSize) {
          currentDelGroup.push(del);
        } else {
          // Start a new group
          deletionGroups.push(currentDelGroup);
          currentDelGroup = [del];
        }
      }
    }
    if (currentDelGroup.length > 0) {
      deletionGroups.push(currentDelGroup);
    }

    const usedInsertions = new Set<number>();

    // For each deletion group, find consecutive insertions that follow
    deletionGroups.forEach(delGroup => {
      const firstDel = delGroup[0];
      const lastDel = delGroup[delGroup.length - 1];
      const groupEndPos = lastDel.pos + lastDel.nodeSize;

      // Find consecutive insertions starting from groupEndPos
      const matchingInsertions: typeof imageInsertions = [];
      let expectedPos = groupEndPos;

      for (const imgIns of sortedInsertions) {
        if (usedInsertions.has(imgIns.pos)) continue;

        if (imgIns.pos === expectedPos) {
          matchingInsertions.push(imgIns);
          usedInsertions.add(imgIns.pos);
          expectedPos = imgIns.pos + imgIns.nodeSize;
        }
      }

      // Calculate red range spanning all deletions in the group
      const redRangeStart = firstDel.pos;
      const redRangeEnd = lastDel.pos + lastDel.nodeSize;

      if (matchingInsertions.length > 0) {
        // This is an image replacement (one or more old → one or more new)
        const firstInsertion = matchingInsertions[0];
        const lastInsertion = matchingInsertions[matchingInsertions.length - 1];

        const greenRangeStart = firstInsertion.pos;
        const greenRangeEnd = lastInsertion.pos + lastInsertion.nodeSize;

        // Calculate bounding rect for all images
        const allRects = [...delGroup.map(d => d.rect), ...matchingInsertions.map(m => m.rect)];
        const combinedRect = {
          top: Math.min(...allRects.map(r => r.top)),
          left: Math.min(...allRects.map(r => r.left)),
          width: Math.max(...allRects.map(r => r.width)),
          right: Math.max(...allRects.map(r => r.right)),
          bottom: Math.max(...allRects.map(r => r.bottom))
        };

        pairs.push({
          redRange: { from: redRangeStart, to: redRangeEnd },
          greenRange: { from: greenRangeStart, to: greenRangeEnd },
          rect: combinedRect,
          lastGreenRect: lastInsertion.rect,
          isImageReplacement: true,
          newImagesCount: matchingInsertions.length
        });


      } else {
        // This is just deletion(s) with no replacement
        // Calculate bounding rect for all deletions
        const combinedRect = {
          top: Math.min(...delGroup.map(d => d.rect.top)),
          left: Math.min(...delGroup.map(d => d.rect.left)),
          width: Math.max(...delGroup.map(d => d.rect.width)),
          right: Math.max(...delGroup.map(d => d.rect.right)),
          bottom: Math.max(...delGroup.map(d => d.rect.bottom))
        };

        pairs.push({
          redRange: { from: redRangeStart, to: redRangeEnd },
          greenRange: undefined,
          rect: combinedRect,
          lastGreenRect: combinedRect,
          isImageDeletion: true
        });
      }
    });

    // Handle any standalone insertions (images added without replacing existing ones)
    imageInsertions.forEach(imgIns => {
      if (!usedInsertions.has(imgIns.pos)) {
        pairs.push({
          redRange: undefined,
          greenRange: { from: imgIns.pos, to: imgIns.pos + imgIns.nodeSize },
          rect: imgIns.rect,
          lastGreenRect: imgIns.rect,
          isImageInsertion: true // Standalone image insertion
        });
      }
    });

    // ========================================================================
    // IMAGE REPLACED BY TEXT: image deletion + text highlight (no image insertion)
    // When old image is being replaced by plain text/HTML, combine them into one pair
    // This is similar to TABLE→TEXT handling
    // ========================================================================
    const hasTextHighlightPairsForImage = pairs.some(p => p.isTextOnly);
    const imageDeletionPairs = pairs.filter(p => p.isImageDeletion);
    const isImageReplacedByText = imageDeletionPairs.length > 0 && imageInsertions.length === 0 && hasTextHighlightPairsForImage;



    if (isImageReplacedByText) {


      const imgDelPairIndex = pairs.findIndex(p => p.isImageDeletion);
      if (imgDelPairIndex !== -1) {
        const imgDelPair = pairs[imgDelPairIndex];
        const imgPos = imgDelPair.redRange?.from ?? 0;
        const imgEndPos = imgDelPair.redRange?.to ?? imgPos;

        // Find the proximate text pair (or first if single)
        let textPair: any = null;
        if (hasMultipleTextPairs) {
          textPair = findOwnerTextPair(imgPos, imgEndPos);
        }
        if (!textPair) {
          const textPairIndex = pairs.findIndex(p => p.isTextOnly);
          if (textPairIndex !== -1) textPair = pairs[textPairIndex];
        }

        if (textPair) {
          if (textPair.redRange && imgDelPair.redRange) {
            textPair.redRange = {
              from: Math.min(textPair.redRange.from, imgDelPair.redRange.from),
              to: Math.max(textPair.redRange.to, imgDelPair.redRange.to)
            };
          } else if (imgDelPair.redRange) {
            textPair.redRange = imgDelPair.redRange;
          }
          textPair.isImageReplacedByText = true;
          textPair.includesImageDeletion = true;
          // Update rect/lastGreenRect if image extends below current button position
          if (imgDelPair.rect) {
            if (imgDelPair.rect.bottom > (textPair.lastGreenRect?.bottom ?? 0)) {
              textPair.lastGreenRect = imgDelPair.rect;
            }
            textPair.rect = {
              top: Math.min(textPair.rect?.top ?? Infinity, imgDelPair.rect.top),
              left: Math.min(textPair.rect?.left ?? Infinity, imgDelPair.rect.left),
              right: Math.max(textPair.rect?.right ?? 0, imgDelPair.rect.right),
              bottom: Math.max(textPair.rect?.bottom ?? 0, imgDelPair.rect.bottom),
              width: Math.max(textPair.rect?.width ?? 0, imgDelPair.rect.width ?? 0)
            };
          }
          pairs.splice(imgDelPairIndex, 1);

        } else {

        }
      } else {

      }
    }

    // ========================================================================
    // TEXT+IMAGE COMBINATION: Text changes + Image insertions in same operation
    // When old_content != '' and new_content != '', and new_content contains
    // both text changes (green highlights) AND image insertions, combine them
    // into a single pair with ONE set of buttons at the very end.
    // This handles: TEXT → TEXT+IMAGE+TEXT, TEXT → IMAGE+TEXT, TEXT → TEXT+IMAGE
    // Also handles: TEXT → IMAGE (pure replacement)
    // ========================================================================
    const textOnlyPairsForImage = pairs.filter(p => p.isTextOnly);
    const standaloneImageInsertionPairs = pairs.filter(p => p.isImageInsertion && !p.isImageReplacement);
    const hasTextAndImageInsertions = textOnlyPairsForImage.length > 0 && standaloneImageInsertionPairs.length > 0 && imageDeletions.length === 0;



    if (hasTextAndImageInsertions) {


      if (hasMultipleTextPairs) {
        // MULTI-PAIR: Use proximity to assign each image to its owner text pair
        const processedImageIndices = new Set<number>();

        for (const imgPair of standaloneImageInsertionPairs) {
          const imgPos = imgPair.greenRange?.from ?? 0;
          const imgEnd = imgPair.greenRange?.to ?? imgPos;
          const ownerPair = findOwnerTextPair(imgPos, imgEnd);

          if (ownerPair) {
            // Save current end position BEFORE extending (to determine if image is last)
            const prevEnd = ownerPair.greenRange?.to ?? 0;

            // Extend owner's green range to include image
            if (ownerPair.greenRange) {
              ownerPair.greenRange = {
                from: Math.min(ownerPair.greenRange.from, imgPos),
                to: Math.max(ownerPair.greenRange.to, imgEnd)
              };
            }
            // Update button position if image is at or beyond the previous end (it's the last element so far)
            if (imgEnd >= prevEnd) {
              ownerPair.lastGreenRect = imgPair.lastGreenRect || imgPair.rect;
              ownerPair.imageIsLastInPair = true;
            }
            ownerPair.includesImageInsertion = true;
            processedImageIndices.add(pairs.indexOf(imgPair));

          }
        }

        // Remove processed image insertion pairs
        for (let i = pairs.length - 1; i >= 0; i--) {
          if (pairs[i].isImageInsertion && !pairs[i].isImageReplacement && processedImageIndices.has(i)) {
            pairs.splice(i, 1);
          }
        }
      } else {
        // SINGLE-PAIR: Original behavior - merge all text pairs and images together
        const textPairIndices: number[] = [];
        pairs.forEach((p, idx) => {
          if (p.isTextOnly) textPairIndices.push(idx);
        });

        const primaryTextPairIndex = textPairIndices[0];
        const textPair = pairs[primaryTextPairIndex];

        // Merge all text pairs into one (for single-operation TEXT+IMAGE+TEXT)
        if (textPairIndices.length > 1) {
          for (let i = textPairIndices.length - 1; i >= 1; i--) {
            const otherIdx = textPairIndices[i];
            const otherPair = pairs[otherIdx];
            if (otherPair.greenRange) {
              if (textPair.greenRange) {
                textPair.greenRange = {
                  from: Math.min(textPair.greenRange.from, otherPair.greenRange.from),
                  to: Math.max(textPair.greenRange.to, otherPair.greenRange.to)
                };
              } else {
                textPair.greenRange = otherPair.greenRange;
              }
              if (otherPair.greenRange.to > (textPair.greenRange?.to || 0)) {
                textPair.lastGreenRect = otherPair.lastGreenRect;
              }
            }
            if (otherPair.redRange) {
              if (textPair.redRange) {
                textPair.redRange = {
                  from: Math.min(textPair.redRange.from, otherPair.redRange.from),
                  to: Math.max(textPair.redRange.to, otherPair.redRange.to)
                };
              } else {
                textPair.redRange = otherPair.redRange;
              }
            }
            pairs.splice(otherIdx, 1);
          }
        }

        // Save text-only end position BEFORE extending with images
        const textOnlyEnd = textPair.greenRange?.to ?? 0;

        // Extend green range to include all image insertions
        let combinedGreenFrom = textPair.greenRange?.from ?? Infinity;
        let combinedGreenTo = textPair.greenRange?.to ?? 0;
        for (const imgPair of standaloneImageInsertionPairs) {
          if (imgPair.greenRange) {
            combinedGreenFrom = Math.min(combinedGreenFrom, imgPair.greenRange.from);
            combinedGreenTo = Math.max(combinedGreenTo, imgPair.greenRange.to);
          }
        }
        if (combinedGreenFrom !== Infinity && combinedGreenTo !== 0) {
          textPair.greenRange = { from: combinedGreenFrom, to: combinedGreenTo };
        }

        // Button at LAST element - compare against text-only end (not the extended range)
        let lastElementRect = textPair.lastGreenRect;
        let lastPosition = textOnlyEnd;
        let imageIsLast = false;
        for (const imgPair of standaloneImageInsertionPairs) {
          const imgEnd = imgPair.greenRange?.to ?? 0;
          if (imgEnd >= lastPosition) {
            lastPosition = imgEnd;
            lastElementRect = imgPair.lastGreenRect || imgPair.rect;
            imageIsLast = true;
          }
        }
        if (lastElementRect) textPair.lastGreenRect = lastElementRect;
        textPair.includesImageInsertion = true;
        textPair.imageIsLastInPair = imageIsLast;

        // Remove all standalone image insertion pairs
        for (let i = pairs.length - 1; i >= 0; i--) {
          if (pairs[i].isImageInsertion && !pairs[i].isImageReplacement) {
            pairs.splice(i, 1);
          }
        }
      }


    }

    // ========================================================================
    // IMAGE REPLACEMENT + TEXT: Image replacement (old img → new img) + text insertion
    // When old_content is an image and new_content is the same/different image + text,
    // combine the image replacement pair with the text pair into ONE unified pair.
    // This handles: IMAGE → IMAGE+TEXT, IMAGE → IMAGE+TEXT+IMAGE
    // ========================================================================
    const imageReplacementPairs = pairs.filter(p => p.isImageReplacement);
    const textPairsForImageRepl = pairs.filter(p => p.isTextOnly);
    const hasImageReplacementWithText = imageReplacementPairs.length > 0 && textPairsForImageRepl.length > 0;



    if (hasImageReplacementWithText) {


      const imgReplPairIndex = pairs.findIndex(p => p.isImageReplacement);
      const imgReplPair = pairs[imgReplPairIndex];
      const textPairIndicesToRemove: number[] = [];

      // Determine image replacement range for proximity check
      const imgStart = Math.min(imgReplPair.redRange?.from ?? Infinity, imgReplPair.greenRange?.from ?? Infinity);
      const imgEnd = Math.max(imgReplPair.redRange?.to ?? 0, imgReplPair.greenRange?.to ?? 0);

      for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].isTextOnly) {
          const textPair = pairs[i];

          // Don't merge text pairs that represent separate AI operations
          // A text pair with BOTH redRange and greenRange is a complete independent operation
          // (e.g., heading text replacement) — it should keep its own buttons
          if (textPair.redRange && textPair.greenRange) continue;

          // MULTI-PAIR: only merge proximate text pairs (green-only insertions that belong to this image op)
          if (hasMultipleTextPairs) {
            const textStart = Math.min(textPair.redRange?.from ?? Infinity, textPair.greenRange?.from ?? Infinity);
            const textEnd = Math.max(textPair.redRange?.to ?? 0, textPair.greenRange?.to ?? 0);
            const isProximate = (textStart >= imgStart - 10 && textEnd <= imgEnd + 10) ||
                               (imgStart >= textStart - 10 && imgEnd <= textEnd + 10) ||
                               (Math.abs(textStart - imgEnd) <= 10) ||
                               (Math.abs(imgStart - textEnd) <= 10);
            if (!isProximate) continue; // Skip non-proximate text pairs
          }

          textPairIndicesToRemove.push(i);

          if (textPair.greenRange) {
            if (imgReplPair.greenRange) {
              imgReplPair.greenRange = {
                from: Math.min(imgReplPair.greenRange.from, textPair.greenRange.from),
                to: Math.max(imgReplPair.greenRange.to, textPair.greenRange.to)
              };
            } else {
              imgReplPair.greenRange = textPair.greenRange;
            }
          }
          if (textPair.redRange) {
            if (imgReplPair.redRange) {
              imgReplPair.redRange = {
                from: Math.min(imgReplPair.redRange.from, textPair.redRange.from),
                to: Math.max(imgReplPair.redRange.to, textPair.redRange.to)
              };
            } else {
              imgReplPair.redRange = textPair.redRange;
            }
          }
        }
      }

      // Button at LAST element
      let lastPosition = imgReplPair.greenRange?.to ?? 0;
      let lastRect = imgReplPair.lastGreenRect;
      for (let i = 0; i < textPairIndicesToRemove.length; i++) {
        const textPair = pairs[textPairIndicesToRemove[i]];
        const textEnd = textPair.greenRange?.to ?? 0;
        if (textEnd > lastPosition) {
          lastPosition = textEnd;
          lastRect = textPair.lastGreenRect;
        }
      }
      if (lastRect) imgReplPair.lastGreenRect = lastRect;
      imgReplPair.includesTextInsertion = true;

      // Remove merged text pairs in reverse order
      for (let i = textPairIndicesToRemove.length - 1; i >= 0; i--) {
        pairs.splice(textPairIndicesToRemove[i], 1);
      }


    }

    // ========================================================================
    // CODE BLOCK PAIRS - Handle code blocks with pendingDelete/pendingInsert
    // Similar to image handling but for code blocks
    // ========================================================================

    // Check if there are any text highlight pairs (green/red text changes)
    // If so, code block insertions should NOT get separate action buttons
    // (they are part of the larger text change and will be handled by the global action bar)
    const hasTextHighlightPairs = pairs.some(p => p.isTextOnly);



    // Check if this is a CODE BLOCK REPLACEMENT scenario:
    // - Both codeBlockDeletions AND codeBlockInsertions exist
    // - In replacement: NO buttons on red code block, only on green code block
    const isCodeBlockReplacement = codeBlockDeletions.length > 0 && codeBlockInsertions.length > 0;

    if (isCodeBlockReplacement) {
      // CODE BLOCK REPLACEMENT: Create ONE pair that covers ALL code blocks
      // Red code blocks are for comparison only (no buttons)
      // Green code blocks show ONE set of Accept/Discard buttons at the LAST code block


      // Calculate the combined range for ALL deletions and ALL insertions
      const firstDeletion = codeBlockDeletions[0];
      const lastDeletion = codeBlockDeletions[codeBlockDeletions.length - 1];
      const firstInsertion = codeBlockInsertions[0];
      const lastInsertion = codeBlockInsertions[codeBlockInsertions.length - 1];

      // Red range covers ALL old code blocks (from first deletion start to last deletion end)
      const combinedRedRange = {
        from: firstDeletion.pos,
        to: lastDeletion.pos + lastDeletion.nodeSize
      };

      // Green range covers ALL new code blocks (from first insertion start to last insertion end)
      const combinedGreenRange = {
        from: firstInsertion.pos,
        to: lastInsertion.pos + lastInsertion.nodeSize
      };

      // Create ONE pair with buttons at the LAST new code block
      pairs.push({
        redRange: combinedRedRange,
        greenRange: combinedGreenRange,
        rect: lastInsertion.rect, // Position buttons at LAST green code block
        lastGreenRect: lastInsertion.rect,
        isCodeBlockInsertion: true,
        isCodeBlockReplacement: true // Flag to indicate this is a replacement
      });


    } else {
      // NOT a replacement - handle deletions and insertions separately

      // Process code block deletions (standalone deletion - show Keep/Delete buttons)
      codeBlockDeletions.forEach(cbDel => {
        pairs.push({
          redRange: { from: cbDel.pos, to: cbDel.pos + cbDel.nodeSize },
          greenRange: undefined,
          rect: cbDel.rect,
          lastGreenRect: cbDel.rect,
          isCodeBlockDeletion: true
        });

      });

      // Process code block insertions - ONLY if no text highlight pairs exist
      // When there are text highlights, the code block is part of the same change
      // and should be handled by the global action bar (at the last green content)
      if (!hasTextHighlightPairs) {

        codeBlockInsertions.forEach(cbIns => {
          pairs.push({
            redRange: undefined,
            greenRange: { from: cbIns.pos, to: cbIns.pos + cbIns.nodeSize },
            rect: cbIns.rect,
            lastGreenRect: cbIns.rect,
            isCodeBlockInsertion: true
          });
        });
      } else if (codeBlockInsertions.length > 0) {
        // Text highlight pairs exist AND code block insertions exist
        // Need to determine the LAST element (text or code block) for button placement
        // Cases:
        // 1. Text + code block (code after text) → button at code block
        // 2. Code + text (code before text) → button at text
        // 3. Text + code + text → button at last text





        // Combine text pairs with code block insertions
        const textPairIndices: number[] = [];
        pairs.forEach((p, idx) => {
          if (p.isTextOnly) textPairIndices.push(idx);
        });

        if (textPairIndices.length > 0) {
          if (hasMultipleTextPairs) {
            // MULTI-PAIR: Assign each code block to its owner text pair by proximity
            for (const cbIns of codeBlockInsertions) {
              const ownerPair = findOwnerTextPair(cbIns.pos, cbIns.pos + cbIns.nodeSize);
              if (ownerPair) {
                const cbEnd = cbIns.pos + cbIns.nodeSize;
                // Save pre-extension end for position comparison
                const prevGreenEnd = ownerPair.greenRange?.to ?? 0;
                if (ownerPair.greenRange) {
                  ownerPair.greenRange = {
                    from: Math.min(ownerPair.greenRange.from, cbIns.pos),
                    to: Math.max(ownerPair.greenRange.to, cbEnd)
                  };
                } else {
                  ownerPair.greenRange = { from: cbIns.pos, to: cbEnd };
                }
                // Button at LAST element (compare against pre-extension value)
                if (cbEnd > prevGreenEnd || prevGreenEnd === 0) {
                  ownerPair.lastGreenRect = cbIns.rect;
                } else {
                  ownerPair.codeBlockIsBeforeText = true;
                }
                ownerPair.includesCodeBlockInsertion = true;
                ownerPair.isTextReplacedByCode = true;
              }
            }

          } else {
            // SINGLE-PAIR: Original behavior - merge all text pairs and code blocks
            const primaryIndex = textPairIndices[0];
            const textPair = pairs[primaryIndex];
            const lastCodeBlock = codeBlockInsertions[codeBlockInsertions.length - 1];
            const firstCodeBlock = codeBlockInsertions[0];
            const codeBlockStart = firstCodeBlock.pos;
            const codeBlockEnd = lastCodeBlock.pos + lastCodeBlock.nodeSize;

            let allTextGreenStart = textPair.greenRange?.from || Infinity;
            let allTextGreenEnd = textPair.greenRange?.to || 0;
            let lastTextPairRect = textPair.lastGreenRect;

            // Merge all other text pairs into primary
            for (let i = textPairIndices.length - 1; i >= 1; i--) {
              const otherIdx = textPairIndices[i];
              const otherPair = pairs[otherIdx];
              if (otherPair.greenRange) {
                allTextGreenStart = Math.min(allTextGreenStart, otherPair.greenRange.from);
                allTextGreenEnd = Math.max(allTextGreenEnd, otherPair.greenRange.to);
                if (otherPair.greenRange.to > (textPair.greenRange?.to || 0)) {
                  lastTextPairRect = otherPair.lastGreenRect;
                }
              }
              if (otherPair.redRange) {
                if (textPair.redRange) {
                  textPair.redRange = {
                    from: Math.min(textPair.redRange.from, otherPair.redRange.from),
                    to: Math.max(textPair.redRange.to, otherPair.redRange.to)
                  };
                } else {
                  textPair.redRange = otherPair.redRange;
                }
              }
              pairs.splice(otherIdx, 1);
            }

            // Extend green range to include code block
            if (textPair.greenRange) {
              textPair.greenRange = {
                from: Math.min(allTextGreenStart, codeBlockStart),
                to: Math.max(allTextGreenEnd, codeBlockEnd)
              };
            } else {
              textPair.greenRange = { from: codeBlockStart, to: codeBlockEnd };
            }

            // Button at LAST element
            if (codeBlockEnd > allTextGreenEnd) {
              textPair.lastGreenRect = lastCodeBlock.rect;
            } else {
              textPair.lastGreenRect = lastTextPairRect;
              textPair.codeBlockIsBeforeText = true;
            }

            textPair.includesCodeBlockInsertion = true;
            textPair.isTextReplacedByCode = true;
          }
        }
      }
    }

    // ========================================================================
    // CODE BLOCK REPLACED BY TEXT: code block deletion + text highlight (no code block insertion)
    // When old code block is being replaced by plain text, combine them into one pair
    // ========================================================================
    const isCodeBlockReplacedByText = codeBlockDeletions.length > 0 && codeBlockInsertions.length === 0 && hasTextHighlightPairs;



    if (isCodeBlockReplacedByText) {
      const firstCodeBlock = codeBlockDeletions[0];
      const lastCodeBlock = codeBlockDeletions[codeBlockDeletions.length - 1];
      const cbStart = firstCodeBlock.pos;
      const cbEnd = lastCodeBlock.pos + lastCodeBlock.nodeSize;

      // Find proximate text pair (or first available)
      let textPair: any = null;
      if (hasMultipleTextPairs) {
        textPair = findOwnerTextPair(cbStart, cbEnd);
      }
      if (!textPair) {
        const textPairIndex = pairs.findIndex(p => p.isTextOnly && !p.isCodeBlockReplacedByText);
        if (textPairIndex !== -1) textPair = pairs[textPairIndex];
      }

      if (textPair) {


        // Calculate combined red range (all code block deletions)
        const combinedCodeBlockRedRange = {
          from: firstCodeBlock.pos,
          to: lastCodeBlock.pos + lastCodeBlock.nodeSize
        };

        // Extend or set the red range to include code block deletion
        if (textPair.redRange) {
          textPair.redRange = {
            from: Math.min(textPair.redRange.from, combinedCodeBlockRedRange.from),
            to: Math.max(textPair.redRange.to, combinedCodeBlockRedRange.to)
          };
        } else {
          textPair.redRange = combinedCodeBlockRedRange;
        }

        // Set flags for CODE→TEXT replacement
        textPair.isCodeBlockReplacedByText = true;
        textPair.includesCodeBlockDeletion = true;

        // Update rect/lastGreenRect if code block extends below current button position
        const lastCbRect = lastCodeBlock.rect;
        if (lastCbRect) {
          if (lastCbRect.bottom > (textPair.lastGreenRect?.bottom ?? 0)) {
            textPair.lastGreenRect = lastCbRect;
          }
          textPair.rect = {
            top: Math.min(textPair.rect?.top ?? Infinity, firstCodeBlock.rect.top),
            left: Math.min(textPair.rect?.left ?? Infinity, lastCbRect.left),
            right: Math.max(textPair.rect?.right ?? 0, lastCbRect.right),
            bottom: Math.max(textPair.rect?.bottom ?? 0, lastCbRect.bottom),
            width: Math.max(textPair.rect?.width ?? 0, lastCbRect.width ?? 0)
          };
        }



        // Remove standalone code block deletion pairs since they're now combined with text
        // Use filter to create new array instead of mutating
        const indicesToRemove: number[] = [];
        pairs.forEach((p, idx) => {
          if (p.isCodeBlockDeletion && !p.isCodeBlockReplacedByText) {
            indicesToRemove.push(idx);
          }
        });
        // Remove in reverse order to preserve indices
        for (let i = indicesToRemove.length - 1; i >= 0; i--) {
          pairs.splice(indicesToRemove[i], 1);
        }
        if (indicesToRemove.length > 0) {

        }
      }
    }

    // ========================================================================
    // TABLE PAIRS - Handle tables with pendingDelete/pendingInsert
    // Similar to image and code block handling but for tables
    // Supports: text+table, table+text, text+table+text, table+text+table
    // ========================================================================

    // Check if there are any text highlight pairs (green/red text changes)
    // If so, table insertions should be GROUPED with text changes (single action button)
    const hasTextHighlightPairsForTable = pairs.some(p => p.isTextOnly);


    // Check if this is a TABLE REPLACEMENT scenario:
    // - Both tableDeletions AND tableInsertions exist
    // - In replacement: NO buttons on red table, only on green table
    const isTableReplacement = tableDeletions.length > 0 && tableInsertions.length > 0;

    if (isTableReplacement) {
      // TABLE REPLACEMENT: Create ONE pair that covers ALL tables
      // Red tables are for comparison only (no buttons)
      // Green tables show ONE set of Accept/Discard buttons at the LAST table


      // Calculate the combined range for ALL deletions and ALL insertions
      const firstDeletion = tableDeletions[0];
      const lastDeletion = tableDeletions[tableDeletions.length - 1];
      const firstInsertion = tableInsertions[0];
      const lastInsertion = tableInsertions[tableInsertions.length - 1];

      // Red range covers ALL old tables (from first deletion start to last deletion end)
      const combinedRedRange = {
        from: firstDeletion.pos,
        to: lastDeletion.pos + lastDeletion.nodeSize
      };

      // Green range covers ALL new tables (from first insertion start to last insertion end)
      const combinedGreenRange = {
        from: firstInsertion.pos,
        to: lastInsertion.pos + lastInsertion.nodeSize
      };

      // Create ONE pair with buttons at the LAST new table
      pairs.push({
        redRange: combinedRedRange,
        greenRange: combinedGreenRange,
        rect: lastInsertion.rect, // Position buttons at LAST green table
        lastGreenRect: lastInsertion.rect,
        isTableInsertion: true,
        isTableReplacement: true // Flag to indicate this is a replacement
      });


    } else {
      // NOT a replacement - handle deletions and insertions separately

      // ========================================================================
      // TABLE REPLACED BY TEXT: table deletion + text highlight (no table insertion)
      // When old table is being replaced by plain text, combine them into one pair
      // ========================================================================
      const isTableReplacedByText = tableDeletions.length > 0 && tableInsertions.length === 0 && hasTextHighlightPairsForTable;

      if (isTableReplacedByText) {


        // Find the text-only pair to combine with (proximity-based for multiple pairs)
        const firstTable = tableDeletions[0];
        const lastTable = tableDeletions[tableDeletions.length - 1];
        const tableBlockStart = firstTable.pos;
        const tableBlockEnd = lastTable.pos + lastTable.nodeSize;

        let textPairIndex: number;
        if (hasMultipleTextPairs) {
          // Use proximity to find the owner text pair for this table deletion
          const ownerPair = findOwnerTextPair(tableBlockStart, tableBlockEnd);
          textPairIndex = ownerPair ? pairs.indexOf(ownerPair) : -1;

        } else {
          textPairIndex = pairs.findIndex(p => p.isTextOnly);
        }

        if (textPairIndex !== -1) {
          const textPair = pairs[textPairIndex];

          // Calculate combined red range (all table deletions)
          const combinedTableRedRange = {
            from: tableBlockStart,
            to: tableBlockEnd
          };

          // Extend or set the red range to include table deletion
          if (textPair.redRange) {
            textPair.redRange = {
              from: Math.min(textPair.redRange.from, combinedTableRedRange.from),
              to: Math.max(textPair.redRange.to, combinedTableRedRange.to)
            };
          } else {
            textPair.redRange = combinedTableRedRange;
          }

          // Mark as table-to-text replacement
          textPair.isTableReplacedByText = true;
          textPair.includesTableDeletion = true;

          // Update rect/lastGreenRect if table extends below current button position
          const lastTableRect = lastTable.rect;
          if (lastTableRect) {
            if (lastTableRect.bottom > (textPair.lastGreenRect?.bottom ?? 0)) {
              textPair.lastGreenRect = lastTableRect;
            }
            textPair.rect = {
              top: Math.min(textPair.rect?.top ?? Infinity, firstTable.rect.top),
              left: Math.min(textPair.rect?.left ?? Infinity, lastTableRect.left),
              right: Math.max(textPair.rect?.right ?? 0, lastTableRect.right),
              bottom: Math.max(textPair.rect?.bottom ?? 0, lastTableRect.bottom),
              width: Math.max(textPair.rect?.width ?? 0, lastTableRect.width ?? 0)
            };
          }


        } else {
          // Fallback: no text pair found, create standalone table deletion

          tableDeletions.forEach(tblDel => {
            pairs.push({
              redRange: { from: tblDel.pos, to: tblDel.pos + tblDel.nodeSize },
              greenRange: undefined,
              rect: tblDel.rect,
              lastGreenRect: tblDel.rect,
              isTableDeletion: true
            });
          });
        }
      } else {
        // Process table deletions as standalone (no text highlights to combine with)
        tableDeletions.forEach(tblDel => {
          pairs.push({
            redRange: { from: tblDel.pos, to: tblDel.pos + tblDel.nodeSize },
            greenRange: undefined,
            rect: tblDel.rect,
            lastGreenRect: tblDel.rect,
            isTableDeletion: true
          });

        });
      }

      // Process table insertions - ONLY if no text highlight pairs exist
      // When there are text highlights, the table is part of the same change
      // and should be handled by the global action bar (at the last green content)
      if (!hasTextHighlightPairsForTable) {

        tableInsertions.forEach(tblIns => {
          pairs.push({
            redRange: undefined,
            greenRange: { from: tblIns.pos, to: tblIns.pos + tblIns.nodeSize },
            rect: tblIns.rect,
            lastGreenRect: tblIns.rect,
            isTableInsertion: true
          });
        });
      } else if (tableInsertions.length > 0) {
        // Text highlight pairs exist AND table insertions exist
        // This is TEXT REPLACED BY TABLE case: old text (red) + new table (green)
        // Need to determine the LAST element (text or table) for button placement
        // Cases: text+table, table+text, text+table+text, table+text+table


        // Check if this is TEXT→TABLE case:
        // - Table insertions exist (green table)
        // - Text highlight pairs exist (red text = old content)
        // - No table deletions (old content is text, not table)
        const isTextReplacedByTable = tableDeletions.length === 0 && hasTextHighlightPairsForTable;


        if (hasMultipleTextPairs) {
          // ===== MULTI-PAIR MODE: Assign each table insertion to its closest text pair =====


          tableInsertions.forEach(tblIns => {
            const tableStart = tblIns.pos;
            const tableEnd = tblIns.pos + tblIns.nodeSize;

            // Find the closest text pair by minimum distance to pair's range
            let closestPair: any = null;
            let closestDist = Infinity;
            for (const pair of pairs) {
              if (!pair.isTextOnly) continue;
              const pairStart = Math.min(pair.redRange?.from ?? Infinity, pair.greenRange?.from ?? Infinity);
              const pairEnd = Math.max(pair.redRange?.to ?? 0, pair.greenRange?.to ?? 0);
              const dist = Math.min(Math.abs(tableStart - pairStart), Math.abs(tableStart - pairEnd));
              if (dist < closestDist) {
                closestDist = dist;
                closestPair = pair;
              }
            }

            if (closestPair) {
              const originalGreenEnd = closestPair.greenRange?.to || 0;

              // Extend greenRange to include this table
              if (closestPair.greenRange) {
                closestPair.greenRange = {
                  from: Math.min(closestPair.greenRange.from, tableStart),
                  to: Math.max(closestPair.greenRange.to, tableEnd)
                };
              } else {
                closestPair.greenRange = { from: tableStart, to: tableEnd };
              }

              // Button at last element: if text ends after table, button stays at text
              if (originalGreenEnd > 0 && originalGreenEnd > tableEnd) {
                closestPair.tableIsBeforeText = true;
              } else {
                closestPair.lastGreenRect = tblIns.rect;
              }
              closestPair.includesTableInsertion = true;
              closestPair.isTextReplacedByTable = true;

            } else {
              // No text pair found - create standalone pair
              pairs.push({
                redRange: undefined,
                greenRange: { from: tableStart, to: tableEnd },
                rect: tblIns.rect,
                lastGreenRect: tblIns.rect,
                isTableInsertion: true,
                includesTableInsertion: true
              });

            }
          });
        } else {
          // ===== SINGLE-PAIR MODE: Existing logic =====
          // Find the text-only pair and update it to include table
          const firstTableIns = tableInsertions[0];
          const lastTableIns = tableInsertions[tableInsertions.length - 1];
          const textPairIndexForTable = pairs.findIndex(p => p.isTextOnly);

          if (textPairIndexForTable !== -1) {
            const textPair = pairs[textPairIndexForTable];

            // Determine if table comes before, after, or in between text
            const textGreenEnd = textPair.greenRange?.to || 0;
            const textGreenStart = textPair.greenRange?.from || 0;
            const tableStart = firstTableIns.pos;
            const tableEnd = lastTableIns.pos + lastTableIns.nodeSize;



            // Extend the green range to include ALL content (both text and tables)
            if (textPair.greenRange) {
              const originalGreenRange = { ...textPair.greenRange };
              textPair.greenRange = {
                from: Math.min(textPair.greenRange.from, tableStart),
                to: Math.max(textPair.greenRange.to, tableEnd)
              };

            } else {
              textPair.greenRange = {
                from: tableStart,
                to: tableEnd
              };

            }

            // Button at LAST element: compare table end with text green end
            if (textGreenEnd > 0 && textGreenEnd > tableEnd) {

              textPair.tableIsBeforeText = true;
            } else {

              textPair.lastGreenRect = lastTableIns.rect;
            }
            textPair.includesTableInsertion = true;
            textPair.isTextReplacedByTable = true;


          } else if (isTextReplacedByTable) {


            const redOnlyPairIndex = pairs.findIndex(p => p.redRange && !p.greenRange);
            if (redOnlyPairIndex !== -1) {
              const redOnlyPair = pairs[redOnlyPairIndex];
              const lastTable = tableInsertions[tableInsertions.length - 1];
              const firstTable = tableInsertions[0];
              const tableStart = firstTable.pos;
              const tableEnd = lastTable.pos + lastTable.nodeSize;

              redOnlyPair.greenRange = {
                from: tableStart,
                to: tableEnd
              };
              redOnlyPair.lastGreenRect = lastTable.rect;
              redOnlyPair.includesTableInsertion = true;
              redOnlyPair.isTextReplacedByTable = true;


            } else {
              const lastTable = tableInsertions[tableInsertions.length - 1];
              const firstTable = tableInsertions[0];
              const tableStart = firstTable.pos;
              const tableEnd = lastTable.pos + lastTable.nodeSize;

              pairs.push({
                redRange: undefined,
                greenRange: { from: tableStart, to: tableEnd },
                rect: lastTable.rect,
                lastGreenRect: lastTable.rect,
                isTableInsertion: true,
                isTextReplacedByTable: true,
                includesTableInsertion: true
              });

            }
          }
        }
      }
    }

    // ========================================================================
    // TABLE DELETION + IMAGE INSERTION: Combine adjacent pairs
    // When a table is replaced by an image (no text content), pair detection creates
    // separate standalone pairs. Combine them into one pair: redRange=table, greenRange=image
    // ========================================================================
    const standaloneTableDelPairs = pairs.filter(p => p.isTableDeletion);
    const standaloneImgInsPairs = pairs.filter(p => p.isImageInsertion && !p.isImageReplacement);

    if (standaloneTableDelPairs.length > 0 && standaloneImgInsPairs.length > 0) {


      const imgPairIndicesToRemove = new Set<number>();

      for (const tablePair of standaloneTableDelPairs) {
        if (!tablePair.redRange) continue;
        const tableEnd = tablePair.redRange.to;

        // Find an image insertion pair that starts right after this table
        const adjacentImagePair = standaloneImgInsPairs.find(imgPair => {
          if (!imgPair.greenRange || imgPairIndicesToRemove.has(pairs.indexOf(imgPair))) return false;
          // Image should be right after the table (allowing small gap for structural nodes)
          return Math.abs(imgPair.greenRange.from - tableEnd) <= 2;
        });

        if (adjacentImagePair) {
          // Combine: table deletion (red) + image insertion (green) → single pair
          tablePair.greenRange = adjacentImagePair.greenRange;
          tablePair.lastGreenRect = adjacentImagePair.lastGreenRect || adjacentImagePair.rect;
          tablePair.isTableDeletion = false; // No longer standalone
          tablePair.includesImageInsertion = true;
          tablePair.includesTableDeletion = true;

          imgPairIndicesToRemove.add(pairs.indexOf(adjacentImagePair));

        }
      }

      // Remove merged image pairs in reverse order
      const sortedIndices = [...imgPairIndicesToRemove].sort((a, b) => b - a);
      for (const idx of sortedIndices) {
        pairs.splice(idx, 1);
      }
    }

    // ========================================================================
    // FINAL MERGING PASS: Combine remaining standalone deletion pairs into text pair
    // After all specific combination strategies (IMAGE→TEXT, CODE→TEXT, TABLE→TEXT, etc.),
    // there may still be standalone block deletion pairs (images, tables, code blocks)
    // that weren't merged. This happens when massive mixed content (TEXT+IMAGE+TABLE+CODE)
    // is replaced — individual strategies may not catch all block types.
    // Merge them all into the single text pair so there's ONE unified Accept/Discard action.
    // ========================================================================
    // Target pairs: prefer pairs with both greenRange+redRange, but also accept
    // deletion-only text pairs (redRange only, isTextOnly) for pure deletion scenarios
    const finalTextPairs = pairs.filter(p => p.greenRange && p.redRange);
    const finalDeletionOnlyTextPairs = finalTextPairs.length === 0
      ? pairs.filter(p => !p.greenRange && p.redRange && p.isTextOnly)
      : [];
    const mergeTargetPairs = finalTextPairs.length > 0 ? finalTextPairs : finalDeletionOnlyTextPairs;

    const finalStandaloneDeletions = pairs.filter(p =>
      !p.greenRange && p.redRange &&
      (p.isImageDeletion || p.isTableDeletion || p.isCodeBlockDeletion)
    );

    if (mergeTargetPairs.length >= 1 && finalStandaloneDeletions.length > 0) {


      const deletionIndicesToRemove = new Set<number>();

      for (const delPair of finalStandaloneDeletions) {
        // Find the best target pair to merge into (by proximity or the only one)
        let targetPair = null;
        if (mergeTargetPairs.length === 1) {
          targetPair = mergeTargetPairs[0];
        } else {
          // For multiple target pairs, find the closest one by position
          const delStart = delPair.redRange.from;
          const delEnd = delPair.redRange.to;
          let closestDist = Infinity;
          for (const tp of mergeTargetPairs) {
            const pairStart = Math.min(tp.redRange?.from ?? Infinity, tp.greenRange?.from ?? Infinity);
            const pairEnd = Math.max(tp.redRange?.to ?? 0, tp.greenRange?.to ?? 0);
            const dist = Math.min(Math.abs(delStart - pairStart), Math.abs(delStart - pairEnd), Math.abs(delEnd - pairStart), Math.abs(delEnd - pairEnd));
            if (dist < closestDist) {
              closestDist = dist;
              targetPair = tp;
            }
          }
        }

        if (targetPair) {
          // Extend target pair's redRange to include this deletion
          targetPair.redRange = {
            from: Math.min(targetPair.redRange.from, delPair.redRange.from),
            to: Math.max(targetPair.redRange.to, delPair.redRange.to)
          };
          // Update rect bounds
          if (delPair.rect) {
            targetPair.rect = {
              top: Math.min(targetPair.rect?.top ?? Infinity, delPair.rect.top),
              left: Math.min(targetPair.rect?.left ?? Infinity, delPair.rect.left),
              right: Math.max(targetPair.rect?.right ?? 0, delPair.rect.right),
              bottom: Math.max(targetPair.rect?.bottom ?? 0, delPair.rect.bottom),
              width: 0
            };
            targetPair.rect.width = targetPair.rect.right - targetPair.rect.left;
            // Also update lastGreenRect if the merged block extends below current button position
            // This ensures the action button appears at the BOTTOM of the entire pair
            if (delPair.rect.bottom > (targetPair.lastGreenRect?.bottom ?? 0)) {
              targetPair.lastGreenRect = {
                top: delPair.rect.top,
                left: delPair.rect.left,
                right: delPair.rect.right,
                bottom: delPair.rect.bottom,
                width: delPair.rect.width || (delPair.rect.right - delPair.rect.left)
              };
            }
          }
          // Propagate deletion type flags to the target pair
          if (delPair.isImageDeletion) targetPair.includesImageDeletion = true;
          if (delPair.isTableDeletion) targetPair.includesTableDeletion = true;
          if (delPair.isCodeBlockDeletion) targetPair.includesCodeBlockDeletion = true;

          deletionIndicesToRemove.add(pairs.indexOf(delPair));
        }
      }

      // Remove merged deletion pairs in reverse order
      const finalSortedIndices = [...deletionIndicesToRemove].sort((a, b) => b - a);
      for (const idx of finalSortedIndices) {
        pairs.splice(idx, 1);
      }

      if (deletionIndicesToRemove.size > 0) {

      }
    }

    // ========================================================================
    // BLOCK-TYPE ADJACENCY MERGE: After all specific strategies, merge adjacent
    // pairs ONLY when at least one pair is a block-type pair (image/table/code).
    // This handles cases where specific merge strategies missed a block deletion.
    // Two TEXT-ONLY pairs are NEVER merged — they represent separate AI operations.
    // ========================================================================
    if (pairs.length > 1) {
      // Sort by start position (earliest range start)
      pairs.sort((a, b) => {
        const aStart = Math.min(a.redRange?.from ?? Infinity, a.greenRange?.from ?? Infinity);
        const bStart = Math.min(b.redRange?.from ?? Infinity, b.greenRange?.from ?? Infinity);
        return aStart - bStart;
      });

      let i = 0;
      while (i < pairs.length - 1) {
        const current = pairs[i];
        const next = pairs[i + 1];

        const currentEnd = Math.max(current.redRange?.to ?? 0, current.greenRange?.to ?? 0);
        const nextStart = Math.min(next.redRange?.from ?? Infinity, next.greenRange?.from ?? Infinity);

        // Check if at least one pair is a block-type pair (not text-only)
        const currentIsBlock = current.isImageDeletion || current.isImageInsertion || current.isImageReplacement ||
                               current.isTableDeletion || current.isTableInsertion || current.isTableReplacement ||
                               current.isCodeBlockDeletion || current.isCodeBlockInsertion || current.isCodeBlockReplacement;
        const nextIsBlock = next.isImageDeletion || next.isImageInsertion || next.isImageReplacement ||
                            next.isTableDeletion || next.isTableInsertion || next.isTableReplacement ||
                            next.isCodeBlockDeletion || next.isCodeBlockInsertion || next.isCodeBlockReplacement;

        // Only merge if adjacent AND at least one is a block-type pair
        // Two text-only pairs = separate AI operations → keep separate
        // Don't merge if BOTH pairs are complete (have both red AND green ranges)
        // — they represent separate AI operations that should remain independent
        const currentIsComplete = current.redRange && current.greenRange;
        const nextIsComplete = next.redRange && next.greenRange;
        if (nextStart <= currentEnd + 5 && (currentIsBlock || nextIsBlock) && !(currentIsComplete && nextIsComplete)) {

          // Extend red range
          if (current.redRange && next.redRange) {
            current.redRange = {
              from: Math.min(current.redRange.from, next.redRange.from),
              to: Math.max(current.redRange.to, next.redRange.to)
            };
          } else if (next.redRange) {
            current.redRange = next.redRange;
          }

          // Extend green range
          if (current.greenRange && next.greenRange) {
            current.greenRange = {
              from: Math.min(current.greenRange.from, next.greenRange.from),
              to: Math.max(current.greenRange.to, next.greenRange.to)
            };
          } else if (next.greenRange) {
            current.greenRange = next.greenRange;
          }

          // Merge rects
          if (next.rect) {
            current.rect = {
              top: Math.min(current.rect?.top ?? Infinity, next.rect.top),
              left: Math.min(current.rect?.left ?? Infinity, next.rect.left),
              right: Math.max(current.rect?.right ?? 0, next.rect.right),
              bottom: Math.max(current.rect?.bottom ?? 0, next.rect.bottom),
              width: 0
            };
            current.rect.width = current.rect.right - current.rect.left;
          }

          // Update lastGreenRect to the bottommost rect (for button positioning at the end)
          if (next.lastGreenRect && (!current.lastGreenRect || next.lastGreenRect.bottom > current.lastGreenRect.bottom)) {
            current.lastGreenRect = next.lastGreenRect;
          }
          if (next.rect && (!current.lastGreenRect || next.rect.bottom > current.lastGreenRect.bottom)) {
            current.lastGreenRect = next.rect;
          }

          // Propagate ALL type flags from next → current
          if (next.isImageDeletion || next.includesImageDeletion) current.includesImageDeletion = true;
          if (next.isTableDeletion || next.includesTableDeletion) current.includesTableDeletion = true;
          if (next.isCodeBlockDeletion || next.includesCodeBlockDeletion) current.includesCodeBlockDeletion = true;
          if (next.isImageInsertion || next.includesImageInsertion) current.includesImageInsertion = true;
          if (next.isCodeBlockInsertion || next.includesCodeBlockInsertion) current.includesCodeBlockInsertion = true;
          if (next.isTableInsertion || next.includesTableInsertion) current.includesTableInsertion = true;
          if (next.isImageReplacement) current.isImageReplacement = true;
          if (next.isTableReplacement) current.isTableReplacement = true;
          if (next.isCodeBlockReplacement) current.isCodeBlockReplacement = true;
          if (next.isImageReplacedByText) current.isImageReplacedByText = true;
          if (next.isTableReplacedByText) current.isTableReplacedByText = true;
          if (next.isCodeBlockReplacedByText) current.isCodeBlockReplacedByText = true;
          if (next.isTextReplacedByImage) current.isTextReplacedByImage = true;
          if (next.isTextReplacedByCode) current.isTextReplacedByCode = true;
          if (next.isTextReplacedByTable) current.isTextReplacedByTable = true;
          if (next.includesTextInsertion) current.includesTextInsertion = true;

          // Clear ALL standalone type flags on the merged pair — it's now a combined pair,
          // NOT a standalone image/table/codeblock pair. This prevents the overlay from
          // skipping it (overlay skips standalone block pairs) and ensures correct rendering.
          current.isImageDeletion = false;
          current.isImageInsertion = false;
          current.isImageReplacement = false;
          current.isTableDeletion = false;
          current.isTableInsertion = false;
          current.isTableReplacement = false;
          current.isCodeBlockDeletion = false;
          current.isCodeBlockInsertion = false;
          current.isCodeBlockReplacement = false;

          // Remove the merged pair
          pairs.splice(i + 1, 1);
          // Don't increment i — check if the next pair also needs merging
        } else {
          i++;
        }
      }

    }

    // Build a fingerprint of the computed pairs to skip redundant state updates.
    // Without this check, new array references trigger re-renders → cascading effects
    // (DOM attribute sync, transaction handlers) → updateDiffRanges re-triggers infinitely.
    // Include rect dimensions for image/block pairs so rect changes (e.g., after image load) trigger updates.
    const pairsKey = pairs.map(p => {
      let key = `${p.redRange?.from ?? ''}-${p.redRange?.to ?? ''}:${p.greenRange?.from ?? ''}-${p.greenRange?.to ?? ''}`;
      if (p.isImageInsertion || p.isImageDeletion || p.isImageReplacement ||
          p.isTableInsertion || p.isTableDeletion || p.isTableReplacement ||
          p.isCodeBlockInsertion || p.isCodeBlockDeletion || p.isCodeBlockReplacement) {
        const r = p.rect;
        if (r) key += `:r${Math.round(r.top)},${Math.round(r.bottom)},${Math.round(r.right)}`;
      }
      return key;
    }).join('|') + `|r${ranges.length}`;

    if (pairsKey === lastDiffPairsKeyRef.current) {
      // Diff pairs unchanged — skip state update to break the loop
      return;
    }
    lastDiffPairsKeyRef.current = pairsKey;

    setDiffRanges(ranges);
    setDiffPairs(pairs);



    } finally {
      // Always reset the processing flag and set cooldown timestamp
      isProcessingDiffRangesRef.current = false;
      lastDiffRangesRunRef.current = Date.now();
    }
  }, [editorRef]);

  useEffect(() => {
    if (isReviewMode) {
      // Only run if content has actually changed (prevents loops from state updates)
      if (lastContentTriggerRef.current !== content) {
        lastContentTriggerRef.current = content;
        // Use requestAnimationFrame to ensure DOM is fully painted and positioned
        // before computing coordinates. This prevents missing pairs when
        // isReviewMode transitions to true (layout may not have settled yet).
        requestAnimationFrame(() => {
          updateDiffRanges();
        });
      }
    } else {
      setActiveReviewIndex(-1);
      setActivePairIndex(-1);
      setDiffRanges([]);
      setDiffPairs([]);
      // Reset refs when exiting review mode
      lastContentTriggerRef.current = null;
      lastDiffPairsKeyRef.current = '';
      hasAutoScrolledRef.current = false;
    }
  }, [isReviewMode, content, updateDiffRanges]);

  // Re-run updateDiffRanges when document changes while in review mode
  // This handles: undo/redo, individual accept/reject, and any other doc mutations
  // that don't change the content prop (which is blocked during pendingReview)
  useEffect(() => {
    if (!isReviewMode) return;
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    let rafId: number | null = null;
    const handleTransaction = ({ transaction }: any) => {
      if (transaction.docChanged) {
        // COOLDOWN: Skip if updateDiffRanges ran recently (within 500ms).
        // This prevents infinite loops caused by:
        //   updateDiffRanges → re-render → syncPendingAttributes (DOM changes)
        //   → ProseMirror MutationObserver → transaction(docChanged) → updateDiffRanges
        const timeSinceLastRun = Date.now() - lastDiffRangesRunRef.current;
        if (timeSinceLastRun < 500) {
          return;
        }
        // Also skip if currently processing
        if (isProcessingDiffRangesRef.current) {
          return;
        }
        // Debounce with RAF to avoid running multiple times per frame
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          updateDiffRanges();
          rafId = null;
        });
      }
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isReviewMode, updateDiffRanges]);

  // Initialize activePairIndex to 0 when diffPairs appear
  useEffect(() => {
    if (diffPairs.length > 0 && activePairIndex === -1) {
      setActivePairIndex(0);
    } else if (diffPairs.length === 0) {
      setActivePairIndex(-1);
    } else if (activePairIndex >= diffPairs.length) {
      // If current index is out of bounds, reset to last valid index
      setActivePairIndex(diffPairs.length - 1);
    }
  }, [diffPairs.length, activePairIndex]);

  // Auto-scroll to first comparison once when diff pairs appear
  useEffect(() => {
    if (diffPairs.length > 0 && !hasAutoScrolledRef.current && editorRef.current) {
      hasAutoScrolledRef.current = true;
      const editor = editorRef.current.getEditor();
      if (!editor) return;

      // Get position of the first pair (prefer redRange, fallback to greenRange)
      const firstPair = diffPairs[0];
      const targetPos = firstPair.redRange?.from ?? firstPair.greenRange?.from;
      if (targetPos == null) return;

      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        try {
          const coords = editor.view.coordsAtPos(targetPos);
          const scrollContainer =
            editor.view.dom.closest('.content-wrapper') as HTMLElement ||
            editor.view.dom.closest('.simple-editor-content')?.parentElement?.parentElement ||
            containerRef.current?.querySelector('.content-wrapper');

          if (scrollContainer && coords) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const scrollTop = scrollContainer.scrollTop;
            const targetScrollTop = scrollTop + (coords.top - containerRect.top) - (containerRect.height / 3);

            scrollContainer.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          }
        } catch (e) { /* ignore scroll errors */ }
      }, 100);
    }
  }, [diffPairs, editorRef]);

  // Notify parent whenever diffPairs change (for minimap integration)
  useEffect(() => {
    if (onDiffPairsChange) {
      onDiffPairsChange(diffPairs);
    }
  }, [diffPairs, onDiffPairsChange]);

  // Track whether we have diffs for smooth banner transitions
  const hasDiffs = diffRanges.length > 0 || diffPairs.length > 0;
  // Track if banner should be shown (with delayed hide to prevent blink)
  const [showBanner, setShowBanner] = useState(false);

  // Update banner visibility with delayed hide to prevent blink during accept/reject
  // Show banner ONLY when actual diff pairs exist (hasDiffs is true)
  // This prevents the banner from persisting when pendingReview is true but no pairs are computed
  // (e.g., after undo, or when highlights don't form valid pairs)
  useEffect(() => {
    // Show banner when:
    // 1. Not streaming (agent has stopped outputting)
    // 2. Not in focus mode
    // 3. hideReviewUI is false
    // 4. There are actual computed diffs (pairs or ranges)
    const shouldShowBanner = !isStreaming && !hideReviewUI && !focusMode && hasDiffs;

    if (shouldShowBanner) {
      // Show immediately when streaming completed with pending changes or diffs
      hadDiffsRef.current = true;
      setShowBanner(true);
      // Clear any pending hide timeout
      if (bannerHideTimeoutRef.current) {
        clearTimeout(bannerHideTimeoutRef.current);
        bannerHideTimeoutRef.current = null;
      }
    } else if (hadDiffsRef.current && !shouldShowBanner) {
      // We had diffs but now don't - delay hiding to prevent blink
      bannerHideTimeoutRef.current = setTimeout(() => {
        hadDiffsRef.current = false;
        setShowBanner(false);
      }, 100);
    } else if (isStreaming || hideReviewUI || focusMode) {
      setShowBanner(false);
      hadDiffsRef.current = false;
    }

    return () => {
      if (bannerHideTimeoutRef.current) {
        clearTimeout(bannerHideTimeoutRef.current);
      }
    };
  }, [hasDiffs, isStreaming, hideReviewUI, focusMode]);

  // Update diff ranges on scroll — debounced with RAF to avoid computing on every scroll pixel
  useEffect(() => {
    if (!isReviewMode || !editorRef.current) return;
    const editor = editorRef.current.getEditor();
    if (!editor) return;

    let scrollRafId: number | null = null;

    const handleScroll = () => {
      // Skip hover-clear if this scroll was triggered by navigation buttons
      if (!isNavigationScrollRef.current) {
        // Immediately hide Accept/Discard buttons on scroll to prevent them from
        // jumping around as positions recalculate during scroll
        if (lastHoverPairIndexRef.current !== -1 || textOnlyHoverIndexRef.current !== -1) {
          lastHoverPairIndexRef.current = -1;
          lastActiveReviewIndexRef.current = -1;
          textOnlyHoverIndexRef.current = -1;
          setHoverPairIndex(-1);
          setActiveReviewIndex(-1);
          setOverlayHoleRect(null);
          forceTextHoverUpdate(prev => prev + 1);
        }
      }
      // Debounce the expensive updateDiffRanges via RAF — only one recalc per frame
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      scrollRafId = requestAnimationFrame(() => {
        updateDiffRanges();
        scrollRafId = null;
      });
    };

    const scrollContainer = (editor.view.dom.closest('.content-wrapper') || editor.view.dom.closest('.simple-editor-content')?.parentElement?.parentElement) as HTMLElement;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        if (scrollRafId) cancelAnimationFrame(scrollRafId);
      };
    }
  }, [isReviewMode, editorRef, updateDiffRanges]);

  // Combined: Re-calculate diff ranges on image load + attach hover listeners for images
  // Uses a SINGLE MutationObserver instead of two separate ones (reduces cascading DOM events)
  useEffect(() => {
    if (!isReviewMode || !editorRef.current) return;
    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const dom = editor.view.dom;
    const loadHandlers = new Map<HTMLImageElement, () => void>();
    const hoverHandlers: { el: HTMLElement; enter: () => void; leave: () => void }[] = [];
    let imageHideTimeout: NodeJS.Timeout | null = null;

    const attachLoadListeners = () => {
      const pendingImages = dom.querySelectorAll(
        '.image-view--pending-insert img, .image-view--pending-delete img'
      ) as NodeListOf<HTMLImageElement>;

      pendingImages.forEach(img => {
        if (loadHandlers.has(img)) return;
        if (img.complete && img.naturalHeight > 0) {
          updateDiffRanges();
          return;
        }
        const handler = () => { updateDiffRanges(); };
        img.addEventListener('load', handler, { once: true });
        loadHandlers.set(img, handler);
      });
    };

    const attachImageHoverListeners = () => {
      hoverHandlers.forEach(h => {
        h.el.removeEventListener('mouseenter', h.enter);
        h.el.removeEventListener('mouseleave', h.leave);
      });
      hoverHandlers.length = 0;

      const imageWrappers = dom.querySelectorAll(
        '.image-view--pending-insert, .image-view--pending-delete'
      ) as NodeListOf<HTMLElement>;

      imageWrappers.forEach(wrapper => {
        const enter = () => {
          if (imageHideTimeout) { clearTimeout(imageHideTimeout); imageHideTimeout = null; }
          isHoveringImageRef.current = true;
          try {
            const imgPos = editor.view.posAtDOM(wrapper, 0);
            const pairIdx = diffPairs.findIndex(p => {
              if (p.greenRange && imgPos >= p.greenRange.from && imgPos <= p.greenRange.to) return true;
              if (p.redRange && imgPos >= p.redRange.from && imgPos <= p.redRange.to) return true;
              return false;
            });
            if (pairIdx >= 0) {
              lastHoverPairIndexRef.current = pairIdx;
              textOnlyHoverIndexRef.current = -1;
              setHoverPairIndex(pairIdx);
            }
          } catch (e) { /* posAtDOM can throw */ }
        };
        const leave = () => {
          isHoveringImageRef.current = false;
          imageHideTimeout = setTimeout(() => {
            if (!isHoveringButtonsRef.current) {
              lastHoverPairIndexRef.current = -1;
              textOnlyHoverIndexRef.current = -1;
              setHoverPairIndex(-1);
              setActiveReviewIndex(-1);
              forceTextHoverUpdate(prev => prev + 1);
            }
          }, 300);
        };
        wrapper.addEventListener('mouseenter', enter);
        wrapper.addEventListener('mouseleave', leave);
        hoverHandlers.push({ el: wrapper, enter, leave });
      });
    };

    // Initial scan
    attachLoadListeners();
    attachImageHoverListeners();

    // Single MutationObserver for both image load and hover listeners
    let mutationRafId: number | null = null;
    const observer = new MutationObserver(() => {
      // Debounce via RAF to avoid firing multiple times per DOM batch
      if (mutationRafId) cancelAnimationFrame(mutationRafId);
      mutationRafId = requestAnimationFrame(() => {
        attachLoadListeners();
        attachImageHoverListeners();
        mutationRafId = null;
      });
    });
    observer.observe(dom, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (mutationRafId) cancelAnimationFrame(mutationRafId);
      loadHandlers.forEach((handler, img) => {
        img.removeEventListener('load', handler);
      });
      loadHandlers.clear();
      hoverHandlers.forEach(h => {
        h.el.removeEventListener('mouseenter', h.enter);
        h.el.removeEventListener('mouseleave', h.leave);
      });
      if (imageHideTimeout) clearTimeout(imageHideTimeout);
    };
  }, [isReviewMode, editorRef, updateDiffRanges, diffPairs]);

  // Interaction Logic - Track last indices to prevent unnecessary state updates
  const lastActiveReviewIndexRef = useRef<number>(-1);
  const lastHoverPairIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!isReviewMode || !editorRef.current) return;
    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const dom = editor.view.dom;
    let hideTimeout: NodeJS.Timeout | null = null;

    const handleInteraction = (event: MouseEvent) => {
      // Real mouse interaction clears navigation hover flag (re-enables overlay)
      isNavigationHoverRef.current = false;
      // Track mouse position for scroll re-evaluation
      lastMousePosRef.current = { clientX: event.clientX, clientY: event.clientY };

      // Clear any pending hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });

      // DOM-BASED DETECTION: Check if mouse target is inside a <mark> element or pending block node
      // This is more reliable than position-based detection because it works on margins, padding, and line breaks
      const findPairFromDOM = (): number => {
        let target = event.target as HTMLElement | null;
        let foundMark: HTMLElement | null = null;
        let foundPendingBlock: HTMLElement | null = null;

        // Walk up the DOM tree to find a <mark> or pending block node
        while (target && target !== editor.view.dom) {
          if (target.tagName === 'MARK' && target.getAttribute('data-color')) {
            foundMark = target;
            break;
          }
          // Check for pending block nodes (tables, code blocks, images)
          if (target.tagName === 'TABLE' && (target.getAttribute('data-pending-delete') === 'true' || target.getAttribute('data-pending-insert') === 'true' || target.classList.contains('pending-delete-table') || target.classList.contains('pending-insert-table'))) {
            foundPendingBlock = target;
            break;
          }
          if (target.tagName === 'PRE' && (target.getAttribute('data-pending-delete') === 'true' || target.getAttribute('data-pending-insert') === 'true')) {
            foundPendingBlock = target;
            break;
          }
          if (target.classList?.contains('image-view--pending-insert') || target.classList?.contains('image-view--pending-delete')) {
            foundPendingBlock = target;
            break;
          }
          // Check for blockquote containing highlighted text (e.g., GREEN-only blockquote insertion)
          // When hovering the blockquote border/padding, the target is the blockquote itself
          if (target.tagName === 'BLOCKQUOTE' && !foundMark) {
            const innerMark = target.querySelector('mark[data-color]') as HTMLElement | null;
            if (innerMark) {
              foundMark = innerMark;
              break;
            }
          }
          target = target.parentElement;
        }

        if (!foundMark && !foundPendingBlock) return -1;

        try {
          if (foundMark) {
            const markPos = editor.view.posAtDOM(foundMark, 0);

            // Find which pair this position belongs to (exact match first)
            let idx = diffPairs.findIndex(p => {
              if (p.redRange && markPos >= p.redRange.from && markPos <= p.redRange.to) return true;
              if (p.greenRange && markPos >= p.greenRange.from && markPos <= p.greenRange.to) return true;
              return false;
            });
            // Fallback: try with tolerance (±5 positions) for edge cases where posAtDOM
            // returns a position at the mark boundary rather than inside the range
            if (idx === -1) {
              const TOLERANCE = 5;
              idx = diffPairs.findIndex(p => {
                if (p.redRange && markPos >= (p.redRange.from - TOLERANCE) && markPos <= (p.redRange.to + TOLERANCE)) return true;
                if (p.greenRange && markPos >= (p.greenRange.from - TOLERANCE) && markPos <= (p.greenRange.to + TOLERANCE)) return true;
                return false;
              });
            }
            // Last resort: find the nearest pair by document position
            if (idx === -1 && diffPairs.length > 0) {
              let minDist = Infinity;
              diffPairs.forEach((p, i) => {
                const redDist = p.redRange ? Math.min(Math.abs(markPos - p.redRange.from), Math.abs(markPos - p.redRange.to)) : Infinity;
                const greenDist = p.greenRange ? Math.min(Math.abs(markPos - p.greenRange.from), Math.abs(markPos - p.greenRange.to)) : Infinity;
                const dist = Math.min(redDist, greenDist);
                if (dist < minDist) { minDist = dist; idx = i; }
              });
              // Only use nearest if it's reasonably close (within 50 positions)
              if (minDist > 50) idx = -1;
            }
            return idx;
          }
          if (foundPendingBlock) {
            const blockPos = editor.view.posAtDOM(foundPendingBlock, 0);
            let idx = diffPairs.findIndex(p => {
              if (p.redRange && blockPos >= p.redRange.from && blockPos <= p.redRange.to) return true;
              if (p.greenRange && blockPos >= p.greenRange.from && blockPos <= p.greenRange.to) return true;
              return false;
            });
            // Tolerance fallback for pending blocks
            if (idx === -1) {
              const TOLERANCE = 10;
              idx = diffPairs.findIndex(p => {
                if (p.redRange && blockPos >= (p.redRange.from - TOLERANCE) && blockPos <= (p.redRange.to + TOLERANCE)) return true;
                if (p.greenRange && blockPos >= (p.greenRange.from - TOLERANCE) && blockPos <= (p.greenRange.to + TOLERANCE)) return true;
                return false;
              });
            }
            return idx;
          }
        } catch (e) { /* posAtDOM can throw */ }

        return -1;
      };

      // Check if mouse is over an image wrapper (even if not over content)
      // This handles hovering on the padding/border area of the green boundary
      const checkImageWrapperHover = (): number => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return -1;

        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        return diffPairs.findIndex(p => {
          // Check if this pair has a valid rect (all image-related pairs should have one)
          if (p.rect) {
            const inRect = mouseX >= p.rect.left && mouseX <= p.rect.right &&
                          mouseY >= p.rect.top && mouseY <= p.rect.bottom;
            if (inRect) return true;
          }
          return false;
        });
      };

      if (!pos) {
         // Check DOM-based detection first (handles margins, padding areas)
         const domPairIndex = findPairFromDOM();
         if (domPairIndex !== -1) {
           if (domPairIndex !== lastHoverPairIndexRef.current) {
             lastHoverPairIndexRef.current = domPairIndex;
             // Determine hover type for the found pair
             const foundPair = diffPairs[domPairIndex];
             const hasBlockPairs = diffPairs.some(p => p.isImageDeletion || p.isImageReplacement || p.isImageInsertion);
             const isSpecialPair = foundPair?.includesTableDeletion || foundPair?.isTableReplacedByText ||
                                   foundPair?.includesCodeBlockDeletion || foundPair?.isCodeBlockReplacedByText ||
                                   foundPair?.isCodeBlockDeletion || foundPair?.isCodeBlockInsertion || foundPair?.isCodeBlockReplacement ||
                                   foundPair?.isTableDeletion || foundPair?.isTableInsertion || foundPair?.isTableReplacement;
             if (isSpecialPair || (foundPair?.isTextOnly && hasBlockPairs)) {
               textOnlyHoverIndexRef.current = domPairIndex;
               forceTextHoverUpdate(prev => prev + 1);
             } else {
               textOnlyHoverIndexRef.current = -1;
               setHoverPairIndex(domPairIndex);
             }
           }
           return;
         }

         // Check if we're hovering over an image wrapper boundary
         const imageWrapperIndex = checkImageWrapperHover();
         if (imageWrapperIndex !== -1) {
           if (imageWrapperIndex !== lastHoverPairIndexRef.current) {
             lastHoverPairIndexRef.current = imageWrapperIndex;
             setHoverPairIndex(imageWrapperIndex);
           }
           return;
         }

         // Live coordsAtPos fallback: posAtCoords returned null but we might still be over diff content
         // This handles edge cases where the mouse is over margins/padding between blocks
         if (diffPairs.length > 0) {
           const mouseY = event.clientY;
           const livePairIndex = diffPairs.findIndex(p => {
             const range = p.greenRange || p.redRange;
             if (!range) return false;
             try {
               const startCoords = editor.view.coordsAtPos(range.from);
               const endCoords = editor.view.coordsAtPos(Math.min(range.to, editor.state.doc.content.size));
               return mouseY >= (startCoords.top - 10) && mouseY <= (endCoords.bottom + 10);
             } catch { return false; }
           });
           if (livePairIndex !== -1) {
             if (livePairIndex !== lastHoverPairIndexRef.current) {
               lastHoverPairIndexRef.current = livePairIndex;
               const foundPair = diffPairs[livePairIndex];
               const hasBlockPairs = diffPairs.some(p => p.isImageDeletion || p.isImageReplacement || p.isImageInsertion);
               const isSpecialPair = foundPair?.includesTableDeletion || foundPair?.isTableReplacedByText ||
                                     foundPair?.includesCodeBlockDeletion || foundPair?.isCodeBlockReplacedByText ||
                                     foundPair?.isCodeBlockDeletion || foundPair?.isCodeBlockInsertion || foundPair?.isCodeBlockReplacement ||
                                     foundPair?.isTableDeletion || foundPair?.isTableInsertion || foundPair?.isTableReplacement;
               if (isSpecialPair || (foundPair?.isTextOnly && hasBlockPairs)) {
                 textOnlyHoverIndexRef.current = livePairIndex;
                 forceTextHoverUpdate(prev => prev + 1);
               } else {
                 textOnlyHoverIndexRef.current = -1;
                 setHoverPairIndex(livePairIndex);
               }
             }
             return;
           }
         }

         // Delay hiding to allow moving to buttons
         hideTimeout = setTimeout(() => {
           // Don't hide if hovering over buttons or image
           if (!isHoveringButtonsRef.current && !isHoveringImageRef.current) {
             if (lastActiveReviewIndexRef.current !== -1) {
               lastActiveReviewIndexRef.current = -1;
               setActiveReviewIndex(-1);
             }
             if (lastHoverPairIndexRef.current !== -1) {
               lastHoverPairIndexRef.current = -1;
               setHoverPairIndex(-1);
             }
             // Also clear text-only hover ref
             if (textOnlyHoverIndexRef.current !== -1) {
               textOnlyHoverIndexRef.current = -1;
               forceTextHoverUpdate(prev => prev + 1);
             }
           }
         }, 150);
         return;
      }

      const rangeIndex = diffRanges.findIndex(r => pos.pos >= r.from && pos.pos <= r.to);
      // Only update state if range index actually changed
      if (rangeIndex !== lastActiveReviewIndexRef.current) {
        lastActiveReviewIndexRef.current = rangeIndex;
        setActiveReviewIndex(rangeIndex);
      }

      // Check for diff pair hover (for individual buttons)
      // PRIMARY: DOM-based detection (handles padding, margins, line breaks)
      let pairIndex = findPairFromDOM();

      // FALLBACK: Position-based detection
      if (pairIndex === -1) {
        pairIndex = diffPairs.findIndex(p => {
          const inRed = p.redRange && pos.pos >= p.redRange.from && pos.pos <= p.redRange.to;
          const inGreen = p.greenRange && pos.pos >= p.greenRange.from && pos.pos <= p.greenRange.to;

          // Also check if mouse is within the visual boundary (handles padding/margin areas)
          if (p.rect) {
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (containerRect) {
              const mouseX = event.clientX - containerRect.left;
              const mouseY = event.clientY - containerRect.top;
              const inRect = mouseX >= p.rect.left && mouseX <= p.rect.right &&
                            mouseY >= p.rect.top && mouseY <= p.rect.bottom;
              if (inRect) return true;
            }
          }

          return inRed || inGreen;
        });
      }

      // Fallback: if no pair found via exact range/rect, check with expanded vertical padding
      // This handles cases where mouse is in heading margin/padding near the pair content
      if (pairIndex === -1) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const mouseX = event.clientX - containerRect.left;
          const mouseY = event.clientY - containerRect.top;
          const VERTICAL_PADDING = 8; // px padding above/below the pair rect
          pairIndex = diffPairs.findIndex(p => {
            if (!p.rect) return false;
            return mouseX >= p.rect.left && mouseX <= p.rect.right &&
                   mouseY >= (p.rect.top - VERTICAL_PADDING) && mouseY <= (p.rect.bottom + VERTICAL_PADDING);
          });
        }
      }

      // Last resort: Use LIVE coordsAtPos to compute fresh rects for each pair
      // Stored rects become stale after scrolling since buttons are positioned in the non-scrolling container
      if (pairIndex === -1 && diffPairs.length > 0) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const mouseY = event.clientY;
          pairIndex = diffPairs.findIndex(p => {
            const range = p.greenRange || p.redRange;
            if (!range) return false;
            try {
              const startCoords = editor.view.coordsAtPos(range.from);
              const endCoords = editor.view.coordsAtPos(Math.min(range.to, editor.state.doc.content.size));
              // Check if mouse Y is between the start and end of this pair (viewport coords)
              return mouseY >= (startCoords.top - 10) && mouseY <= (endCoords.bottom + 10);
            } catch { return false; }
          });
        }
      }

      // Debug: log hover detection result (only when position changes significantly)
      if (pairIndex >= 0 || (pos && diffPairs.some(p => (p.greenRange && pos.pos >= p.greenRange.from && pos.pos <= p.greenRange.to) || (p.redRange && pos.pos >= p.redRange.from && pos.pos <= p.redRange.to)))) {
        if (pairIndex !== lastHoverPairIndexRef.current) {

        }
      }

      // Check if there are any image pairs in the document
      const hasImagePairs = diffPairs.some(p => p.isImageDeletion || p.isImageReplacement || p.isImageInsertion);

      // Check if the hovered pair is text-only, table→text, code→text, or standalone code/table (which needs special handling)
      const hoveredPair = pairIndex >= 0 ? diffPairs[pairIndex] : null;
      const isTextOnlyHover = hoveredPair?.isTextOnly === true;
      const isTableTextHover = hoveredPair?.includesTableDeletion === true || hoveredPair?.isTableReplacedByText === true;
      const isCodeTextHover = hoveredPair?.includesCodeBlockDeletion === true || hoveredPair?.isCodeBlockReplacedByText === true;
      // Standalone code block pairs (deletion, insertion, replacement)
      const isCodeBlockPairHover = hoveredPair?.isCodeBlockDeletion === true ||
                                   hoveredPair?.isCodeBlockInsertion === true ||
                                   hoveredPair?.isCodeBlockReplacement === true;
      // Standalone table pairs (deletion, insertion, replacement)
      const isTablePairHover = hoveredPair?.isTableDeletion === true ||
                               hoveredPair?.isTableInsertion === true ||
                               hoveredPair?.isTableReplacement === true;

      // Only update state if the pair index actually changed (prevents unnecessary re-renders)
      if (pairIndex !== lastHoverPairIndexRef.current) {
        // When moving OFF a pair (pairIndex = -1), delay clearing to let user reach the button
        if (pairIndex === -1 && lastHoverPairIndexRef.current >= 0) {
          hideTimeout = setTimeout(() => {
            if (!isHoveringButtonsRef.current && !isHoveringImageRef.current) {
              lastHoverPairIndexRef.current = -1;
              lastActiveReviewIndexRef.current = -1;
              textOnlyHoverIndexRef.current = -1;
              setHoverPairIndex(-1);
              setActiveReviewIndex(-1);
              forceTextHoverUpdate(prev => prev + 1);
            }
          }, 150);
          return;
        }

        lastHoverPairIndexRef.current = pairIndex;

        // For table→text, code→text, standalone code block, or standalone table pairs, use ref + forceTextHoverUpdate
        // This triggers a re-render for button UI only (NOT syncPendingAttributes to avoid blinking)
        if (isTableTextHover || isCodeTextHover || isCodeBlockPairHover || isTablePairHover) {
          textOnlyHoverIndexRef.current = pairIndex;
          // Clear state-based hover to prevent ghost buttons on previous pair
          if (hoverPairIndex >= 0) {
            setHoverPairIndex(-1);
          }
          forceTextHoverUpdate(prev => prev + 1);
        }
        // If hovering on text-only pair and there are image pairs, use ref instead of state
        // This prevents React re-renders that cause image blinking
        else if (isTextOnlyHover && hasImagePairs) {
          // Update ref and trigger minimal update for buttons only
          textOnlyHoverIndexRef.current = pairIndex;
          // Only trigger state update if we were previously on an image pair
          if (hoverPairIndex >= 0 && !diffPairs[hoverPairIndex]?.isTextOnly) {
            setHoverPairIndex(-1); // Clear image hover state
          }
          forceTextHoverUpdate(prev => prev + 1); // Minimal update for text buttons
        } else {
          // For image pairs or when no images exist, use normal state
          textOnlyHoverIndexRef.current = -1;
          setHoverPairIndex(pairIndex);
        }
      }
    };

    // Throttle mousemove to avoid expensive posAtCoords/coordsAtPos on every pixel
    let lastMoveTime = 0;
    const THROTTLE_MS = 32; // ~30fps — smooth enough for hover, much cheaper than 60fps
    let pendingMoveRaf: number | null = null;

    const throttledInteraction = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < THROTTLE_MS) {
        // Schedule a trailing call so the final position is always processed
        if (pendingMoveRaf) cancelAnimationFrame(pendingMoveRaf);
        pendingMoveRaf = requestAnimationFrame(() => {
          lastMoveTime = performance.now();
          handleInteraction(event);
          pendingMoveRaf = null;
        });
        return;
      }
      lastMoveTime = now;
      handleInteraction(event);
    };

    dom.addEventListener('mousemove', throttledInteraction);
    return () => {
      dom.removeEventListener('mousemove', throttledInteraction);
      if (hideTimeout) clearTimeout(hideTimeout);
      if (pendingMoveRaf) cancelAnimationFrame(pendingMoveRaf);
    };
  }, [isReviewMode, diffRanges, diffPairs, editorRef, hoverPairIndex, forceTextHoverUpdate]);

  // Mark active review range nodes with data attribute
  useEffect(() => {
    if (!editorRef.current || !isReviewMode) return;

    // Skip if hover pair index hasn't actually changed (prevents unnecessary DOM manipulation)
    if (hoverPairIndex === prevHoverPairIndexRef.current && activeReviewIndex === -1) {
      return;
    }
    prevHoverPairIndexRef.current = hoverPairIndex;

    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const dom = editor.view.dom;

    // Clear all previous markers (except on images and pending tables to prevent reload/flicker)
    dom.querySelectorAll('[data-active-review]').forEach(el => {
      // Skip images to prevent reload/flicker
      if (el.tagName === 'IMG' || el.classList.contains('resizable-image-node')) {
        return;
      }
      // Skip tables with pending attributes to prevent color flicker
      if (el.tagName === 'TABLE' && (el.hasAttribute('data-pending-insert') || el.hasAttribute('data-pending-delete'))) {
        return;
      }
      // Skip elements inside pending tables
      const parentTable = el.closest('table[data-pending-insert], table[data-pending-delete]');
      if (parentTable) {
        return;
      }
      el.removeAttribute('data-active-review');
    });

    // Helper to mark node if not an image or pending table
    const markNodeIfNotImage = (node: any, pos: number) => {
      // Skip image nodes to prevent reload/flicker
      if (node.type.name === 'image' || node.type.name === 'resizableImage') {
        return;
      }
      // Skip table nodes with pending attributes to prevent color flicker
      if (node.type.name === 'table' && (node.attrs.pendingInsert || node.attrs.pendingDelete)) {
        return;
      }
      try {
        const domNode = editor.view.nodeDOM(pos);
        if (domNode && domNode instanceof HTMLElement) {
          // Double-check it's not an image element
          if (domNode.tagName === 'IMG' || domNode.classList.contains('resizable-image-node')) {
            return;
          }
          // Double-check it's not a pending table or inside one
          if (domNode.tagName === 'TABLE' && (domNode.hasAttribute('data-pending-insert') || domNode.hasAttribute('data-pending-delete'))) {
            return;
          }
          const parentTable = domNode.closest('table[data-pending-insert], table[data-pending-delete]');
          if (parentTable) {
            return;
          }
          domNode.setAttribute('data-active-review', 'true');
        }
      } catch (e) {}
    };

    // SAFETY: Check bounds before nodesBetween to prevent errors when document changes
    const docSize = editor.state.doc.content.size;

    // Mark nodes in active range (from diffRanges)
    if (activeReviewIndex >= 0 && diffRanges[activeReviewIndex]) {
      const range = diffRanges[activeReviewIndex];
      const safeFrom = Math.max(0, Math.min(range.from, docSize));
      const safeTo = Math.max(0, Math.min(range.to, docSize));
      if (safeFrom < safeTo) {
        try {
          editor.state.doc.nodesBetween(safeFrom, safeTo, (node, pos) => {
            markNodeIfNotImage(node, pos);
            return true;
          });
        } catch (e) {
          console.warn('[BlogEditor] Error in nodesBetween for active range:', e);
        }
      }
    }

    // Mark nodes in hovered pair (from diffPairs) - for dimming overlay
    if (hoverPairIndex >= 0 && diffPairs[hoverPairIndex]) {
      const pair = diffPairs[hoverPairIndex];
      // Mark green range nodes
      if (pair.greenRange) {
        const safeGreenFrom = Math.max(0, Math.min(pair.greenRange.from, docSize));
        const safeGreenTo = Math.max(0, Math.min(pair.greenRange.to, docSize));
        if (safeGreenFrom < safeGreenTo) {
          try {
            editor.state.doc.nodesBetween(safeGreenFrom, safeGreenTo, (node, pos) => {
              markNodeIfNotImage(node, pos);
              return true;
            });
          } catch (e) {
            console.warn('[BlogEditor] Error in nodesBetween for green range:', e);
          }
        }
      }
      // Mark red range nodes
      if (pair.redRange) {
        const safeRedFrom = Math.max(0, Math.min(pair.redRange.from, docSize));
        const safeRedTo = Math.max(0, Math.min(pair.redRange.to, docSize));
        if (safeRedFrom < safeRedTo) {
          try {
            editor.state.doc.nodesBetween(safeRedFrom, safeRedTo, (node, pos) => {
              markNodeIfNotImage(node, pos);
              return true;
            });
          } catch (e) {
            console.warn('[BlogEditor] Error in nodesBetween for red range:', e);
          }
        }
      }
    }
  }, [activeReviewIndex, diffRanges, hoverPairIndex, diffPairs, isReviewMode, editorRef]);

  // Calculate overlay hole rect in useEffect to avoid DOM queries during render
  // This prevents image re-renders caused by DOM queries in render phase
  useEffect(() => {
    if (!editorRef.current || !isReviewMode || hoverPairIndex === -1 || isNavigationHoverRef.current) {
      setOverlayHoleRect(null);
      return;
    }

    const pair = diffPairs[hoverPairIndex];
    if (!pair) {
      setOverlayHoleRect(null);
      return;
    }

    // Skip for STANDALONE table and code block pair types (they have their own styling)
    // Combined pairs (text + table/code) should still show overlay for the text portion
    if (pair.isTableDeletion || pair.isTableInsertion || pair.isTableReplacement ||
        pair.isCodeBlockDeletion || pair.isCodeBlockInsertion || pair.isCodeBlockReplacement) {
      setOverlayHoleRect(null);
      return;
    }

    // Note: Image pairs are now supported - DOM queries happen in useEffect, not render
    // so they won't cause image re-renders

    const editor = editorRef.current.getEditor();
    if (!editor || (!pair.greenRange && !pair.redRange)) {
      setOverlayHoleRect(null);
      return;
    }

    // Calculate overlay rect from DOM
    let fullTop = Infinity;
    let fullBottom = 0;

    const dom = editor.view.dom;
    const allMarks = dom.querySelectorAll('mark[data-color]') as NodeListOf<HTMLElement>;

    allMarks.forEach(mark => {
      const dataColor = mark.getAttribute('data-color')?.toLowerCase() || '';
      const isGreen = dataColor.includes('c7f0d6') || dataColor.includes('d5f6e7');
      const isRed = dataColor.includes('fecaca');

      if (!isGreen && !isRed) return;

      try {
        const markPos = editor.view.posAtDOM(mark, 0);
        let isInPair = false;

        if (isGreen && pair.greenRange && markPos >= pair.greenRange.from && markPos <= pair.greenRange.to) {
          isInPair = true;
        }
        if (isRed && pair.redRange && markPos >= pair.redRange.from && markPos <= pair.redRange.to) {
          isInPair = true;
        }

        if (isInPair) {
          const rect = mark.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const relativeTop = rect.top - containerRect.top + (containerRef.current?.scrollTop || 0);
            const relativeBottom = rect.bottom - containerRect.top + (containerRef.current?.scrollTop || 0);
            fullTop = Math.min(fullTop, relativeTop);
            fullBottom = Math.max(fullBottom, relativeBottom);
          }
        }
      } catch (e) {}
    });

    // Also check for images (both pending insert and pending delete) within the pair's range
    // Images are block-level nodes that don't use <mark> elements, so they need separate handling
    // Filter by pair range to avoid including images from other pairs
    if (pair.greenRange || pair.redRange) {
      const pendingImages = dom.querySelectorAll('.image-view--pending-insert, .image-view--pending-delete') as NodeListOf<HTMLElement>;
      pendingImages.forEach(img => {
        try {
          // Verify this image is within the hovered pair's range
          const imgPos = editor.view.posAtDOM(img, 0);
          const inGreen = pair.greenRange && imgPos >= pair.greenRange.from && imgPos <= pair.greenRange.to;
          const inRed = pair.redRange && imgPos >= pair.redRange.from && imgPos <= pair.redRange.to;
          if (!inGreen && !inRed) return;

          const rect = img.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const relativeTop = rect.top - containerRect.top + (containerRef.current?.scrollTop || 0);
            const relativeBottom = rect.bottom - containerRect.top + (containerRef.current?.scrollTop || 0);
            fullTop = Math.min(fullTop, relativeTop);
            fullBottom = Math.max(fullBottom, relativeBottom);
          }
        } catch (e) { /* ignore position errors */ }
      });
    }

    // Also check for tables (pending insert and pending delete) within the pair's range
    // Tables are block-level nodes that don't use <mark> elements, so they need separate handling
    if (pair.greenRange || pair.redRange) {
      const pendingTables = dom.querySelectorAll('.pending-insert-table, .pending-delete-table') as NodeListOf<HTMLElement>;
      pendingTables.forEach(tableEl => {
        try {
          // Verify this table is within the hovered pair's range
          const tablePos = editor.view.posAtDOM(tableEl, 0);
          const inGreen = pair.greenRange && tablePos >= pair.greenRange.from && tablePos <= pair.greenRange.to;
          const inRed = pair.redRange && tablePos >= pair.redRange.from && tablePos <= pair.redRange.to;
          if (!inGreen && !inRed) return;

          const rect = tableEl.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const relativeTop = rect.top - containerRect.top + (containerRef.current?.scrollTop || 0);
            const relativeBottom = rect.bottom - containerRect.top + (containerRef.current?.scrollTop || 0);
            fullTop = Math.min(fullTop, relativeTop);
            fullBottom = Math.max(fullBottom, relativeBottom);
          }
        } catch (e) { /* ignore position errors */ }
      });
    }

    // Also check for code blocks (pending insert and pending delete) within the pair's range
    // Code blocks are block-level nodes that use pendingInsert/pendingDelete attributes
    if (pair.greenRange || pair.redRange) {
      const pendingCodeBlocks = dom.querySelectorAll('.pending-insert-codeblock, .pending-delete-codeblock') as NodeListOf<HTMLElement>;
      pendingCodeBlocks.forEach(codeEl => {
        try {
          const codePos = editor.view.posAtDOM(codeEl, 0);
          const inGreen = pair.greenRange && codePos >= pair.greenRange.from && codePos <= pair.greenRange.to;
          const inRed = pair.redRange && codePos >= pair.redRange.from && codePos <= pair.redRange.to;
          if (!inGreen && !inRed) return;

          const rect = codeEl.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const relativeTop = rect.top - containerRect.top + (containerRef.current?.scrollTop || 0);
            const relativeBottom = rect.bottom - containerRect.top + (containerRef.current?.scrollTop || 0);
            fullTop = Math.min(fullTop, relativeTop);
            fullBottom = Math.max(fullBottom, relativeBottom);
          }
        } catch (e) { /* ignore position errors */ }
      });
    }

    // Always incorporate pair.rect and lastGreenRect to ensure full pair coverage
    // Previously this was fallback-only (when no marks found), which caused the overlay
    // to miss the green area when only red marks were detected in the DOM query.
    // pair.rect/lastGreenRect use viewport-relative coords (no scrollTop), so add scrollTop
    // to match the document-relative coords used by the mark/element scanning above.
    const scrollTopForRect = containerRef.current?.scrollTop || 0;
    if (pair.rect) {
      fullTop = Math.min(fullTop, pair.rect.top + scrollTopForRect);
      fullBottom = Math.max(fullBottom, pair.rect.bottom + scrollTopForRect);
    }
    if (pair.lastGreenRect) {
      fullTop = Math.min(fullTop, pair.lastGreenRect.top + scrollTopForRect);
      fullBottom = Math.max(fullBottom, pair.lastGreenRect.bottom + scrollTopForRect);
    }

    if (fullTop !== Infinity && fullBottom !== 0) {
      setOverlayHoleRect({ top: fullTop - 1, bottom: fullBottom + 1 });
    } else {
      setOverlayHoleRect(null);
    }
  }, [hoverPairIndex, diffPairs, isReviewMode, editorRef]);

  // Sync table AND code block pending DOM attributes when hover state changes
  // TipTap's NodeViews don't persist data-pending-* attributes on re-render,
  // so we need to re-apply them whenever React causes a re-render (e.g., hover changes)
  useEffect(() => {
    if (!editorRef.current || !isReviewMode) return;

    const editor = editorRef.current.getEditor();
    if (!editor) return;

    // Function to sync table AND code block DOM attributes with ProseMirror state
    // IMPORTANT: Only set attributes if not already set to prevent infinite MutationObserver loops
    const syncPendingAttributes = () => {
      const { doc } = editor.state;

      doc.descendants((node, pos) => {
        // Handle tables
        if (node.type.name === 'table') {
          const { pendingDelete, pendingInsert } = node.attrs;

          try {
            const domNode = editor.view.nodeDOM(pos);
            if (domNode) {
              const tableElement = domNode instanceof HTMLTableElement
                ? domNode
                : (domNode as HTMLElement).querySelector?.('table') || domNode;

              if (tableElement instanceof HTMLElement) {
                // Sync pendingDelete: add if true, REMOVE if false
                if (pendingDelete === true && !tableElement.hasAttribute('data-pending-delete')) {
                  tableElement.setAttribute('data-pending-delete', 'true');
                  tableElement.classList.add('pending-delete-table');
                } else if (pendingDelete !== true && tableElement.hasAttribute('data-pending-delete')) {
                  tableElement.removeAttribute('data-pending-delete');
                  tableElement.classList.remove('pending-delete-table');
                }

                // Sync pendingInsert: add if true, REMOVE if false
                if (pendingInsert === true && !tableElement.hasAttribute('data-pending-insert')) {
                  tableElement.setAttribute('data-pending-insert', 'true');
                  tableElement.classList.add('pending-insert-table');
                } else if (pendingInsert !== true && tableElement.hasAttribute('data-pending-insert')) {
                  tableElement.removeAttribute('data-pending-insert');
                  tableElement.classList.remove('pending-insert-table');
                }
              }
            }
          } catch (e) {
            // Ignore position errors
          }
        }

        // Handle code blocks (codeBlock node type)
        if (node.type.name === 'codeBlock') {
          const { pendingDelete, pendingInsert } = node.attrs;

          try {
            const domNode = editor.view.nodeDOM(pos);
            if (domNode) {
              // Code blocks render as <pre> elements
              const preElement = domNode instanceof HTMLPreElement
                ? domNode
                : (domNode as HTMLElement).querySelector?.('pre') || domNode;

              if (preElement instanceof HTMLElement) {
                // Sync pendingDelete: add if true, REMOVE if false
                if (pendingDelete === true && !preElement.hasAttribute('data-pending-delete')) {
                  preElement.setAttribute('data-pending-delete', 'true');
                  preElement.classList.add('pending-delete-codeblock');
                } else if (pendingDelete !== true && preElement.hasAttribute('data-pending-delete')) {
                  preElement.removeAttribute('data-pending-delete');
                  preElement.classList.remove('pending-delete-codeblock');
                }

                // Sync pendingInsert: add if true, REMOVE if false
                if (pendingInsert === true && !preElement.hasAttribute('data-pending-insert')) {
                  preElement.setAttribute('data-pending-insert', 'true');
                  preElement.classList.add('pending-insert-codeblock');
                } else if (pendingInsert !== true && preElement.hasAttribute('data-pending-insert')) {
                  preElement.removeAttribute('data-pending-insert');
                  preElement.classList.remove('pending-insert-codeblock');
                }
              }
            }
          } catch (e) {
            // Ignore position errors
          }
        }
        return true;
      });
    };

    // Sync ONCE on mount after TipTap has finished rendering
    // Using a single RAF + small delay instead of multiple timeouts to avoid blinking
    let isMounted = true;
    const initialSyncId = requestAnimationFrame(() => {
      if (isMounted) {
        setTimeout(() => {
          if (isMounted) syncPendingAttributes();
        }, 50);
      }
    });

    // Use MutationObserver to detect when TipTap recreates DOM (e.g., new table/code added)
    const editorDom = editor.view.dom;
    let syncDebounceTimer: NodeJS.Timeout | null = null;
    let lastSyncTime = 0;
    const SYNC_COOLDOWN = 500; // ms - prevent rapid re-syncing

    const debouncedSync = () => {
      const now = Date.now();
      if (now - lastSyncTime < SYNC_COOLDOWN) return;

      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      syncDebounceTimer = setTimeout(() => {
        if (isMounted) {
          lastSyncTime = Date.now();
          syncPendingAttributes();
        }
      }, 100);
    };

    // Only observe childList changes (new elements added), NOT attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              if (node.tagName === 'TABLE' || node.querySelector?.('table') ||
                  node.tagName === 'PRE' || node.querySelector?.('pre')) {
                debouncedSync();
                return;
              }
            }
          }
        }
      }
    });

    observer.observe(editorDom, {
      childList: true,
      subtree: true,
      attributes: false
    });

    // Listen to document changes only (undo/redo, content edits) - NOT selection/hover
    const handleTransaction = ({ transaction }: { transaction: any }) => {
      if (!transaction.docChanged) return;
      debouncedSync();
    };

    editor.on('transaction', handleTransaction);

    return () => {
      isMounted = false;
      cancelAnimationFrame(initialSyncId);
      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      observer.disconnect();
      editor.off('transaction', handleTransaction);
    };
    // NOTE: hoverPairIndex, activeReviewIndex, and textHoverUpdateCounter are intentionally excluded.
    // syncPendingAttributes only syncs ProseMirror node attrs to DOM - it doesn't use hover state.
    // Including hover-related dependencies triggers 6 DOM sync calls (5 timeouts + RAF) per hover,
    // causing the green table overlay and action buttons to blink/flicker.
  }, [isReviewMode, editorRef]);

  const scrollToPair = useCallback((index: number) => {
    if (!editorRef.current || index < 0 || index >= diffPairs.length) return;
    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const pair = diffPairs[index];
    // Get the position to scroll to (prefer green range, fallback to red range)
    const targetPos = pair.greenRange?.from ?? pair.redRange?.from;
    if (targetPos === undefined) return;

    // Suppress scroll handler's hover-clear during this programmatic scroll
    isNavigationScrollRef.current = true;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        // Use editor's built-in scrollIntoView for smooth scrolling
        editor.commands.setTextSelection(targetPos);

        // Get the coordinates and scroll container
        const coords = editor.view.coordsAtPos(targetPos);
        // The actual scroll container is .content-wrapper (has overflow-y: auto)
        const scrollContainer =
          editor.view.dom.closest('.content-wrapper') as HTMLElement ||
          editor.view.dom.closest('.simple-editor-content')?.parentElement?.parentElement ||
          containerRef.current?.querySelector('.content-wrapper');

        if (scrollContainer && coords) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const scrollTop = scrollContainer.scrollTop;
          // Calculate position relative to scroll container and center it vertically
          const targetScrollTop = scrollTop + (coords.top - containerRect.top) - (containerRect.height / 3);

          scrollContainer.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
        }

        // Reset selection after scroll to avoid cursor appearing, and re-enable scroll handler
        setTimeout(() => {
          editor.commands.blur();
          isNavigationScrollRef.current = false;
        }, 400);
      } catch (e) {
        console.error('Error scrolling to pair:', e);
        isNavigationScrollRef.current = false;
      }
    });
  }, [editorRef, diffPairs]);

  const activateHoverForPair = useCallback((index: number) => {
    if (index < 0 || index >= diffPairs.length) return;
    // Mark as navigation hover to skip dimming overlay
    isNavigationHoverRef.current = true;
    const pair = diffPairs[index];
    // Use the same hover mechanism as the interaction handler
    const hasBlockPairs = diffPairs.some(p => p.isImageDeletion || p.isImageReplacement || p.isImageInsertion || p.isCodeBlockDeletion || p.isCodeBlockInsertion || p.isCodeBlockReplacement || p.isTableDeletion || p.isTableInsertion || p.isTableReplacement);
    const isTableTextPair = pair.includesTableDeletion || pair.isTableReplacedByText;
    const isCodeTextPair = pair.includesCodeBlockDeletion || pair.isCodeBlockReplacedByText;
    const isStandaloneCodeBlockPair = pair.isCodeBlockDeletion || pair.isCodeBlockInsertion || pair.isCodeBlockReplacement;
    const isStandaloneTablePair = pair.isTableDeletion || pair.isTableInsertion || pair.isTableReplacement;
    const useRefBasedHover = (pair.isTextOnly && hasBlockPairs && !pair.includesCodeBlockInsertion) || isTableTextPair || isCodeTextPair || isStandaloneCodeBlockPair || isStandaloneTablePair;

    if (useRefBasedHover) {
      textOnlyHoverIndexRef.current = index;
      setHoverPairIndex(-1);
      forceTextHoverUpdate(prev => prev + 1);
    } else {
      textOnlyHoverIndexRef.current = -1;
      setHoverPairIndex(index);
    }
  }, [diffPairs]);

  const handleNextPair = () => {
    if (diffPairs.length > 0) {
      const newIndex = (activePairIndex + 1) % diffPairs.length;
      setActivePairIndex(newIndex);
      activateHoverForPair(newIndex);
      scrollToPair(newIndex);
    }
  };
  const handlePrevPair = () => {
    if (diffPairs.length > 0) {
      const newIndex = (activePairIndex - 1 + diffPairs.length) % diffPairs.length;
      setActivePairIndex(newIndex);
      activateHoverForPair(newIndex);
      scrollToPair(newIndex);
    }
  };

  // Auto-scroll to next comparison after accepting/rejecting a pair
  useEffect(() => {
    if (pendingScrollToNextRef.current === null) return;

    const prevIndex = pendingScrollToNextRef.current;
    pendingScrollToNextRef.current = null;

    if (diffPairs.length === 0) return; // No more comparisons left

    // After the pair is removed, the next pair now sits at the same index (or last index if we were at end)
    const nextIndex = Math.min(prevIndex, diffPairs.length - 1);
    setActivePairIndex(nextIndex);
    scrollToPair(nextIndex);
  }, [diffPairs, scrollToPair]);

  // Early return for loading state - MUST be after all hooks
  if (isLoading) return <CustomEditorSkeleton />;

  return (
    <div
      ref={containerRef}
      className={`h-full w-full relative flex flex-col overflow-hidden bg-[#F2F3F7] ${activeReviewIndex !== -1 ? 'review-active-hover' : ''} ${hoverPairIndex !== -1 ? 'review-pair-hover' : ''} ${showDiffs ? 'show-diffs' : 'hide-diffs'}`}
      style={{ isolation: 'isolate', clipPath: 'inset(0)' }}
    >
      <style>{`
        /* Prevent image reload by isolating image elements from layout changes */
        .simple-editor-content img,
        .simple-editor-content .resizable-image-node-view,
        .simple-editor-content .resizable-img-container {
          contain: layout style;
          will-change: auto;
        }

        /* YOLO Mode Strikethrough Styling - Shows text with strikethrough in #EE877B before deletion */
        .simple-editor-content mark[data-color="#EE877B"],
        .simple-editor-content mark[data-color="#ee877b"],
        .simple-editor-content [style*="background-color:#EE877B"],
        .simple-editor-content [style*="background-color:#ee877b"],
        .simple-editor-content [style*="background-color: rgb(238, 135, 123)"] {
          background-color: transparent !important;
          text-decoration: line-through !important;
          text-decoration-color: #EE877B !important;
          color: #EE877B !important;
          font-weight: 400 !important;
          display: inline !important;
        }

        /* Diff Mark Styling - Green background for insertions, Red strikethrough for deletions */
        .show-diffs .simple-editor-content ins,
        .show-diffs .simple-editor-content [data-diff-insertion],
        .show-diffs .simple-editor-content mark[data-color="#c7f0d6ff"],
        .show-diffs .simple-editor-content [style*="background-color: rgb(199, 240, 214)"],
        .show-diffs .simple-editor-content [style*="background-color:#c7f0d6ff"] {
          background-color: #D5F6E7 !important;
          border-radius: 4px !important;
          text-decoration: none !important;
          padding: 2px 0 !important;
          color: #182234 !important;
          font-weight: 400 !important;
          display: inline !important;
          box-decoration-break: clone !important;
          -webkit-box-decoration-break: clone !important;
          box-shadow: 4px 0 0 #D5F6E7, -4px 0 0 #D5F6E7 !important;
        }

        /* Green highlight inside links - remove box-shadow to prevent clipping */
        .show-diffs .simple-editor-content a mark[data-color="#c7f0d6ff"],
        .simple-editor-content a mark[data-color="#c7f0d6ff"],
        .review-active-hover .simple-editor-content a mark[data-color="#c7f0d6ff"] {
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 2px 0 !important;
          position: relative !important;
          z-index: 1 !important;
        }

        /* Green mark adjacent to links (e.g., space between two <a> tags) -
           remove box-shadow so the -4px left shadow doesn't cover the last
           character of the preceding link text (e.g., 'i' in "Devi") */
        .show-diffs .simple-editor-content a + mark[data-color="#c7f0d6ff"],
        .simple-editor-content a + mark[data-color="#c7f0d6ff"],
        .review-active-hover .simple-editor-content a + mark[data-color="#c7f0d6ff"] {
          box-shadow: none !important;
        }

        /* Links containing red diff marks — remove link underline so only
           strikethrough shows. Also remove gaps from red mark margin. */
        .show-diffs .simple-editor-content a:has(> mark[data-color="#fecaca"]) {
          text-decoration: none !important;
          color: #EE877B !important;
        }
        .show-diffs .simple-editor-content a mark[data-color="#fecaca"] {
          margin: 0 !important;
        }
        /* Red mark adjacent to links (space between <a> tags) — remove extra margin */
        .show-diffs .simple-editor-content a + mark[data-color="#fecaca"] {
          margin: 0 !important;
        }

        .show-diffs .simple-editor-content del,
        .show-diffs .simple-editor-content [data-diff-deletion],
        .show-diffs .simple-editor-content mark[data-color="#fecaca"],
        .show-diffs .simple-editor-content [style*="background-color: rgb(254, 202, 202)"],
        .show-diffs .simple-editor-content [style*="background-color:#fecaca"] {
          background-color: transparent !important;
          text-decoration: line-through !important;
          text-decoration-color: #EE877B !important;
          color: #EE877B !important;
          font-family: Inter !important;
          font-weight: 400 !important;
          font-size: inherit !important;
          line-height: 140% !important;
          letter-spacing: -0.02em !important;
          display: inline !important;
          margin: 0 4px !important;
        }

        /* HIDE DIFFS Styling - Show accepted state (insertions normal, deletions hidden) */
        .hide-diffs .simple-editor-content ins,
        .hide-diffs .simple-editor-content [data-diff-insertion],
        .hide-diffs .simple-editor-content mark[data-color="#c7f0d6ff"] {
          background-color: transparent !important;
          text-decoration: none !important;
          color: inherit !important;
          padding: 0 !important;
        }

        .hide-diffs .simple-editor-content del,
        .hide-diffs .simple-editor-content [data-diff-deletion],
        .hide-diffs .simple-editor-content mark[data-color="#fecaca"] {
          display: none !important;
        }

        /* Override any conflicting highlight styles */
        .review-active-hover .simple-editor-content mark[data-color="#c7f0d6ff"],
        .simple-editor-content mark[data-color="#c7f0d6ff"],
        .simple-editor-content [style*="background-color: rgb(199, 240, 214)"],
        .simple-editor-content [style*="background-color:#c7f0d6ff"] {
          background-color: #D5F6E7 !important;
          border-radius: 4px !important;
          text-decoration: none !important;
          padding: 2px 0 !important;
          color: #182234 !important;
          font-weight: 400 !important;
          display: inline !important;
          box-decoration-break: clone !important;
          -webkit-box-decoration-break: clone !important;
          box-shadow: 4px 0 0 #D5F6E7, -4px 0 0 #D5F6E7 !important;
        }

        .simple-editor-content del,
        .simple-editor-content [data-diff-deletion],
        .simple-editor-content mark[data-color="#fecaca"],
        .simple-editor-content [style*="background-color: rgb(254, 202, 202)"],
        .simple-editor-content [style*="background-color:#fecaca"] {
          background-color: transparent !important;
          text-decoration: line-through !important;
          text-decoration-color: #EE877B !important;
          color: #EE877B !important;
          font-family: Inter !important;
          font-weight: 400 !important;
          font-size: inherit !important;
          line-height: 140% !important;
          letter-spacing: -0.02em !important;
          display: inline !important;
          margin: 0 4px !important;
        }

        /* Override any conflicting highlight styles */
        .review-active-hover .simple-editor-content mark[data-color="#c7f0d6ff"],
        .review-active-hover .simple-editor-content [style*="background-color: rgb(199, 240, 214)"] {
          background-color: #D5F6E7 !important;
          color: #182234 !important;
          font-weight: 400 !important;
        }

        .review-active-hover .simple-editor-content mark[data-color="#fecaca"],
        .review-active-hover .simple-editor-content [style*="background-color: rgb(254, 202, 202)"] {
          background-color: transparent !important;
          color: #EE877B !important;
          text-decoration: line-through !important;
          text-decoration-color: #EE877B !important;
        }

        /* Elevate active/hovered diff marks above the dimming overlay */
        /* EXCLUDE pending-insert and pending-delete tables - they have their own styling */
        .review-pair-hover [data-active-review="true"]:not(table[data-pending-insert="true"]):not(table[data-pending-delete="true"]):not(table.pending-insert-table):not(table.pending-delete-table) {
          position: relative;
          z-index: 2 !important;
          background-color: #FFFFFF !important;
        }
        /* Exclude cells inside pending tables from white background */
        .review-pair-hover table[data-pending-insert="true"] [data-active-review="true"],
        .review-pair-hover table[data-pending-delete="true"] [data-active-review="true"],
        .review-pair-hover table.pending-insert-table [data-active-review="true"],
        .review-pair-hover table.pending-delete-table [data-active-review="true"] {
          background-color: inherit !important;
        }
        .review-pair-hover [data-active-review="true"] mark,
        .review-pair-hover [data-active-review="true"] p,
        .review-pair-hover [data-active-review="true"] span {
          position: relative;
          z-index: 2 !important;
        }
        /* Ensure green highlights stay green above overlay */
        .review-pair-hover [data-active-review="true"] mark[data-color="#c7f0d6ff"] {
          background-color: #D5F6E7 !important;
        }
        /* Keep green table cells green even with data-active-review */
        .review-pair-hover table[data-pending-insert="true"] td,
        .review-pair-hover table[data-pending-insert="true"] th,
        .review-pair-hover table.pending-insert-table td,
        .review-pair-hover table.pending-insert-table th {
          background-color: #D5F6E7 !important;
        }
        .review-pair-hover table[data-pending-insert="true"] th,
        .review-pair-hover table.pending-insert-table th {
          background-color: #c2f0db !important;
        }
        /* Keep red table cells red even with data-active-review */
        .review-pair-hover table[data-pending-delete="true"] td,
        .review-pair-hover table[data-pending-delete="true"] th,
        .review-pair-hover table.pending-delete-table td,
        .review-pair-hover table.pending-delete-table th {
          background-color: rgba(238, 135, 123, 0.2) !important;
        }
        .review-pair-hover table[data-pending-delete="true"] th,
        .review-pair-hover table.pending-delete-table th {
          background-color: rgba(238, 135, 123, 0.35) !important;
        }

        /* 2. FORCE TOTAL CLARITY FOR ALL HIGHLIGHT MARKS (green backgrounds) */
        .review-active-hover .simple-editor-content mark[data-color="#c7f0d6ff"],
        .review-active-hover .simple-editor-content [style*="background-color: rgb(199, 240, 214)"],
        .review-active-hover .simple-editor-content [style*="background-color:#c7f0d6ff"] {
           color: #182234 !important;
           font-weight: 400 !important;
           opacity: 1 !important;
           filter: none !important;
           visibility: visible !important;
        }

        /* Keep red color for deletions on hover */
        .review-active-hover .simple-editor-content mark[data-color="#fecaca"],
        .review-active-hover .simple-editor-content [style*="background-color: rgb(254, 202, 202)"],
        .review-active-hover .simple-editor-content [style*="background-color:#fecaca"] {
           color: #EE877B !important;
           opacity: 1 !important;
           filter: none !important;
           visibility: visible !important;
        }

        /* 3. BRIGHTEN ALL ELEMENTS IN ACTIVE REVIEW RANGE (both old and new) */
        .review-active-hover [data-active-review="true"],
        .review-active-hover [data-active-review="true"] > *,
        .review-active-hover [data-active-review="true"] p,
        .review-active-hover [data-active-review="true"] h1,
        .review-active-hover [data-active-review="true"] h2,
        .review-active-hover [data-active-review="true"] h3,
        .review-active-hover [data-active-review="true"] li,
        .review-active-hover [data-active-review="true"] span,
        .review-active-hover [data-active-review="true"] strong,
        .review-active-hover [data-active-review="true"] em {
           color: #182234 !important;
           opacity: 1 !important;
           filter: none !important;
        }

        /* Force visibility for green highlight marks within active range */
        .review-active-hover [data-active-review="true"] mark[data-color="#c7f0d6ff"],
        .review-active-hover [data-active-review="true"] [style*="background-color: rgb(199, 240, 214)"],
        .review-active-hover [data-active-review="true"] [style*="background-color:#c7f0d6ff"] {
           color: #182234 !important;
           font-weight: 400 !important;
           opacity: 1 !important;
           filter: none !important;
           visibility: visible !important;
        }

        /* Force visibility for red highlight marks within active range - keep red color */
        .review-active-hover [data-active-review="true"] mark[data-color="#fecaca"],
        .review-active-hover [data-active-review="true"] [style*="background-color: rgb(254, 202, 202)"],
        .review-active-hover [data-active-review="true"] [style*="background-color:#fecaca"] {
           color: #EE877B !important;
           opacity: 1 !important;
           filter: none !important;
           visibility: visible !important;
        }

        /* Images stay fully visible when hovering on diff ranges */

        /* Default toolbar width */
        .blog-simple-editor-container .tiptap-toolbar {
          width: 100%;
        }

        /* Blog Editor Styled - Gray background with white content box */
        .blog-editor-styled.blog-simple-editor-container {
          background: transparent !important;
          padding: 0 15px !important;
          gap: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          box-sizing: border-box !important;
        }

        .blog-editor-styled .content-wrapper {
          background: #FFFFFF !important;
          border-radius: 20px 20px 0 0 !important;
          margin-top: 0 !important;
          max-width: min(770px, 100%) !important;
          width: 100% !important;
          box-sizing: border-box !important;
          align-self: center !important;
        }

        .blog-editor-styled .tiptap-toolbar,
        .blog-editor-styled .tiptap-toolbar[data-variant="floating"] {
          background: #FFFFFF !important;
          border: none !important;
          border-top: 1px solid #DCDEE5 !important;
          max-width: none !important;
          width: calc(100% + 30px) !important;
          margin-left: -15px !important;
          margin-right: -15px !important;
          border-radius: 0 !important;
          flex-shrink: 0 !important;
          padding: 16px 0 !important;
          box-sizing: border-box !important;
          box-shadow: none !important;
          transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s, opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s !important;
          align-self: stretch !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        .blog-editor-styled .tiptap-toolbar::-webkit-scrollbar {
          display: none !important;
        }

        /* Container query setup for responsive toolbar */
        .blog-editor-styled.blog-simple-editor-container {
          container-type: inline-size;
          container-name: blog-editor;
        }

        /* Base (full-size) toolbar — default for wide editor */
        .blog-editor-styled .tiptap-toolbar .tiptap-toolbar-group {
          flex-shrink: 0 !important;
        }

        .blog-editor-styled .tiptap-toolbar .tiptap-separator {
          flex-shrink: 0 !important;
        }

        /* ---- Medium compact: container 550px–700px ---- */
        @container blog-editor (max-width: 700px) {
          .tiptap-toolbar {
            gap: 0.1875rem !important;
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }

          .tiptap-toolbar .tiptap-toolbar-group {
            gap: 0.0625rem !important;
          }

          .tiptap-toolbar .tiptap-separator {
            height: 1.25rem !important;
            margin: 0 0.125rem !important;
          }

          .tiptap-toolbar .tiptap-button {
            height: 1.875rem !important;
            min-width: 1.875rem !important;
            padding: 0.375rem !important;
            gap: 0.125rem !important;
            border-radius: 0.625rem !important;
          }

          .tiptap-toolbar .tiptap-button .tiptap-button-icon {
            width: 0.9375rem !important;
            height: 0.9375rem !important;
          }

          .tiptap-toolbar .tiptap-button .tiptap-button-dropdown-small {
            width: 0.5625rem !important;
            height: 0.5625rem !important;
          }

          .tiptap-toolbar .font-family-dropdown-trigger {
            min-width: 100px !important;
            max-width: 130px !important;
            gap: 0.375rem !important;
          }

          .tiptap-toolbar .font-family-dropdown-trigger .font-family-label {
            font-size: 0.8125rem !important;
          }

          /* Hide button text labels at medium size */
          .tiptap-toolbar .tiptap-toolbar-group > .tiptap-button > .tiptap-button-text,
          .tiptap-toolbar .tiptap-toolbar-group > div > .tiptap-button > .tiptap-button-text {
            display: none !important;
          }
          .tiptap-toolbar .font-family-dropdown-trigger .font-family-label {
            display: block !important;
          }
        }

        /* ---- Full compact: container < 550px ---- */
        @container blog-editor (max-width: 550px) {
          .tiptap-toolbar {
            gap: 0.125rem !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            padding-left: 0.375rem !important;
            padding-right: 0.375rem !important;
          }

          .tiptap-toolbar .tiptap-toolbar-group {
            gap: 1px !important;
          }

          .tiptap-toolbar .tiptap-separator {
            height: 1.125rem !important;
            margin: 0 0.0625rem !important;
          }

          .tiptap-toolbar .tiptap-button {
            height: 1.75rem !important;
            min-width: 1.75rem !important;
            padding: 0.25rem !important;
            gap: 0.125rem !important;
            border-radius: 0.5rem !important;
          }

          .tiptap-toolbar .tiptap-button .tiptap-button-icon {
            width: 0.875rem !important;
            height: 0.875rem !important;
          }

          .tiptap-toolbar .tiptap-button .tiptap-button-dropdown-small {
            width: 0.5rem !important;
            height: 0.5rem !important;
          }

          .tiptap-toolbar .font-family-dropdown-trigger {
            min-width: 80px !important;
            max-width: 100px !important;
            gap: 0.25rem !important;
            padding-left: 0.375rem !important;
            padding-right: 0.25rem !important;
          }

          .tiptap-toolbar .font-family-dropdown-trigger .font-family-label {
            font-size: 0.75rem !important;
          }
        }

        /* Hide toolbar during streaming/generation */
        .blog-editor-streaming .tiptap-toolbar {
          display: none !important;
        }

        /* Hide toolbar in focus mode with smooth slide animation */
        .blog-editor-focus-mode .tiptap-toolbar {
          position: absolute !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          transform: translateY(100%) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Hide toolbar during review mode (pending changes) */
        .blog-editor-review-mode .tiptap-toolbar {
          display: none !important;
        }

        /* Slide in animation for toolbar when generation completes */
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .blog-editor-toolbar-slide-in .tiptap-toolbar {
          animation: slideInFromBottom 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s forwards;
        }

        /* Add bottom padding during review mode to prevent buttons from being hidden */
        .blog-editor-review-mode .ProseMirror {
          padding-bottom: 150px !important;
        }

        /* Toolbar always stays visible at bottom with z-index 1 */
        .blog-editor-styled .tiptap-toolbar {
          z-index: 1 !important;
        }
      `}</style>

      {/* Editor container with custom styling for gray bg + white content box */}
      <div className={`flex-1 w-full relative overflow-hidden flex flex-col pt-5  ${isReviewMode ? 'blog-editor-review-mode' : ''} ${isStreaming ? 'blog-editor-streaming' : ''} ${showToolbarAnimation ? 'blog-editor-toolbar-slide-in' : ''} ${focusMode ? 'blog-editor-focus-mode' : ''}`}>
        <div className='flex-1 flex flex-col overflow-hidden w-full'>
          <BlogSimpleEditor
            ref={editorRef} initialValue={content} onChange={onChange} onAriScoreChange={onAriScoreChange}
            height="100%" className={`h-full w-full blog-editor-styled ${!title ? 'no-title' : ''}`} documentTitle={title} animated={true}
            readOnly={readOnly} isStreaming={Boolean(isStreaming)}
            disableAutoScroll={disableAutoScroll} onUserScrollChange={onUserScrollChange}
            projectId={projectId}
            images={images} isLoadingImages={isLoadingImages} onUpload={onUpload} onAIRequest={onAIRequest}
            titleElement={
              <div className="px-8 pt-5 pb-0">
                {(isGeneratingImage || isStreaming) ? (
                  <div className="mb-4 w-full rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <ImageGenerationLoader />
                  </div>
                ) : featuredImageUrl ? (
                  <div className="mb-4 w-full rounded-lg overflow-hidden group relative cursor-pointer" style={{ aspectRatio: '16/9' }} onClick={onEditFeaturedImage}>
                    <img
                      src={featuredImageUrl}
                      alt="Featured image"
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay with edit icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 shadow-lg hover:shadow-xl">
                        <Edit2 />
                      </button>
                    </div>
                    {/* Bottom gradient text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 rounded-lg pointer-events-none">
                      <p className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                        Click to change • Drop new image to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mb-4 flex items-center justify-center gap-2 py-3 cursor-pointer"
                    onClick={onEditFeaturedImage}
                  >
                    <div className="w-1/4 h-0" style={{ border: '1px dashed rgba(14, 15, 17, 0.45)' }} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18223473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span className="text-xs font-semibold tracking-[-0.02em]" style={{ color: '#18223473' }}>
                        Click to Add a Featured Thumbnail
                      </span>
                    </div>
                    <div className="w-1/4 h-0" style={{ border: '1px dashed rgba(14, 15, 17, 0.45)' }} />
                  </div>
                )}
                <TitleTextarea
                  title={title}
                  onTitleChange={onTitleChange}
                  readOnly={readOnly}
                />
              </div>
            }
          />
        </div>

        {/* Dimming overlay - uses pre-calculated overlayHoleRect from useEffect to prevent re-renders */}
        {/* Skip rendering if no overlay rect (calculated in useEffect based on pair type) */}
        {overlayHoleRect && (
          <>
            {/* Top overlay - above the hovered pair (1px gap) */}
            {overlayHoleRect.top > 20 && (
              <div
                className="absolute bg-white/60 pointer-events-none z-[1] rounded-t-[20px] transition-opacity duration-150"
                style={{
                  top: '20px',
                  height: `${overlayHoleRect.top - 20}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: '770px',
                  willChange: 'opacity'
                }}
              />
            )}
            {/* Bottom overlay - below the hovered pair (1px gap), stops before pending review */}
            <div
              className="absolute bg-white/60 pointer-events-none z-[1] transition-opacity duration-150"
              style={{
                top: `${overlayHoleRect.bottom}px`,
                bottom: '70px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '770px',
                willChange: 'opacity'
              }}
            />
          </>
        )}

        {/* Inline Action Buttons - Shown only when hovering on that specific comparison */}
        {diffPairs.map((pair, index) => {
          // Must have either green or red content
          if (!pair.greenRange && !pair.redRange) return null;

          // Check if hovering on this specific comparison
          // Check both state-based and ref-based hover detection for maximum reliability
          // State: set by interaction handler for non-ref pairs
          // Ref: set by interaction handler for text-only/special pairs to avoid image re-renders
          const isHoveringViaState = hoverPairIndex === index;
          const isHoveringViaRef = textOnlyHoverIndexRef.current === index;
          const isHovering = isHoveringViaState || isHoveringViaRef;

          // Debug: log render check for every pair
          if (isHoveringViaState || isHoveringViaRef) {

          }

          if (!isHovering) return null;

          // Determine if this is a deletion-only case (red only, no green)
          const isDeletionOnly = !pair.greenRange && pair.redRange;
          const isImageDel = pair.isImageDeletion === true;
          const isImageRepl = pair.isImageReplacement === true;
          const isImageIns = pair.isImageInsertion === true;
          const isImageChange = isImageDel || isImageRepl || isImageIns;
          const isCodeBlockDel = pair.isCodeBlockDeletion === true;
          const isCodeBlockIns = pair.isCodeBlockInsertion === true;
          const isCodeBlockRepl = pair.isCodeBlockReplacement === true;
          const includesCodeBlock = pair.includesCodeBlockInsertion === true;
          // When code block is BEFORE text, use text positioning (not block positioning)
          const codeBlockIsBeforeText = pair.codeBlockIsBeforeText === true;
          const isCodeBlockChange = isCodeBlockDel || isCodeBlockIns || isCodeBlockRepl || (includesCodeBlock && !codeBlockIsBeforeText);
          const includesCodeBlockDeletion = pair.includesCodeBlockDeletion === true; // Code→text replacement
          const isCodeBlockReplacedByText = pair.isCodeBlockReplacedByText === true; // Code→text replacement flag
          const isTableDel = pair.isTableDeletion === true;
          const isTableIns = pair.isTableInsertion === true;
          const isTableRepl = pair.isTableReplacement === true;
          const includesTable = pair.includesTableInsertion === true;
          const includesTableDeletion = pair.includesTableDeletion === true; // Table→text replacement
          const isTableReplacedByText = pair.isTableReplacedByText === true; // Table→text replacement flag
          // When table is BEFORE text, use text positioning (not block positioning)
          const tableIsBeforeText = pair.tableIsBeforeText === true;
          const isTableChange = isTableDel || isTableIns || isTableRepl || (includesTable && !tableIsBeforeText);
          // IMAGE→TEXT replacement detection
          const includesImageDeletion = pair.includesImageDeletion === true; // Image→text replacement
          const isImageReplacedByText = pair.isImageReplacedByText === true; // Image→text replacement flag
          // TEXT→IMAGE replacement detection
          const includesImageInsertion = pair.includesImageInsertion === true; // Text→image replacement
          const isTextReplacedByImage = pair.isTextReplacedByImage === true; // Text→image replacement flag
          // Combined block change flag for positioning (images, code blocks, and tables need similar positioning)
          // But if code block or table comes before text, use text positioning
          // Only include image if it's the LAST element in the pair (not when text/code comes after image)
          const imageIsLastInPair = pair.imageIsLastInPair === true;
          const isBlockChange = isImageChange || isCodeBlockChange || isTableChange || (includesImageInsertion && imageIsLastInPair);



          const buttonWidth = 140;
          // Position at the end of the content (lastGreenRect handles both cases)
          // Fall back to pair.rect if lastGreenRect is not available
          let buttonRect = pair.lastGreenRect || pair.rect;

          // For image change pairs, compute live rect from the actual DOM element at render time.
          // Stored rects become stale after image loads (dimensions change) or after scrolling.
          if (isImageChange && editorRef.current) {
            const editor = editorRef.current.getEditor();
            if (editor) {
              try {
                const targetRange = pair.greenRange || pair.redRange;
                if (targetRange) {
                  const domNode = editor.view.nodeDOM(targetRange.from);
                  if (domNode && domNode instanceof HTMLElement) {
                    let wrapper: Element = domNode;
                    if (!domNode.classList.contains('image-view--pending-insert') && !domNode.classList.contains('image-view--pending-delete')) {
                      const child = domNode.querySelector('.image-view--pending-insert, .image-view--pending-delete');
                      wrapper = child || domNode.closest('.image-view') || domNode;
                    }
                    const bodyEl = wrapper.querySelector('.image-view__body');
                    const targetEl = bodyEl || wrapper;
                    const elRect = targetEl.getBoundingClientRect();
                    const contRect = containerRef.current?.getBoundingClientRect();
                    const borderOffset = bodyEl ? 13 : 0;
                    if (contRect && elRect.height > 0) {
                      buttonRect = {
                        top: elRect.top - contRect.top - borderOffset,
                        left: elRect.left - contRect.left - borderOffset,
                        width: elRect.width + borderOffset * 2,
                        right: elRect.left - contRect.left + elRect.width + borderOffset,
                        bottom: elRect.bottom - contRect.top + borderOffset
                      };
                    }
                  }
                }
              } catch (e) {
                // Fall back to stored rect
              }
            }
          }

          // For table change pairs, compute live rect from the actual DOM table element.
          // Stored rects become stale after scrolling or layout changes.
          if ((isTableDel || isTableIns || isTableRepl) && !pair.isTextOnly && editorRef.current) {
            const editor = editorRef.current.getEditor();
            if (editor) {
              try {
                const targetRange = pair.greenRange || pair.redRange;
                if (targetRange) {
                  // Find the pending table element in the DOM
                  const pendingTables = editor.view.dom.querySelectorAll(
                    'table[data-pending-insert], table[data-pending-delete], .pending-insert-table, .pending-delete-table'
                  ) as NodeListOf<HTMLElement>;
                  let matchedTable: HTMLElement | null = null;
                  pendingTables.forEach(tbl => {
                    try {
                      const tblPos = editor.view.posAtDOM(tbl, 0);
                      if (tblPos >= (targetRange.from - 5) && tblPos <= (targetRange.to + 5)) {
                        matchedTable = tbl; // Take last match (last table in range for button positioning)
                      }
                    } catch (e) { /* posAtDOM can throw */ }
                  });
                  if (matchedTable) {
                    const tblRect = (matchedTable as HTMLElement).getBoundingClientRect();
                    const contRect = containerRef.current?.getBoundingClientRect();
                    if (contRect && tblRect.height > 0) {
                      buttonRect = {
                        top: tblRect.top - contRect.top,
                        left: tblRect.left - contRect.left,
                        width: tblRect.width,
                        right: tblRect.right - contRect.left,
                        bottom: tblRect.bottom - contRect.top
                      };
                    }
                  }
                }
              } catch (e) {
                // Fall back to stored rect
              }
            }
          }

          // For code block change pairs, compute live rect from the actual DOM PRE element.
          if ((isCodeBlockDel || isCodeBlockIns || isCodeBlockRepl) && !pair.isTextOnly && editorRef.current) {
            const editor = editorRef.current.getEditor();
            if (editor) {
              try {
                const targetRange = pair.greenRange || pair.redRange;
                if (targetRange) {
                  const pendingPres = editor.view.dom.querySelectorAll(
                    'pre[data-pending-insert], pre[data-pending-delete]'
                  ) as NodeListOf<HTMLElement>;
                  let matchedPre: HTMLElement | null = null;
                  pendingPres.forEach(pre => {
                    try {
                      const prePos = editor.view.posAtDOM(pre, 0);
                      if (prePos >= (targetRange.from - 5) && prePos <= (targetRange.to + 5)) {
                        matchedPre = pre;
                      }
                    } catch (e) { /* posAtDOM can throw */ }
                  });
                  if (matchedPre) {
                    const preRect = (matchedPre as HTMLElement).getBoundingClientRect();
                    const contRect = containerRef.current?.getBoundingClientRect();
                    if (contRect && preRect.height > 0) {
                      buttonRect = {
                        top: preRect.top - contRect.top,
                        left: preRect.left - contRect.left,
                        width: preRect.width,
                        right: preRect.right - contRect.left,
                        bottom: preRect.bottom - contRect.top
                      };
                    }
                  }
                }
              } catch (e) {
                // Fall back to stored rect
              }
            }
          }

          // For text-only pairs, compute live position using coordsAtPos at render time.
          // Stored rects become stale after scrolling because buttons are absolutely positioned
          // inside the non-scrolling containerRef while text scrolls inside a nested editor div.
          if (pair.isTextOnly && editorRef.current) {
            const editor = editorRef.current.getEditor();
            if (editor) {
              try {
                const targetRange = pair.greenRange || pair.redRange;
                if (targetRange) {
                  const contRect = containerRef.current?.getBoundingClientRect();
                  if (contRect) {
                    // Walk the ProseMirror doc to find the exact last position that has
                    // a green/red highlight mark. This gives us the true end of the
                    // highlighted content, not the range.to which may include unhighlighted gaps.
                    const targetColor = pair.greenRange ? '#c7f0d6ff' : '#fecaca';
                    let lastHighlightEnd = -1;
                    let firstHighlightStart = -1;

                    editor.state.doc.nodesBetween(
                      targetRange.from,
                      Math.min(targetRange.to, editor.state.doc.content.size),
                      (node, pos) => {
                        if (!node.isText) return;
                        const hasHighlight = node.marks.some(
                          m => m.type.name === 'highlight' && m.attrs.color === targetColor
                        );
                        if (hasHighlight) {
                          if (firstHighlightStart === -1) firstHighlightStart = pos;
                          lastHighlightEnd = pos + node.nodeSize;
                        }
                      }
                    );

                    if (lastHighlightEnd > 0) {
                      const liveEnd = editor.view.coordsAtPos(Math.min(lastHighlightEnd, editor.state.doc.content.size));
                      const liveStart = editor.view.coordsAtPos(Math.min(firstHighlightStart, editor.state.doc.content.size));
                      const rawBottom = liveEnd.bottom - contRect.top;
                      const finalBottom = Math.min(rawBottom, contRect.height - 36);

                      buttonRect = {
                        top: liveStart.top - contRect.top,
                        left: liveStart.left - contRect.left,
                        width: liveEnd.right - liveStart.left,
                        right: liveEnd.right - contRect.left,
                        bottom: finalBottom
                      };
                    } else {
                      // Fallback: original coordsAtPos logic
                      const endPos = pair.firstGreenBlockEnd
                        ? Math.min(pair.firstGreenBlockEnd, editor.state.doc.content.size)
                        : Math.min(targetRange.to, editor.state.doc.content.size);
                      const liveEnd = editor.view.coordsAtPos(endPos);
                      const liveStart = editor.view.coordsAtPos(Math.min(targetRange.from, editor.state.doc.content.size));
                      const rawBottom = liveEnd.bottom - contRect.top;
                      const finalBottom = Math.min(rawBottom, contRect.height - 36);

                      buttonRect = {
                        top: liveStart.top - contRect.top,
                        left: liveStart.left - contRect.left,
                        width: liveEnd.right - liveStart.left,
                        right: liveEnd.right - contRect.left,
                        bottom: finalBottom
                      };
                    }
                  }
                }
              } catch (e) {
                // Fall back to stored rect if position is no longer valid
              }
            }
          }

          // For TEXT+IMAGE pairs where image IS the last element, find the actual pending-insert image
          // within THIS pair's greenRange and use its live DOM rect for button positioning
          // Skip if image is NOT last (e.g., TEXT→IMAGE+TEXT+CODE+TEXT → button stays at text)
          if (includesImageInsertion && imageIsLastInPair && editorRef.current) {
            const editor = editorRef.current.getEditor();
            if (editor && pair.greenRange) {
              const allPendingImages = editor.view.dom.querySelectorAll('.image-view--pending-insert') as NodeListOf<HTMLElement>;
              let matchedImage: HTMLElement | null = null;

              allPendingImages.forEach(img => {
                try {
                  const pos = editor.view.posAtDOM(img, 0);
                  // Check if this image's position falls within this pair's greenRange (±10 tolerance)
                  if (pos >= (pair.greenRange!.from - 10) && pos <= (pair.greenRange!.to + 10)) {
                    matchedImage = img; // Take the last match (last image in range)
                  }
                } catch (e) {
                  // posAtDOM can throw if element is not in view
                }
              });

              if (matchedImage) {
                // Use the body element's rect + 13px border offset for alignment with visual border
                const bodyEl = (matchedImage as HTMLElement).querySelector('.image-view__body');
                const targetEl = bodyEl || matchedImage;
                const imgRect = targetEl.getBoundingClientRect();
                const bOff = bodyEl ? 13 : 0;
                const contRect = containerRef.current?.getBoundingClientRect();
                if (contRect) {
                  buttonRect = {
                    top: imgRect.top - contRect.top + (containerRef.current?.scrollTop || 0) - bOff,
                    bottom: imgRect.bottom - contRect.top + (containerRef.current?.scrollTop || 0) + bOff,
                    left: imgRect.left - contRect.left - bOff,
                    right: imgRect.right - contRect.left + bOff,
                    width: imgRect.width + bOff * 2
                  };
                }
              }
            }
          }

          // For merged pairs that include block DELETIONS (image+table+code being removed),
          // the button must be at the BOTTOM of the entire pair (after the last deleted block),
          // not at the text/green position which may be above the deleted blocks.
          if ((includesImageDeletion || includesTableDeletion || includesCodeBlockDeletion) && editorRef.current) {
            const editor = editorRef.current.getEditor();
            if (editor && pair.redRange) {
              let maxBottom = buttonRect?.bottom || 0;
              let bottomLeft = buttonRect?.left || 0;
              let bottomRight = buttonRect?.right || 0;
              let bottomWidth = buttonRect?.width || 0;

              // Scan all pending-delete block elements within this pair's redRange
              const pendingDeleteBlocks = editor.view.dom.querySelectorAll(
                '.image-view--pending-delete, .pending-delete-table, .pending-delete-codeblock'
              ) as NodeListOf<HTMLElement>;

              pendingDeleteBlocks.forEach(el => {
                try {
                  const pos = editor.view.posAtDOM(el, 0);
                  if (pos >= (pair.redRange!.from - 10) && pos <= (pair.redRange!.to + 10)) {
                    // Use the body element's rect + border offset for alignment with visual border
                    const bodyEl = el.querySelector('.image-view__body');
                    const targetEl = bodyEl || el;
                    const elRect = targetEl.getBoundingClientRect();
                    const bOff = bodyEl ? 13 : 0;
                    const contRect = containerRef.current?.getBoundingClientRect();
                    if (contRect) {
                      const relBottom = elRect.bottom - contRect.top + (containerRef.current?.scrollTop || 0) + bOff;
                      if (relBottom > maxBottom) {
                        maxBottom = relBottom;
                        bottomLeft = elRect.left - contRect.left - bOff;
                        bottomRight = elRect.right - contRect.left + bOff;
                        bottomWidth = elRect.width + bOff * 2;
                      }
                    }
                  }
                } catch (e) {
                  // posAtDOM can throw if element is not in view
                }
              });

              if (maxBottom > (buttonRect?.bottom || 0)) {
                buttonRect = {
                  top: buttonRect?.top || 0,
                  left: bottomLeft,
                  right: bottomRight,
                  bottom: maxBottom,
                  width: bottomWidth
                };
              }
            }
          }

          // Debug log for image button positioning
          if (isImageChange || includesImageInsertion) {

          }
          // Guard: if buttonRect is still undefined, skip this pair's button
          if (!buttonRect || typeof buttonRect.right !== 'number' || isNaN(buttonRect.right)) {
            console.warn('[BlogEditor] Skipping button render - invalid buttonRect:', buttonRect, 'pair:', pair);
            return null;
          }

          const containerRect = containerRef.current?.getBoundingClientRect();
          const containerWidth = containerRect?.width || 800;

          // Content area is max 770px and centered
          const contentMaxWidth = 770;
          const actualContentWidth = Math.min(contentMaxWidth, containerWidth);
          const contentOffset = (containerWidth - actualContentWidth) / 2;

          // Content area boundaries: centered content + 32px (px-8) text padding
          const contentLeftBound = contentOffset + 32;
          const contentRightBound = contentOffset + actualContentWidth - 32;

          // For block changes (images and code blocks), align buttons with the right edge of the wrapper
          // For text changes, use the standard positioning
          let calculatedLeft: number;
          let actualButtonWidth = buttonWidth;

          if (isBlockChange) {
            // For block elements (images, code blocks), position buttons at the right edge of the wrapper
            // The buttonRect.right should be the right edge of the block wrapper
            calculatedLeft = buttonRect.right - buttonWidth;
            // Ensure it doesn't go off screen
            if (calculatedLeft < buttonRect.left) {
              calculatedLeft = buttonRect.left;
              actualButtonWidth = buttonRect.right - buttonRect.left;
            }
          } else {
            // Dynamic positioning: try to align button's right edge with content's right edge
            // If no space on right, shift left; if no space on left, shift right
            calculatedLeft = buttonRect.right - buttonWidth;

            // Check if button would overflow on the right
            if (calculatedLeft + buttonWidth > contentRightBound) {
              // Shift left to fit within right boundary
              calculatedLeft = contentRightBound - buttonWidth;
            }

            // Check if button would overflow on the left
            if (calculatedLeft < contentLeftBound) {
              // Shift right to fit within left boundary
              calculatedLeft = contentLeftBound;
            }
          }

          // Handler for accepting this specific change
          // Accept = keep green (new content), delete red (old content)
          const handleAcceptSingle = (e: React.MouseEvent) => {
            e.stopPropagation();

            // Set pending scroll to auto-scroll to next comparison after diffPairs update
            pendingScrollToNextRef.current = index;

            // Unified dispatch - handler handles all content types generically
            if (onAcceptSingleChange) {
              const gRange = pair.greenRange
                ? { from: pair.greenRange.from, to: pair.greenRange.to }
                : { from: pair.redRange!.from, to: pair.redRange!.from }; // Empty green for deletion-only
              const rRange = pair.redRange
                ? { from: pair.redRange.from, to: pair.redRange.to }
                : undefined;
              onAcceptSingleChange(gRange, rRange);
            }
          };

          // Reject = keep red (old content), delete green (new content)
          const handleRejectSingle = (e: React.MouseEvent) => {
            e.stopPropagation();

            // Set pending scroll to auto-scroll to next comparison after diffPairs update
            pendingScrollToNextRef.current = index;

            // Unified dispatch - handler handles all content types generically
            if (onRejectSingleChange) {
              const gRange = pair.greenRange
                ? { from: pair.greenRange.from, to: pair.greenRange.to }
                : { from: pair.redRange!.from, to: pair.redRange!.from }; // Empty green for deletion-only
              const rRange = pair.redRange
                ? { from: pair.redRange.from, to: pair.redRange.to }
                : undefined;
              onRejectSingleChange(gRange, rRange);
            }
          };

          return (
            <div
              key={`pair-btn-${index}`}
              className="absolute z-[5] flex flex-col items-end"
              style={{
                // For image changes, position buttons OUTSIDE at bottom-right corner
                // Button's right edge aligns with image's right edge, button is below image
                // For other block changes (code blocks, tables), position at bottom-right outside the frame
                // For text changes, position at the end of the content
                left: isImageChange
                  ? (buttonRect.left + buttonRect.width - actualButtonWidth - 1) // Align button's right with image's outer border
                  : (isBlockChange ? buttonRect.right - actualButtonWidth : calculatedLeft),
                top: isImageChange
                  ? buttonRect.bottom // Directly below the border (no gap)
                  : buttonRect.bottom,
                width: `${actualButtonWidth}px`,
                pointerEvents: 'auto',
                marginTop: isBlockChange ? '0px' : '-1px',
                marginLeft: isBlockChange ? '0px' : '-1px'
              }}
              onMouseEnter={() => {
                isHoveringButtonsRef.current = true;
                // Determine if this pair should use ref-based hover tracking
                // This includes: text-only pairs, table→text, code→text, and standalone code/table pairs
                const hasBlockPairs = diffPairs.some(p => p.isImageDeletion || p.isImageReplacement || p.isImageInsertion || p.isCodeBlockDeletion || p.isCodeBlockInsertion || p.isCodeBlockReplacement || p.isTableDeletion || p.isTableInsertion || p.isTableReplacement);
                const isTableTextPair = pair.includesTableDeletion || pair.isTableReplacedByText;
                const isCodeTextPair = pair.includesCodeBlockDeletion || pair.isCodeBlockReplacedByText;
                const isStandaloneCodeBlockPair = pair.isCodeBlockDeletion || pair.isCodeBlockInsertion || pair.isCodeBlockReplacement;
                const isStandaloneTablePair = pair.isTableDeletion || pair.isTableInsertion || pair.isTableReplacement;
                const useRefBasedHover = (pair.isTextOnly && hasBlockPairs && !pair.includesCodeBlockInsertion) || isTableTextPair || isCodeTextPair || isStandaloneCodeBlockPair || isStandaloneTablePair;

                if (useRefBasedHover) {
                  // Only trigger re-render if hover index actually changed
                  // This prevents unnecessary syncPendingAttributes runs (avoiding table color flicker)
                  if (textOnlyHoverIndexRef.current !== index) {
                    textOnlyHoverIndexRef.current = index;
                    forceTextHoverUpdate(prev => prev + 1);
                  }
                } else {
                  setHoverPairIndex(index);
                }
              }}
              onMouseLeave={() => {
                isHoveringButtonsRef.current = false;
                // CRITICAL: Reset lastHoverPairIndexRef so that when mouse re-enters
                // the content, handleInteraction detects the change and shows buttons again
                lastHoverPairIndexRef.current = -1;
                // Determine if this pair should use ref-based hover tracking
                const hasBlockPairs = diffPairs.some(p => p.isImageDeletion || p.isImageReplacement || p.isImageInsertion || p.isCodeBlockDeletion || p.isCodeBlockInsertion || p.isCodeBlockReplacement || p.isTableDeletion || p.isTableInsertion || p.isTableReplacement);
                const isTableTextPair = pair.includesTableDeletion || pair.isTableReplacedByText;
                const isCodeTextPair = pair.includesCodeBlockDeletion || pair.isCodeBlockReplacedByText;
                const isStandaloneCodeBlockPair = pair.isCodeBlockDeletion || pair.isCodeBlockInsertion || pair.isCodeBlockReplacement;
                const isStandaloneTablePair = pair.isTableDeletion || pair.isTableInsertion || pair.isTableReplacement;
                const useRefBasedHover = (pair.isTextOnly && hasBlockPairs && !pair.includesCodeBlockInsertion) || isTableTextPair || isCodeTextPair || isStandaloneCodeBlockPair || isStandaloneTablePair;

                if (useRefBasedHover) {
                  textOnlyHoverIndexRef.current = -1;
                  forceTextHoverUpdate(prev => prev + 1);
                } else {
                  setHoverPairIndex(-1);
                }
              }}
            >
               {/* For non-block changes (text only), show gradient line */}
               {!isBlockChange && (
                 <div className="h-[1.5px] w-full pointer-events-none" style={{ background: isDeletionOnly ? 'linear-gradient(270deg, #EF4444 34.89%, rgba(255, 255, 255, 0) 100%)' : 'linear-gradient(270deg, #167858 34.89%, rgba(255, 255, 255, 0) 100%)' }} />
               )}
               <div className="flex flex-row items-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-bl-xl rounded-br-xl overflow-hidden h-[34px]">
                  <button onClick={handleRejectSingle} className="px-5 py-1 bg-[#EDEEF3] hover:bg-[#E4E5EA] text-[12px] font-bold text-[#182234] font-['Inter'] h-full flex items-center justify-center transition-colors border border-[#EDEEF3] hover:border-[#E4E5EA]">{isDeletionOnly ? 'Keep' : 'Discard'}</button>
                  <button onClick={handleAcceptSingle} className={`px-5 py-1 ${isDeletionOnly ? 'bg-[#EF4444] hover:bg-[#EF4444] border-[#EF4444] hover:border-[#DC2626]' : 'bg-[#167858] hover:bg-[#125f4a] border-[#167858] hover:border-[#125f4a]'} text-[12px] font-bold text-white font-['Inter'] h-full flex items-center justify-center transition-colors border`}>{isDeletionOnly ? 'Delete' : 'Accept'}</button>
               </div>
            </div>
          );
        })}
      </div>

      {/* Pending Review Pill - always visible when there are diffs */}
      <AnimatePresence>
        {diffPairs.length > 0 && !hideReviewUI && !focusMode && (
          <>
            {/* Glow background - centered in blog editor content area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute pointer-events-none z-10"
              style={{
                left: '20px',
                right: '20px',
                bottom: showBanner ? '40px':"-50px",
                height: '80px',
                filter: 'blur(30px)',
                WebkitFilter: 'blur(30px)',
                scale: '2',
                // marginBottom:"-70px"
              }}
            >
              <GlowRive style={{ width: '100%', height: '100%' }} />
            </motion.div>

            {/* Pending Review Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 flex justify-center"
              style={{
                left: '20px',
                right: '20px',
                bottom: showBanner ? '80px' : '20px'
              }}
            >
              {/* Pill with gradient border */}
              <div
                className="relative gradient-border-container-slim !rounded-[12px]"
                style={{ boxShadow: '0px 8px 25px rgba(118, 99, 187, 0.15)' }}
              >
                <div
                  className="gradient-border-container-slim-inner !rounded-[11px] flex flex-row items-center gap-2 px-2 py-2"
                  style={{ background: 'linear-gradient(113.43deg, #FFF0E8 32.49%, #F5EAFF 65.23%), #F2F3F7' }}
                >
                  <button onClick={handlePrevPair} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded transition-colors"><ChevronLeft className="w-4 h-4 text-[#323232]" strokeWidth={1.5} /></button>
                  <span className="text-[12px] font-semibold text-[#1A1A1A] tracking-[-0.02em]">Pending review {Math.max(1, activePairIndex + 1)}/{diffPairs.length}</span>
                  <button onClick={handleNextPair} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded transition-colors"><ChevronRight className="w-4 h-4 text-[#323232]" strokeWidth={1.5} /></button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Banner - only shows after agent thinking is complete */}
      <AnimatePresence mode="wait">
        {showBanner && (
          <motion.div
            key="review-banner"
            initial={{ y: 56, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 56, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center w-full z-30"
          >
             {/* Bottom Banner */}
             <div className="relative flex flex-row justify-between items-center px-8 w-full h-[72px] bg-white border-t border-[#DCDEE5] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
                <div className="flex items-center">
                   {(() => {
                     const imageChangesCount = diffPairs.filter(p => p.isImageDeletion || p.isImageReplacement).length;
                     const textChangesCount = editedLinesCount || diffRanges.length;
                     if (imageChangesCount > 0 && textChangesCount > 0) {
                       return <span className="text-[13px] font-medium tracking-[-0.01em] text-[#182234]">Edited {textChangesCount} lines, {imageChangesCount} image{imageChangesCount > 1 ? 's' : ''}</span>;
                     } else if (imageChangesCount > 0) {
                       return <span className="text-[13px] font-medium tracking-[-0.01em] text-[#182234]">Edited {imageChangesCount} image{imageChangesCount > 1 ? 's' : ''}</span>;
                     } else {
                       return <span className="text-[13px] font-medium tracking-[-0.01em] text-[#182234]">Edited {textChangesCount} lines</span>;
                     }
                   })()}
                </div>
                <div className="flex flex-row items-center gap-6">
                   <button onClick={onRejectChanges} className="flex flex-row items-center gap-2 hover:opacity-70 transition-opacity"><DiscardIcon /><span className="text-[13px] font-medium text-[#182234]">Discard All</span></button>
                   <button onClick={onAcceptChanges} className="flex flex-row items-center gap-2 px-5 h-10 bg-[#1A8D67] text-white hover:bg-[#157a58] transition-all active:scale-95 shadow-sm rounded-[10px]"><AcceptIcon /><span className="text-[13px] font-medium">Accept All</span></button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BlogEditor;
