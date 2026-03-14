import { Editor } from '@tiptap/react';
import * as React from "react";
export interface BlogSimpleEditorRef {
    getHTML: () => string;
    setHTML: (html: string) => void;
    clearContent: () => void;
    getPlainText: () => string;
    getEditor: () => Editor | null;
    focus: () => void;
    blur: () => void;
    /**
     * Sync the lastDispatchedContentRef to the current editor content.
     * Call this after Accept/Reject cleanup to prevent setContent from being triggered
     * when updateBlog echoes back, which would clear undo history.
     */
    syncLastDispatched: () => void;
    commands: {
        compareVersion: (versionHtml: string) => boolean;
        showBlockDiff: (versionHtml: string) => boolean;
        exitComparison: () => boolean;
        isComparing: () => boolean;
    };
}
export interface BlogSimpleEditorProps {
    initialValue?: string;
    onChange?: (html: string) => void;
    onAriScoreChange?: (score: number) => void;
    placeholder?: string;
    readOnly?: boolean;
    height?: string;
    className?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    documentTitle?: string;
    animated?: boolean;
    magnification?: number;
    distance?: number;
    spring?: {
        mass: number;
        stiffness: number;
        damping: number;
    };
    isStreaming?: boolean;
    disableAutoScroll?: boolean;
    onUserScrollChange?: (isScrolledUp: boolean) => void;
    titleElement?: React.ReactNode;
}
export declare function BlogSimpleEditor({ ref, initialValue, onChange, placeholder, readOnly, height, className, onFocus, onBlur, documentTitle, animated, magnification, distance, spring, isStreaming, onAriScoreChange, disableAutoScroll, onUserScrollChange, titleElement }: BlogSimpleEditorProps & {
    ref?: React.Ref<BlogSimpleEditorRef>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=blog-simple-editor.d.ts.map