import * as React from "react";
import { FloatingPortal } from "@floating-ui/react";
import "@/components/tiptap-ui-primitive/popover/popover.scss";
interface PopoverOptions {
    initialOpen?: boolean;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
}
interface PopoverProps extends PopoverOptions {
    children: React.ReactNode;
}
declare function Popover({ children, modal, ...options }: PopoverProps): import("react/jsx-runtime").JSX.Element;
interface TriggerElementProps extends React.HTMLProps<HTMLElement> {
    asChild?: boolean;
}
declare function PopoverTrigger({ children, asChild, ref: propRef, ...props }: TriggerElementProps & {
    ref?: React.Ref<HTMLElement>;
}): import("react/jsx-runtime").JSX.Element;
interface PopoverContentProps extends React.HTMLProps<HTMLDivElement> {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    portal?: boolean;
    portalProps?: Omit<React.ComponentProps<typeof FloatingPortal>, "children">;
    asChild?: boolean;
}
declare function PopoverContent({ className, side, align, sideOffset, alignOffset, style, portal, portalProps, asChild, children, ref: propRef, ...props }: PopoverContentProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export { Popover, PopoverTrigger, PopoverContent };
//# sourceMappingURL=popover.d.ts.map