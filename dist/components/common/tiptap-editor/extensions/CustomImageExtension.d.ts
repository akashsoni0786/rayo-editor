import { Node } from '@tiptap/core';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        customImage: {
            /**
             * Add an image
             */
            setImage: (options: {
                src: string;
                alt?: string;
                title?: string;
                width?: number;
                height?: number;
                align?: string;
                inline?: boolean;
            }) => ReturnType;
        };
    }
}
/**
 * CustomImage extension enhancing the standard TipTap Image with resizing capabilities
 */
export declare const CustomImage: Node<any, any>;
export default CustomImage;
//# sourceMappingURL=CustomImageExtension.d.ts.map