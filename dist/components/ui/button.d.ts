import * as React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
}
declare function Button({ className, variant, size, asChild, ref, ...props }: ButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element;
export { Button };
//# sourceMappingURL=button.d.ts.map