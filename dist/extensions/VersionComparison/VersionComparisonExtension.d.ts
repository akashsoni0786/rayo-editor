import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        versionComparison: {
            /**
             * Compare current content with a previous version
             */
            compareVersion: (versionHtml: string) => ReturnType;
            /**
             * Show comparison in separated block view (Old followed by New)
             */
            showBlockDiff: (versionHtml: string) => ReturnType;
            /**
             * Exit comparison mode and restore original content
             */
            exitComparison: () => ReturnType;
            /**
             * Check if currently in comparison mode
             */
            isComparing: () => ReturnType;
        };
    }
}
export interface VersionComparisonOptions {
    onComparisonStart?: () => void;
    onComparisonEnd?: () => void;
}
export interface VersionComparisonStorage {
    isComparing: boolean;
    originalContent: string;
    comparisonContent: string;
    stylePlugin?: Plugin;
}
export declare const VersionComparisonExtension: Extension<VersionComparisonOptions, VersionComparisonStorage>;
/**
 * Helper function to get diff statistics from HTML
 */
export declare function getDiffStats(diffHtml: string): {
    additions: number;
    deletions: number;
    hasChanges: boolean;
};
//# sourceMappingURL=VersionComparisonExtension.d.ts.map