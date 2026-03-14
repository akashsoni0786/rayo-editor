import { Attrs, Node } from '@tiptap/pm/model';
import { Editor } from '@tiptap/react';
export declare const MAX_FILE_SIZE: number;
/**
 * Checks if a mark exists in the editor schema
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 * @returns boolean indicating if the mark exists in the schema
 */
export declare const isMarkInSchema: (markName: string, editor: Editor | null) => boolean;
/**
 * Checks if a node exists in the editor schema
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 * @returns boolean indicating if the node exists in the schema
 */
export declare const isNodeInSchema: (nodeName: string, editor: Editor | null) => boolean;
/**
 * Gets the active attributes of a specific mark in the current editor selection.
 *
 * @param editor - The Tiptap editor instance.
 * @param markName - The name of the mark to look for (e.g., "highlight", "link").
 * @returns The attributes of the active mark, or `null` if the mark is not active.
 */
export declare function getActiveMarkAttrs(editor: Editor | null, markName: string): Attrs | null;
/**
 * Checks if a node is empty
 */
export declare function isEmptyNode(node?: Node | null): boolean;
/**
 * Utility function to conditionally join class names into a single string.
 * Filters out falsey values like false, undefined, null, and empty strings.
 *
 * @param classes - List of class name strings or falsey values.
 * @returns A single space-separated string of valid class names.
 */
export declare function cn(...classes: (string | boolean | undefined | null)[]): string;
/**
 * Finds the position and instance of a node in the document
 * @param props Object containing editor, node (optional), and nodePos (optional)
 * @param props.editor The TipTap editor instance
 * @param props.node The node to find (optional if nodePos is provided)
 * @param props.nodePos The position of the node to find (optional if node is provided)
 * @returns An object with the position and node, or null if not found
 */
export declare function findNodePosition(props: {
    editor: Editor | null;
    node?: Node | null;
    nodePos?: number | null;
}): {
    pos: number;
    node: Node;
} | null;
/**
 * Handles image upload with progress tracking and abort capability
 * @param file The file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @param abortSignal Optional AbortSignal for cancelling the upload
 * @returns Promise resolving to the URL of the uploaded image
 */
export declare const handleImageUpload: (file: File, onProgress?: (event: {
    progress: number;
}) => void, abortSignal?: AbortSignal) => Promise<string>;
/**
 * Converts a File to base64 string
 * @param file The file to convert
 * @param abortSignal Optional AbortSignal for cancelling the conversion
 * @returns Promise resolving to the base64 representation of the file
 */
export declare const convertFileToBase64: (file: File, abortSignal?: AbortSignal) => Promise<string>;
type ProtocolOptions = {
    /**
     * The protocol scheme to be registered.
     * @default '''
     * @example 'ftp'
     * @example 'git'
     */
    scheme: string;
    /**
     * If enabled, it allows optional slashes after the protocol.
     * @default false
     * @example true
     */
    optionalSlashes?: boolean;
};
type ProtocolConfig = Array<ProtocolOptions | string>;
export declare function isAllowedUri(uri: string | undefined, protocols?: ProtocolConfig): true | RegExpMatchArray | null;
export declare function sanitizeUrl(inputUrl: string, baseUrl: string, protocols?: ProtocolConfig): string;
export {};
//# sourceMappingURL=tiptap-utils.d.ts.map