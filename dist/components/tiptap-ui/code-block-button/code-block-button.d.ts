import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface CodeBlockButtonProps extends Omit<ButtonProps, "type"> {
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
export declare function canToggleCodeBlock(editor: Editor | null): boolean;
export declare function isCodeBlockActive(editor: Editor | null): boolean;
export declare function toggleCodeBlock(editor: Editor | null): boolean;
export declare function isCodeBlockButtonDisabled(editor: Editor | null, canToggle: boolean, userDisabled?: boolean): boolean;
export declare function shouldShowCodeBlockButton(params: {
    editor: Editor | null;
    hideWhenUnavailable: boolean;
    nodeInSchema: boolean;
    canToggle: boolean;
}): boolean;
export declare function useCodeBlockState(editor: Editor | null, disabled?: boolean, hideWhenUnavailable?: boolean): {
    nodeInSchema: boolean;
    canToggle: boolean;
    isDisabled: boolean;
    isActive: boolean;
    shouldShow: boolean;
    handleToggle: () => boolean;
    shortcutKey: string;
    label: string;
};
export declare function CodeBlockButton({ editor: providedEditor, text, hideWhenUnavailable, className, disabled, onClick, children, ref, ...buttonProps }: CodeBlockButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default CodeBlockButton;
//# sourceMappingURL=code-block-button.d.ts.map