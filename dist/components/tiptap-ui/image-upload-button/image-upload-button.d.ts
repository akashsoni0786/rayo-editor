import { Editor } from '@tiptap/react';
import { ButtonProps } from '../../tiptap-ui-primitive/button';
import * as React from "react";
export interface ImageUploadButtonProps extends ButtonProps {
    editor?: Editor | null;
    text?: string;
    extensionName?: string;
    projectId?: string;
}
export declare function isImageActive(editor: Editor | null, extensionName: string): boolean;
export declare function insertImage(editor: Editor | null, extensionName: string): boolean;
export declare function useImageUploadButton(editor: Editor | null, extensionName?: string, disabled?: boolean): {
    isActive: boolean;
    handleInsertImage: () => boolean;
    handleOpenGallery: () => boolean;
    isGalleryOpen: boolean;
    setIsGalleryOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export declare function ImageUploadButton({ editor: providedEditor, extensionName, text, className, disabled, onClick, children, projectId: providedProjectId, ref, ...buttonProps }: ImageUploadButtonProps & {
    ref?: React.Ref<HTMLButtonElement>;
}): import("react/jsx-runtime").JSX.Element | null;
export default ImageUploadButton;
//# sourceMappingURL=image-upload-button.d.ts.map