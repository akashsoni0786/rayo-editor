import { CodeBlock } from '@tiptap/extension-code-block';
/**
 * Custom CodeBlock extension with pendingDelete/pendingInsert attributes
 * for AI review mode (similar to ResizableImageExtension)
 */
export const CustomCodeBlock = CodeBlock.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            language: {
                default: null,
                parseHTML: element => {
                    const codeEl = element.querySelector('code');
                    const classAttr = codeEl?.getAttribute('class');
                    if (classAttr) {
                        const match = classAttr.match(/language-(\w+)/);
                        return match ? match[1] : null;
                    }
                    return element.getAttribute('data-language') || null;
                },
                renderHTML: attributes => {
                    if (!attributes.language)
                        return {};
                    return {
                        'data-language': attributes.language,
                    };
                },
            },
            pendingDelete: {
                default: false,
                parseHTML: element => element.getAttribute('data-pending-delete') === 'true',
                renderHTML: attributes => {
                    if (!attributes.pendingDelete)
                        return {};
                    return {
                        'data-pending-delete': 'true',
                    };
                },
            },
            pendingInsert: {
                default: false,
                parseHTML: element => element.getAttribute('data-pending-insert') === 'true',
                renderHTML: attributes => {
                    if (!attributes.pendingInsert)
                        return {};
                    return {
                        'data-pending-insert': 'true',
                    };
                },
            },
        };
    },
});
export default CustomCodeBlock;
//# sourceMappingURL=code-block-extension.js.map