import { FloatingPortal } from '@floating-ui/react';
import { Separator } from '../separator';
import * as React from "react";
interface DropdownMenuOptions {
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}
interface DropdownMenuProps extends DropdownMenuOptions {
    children: React.ReactNode;
}
export declare function DropdownMenu({ children, ...options }: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;
interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}
export declare function DropdownMenuTrigger({ children, asChild, ref: propRef, ...props }: DropdownMenuTriggerProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element;
interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "vertical" | "horizontal";
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    portal?: boolean;
    portalProps?: Omit<React.ComponentProps<typeof FloatingPortal>, "children">;
    sideOffset?: number;
}
export declare function DropdownMenuContent({ style, className, orientation, side, align, portal, portalProps, ref: propRef, ...props }: DropdownMenuContentProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element | null;
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
}
export declare function DropdownMenuItem({ children, disabled, asChild, onSelect, className, ref, ...props }: DropdownMenuItemProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element;
interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
}
export declare function DropdownMenuGroup({ children, label, className, ref, ...props }: DropdownMenuGroupProps & {
    ref?: React.Ref<HTMLDivElement>;
}): import("react/jsx-runtime").JSX.Element;
export declare function DropdownMenuSeparator({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof Separator> & {
    ref?: React.Ref<React.ElementRef<typeof Separator>>;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=dropdown-menu.d.ts.map