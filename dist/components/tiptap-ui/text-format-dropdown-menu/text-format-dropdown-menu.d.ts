import { Editor } from '@tiptap/react';
import { Mark } from '../mark-button/mark-button';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface TextFormatDropdownMenuProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor;
    /**
     * The text formatting options to display in the dropdown.
     */
    formats?: Mark[];
    /**
     * Whether the dropdown should be hidden when no formatting options are available
     * @default false
     */
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare const textFormatOptions: {
    mark: Mark;
    label: string;
    icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    shortcut: string;
}[];
export declare function canSetAnyTextFormat(editor: Editor | null, formats: Mark[]): boolean;
export declare function isAnyTextFormatActive(editor: Editor | null, formats: Mark[]): boolean;
export declare function getFilteredTextFormatOptions(availableFormats: Mark[]): typeof textFormatOptions;
export declare function shouldShowTextFormatDropdown(params: {
    editor: Editor | null;
    formats: Mark[];
    hideWhenUnavailable: boolean;
    formatsInSchema: boolean;
    canSetAny: boolean;
}): boolean;
export declare function useTextFormatDropdownState(editor: Editor | null, availableFormats: Mark[]): {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formatsInSchema: boolean;
    filteredFormats: {
        mark: Mark;
        label: string;
        icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
        shortcut: string;
    }[];
    canSetAny: boolean;
    isAnyActive: boolean;
    handleOpenChange: (open: boolean, callback?: (isOpen: boolean) => void) => void;
};
export declare function useActiveTextFormatIcon(editor: Editor | null, filteredFormats: typeof textFormatOptions): () => import("react/jsx-runtime").JSX.Element;
export declare function TextFormatDropdownMenu({ editor: providedEditor, formats, hideWhenUnavailable, onOpenChange, ...props }: TextFormatDropdownMenuProps): import("react/jsx-runtime").JSX.Element | null;
export default TextFormatDropdownMenu;
//# sourceMappingURL=text-format-dropdown-menu.d.ts.map