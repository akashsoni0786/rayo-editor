import { jsx as _jsx } from "react/jsx-runtime";
import "@/components/tiptap-ui-primitive/separator/separator.scss";
export function Separator({ decorative, orientation = "vertical", className = "", ref, ...divProps }) {
    const ariaOrientation = orientation === "vertical" ? orientation : undefined;
    const semanticProps = decorative
        ? { role: "none" }
        : { "aria-orientation": ariaOrientation, role: "separator" };
    return (_jsx("div", { className: `tiptap-separator ${className}`.trim(), "data-orientation": orientation, ...semanticProps, ...divProps, ref: ref }));
}
//# sourceMappingURL=separator.js.map