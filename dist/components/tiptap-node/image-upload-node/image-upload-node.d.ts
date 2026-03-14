import { NodeViewProps } from '@tiptap/react';
import * as React from "react";
export interface FileItem {
    id: string;
    file: File;
    progress: number;
    status: "uploading" | "success" | "error";
    url?: string;
    abortController?: AbortController;
}
export declare const ImageUploadNode: React.FC<NodeViewProps>;
//# sourceMappingURL=image-upload-node.d.ts.map