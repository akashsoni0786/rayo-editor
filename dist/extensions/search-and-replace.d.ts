import { Extension } from '@tiptap/core';
export interface SearchAndReplaceOptions {
    searchTerm: string;
    replaceTerm: string;
    results: Array<{
        from: number;
        to: number;
    }>;
    searchResultClass: string;
    searchResultCurrentClass: string;
    caseSensitive: boolean;
    disableRegex: boolean;
}
export interface SearchAndReplaceStorage {
    searchTerm: string;
    replaceTerm: string;
    results: Array<{
        from: number;
        to: number;
    }>;
    lastSearchTerm: string;
    caseSensitive: boolean;
    lastCaseSensitive: boolean;
    resultIndex: number;
    lastResultIndex: number;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        searchAndReplace: {
            setSearchTerm: (searchTerm: string) => ReturnType;
            setReplaceTerm: (replaceTerm: string) => ReturnType;
            setCaseSensitive: (caseSensitive: boolean) => ReturnType;
            resetIndex: () => ReturnType;
            nextSearchResult: () => ReturnType;
            previousSearchResult: () => ReturnType;
            replace: () => ReturnType;
            replaceAll: () => ReturnType;
        };
    }
}
export declare const SearchAndReplace: Extension<SearchAndReplaceOptions, SearchAndReplaceStorage>;
//# sourceMappingURL=search-and-replace.d.ts.map