import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory - relative to backend root
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const UPLOAD_URL = '/uploads'; // URL path for serving static files

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    // Create subdirectories
    await fs.mkdir(path.join(UPLOAD_DIR, 'products'), { recursive: true });
    console.log('📁 Upload directory created:', UPLOAD_DIR);
  }
};

// Initialize upload directory on module load
ensureUploadDir().catch(console.error);

export const uploadToLocal = async (file, folder = 'products') => {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'File is required');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.originalname.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${randomString}.${extension}`;
  const folderPath = path.join(UPLOAD_DIR, folder);

  // Ensure folder exists
  try {
    await fs.access(folderPath);
  } catch (error) {
    await fs.mkdir(folderPath, { recursive: true });
  }

  const filepath = path.join(folderPath, filename);

  try {
    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    // Return public URL (relative path that Express will serve)
    const publicUrl = `${UPLOAD_URL}/${folder}/${filename}`;

    return {
      url: publicUrl,
      path: filepath,
      filename: filename,
    };
  } catch (error) {
    console.error('Local Upload Error:', error);
    throw new ApiError(500, 'Failed to upload file');
  }
};

export const deleteLocalFile = async (fileUrl) => {
  try {
    // Extract path from URL (e.g., /uploads/products/filename.jpg)
    const relativePath = fileUrl.replace(UPLOAD_URL, '');
    const filepath = path.join(UPLOAD_DIR, relativePath);

    // Check if file exists and delete
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
    } catch (error) {
      // File doesn't exist, ignore
      console.warn('File not found for deletion:', filepath);
    }
  } catch (error) {
    console.error('Local Delete Error:', error);
    // Don't throw error, just log it
  }
};

// For backward compatibility (old S3 function names)
export const uploadToS3 = uploadToLocal;
export const deleteFromS3 = deleteLocalFile;

export { UPLOAD_DIR, UPLOAD_URL };

