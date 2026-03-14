import { Editor } from '@tiptap/react';
import { Level } from '../heading-button/heading-button';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
export interface HeadingDropdownMenuProps extends Omit<ButtonProps, "type"> {
    editor?: Editor | null;
    levels?: Level[];
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    includeParagraph?: boolean;
}
export declare function HeadingDropdownMenu({ editor: providedEditor, levels, hideWhenUnavailable, includeParagraph, onOpenChange, ...props }: HeadingDropdownMenuProps): import("react/jsx-runtime").JSX.Element | null;
export default HeadingDropdownMenu;
//# sourceMappingURL=heading-dropdown-menu.d.ts.map