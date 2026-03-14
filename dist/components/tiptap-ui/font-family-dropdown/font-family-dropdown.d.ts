import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
export interface FontFamilyDropdownProps extends Omit<ButtonProps, "type"> {
    editor?: Editor | null;
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    /** Custom font options to override defaults */
    customFonts?: FontOption[];
    /** Whether to show font previews in dropdown */
    showPreviews?: boolean;
}
interface FontOption {
    value: string;
    label: string;
    category: string;
}
export declare function FontFamilyDropdown({ editor: providedEditor, hideWhenUnavailable, customFonts, showPreviews, onOpenChange, ...props }: FontFamilyDropdownProps): import("react/jsx-runtime").JSX.Element | null;
export declare const FontFamilyUtils: {
    /**
     * Check if a font family is active in the editor
     * @param editor TipTap editor instance
     * @param fontFamily Font family string to check
     */
    isFontFamilyActive: (editor: Editor | null, fontFamily: string) => boolean;
    /**
     * Apply font family using official TipTap command
     * @param editor TipTap editor instance
     * @param fontFamily Font family string to apply
     */
    setFontFamily: (editor: Editor | null, fontFamily: string) => boolean;
    /**
     * Remove font family using official TipTap command
     * @param editor TipTap editor instance
     */
    unsetFontFamily: (editor: Editor | null) => boolean;
    /**
     * Get current font family from editor
     * @param editor TipTap editor instance
     */
    getCurrentFontFamily: (editor: Editor | null) => string;
};
export {};
//# sourceMappingURL=font-family-dropdown.d.ts.map