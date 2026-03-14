import { Node } from '@tiptap/core';
export interface InstagramOptions {
    addPasteHandler: boolean;
    allowFullscreen: boolean;
    HTMLAttributes: Record<string, any>;
    inline: boolean;
    width: number;
    height: number;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        instagram: {
            /**
             * Insert an Instagram post
             */
            setInstagramVideo: (options: {
                src: string;
                width?: number;
                height?: number;
            }) => ReturnType;
        };
    }
}
export declare const Instagram: Node<InstagramOptions, any>;
export default Instagram;
//# sourceMappingURL=instagram-extension.d.ts.map