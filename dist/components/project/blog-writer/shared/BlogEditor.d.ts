import { default as React } from 'react';
import { BlogSimpleEditorRef } from '../../../tiptap-templates/simple/blog-simple-editor';
export interface BlogEditorProps {
    editorRef: React.RefObject<BlogSimpleEditorRef>;
    content: string;
    isLoading: boolean;
    title: string;
    onChange: (content: string) => void;
    onTitleChange?: (title: string) => void;
    isStreaming?: boolean;
    isAgentThinking?: boolean;
    streamingPhase?: string;
    showToolbarAnimation?: boolean;
    readOnly?: boolean;
    onAriScoreChange?: (score: number) => void;
    disableAutoScroll?: boolean;
    onUserScrollChange?: (isScrolledUp: boolean) => void;
    pendingChanges?: boolean;
    onAcceptChanges?: () => void;
    onRejectChanges?: () => void;
    editedLinesCount?: number;
    hideReviewUI?: boolean;
    showDiffs?: boolean;
    focusMode?: boolean;
    onAcceptSingleChange?: (greenRange: {
        from: number;
        to: number;
    }, redRange?: {
        from: number;
        to: number;
    }) => void;
    onRejectSingleChange?: (greenRange: {
        from: number;
        to: number;
    }, redRange?: {
        from: number;
        to: number;
    }) => void;
    onDiffPairsChange?: (diffPairs: any[]) => void;
    featuredImageUrl?: string;
    onEditFeaturedImage?: () => void;
    isGeneratingImage?: boolean;
}
declare const BlogEditor: React.FC<BlogEditorProps>;
export default BlogEditor;
//# sourceMappingURL=BlogEditor.d.ts.map