import * as React from "react";
type BaseProps = React.HTMLAttributes<HTMLDivElement>;
interface ToolbarProps extends BaseProps {
    variant?: "floating" | "fixed";
}
export declare function Toolbar({ children, className, variant, ref, ...props }: ToolbarProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function ToolbarGroup({ children, className, ref, ...props }: BaseProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function ToolbarSeparator({ ref, ...props }: BaseProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=toolbar.d.ts.map