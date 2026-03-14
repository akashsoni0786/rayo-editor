import { VariantProps } from 'class-variance-authority';
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
declare const labelVariants: (props?: import('class-variance-authority/types').ClassProp | undefined) => string;
declare function Label({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants> & {
    ref?: React.Ref<React.ElementRef<typeof LabelPrimitive.Root>>;
}): import("react/jsx-runtime").JSX.Element;
export { Label };
//# sourceMappingURL=label.d.ts.map