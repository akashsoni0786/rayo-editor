import { default as React } from 'react';
interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImageUrl: string) => void;
    onCancel: () => void;
    isOpen: boolean;
}
export declare const ImageCropper: React.FC<ImageCropperProps>;
export default ImageCropper;
//# sourceMappingURL=image-cropper.d.ts.map