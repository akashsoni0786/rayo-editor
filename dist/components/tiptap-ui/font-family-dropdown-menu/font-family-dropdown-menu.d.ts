import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
export interface FontFamilyDropdownMenuProps extends Omit<ButtonProps, "type"> {
    editor?: Editor | null;
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare function FontFamilyDropdownMenu({ editor: providedEditor, hideWhenUnavailable, onOpenChange, ...props }: FontFamilyDropdownMenuProps): import("react/jsx-runtime").JSX.Element | null;
export default FontFamilyDropdownMenu;
//# sourceMappingURL=font-family-dropdown-menu.d.ts.map