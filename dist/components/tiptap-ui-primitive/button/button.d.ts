import * as React from "react";
type PlatformShortcuts = Record<string, string>;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    showTooltip?: boolean;
    tooltip?: React.ReactNode;
    shortcutKeys?: string;
}
export declare const MAC_SYMBOLS: PlatformShortcuts;
export declare const formatShortcutKey: (key: string, isMac: boolean) => string;
export declare const parseShortcutKeys: (shortcutKeys: string | undefined, isMac: boolean) => string[];
export declare const ShortcutDisplay: React.FC<{
    shortcuts: string[];
}>;
export declare function Button({ className, children, tooltip, showTooltip, shortcutKeys, "aria-label": ariaLabel, ref, ...props }: ButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element;
export default Button;
//# sourceMappingURL=button.d.ts.map