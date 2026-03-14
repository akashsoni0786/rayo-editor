import * as React from "react";
import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss";
type BaseProps = React.HTMLAttributes<HTMLDivElement>;
interface AnimatedToolbarProps extends BaseProps {
    variant?: "floating" | "fixed";
    magnification?: number;
    distance?: number;
    spring?: {
        mass: number;
        stiffness: number;
        damping: number;
    };
}
export declare function AnimatedToolbar({ children, className, variant, magnification, distance, spring, ref, ...props }: AnimatedToolbarProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function AnimatedToolbarGroup({ children, className, mouseX, spring, distance, magnification, ref, ...props }: BaseProps & {
    mouseX?: any;
    spring?: any;
    distance?: number;
    magnification?: number;
} & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function AnimatedToolbarSeparator({ ref, ...props }: BaseProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=animated-toolbar.d.ts.map