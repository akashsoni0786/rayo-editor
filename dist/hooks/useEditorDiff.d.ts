import { DiffPair } from '../types/diff.types';
/**
 * Hook for managing diff detection and overlay state
 *
 * Tracks detected diff pairs, active/hover indices, and overlay positioning.
 * Automatically throttles diff updates to prevent excessive processing.
 *
 * @param editorRef - Reference to the editor instance
 * @param options - Optional configuration
 * @param options.focusMode - Enable focus mode UI (default: false)
 * @returns Object with diff state and control functions
 *
 * @returns {Object} Diff state object containing:
 *   - diffPairs: DiffPair[] - Array of detected diff pairs
 *   - setDiffPairs: (pairs: DiffPair[]) => void - Update diff pairs
 *   - activePairIndex: number - Currently active pair index (-1 if none)
 *   - setActivePairIndex: (index: number) => void - Set active pair
 *   - hoverPairIndex: number - Currently hovered pair index
 *   - setHoverPairIndex: (index: number) => void - Set hovered pair
 *   - overlayHoleRect: Rect | null - Rectangle for overlay positioning
 *   - setOverlayHoleRect: (rect: Rect | null) => void - Set overlay position
 *   - updateDiffRanges: () => void - Trigger diff detection update
 *
 * @example
 * ```tsx
 * const {
 *   diffPairs,
 *   activePairIndex,
 *   hoverPairIndex,
 *   updateDiffRanges
 * } = useEditorDiff(editorRef, { focusMode: false });
 *
 * // Update when needed
 * useEffect(() => {
 *   updateDiffRanges();
 * }, [content]);
 * ```
 *
 * @example
 * Interactive diff UI:
 * ```tsx
 * const {
 *   diffPairs,
 *   setActivePairIndex,
 *   setHoverPairIndex
 * } = useEditorDiff(editorRef);
 *
 * // Use diffPairs to render interactive UI elements
 * // with hover and click handlers
 * ```
 */
export declare const useEditorDiff: (_editorRef: any, _options?: {
    focusMode?: boolean;
}) => {
    diffPairs: DiffPair[];
    setDiffPairs: import('react').Dispatch<import('react').SetStateAction<DiffPair[]>>;
    activePairIndex: number;
    setActivePairIndex: import('react').Dispatch<import('react').SetStateAction<number>>;
    hoverPairIndex: number;
    setHoverPairIndex: import('react').Dispatch<import('react').SetStateAction<number>>;
    overlayHoleRect: any;
    setOverlayHoleRect: import('react').Dispatch<any>;
    updateDiffRanges: () => void;
};
//# sourceMappingURL=useEditorDiff.d.ts.map