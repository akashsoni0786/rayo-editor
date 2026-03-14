import { default as React } from 'react';
interface DiffPair {
    redRange?: {
        from: number;
        to: number;
    };
    greenRange?: {
        from: number;
        to: number;
    };
    rect: {
        top: number;
        left: number;
        width: number;
        bottom: number;
        right: number;
    };
    lastGreenRect: {
        top: number;
        left: number;
        width: number;
        bottom: number;
        right: number;
    };
    isImageDeletion?: boolean;
    isImageReplacement?: boolean;
}
interface BlogMinimapProps {
    content: string;
    editorRef: React.RefObject<any>;
    visible?: boolean;
    diffPairs?: DiffPair[];
}
declare const BlogMinimap: React.FC<BlogMinimapProps>;
export default BlogMinimap;
//# sourceMappingURL=BlogMinimap.d.ts.map