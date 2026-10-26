import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

/**
 * Upload an image (data URI or base64 string) to Cloudinary
 */
export async function uploadToCloudinary(
  fileDataUri: string,
  folder = "himalyan-wheels/cars"
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" }
    ],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

/**
 * Delete an image by its Cloudinary public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  if (!isCloudinaryConfigured() || !publicId) return;

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Failed to delete Cloudinary image "${publicId}":`, err);
  }
}
