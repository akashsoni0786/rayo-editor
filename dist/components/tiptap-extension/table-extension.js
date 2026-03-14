import { Table } from '@tiptap/extension-table';
import { mergeAttributes } from '@tiptap/core';
/**
 * Custom Table extension with pendingDelete/pendingInsert attributes
 * for AI review mode (similar to ResizableImageExtension and CustomCodeBlock)
 *
 * Uses addAttributes with renderHTML callbacks to ensure data-pending-*
 * attributes are rendered on the table element.
 */
export const CustomTable = Table.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
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
    renderHTML({ node, HTMLAttributes }) {
        // Merge attributes including pendingDelete/pendingInsert data attributes
        const attrs = {};
        if (node.attrs.pendingDelete) {
            attrs['data-pending-delete'] = 'true';
        }
        if (node.attrs.pendingInsert) {
            attrs['data-pending-insert'] = 'true';
        }
        return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, attrs), ['tbody', 0]];
    },
});
export default CustomTable;
//# sourceMappingURL=table-extension.js.map