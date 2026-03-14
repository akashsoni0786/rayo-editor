import { Extension } from '@tiptap/core';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        referenceManager: {
            /**
             * Remove a specific reference link (by URL) while keeping the text
             */
            removeReference: (url: string) => ReturnType;
            /**
             * Remove all reference links (with class="ref") while keeping the text
             */
            removeAllReferences: () => ReturnType;
        };
    }
}
export declare const ReferenceManagerExtension: Extension<any, any>;
//# sourceMappingURL=reference-manager-extension.d.ts.map