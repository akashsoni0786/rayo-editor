import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollSection {
  id: string;
  percentage: number; // 0, 10, 20, 30, etc.
  scrollPosition: number; // Actual scroll position
}

interface DiffPair {
  redRange?: {from: number, to: number};
  greenRange?: {from: number, to: number};
  rect: {top: number, left: number, width: number, bottom: number, right: number};
  lastGreenRect: {top: number, left: number, width: number, bottom: number, right: number};
  isImageDeletion?: boolean;
  isImageReplacement?: boolean;
}

interface BlogMinimapProps {
  content: string;
  editorRef: React.RefObject<any>;
  visible?: boolean; // Optional, kept for backwards compatibility
  diffPairs?: DiffPair[]; // Comparison points to show on minimap
}

const BlogMinimap: React.FC<BlogMinimapProps> = ({ content, editorRef, visible = true, diffPairs = [] }) => {
  const [sections, setSections] = useState<ScrollSection[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [bitmapSegments, setBitmapSegments] = useState<{startPercentage: number, endPercentage: number, isChanged: boolean, changeType?: 'deletion' | 'addition', wordCount?: number}[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [tooltipY, setTooltipY] = useState<number>(0); // Track mouse Y position relative to segment
  const minimapRef = useRef<HTMLDivElement>(null);
  const lastDiffPairsRef = useRef<string>('');

  // Calculate scroll sections based on document height
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const scrollContainer = editor.view.dom.closest('.simple-editor-content')?.parentElement;
    if (!scrollContainer) return;

    const updateSections = () => {
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

      // Create percentage markers: 0%, 0.1%, 0.2%, ..., 100% (1001 sections for smooth scrolling)
      const newSections: ScrollSection[] = [];
      for (let i = 0; i <= 1000; i++) {
        const percentage = i / 10; // 0, 0.1, 0.2, ..., 100
        newSections.push({
          id: `section-${i}`,
          percentage: percentage,
          scrollPosition: (maxScroll * percentage) / 100
        });
      }

      setSections(newSections);
    };

    updateSections();

    // Update sections when content changes (height might change)
    const resizeObserver = new ResizeObserver(updateSections);
    resizeObserver.observe(scrollContainer);

    return () => resizeObserver.disconnect();
  }, [content, editorRef]);

  // Track active section based on scroll position
  useEffect(() => {
    if (!editorRef.current || sections.length === 0) return;

    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const scrollContainer = editor.view.dom.closest('.simple-editor-content')?.parentElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

      // Calculate current percentage
      const currentPercentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      // Find the closest section
      let closestSection = 0;
      let minDiff = Infinity;

      sections.forEach(section => {
        const diff = Math.abs(section.percentage - currentPercentage);
        if (diff < minDiff) {
          minDiff = diff;
          closestSection = section.percentage;
        }
      });

      setActiveSection(closestSection);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [sections, editorRef]);

  // Calculate diff marker positions and heights based on diffPairs
  useEffect(() => {
    if (!editorRef.current || diffPairs.length === 0) {
      // No changes - single gray segment covering 0-100%
      setBitmapSegments([{ startPercentage: 0, endPercentage: 100, isChanged: false }]);
      lastDiffPairsRef.current = '';
      return;
    }

    // Create a stable key from diffPairs to check if they actually changed
    const diffPairsKey = diffPairs.map(p =>
      `${p.redRange?.from}-${p.redRange?.to}-${p.greenRange?.from}-${p.greenRange?.to}`
    ).join('|');

    // Skip recalculation if diffPairs haven't actually changed
    if (lastDiffPairsRef.current === diffPairsKey) {
      return;
    }
    lastDiffPairsRef.current = diffPairsKey;

    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const scrollContainer = editor.view.dom.closest('.simple-editor-content')?.parentElement;
    if (!scrollContainer) return;

    const totalScrollHeight = scrollContainer.scrollHeight;
    if (totalScrollHeight <= 0) return;

    const positions: {percentage: number, height: number, changeType: 'deletion' | 'addition'}[] = [];
    const minimapHeight = 450; // Max height of minimap (55vh max = 450px)
    const minMarkerHeight = 8; // Minimum marker height in pixels
    const maxMarkerHeight = 40; // Maximum marker height in pixels

    diffPairs.forEach(pair => {
      try {
        // Determine change type: if redRange exists (deletion), use red; otherwise use green (addition)
        // Priority: show deletion (red) if available, otherwise show addition (green)
        const changeType: 'deletion' | 'addition' = pair.redRange ? 'deletion' : 'addition';

        // Use range positions for stable calculation (not viewport-relative rect)
        const rangeToUse = changeType === 'deletion' ? pair.redRange : pair.greenRange;
        if (!rangeToUse) return;

        // Get coordinates from document positions - these are stable
        const startCoords = editor.view.coordsAtPos(rangeToUse.from);
        const endCoords = editor.view.coordsAtPos(rangeToUse.to);
        const scrollContainerRect = scrollContainer.getBoundingClientRect();

        // Calculate the position relative to the document (not viewport)
        const diffTopInDocument = startCoords.top - scrollContainerRect.top + scrollContainer.scrollTop;

        // Convert to percentage of total document height
        const percentage = (diffTopInDocument / totalScrollHeight) * 100;
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        // Calculate the actual height of the change in pixels
        const changeHeightInDocument = endCoords.bottom - startCoords.top;

        // Scale the change height to minimap proportions
        const scaleFactor = minimapHeight / totalScrollHeight;
        let markerHeight = changeHeightInDocument * scaleFactor;

        // Clamp between min and max marker height
        markerHeight = Math.max(minMarkerHeight, Math.min(maxMarkerHeight, markerHeight));

        positions.push({ percentage: clampedPercentage, height: markerHeight, changeType });
      } catch (e) {
        console.error('Error calculating diff position:', e);
      }
    });

    // Calculate bitmap segments (gray and blue capsules)
    if (positions.length === 0) {
      // No changes - single gray segment covering 0-100%
      setBitmapSegments([{ startPercentage: 0, endPercentage: 100, isChanged: false }]);
    } else {
      // Build segments: gray → red/green (changes) → gray
      const segments: {startPercentage: number, endPercentage: number, isChanged: boolean, changeType?: 'deletion' | 'addition', wordCount?: number}[] = [];

      // Sort positions by percentage
      const sortedPositions = [...positions].sort((a, b) => a.percentage - b.percentage);

      let currentPos = 0;

      sortedPositions.forEach((marker, markerIndex) => {
        const markerStart = Math.max(0, marker.percentage - (marker.height / 2) * (100 / minimapHeight));
        const markerEnd = Math.min(100, marker.percentage + (marker.height / 2) * (100 / minimapHeight));

        const gapSize = 0.5; // Gap between segments in percentage

        // Add gray segment before this change (if there's a gap)
        if (currentPos < markerStart) {
          segments.push({ startPercentage: currentPos, endPercentage: markerStart - gapSize, isChanged: false });
        }

        // Calculate word count for this change
        // Use the range that matches the changeType (red for deletion, green for addition)
        let wordCount = 0;
        if (diffPairs[markerIndex]) {
          const pair = diffPairs[markerIndex];
          const rangeToUse = marker.changeType === 'deletion' ? pair.redRange : pair.greenRange;
          if (rangeToUse) {
            try {
              // Get text content from the range
              const nodeStart = rangeToUse.from;
              const nodeEnd = rangeToUse.to;
              let textContent = '';

              editor.state.doc.nodesBetween(nodeStart, nodeEnd, (node: any) => {
                if (node.isText) {
                  textContent += node.text + ' ';
                }
              });

              // Count words
              const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
              wordCount = words.length;
            } catch (e) {
              console.error('Error counting words:', e);
            }
          }
        }

        // Add red/green segment for this change based on changeType
        segments.push({ startPercentage: markerStart, endPercentage: markerEnd, isChanged: true, changeType: marker.changeType, wordCount });

        currentPos = markerEnd + gapSize;
      });

      // Add final gray segment after last change (if needed)
      if (currentPos < 100) {
        segments.push({ startPercentage: currentPos, endPercentage: 100, isChanged: false });
      }

      setBitmapSegments(segments);
    }
  }, [editorRef, diffPairs, content]);

  // Scroll to percentage when clicked anywhere on the bar
  const handleBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;

    const editor = editorRef.current.getEditor();
    if (!editor) return;

    const scrollContainer = editor.view.dom.closest('.simple-editor-content')?.parentElement;
    if (!scrollContainer) return;

    // Get click position relative to the bar
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const barHeight = rect.height;
    const clickPercentage = (clickY / barHeight) * 100;

    // Calculate scroll position
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const targetScroll = (maxScroll * clickPercentage) / 100;

    scrollContainer.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }, [editorRef]);

  if (!visible) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          ref={minimapRef}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-shrink-0 flex flex-col justify-center items-center"
          style={{
            width: '3px',
            height: '100%'
          }}
        >
          {/* Background container - clickable */}
          <div
            onClick={handleBarClick}
            className="relative cursor-pointer"
            style={{
              background: 'transparent',
              width: '3px',
              height: '55vh',
              minHeight: '280px',
              maxHeight: '450px',
              borderRadius: '16px'
            }}
          >
            {/* Bitmap segments - gray and blue capsules showing document structure */}
            {bitmapSegments.map((segment, index) => {
              const segmentHeight = segment.endPercentage - segment.startPercentage;
              const topPosition = segment.startPercentage;
              const segmentMidpoint = topPosition + (segmentHeight / 2);
              const isHovered = hoveredSegment === index;

              // Determine arrow direction: if segment is in top half (< 50%), show down arrow; otherwise show up arrow
              const showDownArrow = segmentMidpoint < 50;

              // Determine segment color: purple for changes, gray for no changes
              const getSegmentColor = () => {
                if (!segment.isChanged) return '#D9D9D9';
                return '#5E33FF';
              };

              return (
                <div
                  key={`segment-${index}`}
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    width: '4px',
                    height: `calc(${segmentHeight}% - ${(segmentHeight / 100) * 16}px)`,
                    background: getSegmentColor(),
                    borderRadius: '16px',
                    top: `calc(8px + ${topPosition}% - ${(topPosition / 100) * 16}px)`,
                    zIndex: 1,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredSegment(index);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipY(e.clientY - rect.top);
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipY(e.clientY - rect.top);
                  }}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div
                      className="absolute flex flex-row justify-center items-center gap-[2px]"
                      style={{
                        left: '16px',
                        top: `${tooltipY}px`,
                        transform: 'translateY(-50%)',
                        padding: '4px 8px',
                        background: segment.isChanged
                          ? '#E8E7FF'
                          : '#E1E3EA',
                        borderRadius: '16px',
                        height: '20px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 9999
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          fontSize: '10px',
                          lineHeight: '12px',
                          color: segment.isChanged ? '#5E33FF' : '#182234'
                        }}
                      >
                        {segment.isChanged
                          ? `Edited ${segment.wordCount || 0} word${segment.wordCount !== 1 ? 's' : ''}`
                          : 'No changes'}
                      </span>
                      {segment.isChanged && (
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 11 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ transform: showDownArrow ? 'rotate(0deg)' : 'rotate(180deg)' }}
                        >
                          <path
                            d="M5.5 8.25V2.75M5.5 2.75L2.75 5.5M5.5 2.75L8.25 5.5"
                            stroke="#5E33FF"
                            strokeWidth="0.916667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Purple pointer dot - positioned based on active section */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{
                width: '4px',
                height: '10px',
                background: 'transparent',
                marginLeft: '0px',
                zIndex: 2
              }}
              animate={{
                top: `calc(8px + ${(activeSection / 100) * 100}% - ${(activeSection / 100) * 16}px)`
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlogMinimap;
