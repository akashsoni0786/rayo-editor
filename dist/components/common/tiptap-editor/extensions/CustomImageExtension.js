import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageView from '../node-views/ImageView';
/**
 * Regular expression that matches image Markdown syntax:
 * ![alt](src title)
 */
const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;
/**
 * CustomImage extension enhancing the standard TipTap Image with resizing capabilities
 */
export const CustomImage = Node.create({
    name: 'image',
    addOptions() {
        return {
            inline: false,
            allowBase64: true,
            HTMLAttributes: {},
        };
    },
    inline() {
        return this.options.inline;
    },
    group() {
        return this.options.inline ? 'inline' : 'block';
    },
    draggable: true,
    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            width: {
                default: null,
            },
            height: {
                default: null,
            },
            align: {
                default: 'center',
            },
            inline: {
                default: false,
            },
            flipX: {
                default: false,
            },
            flipY: {
                default: false,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'img[src]',
                getAttrs: (dom) => {
                    if (typeof dom === 'string')
                        return {};
                    const element = dom;
                    const width = element.getAttribute('width');
                    const height = element.getAttribute('height');
                    const style = element.getAttribute('style') || '';
                    let align = null;
                    if (element.closest('div[style*="text-align"]')) {
                        const parentElement = element.closest('div[style*="text-align"]');
                        align = parentElement?.style.textAlign || null;
                    }
                    return {
                        src: element.getAttribute('src'),
                        title: element.getAttribute('title'),
                        alt: element.getAttribute('alt'),
                        width: width ? parseInt(width, 10) : null,
                        height: height ? parseInt(height, 10) : null,
                        align,
                        inline: element.style.display === 'inline' || element.style.display === 'inline-block',
                        flipX: style.includes('rotateX(180deg)'),
                        flipY: style.includes('rotateY(180deg)'),
                    };
                },
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        const { align, flipX, flipY, ...restAttrs } = HTMLAttributes;
        // Handle transform styles for flipping
        let styleAttr = '';
        if (flipX || flipY) {
            const transformStyles = [];
            if (flipX)
                transformStyles.push('rotateX(180deg)');
            if (flipY)
                transformStyles.push('rotateY(180deg)');
            styleAttr = `transform: ${transformStyles.join(' ')};`;
        }
        // Create properly formatted attributes
        const imgAttributes = mergeAttributes(this.options.HTMLAttributes, restAttrs, styleAttr ? { style: styleAttr } : {});
        // Proper DOMOutputSpec format
        if (align) {
            return [
                'div',
                { style: `text-align: ${align}` },
                ['img', imgAttributes]
            ];
        }
        return ['img', imgAttributes];
    },
    addCommands() {
        return {
            setImage: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
    addInputRules() {
        return [
            nodeInputRule({
                find: inputRegex,
                type: this.type,
                getAttributes: (match) => {
                    const [, alt, src, title] = match;
                    return {
                        src,
                        alt,
                        title,
                    };
                },
            }),
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(ImageView);
    },
});
export default CustomImage;
//# sourceMappingURL=CustomImageExtension.js.map