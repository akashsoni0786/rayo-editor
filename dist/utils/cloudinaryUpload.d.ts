/**
 * Utility for uploading images to Cloudinary directly from the browser
 */
interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    resource_type: string;
}
/**
 * Upload an image file to Cloudinary
 * @param file The image file to upload
 * @param cloudName Your Cloudinary cloud name
 * @param uploadPreset The unsigned upload preset to use
 * @returns A promise that resolves to the Cloudinary response
 */
export declare function uploadToCloudinary(file: File, cloudName: string, uploadPreset: string): Promise<CloudinaryUploadResponse>;
/**
 * Get Cloudinary configuration from environment variables
 * Falls back to using the base64 approach if Cloudinary is not configured
 */
export declare function getCloudinaryConfig(): {
    cloudName: any;
    uploadPreset: any;
    isConfigured: any;
};
/**
 * Convert a file to a base64 data URL (fallback when Cloudinary is not configured)
 */
export declare function fileToBase64(file: File): Promise<string>;
export {};
//# sourceMappingURL=cloudinaryUpload.d.ts.map