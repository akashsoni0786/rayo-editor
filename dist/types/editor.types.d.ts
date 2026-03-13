import { RefObject } from 'react';
import { DiffRange, DiffPair } from './diff.types';
type Editor = any;
export interface BlogSimpleEditorRef {
    getEditor: () => Editor | null;
}
export interface RayoEditorProps {
    content: string;
    title: string;
    onChange: (content: string) => void;
    onTitleChange?: (title: string) => void;
    isLoading: boolean;
    isStreaming?: boolean;
    isAgentThinking?: boolean;
    readOnly?: boolean;
    focusMode?: boolean;
    pendingChanges?: boolean;
    showDiffs?: boolean;
    hideReviewUI?: boolean;
    editedLinesCount?: number;
    onAcceptChanges?: () => void;
    onRejectChanges?: () => void;
    onAcceptSingleChange?: (greenRange: DiffRange, redRange?: DiffRange) => void;
    onRejectSingleChange?: (greenRange: DiffRange, redRange?: DiffRange) => void;
    onDiffPairsChange?: (diffPairs: DiffPair[]) => void;
    featuredImageUrl?: string;
    onEditFeaturedImage?: () => void;
    isGeneratingImage?: boolean;
    editorRef: RefObject<BlogSimpleEditorRef>;
    onAriScoreChange?: (score: number) => void;
    disableAutoScroll?: boolean;
    onUserScrollChange?: (isScrolledUp: boolean) => void;
    showToolbarAnimation?: boolean;
    streamingPhase?: string;
}
export interface TitleTextareaProps {
    title: string;
    onTitleChange?: (title: string) => void;
    readOnly?: boolean;
}
export interface DiffOverlayProps {
    diffPairs: DiffPair[];
    overlayHoleRect: {
        top: number;
        bottom: number;
    } | null;
    onPairHover?: (index: number) => void;
    onPairClick?: (index: number) => void;
}
export interface ReviewButtonsProps {
    onAccept: () => void;
    onReject: () => void;
    position: {
        top: number;
        left: number;
    };
}
export {};
//# sourceMappingURL=editor.types.d.ts.map