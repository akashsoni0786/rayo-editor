import { default as React, ReactNode } from 'react';
import { Editor } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
interface BubbleMenuProps {
    editor: Editor;
    children: ReactNode;
    className?: string;
    tippyOptions?: {
        duration?: number;
        placement?: string;
        maxWidth?: string | number;
        [key: string]: unknown;
    };
    shouldShow?: (props: {
        editor: Editor;
        element: HTMLElement;
        view: EditorView;
        state: EditorState;
        oldState?: EditorState;
        from: number;
        to: number;
    }) => boolean;
    pluginKey?: string;
}
export declare const BubbleMenu: React.FC<BubbleMenuProps>;
export default BubbleMenu;
//# sourceMappingURL=BubbleMenu.d.ts.map