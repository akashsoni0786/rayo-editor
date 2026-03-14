import { jsx as _jsx } from "react/jsx-runtime";
export function Spacer({ orientation = "horizontal", size, className = "", style = {}, ref, ...props }) {
    const computedStyle = {
        ...style,
        ...(orientation === "horizontal" && !size && { flex: 1 }),
        ...(size && {
            width: orientation === "vertical" ? "1px" : size,
            height: orientation === "horizontal" ? "1px" : size,
        }),
    };
    return (_jsx("div", { ref: ref, ...props, className: className, style: computedStyle }));
}
//# sourceMappingURL=spacer.js.map