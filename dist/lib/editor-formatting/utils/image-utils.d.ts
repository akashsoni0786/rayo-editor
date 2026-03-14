import { Editor } from '@tiptap/react';
import { ImageAlignment, ImageAttributes, ImageWithCaptionAttributes } from '../types';
/**
 * Set image alignment in the editor
 */
export declare function setImageAlignment(editor: Editor | null, alignment: ImageAlignment): boolean;
/**
 * Set image size in the editor
 * @param width - Width value (e.g., '50%', '300px', 300)
 * @param height - Height value (optional, defaults to 'auto')
 */
export declare function setImageSize(editor: Editor | null, width: string | number, height?: string | number): boolean;
/**
 * Set image caption
 */
export declare function setImageCaption(editor: Editor | null, caption: string): boolean;
/**
 * Remove the currently selected image
 */
export declare function removeImage(editor: Editor | null): boolean;
/**
 * Get attributes of the currently selected image
 */
export declare function getImageAttributes(editor: Editor | null): ImageWithCaptionAttributes | null;
/**
 * Check if current selection is an image
 */
export declare function isImageSelected(editor: Editor | null): boolean;
/**
 * Insert an image at the current cursor position
 */
export declare function insertImage(editor: Editor | null, attrs: ImageAttributes): boolean;
/**
 * Calculate responsive image size based on container width
 */
export declare function calculateResponsiveSize(originalWidth: number, originalHeight: number, maxWidth: number): {
    width: number;
    height: number;
};
/**
 * Convert pixel width to percentage
 */
export declare function pixelsToPercentage(pixelWidth: number, containerWidth: number): number;
/**
 * Convert percentage width to pixels
 */
export declare function percentageToPixels(percentageWidth: number, containerWidth: number): number;
/**
 * Parse width value to get numeric value and unit
 */
export declare function parseWidthValue(width: string | number): {
    value: number;
    unit: 'px' | '%' | 'auto';
};
/**
 * Validate image URL
 */
export declare function isValidImageUrl(url: string): boolean;
/**
 * Get image dimensions from URL
 */
export declare function getImageDimensions(url: string): Promise<{
    width: number;
    height: number;
}>;
//# sourceMappingURL=image-utils.d.ts.map