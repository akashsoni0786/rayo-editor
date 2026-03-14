import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
declare const Popover: React.FC<PopoverPrimitive.PopoverProps>;
declare const PopoverTrigger: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare function PopoverContent({ className, align, sideOffset, ref, ...props }: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    ref?: React.Ref<React.ElementRef<typeof PopoverPrimitive.Content>>;
}): import("react/jsx-runtime").JSX.Element;
export { Popover, PopoverTrigger, PopoverContent };
//# sourceMappingURL=popover.d.ts.map