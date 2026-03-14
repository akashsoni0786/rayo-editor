import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface TableDropdownMenuProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor;
    /**
     * Whether the dropdown should be hidden when no table functionality is available
     * @default false
     */
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare function canUseTable(editor: Editor | null): boolean;
export declare function isTableActive(editor: Editor | null): boolean;
export declare function shouldShowTableDropdown(params: {
    editor: Editor | null;
    hideWhenUnavailable: boolean;
    tableInSchema: boolean;
    canUseTable: boolean;
}): boolean;
export declare function useTableDropdownState(editor: Editor | null): {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    tableInSchema: boolean;
    canUseTableFeature: boolean;
    isActive: boolean;
    handleOpenChange: (open: boolean, callback?: (isOpen: boolean) => void) => void;
};
export declare function TableDropdownMenu({ editor: providedEditor, hideWhenUnavailable, onOpenChange, ...props }: TableDropdownMenuProps): import("react/jsx-runtime").JSX.Element | null;
export default TableDropdownMenu;
//# sourceMappingURL=table-dropdown-menu.d.ts.map