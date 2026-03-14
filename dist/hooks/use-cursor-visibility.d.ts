import { Editor } from '@tiptap/react';
import * as React from "react";
/**
 * Interface defining required parameters for the cursor visibility hook
 */
export interface CursorVisibilityOptions {
    /**
     * The TipTap editor instance
     */
    editor: Editor | null;
    /**
     * Reference to the toolbar element that may obscure the cursor
     */
    overlayHeight?: number;
    /**
     * Reference to the element to track for cursor visibility
     */
    elementRef?: React.RefObject<HTMLElement> | null;
}
/**
 * Simplified DOMRect type containing only the essential positioning properties
 */
export type RectState = Pick<DOMRect, "x" | "y" | "width" | "height">;
/**
 * Custom hook that ensures the cursor remains visible when typing in a TipTap editor.
 * Automatically scrolls the window when the cursor would be hidden by the toolbar.
 *
 * This is particularly useful for long-form content editing where the cursor
 * might move out of the visible area as the user types.
 *
 * @param options Configuration options for cursor visibility behavior
 * @returns void
 */
export declare function useCursorVisibility({ editor, overlayHeight, elementRef, }: CursorVisibilityOptions): RectState;
//# sourceMappingURL=use-cursor-visibility.d.ts.map