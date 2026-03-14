import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export type HistoryAction = "undo" | "redo";
/**
 * Props for the UndoRedoButton component.
 */
export interface UndoRedoButtonProps extends ButtonProps {
    /**
     * The TipTap editor instance.
     */
    editor?: Editor | null;
    /**
     * Optional text to display alongside the icon.
     */
    text?: string;
    /**
     * The history action to perform (undo or redo).
     */
    action: HistoryAction;
}
export declare const historyIcons: {
    undo: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    redo: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
};
export declare const historyShortcutKeys: Partial<Record<HistoryAction, string>>;
export declare const historyActionLabels: Record<HistoryAction, string>;
/**
 * Checks if a history action can be executed.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to check
 * @returns Whether the action can be executed
 */
export declare function canExecuteHistoryAction(editor: Editor | null, action: HistoryAction): boolean;
/**
 * Executes a history action on the editor.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to execute
 * @returns Whether the action was executed successfully
 */
export declare function executeHistoryAction(editor: Editor | null, action: HistoryAction): boolean;
/**
 * Determines if a history action should be disabled.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to check
 * @param userDisabled Whether the action is explicitly disabled by the user
 * @returns Whether the action should be disabled
 */
export declare function isHistoryActionDisabled(editor: Editor | null, action: HistoryAction, userDisabled?: boolean): boolean;
/**
 * Hook that provides all the necessary state and handlers for a history action.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to handle
 * @param disabled Whether the action is explicitly disabled
 * @returns Object containing state and handlers for the history action
 */
export declare function useHistoryAction(editor: Editor | null, action: HistoryAction, disabled?: boolean): {
    canExecute: boolean;
    isDisabled: boolean;
    handleAction: () => void;
    Icon: React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element> | React.MemoExoticComponent<({ className, ...props }: React.SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element>;
    actionLabel: string;
    shortcutKey: string | undefined;
};
/**
 * Button component for triggering undo/redo actions in a TipTap editor.
 */
export declare function UndoRedoButton({ editor: providedEditor, action, text, className, disabled, onClick, children, ref, ...buttonProps }: UndoRedoButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default UndoRedoButton;
//# sourceMappingURL=undo-redo-button.d.ts.map