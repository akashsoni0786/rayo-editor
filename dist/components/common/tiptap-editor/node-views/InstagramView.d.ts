import { type NodeViewProps } from '@tiptap/react';
import './EmbedView.css';
declare global {
    interface Window {
        instgrm?: {
            Embeds: {
                process: () => void;
            };
        };
    }
}
declare function InstagramView({ node, selected }: NodeViewProps): import("react/jsx-runtime").JSX.Element;
export default InstagramView;
//# sourceMappingURL=InstagramView.d.ts.map