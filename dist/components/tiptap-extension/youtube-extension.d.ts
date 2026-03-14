import { Node } from '@tiptap/core';
export interface YoutubeOptions {
    addPasteHandler: boolean;
    allowFullscreen: boolean;
    autoplay: boolean;
    ccLanguage?: string;
    ccLoadPolicy?: boolean;
    controls: boolean;
    disableKBcontrols: boolean;
    enableIFrameApi: boolean;
    endTime: number;
    height: number;
    interfaceLanguage?: string;
    ivLoadPolicy: number;
    loop: boolean;
    modestBranding: boolean;
    HTMLAttributes: Record<string, any>;
    inline: boolean;
    nocookie: boolean;
    origin: string;
    playlist: string;
    progressBarColor?: string;
    width: number;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        youtube: {
            /**
             * Insert a youtube video
             */
            setYoutubeVideo: (options: {
                src: string;
                width?: number;
                height?: number;
                start?: number;
            }) => ReturnType;
        };
    }
}
export declare const Youtube: Node<YoutubeOptions, any>;
export default Youtube;
//# sourceMappingURL=youtube-extension.d.ts.map