import { Extension } from '@tiptap/core';
export const ReferenceManagerExtension = Extension.create({
    name: 'referenceManager',
    addCommands() {
        return {
            removeReference: (url) => ({ tr, state, dispatch }) => {
                if (dispatch && url) {
                    console.log('🔍 [Ref Manager] Removing reference:', url);
                    const { doc } = state;
                    const ranges = [];
                    doc.descendants((node, pos) => {
                        if (node.isText) {
                            // Debug logs for every link found
                            node.marks.forEach(mark => {
                                if (mark.type.name === 'link') {
                                    console.log('  Found link:', {
                                        href: mark.attrs.href,
                                        class: mark.attrs.class,
                                        matchUrl: mark.attrs.href === url,
                                        matchClass: mark.attrs.class === 'ref'
                                    });
                                }
                            });
                            const linkMark = node.marks.find(mark => mark.type.name === 'link' &&
                                (mark.attrs.href === url || mark.attrs.href === url + '/') && // Handle trailing slash
                                (mark.attrs.class === 'ref' || (mark.attrs.class && mark.attrs.class.includes('ref'))) // Handle multiple classes
                            );
                            if (linkMark) {
                                console.log('  ✅ Match found at pos:', pos);
                                ranges.push({ from: pos, to: pos + node.nodeSize });
                            }
                        }
                    });
                    if (ranges.length === 0) {
                        console.warn('❌ [Ref Manager] No matching reference found for:', url);
                        return false; // No references found
                    }
                    // Sort ranges in reverse order to avoid position shifts affecting subsequent removals
                    ranges.sort((a, b) => b.from - a.from).forEach(({ from, to }) => {
                        tr.removeMark(from, to, state.schema.marks.link);
                    });
                    if (dispatch)
                        dispatch(tr);
                    return true;
                }
                return false;
            },
            removeAllReferences: () => ({ tr, state, dispatch }) => {
                if (dispatch) {
                    console.log('🔍 [Ref Manager] Removing ALL references');
                    const { doc } = state;
                    const ranges = [];
                    doc.descendants((node, pos) => {
                        if (node.isText) {
                            const linkMark = node.marks.find(mark => mark.type.name === 'link' &&
                                (mark.attrs.class === 'ref' || (mark.attrs.class && mark.attrs.class.includes('ref'))));
                            if (linkMark) {
                                ranges.push({ from: pos, to: pos + node.nodeSize });
                            }
                        }
                    });
                    if (ranges.length === 0) {
                        console.warn('❌ [Ref Manager] No references found to remove');
                        return false; // No references found
                    }
                    // Sort ranges in reverse order
                    ranges.sort((a, b) => b.from - a.from).forEach(({ from, to }) => {
                        tr.removeMark(from, to, state.schema.marks.link);
                    });
                    if (dispatch)
                        dispatch(tr);
                    return true;
                }
                return false;
            },
        };
    },
});
//# sourceMappingURL=reference-manager-extension.js.map