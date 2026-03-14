export interface KeywordToastOptions {
    title?: string;
    description: string;
    variant?: 'default' | 'destructive';
}
export interface KeywordToastAPI {
    toast: (options: KeywordToastOptions) => void;
}
export declare function useKeywordToast(): KeywordToastAPI;
//# sourceMappingURL=useKeywordToast.d.ts.map