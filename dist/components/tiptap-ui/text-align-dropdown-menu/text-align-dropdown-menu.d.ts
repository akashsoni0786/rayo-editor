import { Editor } from '@tiptap/react';
import { TextAlign } from '../text-align-button/text-align-button';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface TextAlignDropdownMenuProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor;
    /**
     * The text alignment options to display in the dropdown.
     */
    alignments?: TextAlign[];
    /**
     * Whether the dropdown should be hidden when no alignment options are available
     * @default false
     */
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare const textAlignOptions: {
    align: TextAlign;
    label: string;
    icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
}[];
export declare function canSetAnyTextAlign(editor: Editor | null, alignments: TextAlign[]): boolean;
export declare function isAnyTextAlignActive(editor: Editor | null, alignments: TextAlign[]): boolean;
export declare function getFilteredTextAlignOptions(availableAlignments: TextAlign[]): typeof textAlignOptions;
export declare function shouldShowTextAlignDropdown(params: {
    editor: Editor | null;
    alignments: TextAlign[];
    hideWhenUnavailable: boolean;
    alignInSchema: boolean;
    canSetAny: boolean;
}): boolean;
export declare function useTextAlignDropdownState(editor: Editor | null, availableAlignments: TextAlign[]): {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    alignInSchema: boolean;
    filteredAlignments: {
        align: TextAlign;
        label: string;
        icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    }[];
    canSetAny: boolean;
    isAnyActive: boolean;
    handleOpenChange: (open: boolean, callback?: (isOpen: boolean) => void) => void;
};
export declare function useActiveTextAlignIcon(editor: Editor | null, filteredAlignments: typeof textAlignOptions): () => import("react/jsx-runtime").JSX.Element;
export declare function TextAlignDropdownMenu({ editor: providedEditor, alignments, hideWhenUnavailable, onOpenChange, ...props }: TextAlignDropdownMenuProps): import("react/jsx-runtime").JSX.Element | null;
export default TextAlignDropdownMenu;
//# sourceMappingURL=text-align-dropdown-menu.d.ts.map