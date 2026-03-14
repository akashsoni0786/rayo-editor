import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface BlockquoteButtonProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Whether the button should hide when the node is not available.
     * @default false
     */
    hideWhenUnavailable?: boolean;
}
export declare function canToggleBlockquote(editor: Editor | null): boolean;
export declare function isBlockquoteActive(editor: Editor | null): boolean;
export declare function toggleBlockquote(editor: Editor | null): boolean;
export declare function isBlockquoteButtonDisabled(editor: Editor | null, canToggle: boolean, userDisabled?: boolean): boolean;
export declare function shouldShowBlockquoteButton(params: {
    editor: Editor | null;
    hideWhenUnavailable: boolean;
    nodeInSchema: boolean;
    canToggle: boolean;
}): boolean;
export declare function useBlockquoteState(editor: Editor | null, disabled?: boolean, hideWhenUnavailable?: boolean): {
    nodeInSchema: boolean;
    canToggle: boolean;
    isDisabled: boolean;
    isActive: boolean;
    shouldShow: boolean;
    handleToggle: () => boolean;
    shortcutKey: string;
    label: string;
};
export declare function BlockquoteButton({ editor: providedEditor, text, hideWhenUnavailable, className, disabled, onClick, children, ref, ...buttonProps }: BlockquoteButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default BlockquoteButton;
//# sourceMappingURL=blockquote-button.d.ts.map