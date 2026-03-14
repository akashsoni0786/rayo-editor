import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export type Mark = "bold" | "italic" | "strike" | "code" | "underline" | "superscript" | "subscript";
export interface MarkButtonProps extends Omit<ButtonProps, "type"> {
    /**
     * The type of mark to toggle
     */
    type: Mark;
    /**
     * Optional editor instance. If not provided, will use editor from context
     */
    editor?: Editor | null;
    /**
     * Display text for the button (optional)
     */
    text?: string;
    /**
     * Whether this button should be hidden when the mark is not available
     */
    hideWhenUnavailable?: boolean;
}
export declare const markIcons: {
    bold: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    italic: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    underline: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    strike: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    code: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    superscript: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    subscript: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
};
export declare const markShortcutKeys: Partial<Record<Mark, string>>;
export declare function canToggleMark(editor: Editor | null, type: Mark): boolean;
export declare function isMarkActive(editor: Editor | null, type: Mark): boolean;
export declare function toggleMark(editor: Editor | null, type: Mark): void;
export declare function isMarkButtonDisabled(editor: Editor | null, type: Mark, userDisabled?: boolean): boolean;
export declare function shouldShowMarkButton(params: {
    editor: Editor | null;
    type: Mark;
    hideWhenUnavailable: boolean;
    markInSchema: boolean;
}): boolean;
export declare function getFormattedMarkName(type: Mark): string;
export declare function useMarkState(editor: Editor | null, type: Mark, disabled?: boolean): {
    markInSchema: boolean;
    isDisabled: boolean;
    isActive: boolean;
    Icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    shortcutKey: string | undefined;
    formattedName: string;
};
export declare function MarkButton({ editor: providedEditor, type, text, hideWhenUnavailable, className, disabled, onClick, children, ref, ...buttonProps }: MarkButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default MarkButton;
//# sourceMappingURL=mark-button.d.ts.map