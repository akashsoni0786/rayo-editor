interface UseAICompletionOptions {
    onResponse?: (response: Response) => void;
    onError?: (error: Error) => void;
}
interface AICompletionRequest {
    option: string;
    command?: string;
    projectId?: string;
    beforeContext?: string;
    afterContext?: string;
}
export declare function useAICompletion(options?: UseAICompletionOptions): {
    completion: string;
    complete: (prompt: string, requestData: {
        body: AICompletionRequest;
    }) => Promise<void>;
    isLoading: boolean;
    isStreaming: boolean;
    error: Error | null;
    hasCompletion: boolean;
    resetCompletion: () => void;
    forceReset: () => void;
};
export {};
//# sourceMappingURL=useAICompletion.d.ts.map