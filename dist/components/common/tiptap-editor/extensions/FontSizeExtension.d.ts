import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';
export type FontSizeOptions = {
    types: string[];
    defaultSize: string;
    sizes: string[];
};
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize: (fontSize: string) => ReturnType;
            /**
             * Unset the font size
             */
            unsetFontSize: () => ReturnType;
        };
    }
}
export declare const FontSize: Extension<FontSizeOptions, any>;
export default FontSize;
//# sourceMappingURL=FontSizeExtension.d.ts.map