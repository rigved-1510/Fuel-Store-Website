import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

console.log("=== Cloudinary ENV ===");
console.log({
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secretExists: !!process.env.CLOUDINARY_API_SECRET,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("=== Cloudinary Config ===");
console.log(cloudinary.config());

export default cloudinary;