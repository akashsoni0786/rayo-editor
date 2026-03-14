import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export type ListType = "bulletList" | "orderedList" | "taskList";
export interface ListOption {
    label: string;
    type: ListType;
    icon: React.ElementType;
}
export interface ListButtonProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * The type of list to toggle.
     */
    type: ListType;
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * Whether the button should hide when the list is not available.
     * @default false
     */
    hideWhenUnavailable?: boolean;
}
export declare const listOptions: ListOption[];
export declare const listShortcutKeys: Record<ListType, string>;
export declare function canToggleList(editor: Editor | null, type: ListType): boolean;
export declare function isListActive(editor: Editor | null, type: ListType): boolean;
export declare function toggleList(editor: Editor | null, type: ListType): void;
export declare function getListOption(type: ListType): ListOption | undefined;
export declare function shouldShowListButton(params: {
    editor: Editor | null;
    type: ListType;
    hideWhenUnavailable: boolean;
    listInSchema: boolean;
}): boolean;
export declare function useListState(editor: Editor | null, type: ListType): {
    listInSchema: boolean;
    listOption: ListOption | undefined;
    isActive: boolean;
    shortcutKey: string;
};
export declare function ListButton({ editor: providedEditor, type, hideWhenUnavailable, className, onClick, text, children, ref, ...buttonProps }: ListButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default ListButton;
//# sourceMappingURL=list-button.d.ts.map