import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface ColorHighlightPopoverColor {
    label: string;
    value: string;
    border?: string;
}
export interface ColorHighlightPopoverContentProps {
    editor?: Editor | null;
    colors?: ColorHighlightPopoverColor[];
    onClose?: () => void;
}
export interface ColorHighlightPopoverProps extends Omit<ButtonProps, "type"> {
    /** The TipTap editor instance. */
    editor?: Editor | null;
    /** The highlight colors to display in the popover. */
    colors?: ColorHighlightPopoverColor[];
    /** Whether to hide the highlight popover when unavailable. */
    hideWhenUnavailable?: boolean;
}
export declare const DEFAULT_HIGHLIGHT_COLORS: ColorHighlightPopoverColor[];
export declare function ColorHighlightPopoverButton({ className, children, ref, ...props }: ButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element;
export declare function ColorHighlightPopoverContent({ editor: providedEditor, colors, onClose, }: ColorHighlightPopoverContentProps): import("react/jsx-runtime").JSX.Element;
export declare function ColorHighlightPopover({ editor: providedEditor, colors, hideWhenUnavailable, ...props }: ColorHighlightPopoverProps): import("react/jsx-runtime").JSX.Element | null;
export default ColorHighlightPopover;
//# sourceMappingURL=color-highlight-popover.d.ts.map