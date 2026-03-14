import { Editor } from '@tiptap/react';
import { listOptions, ListType } from '../list-button/list-button';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface ListDropdownMenuProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor;
    /**
     * The list types to display in the dropdown.
     */
    types?: ListType[];
    /**
     * Whether the dropdown should be hidden when no list types are available
     * @default false
     */
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare function canToggleAnyList(editor: Editor | null, listTypes: ListType[]): boolean;
export declare function isAnyListActive(editor: Editor | null, listTypes: ListType[]): boolean;
export declare function getFilteredListOptions(availableTypes: ListType[]): typeof listOptions;
export declare function shouldShowListDropdown(params: {
    editor: Editor | null;
    listTypes: ListType[];
    hideWhenUnavailable: boolean;
    listInSchema: boolean;
    canToggleAny: boolean;
}): boolean;
export declare function useListDropdownState(editor: Editor | null, availableTypes: ListType[]): {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    listInSchema: boolean;
    filteredLists: import('../list-button').ListOption[];
    canToggleAny: boolean;
    isAnyActive: boolean;
    handleOpenChange: (open: boolean, callback?: (isOpen: boolean) => void) => void;
};
export declare function useActiveListIcon(editor: Editor | null, filteredLists: typeof listOptions): () => import("react/jsx-runtime").JSX.Element;
export declare function ListDropdownMenu({ editor: providedEditor, types, hideWhenUnavailable, onOpenChange, ...props }: ListDropdownMenuProps): import("react/jsx-runtime").JSX.Element | null;
export default ListDropdownMenu;
//# sourceMappingURL=list-dropdown-menu.d.ts.map