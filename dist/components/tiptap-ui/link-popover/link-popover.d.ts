import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface LinkHandlerProps {
    editor: Editor | null;
    onSetLink?: () => void;
    onLinkActive?: () => void;
}
export interface LinkMainProps {
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<string | null>>;
    setLink: () => void;
    removeLink: () => void;
    isActive: boolean;
}
export declare const useLinkHandler: (props: LinkHandlerProps) => {
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<string | null>>;
    setLink: () => void;
    removeLink: () => void;
    isActive: boolean;
};
export declare function LinkButton({ className, children, ref, ...props }: ButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element;
export declare const LinkContent: React.FC<{
    editor?: Editor | null;
}>;
export interface LinkPopoverProps extends Omit<ButtonProps, "type"> {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * Whether to hide the link popover.
     * @default false
     */
    hideWhenUnavailable?: boolean;
    /**
     * Callback for when the popover opens or closes.
     */
    onOpenChange?: (isOpen: boolean) => void;
    /**
     * Whether to automatically open the popover when a link is active.
     * @default true
     */
    autoOpenOnLinkActive?: boolean;
}
export declare function LinkPopover({ editor: providedEditor, hideWhenUnavailable, onOpenChange, autoOpenOnLinkActive, ...props }: LinkPopoverProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=link-popover.d.ts.map