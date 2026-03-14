import * as React from "react";
import { FloatingPortal, type Placement } from "@floating-ui/react";
import "@/components/tiptap-ui-primitive/tooltip/tooltip.scss";
interface TooltipProviderProps {
    children: React.ReactNode;
    initialOpen?: boolean;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    delay?: number;
    closeDelay?: number;
    timeout?: number;
    useDelayGroup?: boolean;
}
interface TooltipTriggerProps extends Omit<React.HTMLProps<HTMLElement>, "ref"> {
    asChild?: boolean;
    children: React.ReactNode;
}
interface TooltipContentProps extends Omit<React.HTMLProps<HTMLDivElement>, "ref"> {
    children?: React.ReactNode;
    portal?: boolean;
    portalProps?: Omit<React.ComponentProps<typeof FloatingPortal>, "children">;
}
export declare function Tooltip({ children, ...props }: TooltipProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function TooltipTrigger({ children, asChild, ref: propRef, ...props }: TooltipTriggerProps & {
    ref?: React.Ref<HTMLElement>;
}): import("react/jsx-runtime").JSX.Element;
export declare function TooltipContent({ style, children, portal, portalProps, ref: propRef, ...props }: TooltipContentProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=tooltip.d.ts.map