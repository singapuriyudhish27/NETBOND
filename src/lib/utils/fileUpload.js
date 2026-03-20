import fs from "fs/promises";
import path from "path";

// Get the project root directory using process.cwd() (works in Next.js API routes)
// process.cwd() returns the directory where the Next.js process was started
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");

/**
 * Save a file to the public directory
 * @param {ArrayBuffer} fileBuffer - The file buffer
 * @param {string} fileName - The file name
 * @param {string} folder - The folder name (e.g., "Uploads" or "UploadPost")
 * @returns {Promise<string>} The public URL path
 */
export async function saveFile(fileBuffer, fileName, folder = "Uploads") {
  try {
    // Create directory if it doesn't exist
    const uploadDir = path.join(publicDir, folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    // Return the public URL path
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
}

/**
 * Delete a file from the public directory
 * @param {string} fileUrl - The file URL (e.g., "/Uploads/filename.jpg")
 * @returns {Promise<void>}
 */
export async function deleteFile(fileUrl) {
  try {
    if (!fileUrl || fileUrl.startsWith("http") || fileUrl === "") {
      // Skip deletion for external URLs or empty URLs
      return;
    }

    // Remove leading slash if present
    const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const filePath = path.join(publicDir, relativePath);
    
    await fs.unlink(filePath).catch((err) => {
      // File might not exist, that's okay
      if (err.code !== "ENOENT") {
        console.error("Error deleting file:", err);
      }
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    // Don't throw - file deletion failure shouldn't break the update
  }
}

