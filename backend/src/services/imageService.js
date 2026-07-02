import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export const ImageService = {
  /**
   * Formats files from request into clean relative path strings to store in the DB.
   * Can be easily swapped with a Cloudinary upload call.
   */
  async uploadImages(files) {
    if (!files || files.length === 0) return [];
    
    // For local uploads, return the relative path (e.g. uploads/products/filename.jpg)
    return files.map(file => {
      // Return standard path with forward slashes
      return `uploads/products/${file.filename}`;
    });
  },

  /**
   * Deletes a local file from disk.
   */
  async deleteImage(imagePath) {
    if (!imagePath) return;

    // Resolve absolute path
    const absPath = path.join(process.cwd(), imagePath);
    try {
      await fs.unlink(absPath);
      logger.info(`Deleted local file: ${absPath}`);
    } catch (error) {
      // Log warning but don't throw (e.g. file might have been deleted manually)
      logger.warn(`Failed to delete local file: ${absPath}`, error.message);
    }
  }
};
