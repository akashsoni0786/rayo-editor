import * as React from "react";
interface AnimatedToolbarButtonProps {
    children: React.ReactNode;
    mouseX: any;
    spring: any;
    distance: number;
    magnification: number;
    baseSize?: number;
    className?: string;
}
export declare function AnimatedToolbarButton({ children, mouseX, spring, distance, magnification, baseSize, className, ref, ...props }: AnimatedToolbarButtonProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=animated-toolbar-button.d.ts.map