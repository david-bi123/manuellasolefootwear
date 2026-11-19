import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configure() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

/**
 * Creates a short-lived signature so the browser can upload directly to
 * Cloudinary. The API secret never leaves the server.
 */
export function createUploadSignature(folder = "manuella/products") {
  if (!configure()) throw new Error("Cloudinary is not configured.");
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET as string,
  );
  return {
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  };
}

export async function destroyCloudinaryAsset(publicId: string) {
  if (!publicId || !configure()) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("[cloudinary] destroy failed:", (error as Error).message);
    return false;
  }
}

/** Builds an optimised delivery URL from a public ID (used by the seed script). */
export function cloudinaryUrl(publicId: string, width = 1200) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return "";
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width}/v1/${publicId}`;
}
