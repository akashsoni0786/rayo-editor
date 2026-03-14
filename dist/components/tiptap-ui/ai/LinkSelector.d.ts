import { default as React } from 'react';
import { Editor } from '@tiptap/react';
export declare function isValidUrl(url: string): boolean;
export declare function getUrlFromString(str: string): string | null | undefined;
interface LinkSelectorProps {
    editor: Editor;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
interface LinkButtonProps {
    editor: Editor;
    openLink?: boolean;
    onOpenLinkChange?: (open: boolean) => void;
}
export declare const LinkButton: React.FC<LinkButtonProps>;
export declare const LinkSelector: React.FC<LinkSelectorProps>;
export {};
//# sourceMappingURL=LinkSelector.d.ts.map