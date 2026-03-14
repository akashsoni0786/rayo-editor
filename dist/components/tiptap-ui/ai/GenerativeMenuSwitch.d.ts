import { default as React, ReactNode } from 'react';
import { Editor } from '@tiptap/react';
interface GenerativeMenuSwitchProps {
    editor: Editor;
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    openLink?: boolean;
    onOpenLinkChange?: (open: boolean) => void;
}
export declare const GenerativeMenuSwitch: React.FC<GenerativeMenuSwitchProps>;
export {};
//# sourceMappingURL=GenerativeMenuSwitch.d.ts.map