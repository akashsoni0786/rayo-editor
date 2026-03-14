import { Editor } from '@tiptap/react';
export interface ProjectImage {
    id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    url: string;
    file_size: number;
    mime_type: string;
    width: number | null;
    height: number | null;
    category: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}
export interface InsertOptions {
    width: number | 'auto';
    height: number | 'auto';
    alignment: 'left' | 'center' | 'right';
    caption: string;
    altText: string;
}
export interface ImageGalleryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect?: (image: ProjectImage, options: InsertOptions) => void;
    images?: ProjectImage[];
    isLoadingImages?: boolean;
    onUpload?: (formData: FormData) => Promise<ProjectImage>;
    editor?: Editor | null;
}
export default function ImageGalleryDialog({ isOpen, onClose, onImageSelect, images: propImages, isLoadingImages, onUpload, editor }: ImageGalleryDialogProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ImageGalleryDialog.d.ts.map