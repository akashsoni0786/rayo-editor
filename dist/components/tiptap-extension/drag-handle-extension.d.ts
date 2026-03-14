import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
export interface DragHandleOptions {
    /**
     * The class name to apply to the drag handle element
     */
    dragHandleClass: string;
    /**
     * The class name to apply when the node is being dragged
     */
    draggingClass: string;
}
export declare const DragHandlePluginKey: PluginKey<any>;
export declare const DragHandleExtension: Extension<DragHandleOptions, any>;
export default DragHandleExtension;
//# sourceMappingURL=drag-handle-extension.d.ts.map