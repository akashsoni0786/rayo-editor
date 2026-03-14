/**
 * Utility for uploading images to Cloudinary directly from the browser
 */

// Define the structure of the Cloudinary response
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
export async function uploadToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<CloudinaryUploadResponse> {
  // Create FormData for the upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  // Upload to Cloudinary's upload endpoint
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Get Cloudinary configuration from environment variables
 * Falls back to using the base64 approach if Cloudinary is not configured
 */
export function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  
  const isConfigured = cloudName && uploadPreset;
  
  return {
    cloudName,
    uploadPreset,
    isConfigured,
  };
}

/**
 * Convert a file to a base64 data URL (fallback when Cloudinary is not configured)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
