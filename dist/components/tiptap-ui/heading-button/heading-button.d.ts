import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface HeadingButtonProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * The heading level.
     */
    level: Level;
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Whether the button should hide when the heading is not available.
     * @default false
     */
    hideWhenUnavailable?: boolean;
}
export declare const headingIcons: {
    1: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    2: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    3: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    4: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    5: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    6: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
};
export declare const headingShortcutKeys: Partial<Record<Level, string>>;
export declare function canToggleHeading(editor: Editor | null, level: Level): boolean;
export declare function isHeadingActive(editor: Editor | null, level: Level): boolean;
export declare function toggleHeading(editor: Editor | null, level: Level): void;
export declare function isHeadingButtonDisabled(editor: Editor | null, level: Level, userDisabled?: boolean): boolean;
export declare function shouldShowHeadingButton(params: {
    editor: Editor | null;
    level: Level;
    hideWhenUnavailable: boolean;
    headingInSchema: boolean;
}): boolean;
export declare function getFormattedHeadingName(level: Level): string;
export declare function useHeadingState(editor: Editor | null, level: Level, disabled?: boolean): {
    headingInSchema: boolean;
    isDisabled: boolean;
    isActive: boolean;
    Icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    shortcutKey: string | undefined;
    formattedName: string;
};
export declare function HeadingButton({ editor: providedEditor, level, text, hideWhenUnavailable, className, disabled, onClick, children, ref, ...buttonProps }: HeadingButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default HeadingButton;
//# sourceMappingURL=heading-button.d.ts.map