import { ImageAlignment } from '../types';
export interface ResizableImageWithCaptionOptions {
    /** Default alignment for new images */
    defaultAlignment?: ImageAlignment;
    /** Default caption placement */
    defaultCaptionPlacement?: 'above' | 'below';
    /** Allow base64 images */
    allowBase64?: boolean;
    /** HTML attributes for the image wrapper */
    HTMLAttributes?: Record<string, unknown>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableImageWithCaption: {
            /**
             * Set image alignment
             */
            setImageAlignment: (alignment: ImageAlignment) => ReturnType;
            /**
             * Set image size
             */
            setImageSize: (width: string | number, height?: string | number) => ReturnType;
            /**
             * Set image caption
             */
            setImageCaption: (caption: string) => ReturnType;
            /**
             * Remove image caption
             */
            removeImageCaption: () => ReturnType;
        };
    }
}
export declare const ResizableImageWithCaptionExtension: import('@tiptap/core').Node<ResizableImageWithCaptionOptions, any>;
export default ResizableImageWithCaptionExtension;
//# sourceMappingURL=resizable-image-caption-extension.d.ts.map