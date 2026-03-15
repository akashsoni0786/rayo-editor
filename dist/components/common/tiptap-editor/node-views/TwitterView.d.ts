import { NodeViewProps } from '@tiptap/react';
declare global {
    interface Window {
        twttr?: {
            widgets: {
                load: (element?: HTMLElement) => void;
                createTweet: (tweetId: string, container: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLElement>;
            };
        };
    }
}
declare function TwitterView({ node, selected }: NodeViewProps): import("react/jsx-runtime").JSX.Element;
export default TwitterView;
//# sourceMappingURL=TwitterView.d.ts.map