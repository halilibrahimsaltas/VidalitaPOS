import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Configure multer for memory storage (we'll upload directly to S3)
const storage = multer.memoryStorage();

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

// File filter for CSV files
const csvFileFilter = (req, file, cb) => {
  // Accept CSV and text files
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only CSV files are allowed'), false);
  }
};

// Configure multer for images
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Configure multer for CSV
const uploadCSV = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for CSV
  },
});

// Middleware for single image upload
export const uploadSingleImage = uploadImage.single('image');

// Middleware for CSV upload
export const uploadCSVFile = uploadCSV.single('file');

// Middleware for multiple image uploads
export const uploadMultipleImages = uploadImage.array('images', 10);

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size exceeds 5MB limit'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Too many files'));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

