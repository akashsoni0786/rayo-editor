import * as React from "react";
type Orientation = "horizontal" | "vertical";
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: Orientation;
    decorative?: boolean;
}
export declare function Separator({ decorative, orientation, className, ref, ...divProps }: SeparatorProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=separator.d.ts.map