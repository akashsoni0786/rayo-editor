import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface SearchAndReplaceProps extends Omit<ButtonProps, "type"> {
    editor?: Editor;
    hideWhenUnavailable?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare function useSearchAndReplaceState(editor: Editor | null): {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    replaceTerm: string;
    setReplaceTerm: React.Dispatch<React.SetStateAction<string>>;
    caseSensitive: boolean;
    setCaseSensitive: React.Dispatch<React.SetStateAction<boolean>>;
    resultText: string;
    replace: () => void;
    replaceAll: () => void;
    nextResult: () => void;
    previousResult: () => void;
    clear: () => void;
    handleOpenChange: (open: boolean, callback?: (isOpen: boolean) => void) => void;
};
export declare function SearchAndReplace({ editor: providedEditor, hideWhenUnavailable, onOpenChange, ...props }: SearchAndReplaceProps): import("react/jsx-runtime").JSX.Element | null;
export default SearchAndReplace;
//# sourceMappingURL=search-and-replace.d.ts.map