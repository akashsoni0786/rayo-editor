import { Editor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export declare const HIGHLIGHT_COLORS: {
    label: string;
    value: string;
    border: string;
}[];
export interface ColorHighlightButtonProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * The node to apply highlight to
     */
    node?: Node | null;
    /**
     * The position of the node in the document
     */
    nodePos?: number | null;
    /**
     * The color to apply when toggling the highlight.
     * If not provided, it will use the default color from the extension.
     */
    color: string;
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Whether the button should hide when the mark is not available.
     * @default false
     */
    hideWhenUnavailable?: boolean;
    /**
     * Called when the highlight is applied.
     */
    onApplied?: (color: string) => void;
}
/**
 * Checks if highlight can be toggled in the current editor state
 */
export declare function canToggleHighlight(editor: Editor | null): boolean;
/**
 * Checks if highlight is active in the current selection
 */
export declare function isHighlightActive(editor: Editor | null, color: string): boolean;
/**
 * Toggles highlight on the current selection or specified node
 */
export declare function toggleHighlight(editor: Editor | null, color: string, node?: Node | null, nodePos?: number | null): void;
/**
 * Determines if the highlight button should be disabled
 */
export declare function isColorHighlightButtonDisabled(editor: Editor | null, userDisabled?: boolean): boolean;
/**
 * Determines if the highlight button should be shown
 */
export declare function shouldShowColorHighlightButton(editor: Editor | null, hideWhenUnavailable: boolean, highlightInSchema: boolean): boolean;
/**
 * Custom hook to manage highlight button state
 */
export declare function useHighlightState(editor: Editor | null, color: string, disabled?: boolean, hideWhenUnavailable?: boolean): {
    highlightInSchema: boolean;
    isDisabled: boolean;
    isActive: boolean;
    shouldShow: boolean;
};
/**
 * ColorHighlightButton component for TipTap editor
 */
export declare function ColorHighlightButton({ editor: providedEditor, node, nodePos, color, text, hideWhenUnavailable, className, disabled, onClick, onApplied, children, style, ref, ...buttonProps }: ColorHighlightButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default ColorHighlightButton;
//# sourceMappingURL=color-highlight-button.d.ts.map