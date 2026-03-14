import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';
export const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
            defaultSize: '16px',
            sizes: ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: this.options.defaultSize,
                        parseHTML: element => element.style.fontSize || this.options.defaultSize,
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            },
        };
    },
});
export default FontSize;
//# sourceMappingURL=FontSizeExtension.js.map