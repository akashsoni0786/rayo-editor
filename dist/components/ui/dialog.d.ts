import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
declare const Dialog: React.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogClose: React.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>>;
declare function DialogOverlay({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    ref?: React.Ref<React.ElementRef<typeof DialogPrimitive.Overlay>>;
}): import("react/jsx-runtime").JSX.Element;
declare function DialogContent({ className, children, ref, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    ref?: React.Ref<React.ElementRef<typeof DialogPrimitive.Content>>;
}): import("react/jsx-runtime").JSX.Element;
declare const DialogHeader: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => import("react/jsx-runtime").JSX.Element;
declare const DialogFooter: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => import("react/jsx-runtime").JSX.Element;
declare function DialogTitle({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    ref?: React.Ref<React.ElementRef<typeof DialogPrimitive.Title>>;
}): import("react/jsx-runtime").JSX.Element;
declare function DialogDescription({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    ref?: React.Ref<React.ElementRef<typeof DialogPrimitive.Description>>;
}): import("react/jsx-runtime").JSX.Element;
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, };
//# sourceMappingURL=dialog.d.ts.map