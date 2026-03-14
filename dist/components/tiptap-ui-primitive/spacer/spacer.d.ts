import * as React from "react";
type SpacerOrientation = "horizontal" | "vertical";
interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: SpacerOrientation;
    size?: string | number;
}
export declare function Spacer({ orientation, size, className, style, ref, ...props }: SpacerProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=spacer.d.ts.map