import { Editor, ChainedCommands } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export type TextAlign = "left" | "center" | "right" | "justify";
export interface TextAlignButtonProps extends ButtonProps {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * The text alignment to apply.
     */
    align: TextAlign;
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Whether the button should hide when the alignment is not available.
     * @default false
     */
    hideWhenUnavailable?: boolean;
}
export declare const textAlignIcons: {
    left: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    center: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    right: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    justify: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
};
export declare const textAlignShortcutKeys: Partial<Record<TextAlign, string>>;
export declare const textAlignLabels: Record<TextAlign, string>;
export declare function hasSetTextAlign(commands: ChainedCommands): commands is ChainedCommands & {
    setTextAlign: (align: TextAlign) => ChainedCommands;
};
export declare function checkTextAlignExtension(editor: Editor | null): boolean;
export declare function canSetTextAlign(editor: Editor | null, align: TextAlign, alignAvailable: boolean): boolean;
export declare function isTextAlignActive(editor: Editor | null, align: TextAlign): boolean;
export declare function setTextAlign(editor: Editor | null, align: TextAlign): boolean;
export declare function isTextAlignButtonDisabled(editor: Editor | null, alignAvailable: boolean, canAlign: boolean, userDisabled?: boolean): boolean;
export declare function shouldShowTextAlignButton(editor: Editor | null, canAlign: boolean, hideWhenUnavailable: boolean): boolean;
export declare function useTextAlign(editor: Editor | null, align: TextAlign, disabled?: boolean, hideWhenUnavailable?: boolean): {
    alignAvailable: boolean;
    canAlign: boolean;
    isDisabled: boolean;
    isActive: boolean;
    handleAlignment: () => boolean;
    shouldShow: boolean;
    Icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    shortcutKey: string | undefined;
    label: string;
};
export declare function TextAlignButton({ editor: providedEditor, align, text, hideWhenUnavailable, className, disabled, onClick, children, ref, ...buttonProps }: TextAlignButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default TextAlignButton;
//# sourceMappingURL=text-align-button.d.ts.map