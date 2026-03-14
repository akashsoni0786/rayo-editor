import './ImageView.css';
interface ImageViewProps {
    editor: any;
    node: any;
    getPos: () => number;
    selected: boolean;
    updateAttributes: (attrs: Record<string, any>) => void;
}
declare function ImageView({ editor, node, getPos, selected, updateAttributes }: ImageViewProps): import("react/jsx-runtime").JSX.Element;
export default ImageView;
//# sourceMappingURL=ImageView.d.ts.map