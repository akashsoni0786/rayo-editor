import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

function Button({ className, variant = 'default', size = 'default', asChild = false, ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-indigo-600 text-white shadow hover:bg-indigo-700': variant === 'default',
          'bg-red-600 text-white shadow-sm hover:bg-red-700': variant === 'destructive',
          'border border-gray-200 bg-white shadow-sm hover:bg-gray-50': variant === 'outline',
          'hover:bg-gray-50': variant === 'ghost',
          'h-9 px-3': size === 'sm',
          'h-10 px-4 py-2': size === 'default',
          'h-11 px-8': size === 'lg',
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Button };
