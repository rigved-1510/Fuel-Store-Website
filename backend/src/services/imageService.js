import { v2 as cloudinary } from "cloudinary";
import { logger } from "../utils/logger.js";

export const ImageService = {
  async uploadImages(files) {
    if (!files || files.length === 0) return [];

    // Store the secure Cloudinary URLs in the database
    return files.map((file) => file.path);
  },

  async deleteImage(imageUrl) {
    if (!imageUrl) return;

    try {
      // Extract public_id from the Cloudinary URL
      // Example:
      // https://res.cloudinary.com/.../upload/v123/fuel-fashion-hub/products/abc.jpg
      // -> fuel-fashion-hub/products/abc
      const parts = imageUrl.split("/");
      const uploadIndex = parts.findIndex((p) => p === "upload");

      if (uploadIndex === -1) return;

      const publicId = parts
        .slice(uploadIndex + 2)
        .join("/")
        .replace(/\.[^.]+$/, "");

      await cloudinary.uploader.destroy(publicId);

      logger.info(`Deleted Cloudinary image: ${publicId}`);
    } catch (err) {
      logger.warn("Failed to delete Cloudinary image", err.message);
    }
  },
};