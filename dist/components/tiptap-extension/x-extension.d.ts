import { Node } from '@tiptap/core';
export interface XOptions {
    addPasteHandler: boolean;
    theme: 'light' | 'dark';
    HTMLAttributes: Record<string, any>;
    inline: boolean;
    width: number;
    height: number;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        x: {
            /**
             * Insert an X/Twitter post
             */
            setXVideo: (options: {
                src: string;
                width?: number;
                height?: number;
            }) => ReturnType;
        };
    }
}
export declare const X: Node<XOptions, any>;
export default X;
//# sourceMappingURL=x-extension.d.ts.map