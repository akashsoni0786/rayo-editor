import { default as React } from 'react';
export interface AIRequestPayload {
    text: string;
    option: string;
    projectId: string;
    beforeContext?: string;
    afterContext?: string;
}
interface AIRequestContextValue {
    onAIRequest?: (payload: AIRequestPayload) => Promise<Response>;
}
export declare const AIRequestContext: React.Context<AIRequestContextValue>;
export {};
//# sourceMappingURL=ai-request-context.d.ts.map