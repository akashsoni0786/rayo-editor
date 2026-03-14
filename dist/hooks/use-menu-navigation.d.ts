import { Editor } from '@tiptap/react';
import * as React from "react";
type Orientation = "horizontal" | "vertical" | "both";
interface MenuNavigationOptions<T> {
    editor?: Editor | null;
    containerRef?: React.RefObject<HTMLElement | null>;
    query?: string;
    items: T[];
    onSelect?: (item: T) => void;
    onClose?: () => void;
    orientation?: Orientation;
    autoSelectFirstItem?: boolean;
}
export declare function useMenuNavigation<T>({ editor, containerRef, query, items, onSelect, onClose, orientation, autoSelectFirstItem, }: MenuNavigationOptions<T>): {
    selectedIndex: number | undefined;
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
};
export {};
//# sourceMappingURL=use-menu-navigation.d.ts.map