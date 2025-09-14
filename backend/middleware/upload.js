const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure the base upload directory exists
const BASE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// Enhanced file type configurations
const FILE_TYPES = {
  images: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5MB for images
  },
  documents: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
    maxSize: 10 * 1024 * 1024, // 10MB for documents
  },
  videos: {
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'],
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-matroska', 'video/webm'],
    maxSize: 50 * 1024 * 1024, // 50MB for videos
  }
};

// Enhanced folder mapping
const getFolderFromRoute = (req) => {
  const baseUrl = req.baseUrl || req.originalUrl;
  
  
  // More specific route matching
  if (baseUrl.includes('/team')) return 'team';
  if (baseUrl.includes('/blog')) return 'blogs';
  if (baseUrl.includes('/project')) return 'projects';
  if (baseUrl.includes('/partner')) return 'partners';
  if (baseUrl.includes('/logo')) return 'logos';  // Main website logos
  if (baseUrl.includes('/transaction-details')) return 'transaction-logos'; // NEW: Separate folder for transaction logos
  if (baseUrl.includes('/testimonial')) return 'testimonials';
    if (baseUrl.includes('/event')) return 'events';   // 👈 NEW
  if (baseUrl.includes('/job-applications') || baseUrl.includes('/resume')) return 'resumes'; // FIXED
  if (baseUrl.includes('/highlights')) return 'highlights';

  return 'general';
};

// Generate secure filename with better collision prevention
const generateSecureFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 20);

  // Use crypto for better uniqueness
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  
  return `${baseName}-${timestamp}-${randomBytes}${ext}`;
};

// Enhanced file validation
const validateFile = (file) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeType = file.mimetype.toLowerCase();

  // Check against each file type category
  for (const [category, config] of Object.entries(FILE_TYPES)) {
    if (config.extensions.includes(ext) && config.mimeTypes.includes(mimeType)) {
      return { isValid: true, category, maxSize: config.maxSize };
    }
  }

  return { 
    isValid: false, 
    error: `File type .${ext} with MIME type ${mimeType} is not allowed. Allowed: ${Object.keys(FILE_TYPES).join(', ')}` 
  };
};

// Configure storage logic with enhanced security
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const folder = getFolderFromRoute(req);
      const uploadPath = path.join(BASE_UPLOAD_DIR, folder);
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (err) {
      console.error('❌ Error in destination callback:', err);
      cb(err);
    }
  },

  filename: function (req, file, cb) {
    try {
      const filename = generateSecureFilename(file.originalname);
      cb(null, filename);
    } catch (err) {
      console.error('❌ Error in filename callback:', err);
      cb(err);
    }
  }
});

// Enhanced file filter with category-specific validation
const fileFilter = (req, file, cb) => {
  const validation = validateFile(file);
  
  if (!validation.isValid) {
    return cb(new Error(validation.error), false);
  }

  // Store the category and max size for later use
  file.category = validation.category;
  file.maxSize = validation.maxSize;
  
  cb(null, true);
};

// Dynamic limits based on file type
const createUploadInstance = (options = {}) => {
  const defaultLimits = {
    fileSize: 10 * 1024 * 1024, // Default 10MB
    files: 5,
  };

  return multer({
    storage,
    limits: { ...defaultLimits, ...options.limits },
    fileFilter: options.fileFilter || fileFilter,
  });
};

// Main upload instance
const upload = createUploadInstance();

// === ENHANCED MULTER ERROR HANDLER ===
const handleMulterError = (err, fieldName, res, next, maxCount = 5) => {
  if (err) {
    console.error('Upload error:', err);

    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({ 
            success: false, 
            message: 'File too large. Check individual file size limits.',
            error: 'FILE_TOO_LARGE'
          });
        
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({
            success: false,
            message: `Unexpected file field or too many files. Max ${maxCount} files allowed for field '${fieldName}'`,
            error: 'UNEXPECTED_FILE'
          });
        
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({ 
            success: false, 
            message: `Maximum ${maxCount} files allowed.`,
            error: 'TOO_MANY_FILES'
          });
        
        case 'LIMIT_FIELD_KEY':
          return res.status(400).json({ 
            success: false, 
            message: 'Field name too long.',
            error: 'FIELD_NAME_TOO_LONG'
          });
        
        case 'LIMIT_FIELD_VALUE':
          return res.status(400).json({ 
            success: false, 
            message: 'Field value too long.',
            error: 'FIELD_VALUE_TOO_LONG'
          });
        
        case 'LIMIT_FIELD_COUNT':
          return res.status(400).json({ 
            success: false, 
            message: 'Too many fields.',
            error: 'TOO_MANY_FIELDS'
          });
        
        case 'LIMIT_PART_COUNT':
          return res.status(400).json({ 
            success: false, 
            message: 'Too many parts in multipart data.',
            error: 'TOO_MANY_PARTS'
          });
      }
    }

    return res.status(400).json({ 
      success: false, 
      message: err.message || 'Upload error',
      error: 'UPLOAD_ERROR'
    });
  }

  next();
};

// === ENHANCED UPLOAD MIDDLEWARE WRAPPERS ===

// Single file upload middleware with validation
const uploadSingle = (field = 'image', options = {}) => {
  return (req, res, next) => {
    const uploadInstance = options.customUpload || upload;
    
    uploadInstance.single(field)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, field, res, next);
      }

      // Additional validation after upload
      if (req.file && options.validateAfterUpload) {
        const validationResult = options.validateAfterUpload(req.file);
        if (!validationResult.isValid) {
          deleteFile(req.file.path);
          return res.status(400).json({
            success: false,
            message: validationResult.error,
            error: 'VALIDATION_FAILED'
          });
        }
      }

      next();
    });
  };
};

// Multiple file upload middleware with enhanced validation
const uploadMultiple = (field = 'images', maxCount = 5, options = {}) => {
  return (req, res, next) => {
    const uploadInstance = options.customUpload || upload;
    
    uploadInstance.array(field, maxCount)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, field, res, next, maxCount);
      }

      // Validate all uploaded files
      if (req.files && options.validateAfterUpload) {
        for (const file of req.files) {
          const validationResult = options.validateAfterUpload(file);
          if (!validationResult.isValid) {
            // Clean up all uploaded files on validation failure
            req.files.forEach(f => deleteFile(f.path));
            return res.status(400).json({
              success: false,
              message: validationResult.error,
              error: 'VALIDATION_FAILED'
            });
          }
        }
      }

      next();
    });
  };
};

// Fields upload middleware with enhanced error handling
const uploadFields = (fields, options = {}) => {
  return (req, res, next) => {
    const uploadInstance = options.customUpload || upload;
    
    uploadInstance.fields(fields)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, 'multiple fields', res, next);
      }

      // Validate all uploaded files across all fields
      if (req.files && options.validateAfterUpload) {
        const allFiles = Object.values(req.files).flat();
        for (const file of allFiles) {
          const validationResult = options.validateAfterUpload(file);
          if (!validationResult.isValid) {
            // Clean up all uploaded files on validation failure
            allFiles.forEach(f => deleteFile(f.path));
            return res.status(400).json({
              success: false,
              message: validationResult.error,
              error: 'VALIDATION_FAILED'
            });
          }
        }
      }

      next();
    });
  };
};

// === ENHANCED FILE UTILITIES ===

// Enhanced file deletion with better error handling
const deleteFile = async (filePath) => {
  try {
    if (!filePath) return false;

    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(BASE_UPLOAD_DIR, filePath);

    // Security check: ensure file is within upload directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadDir = path.resolve(BASE_UPLOAD_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      console.error('❌ Security: Attempted to delete file outside upload directory');
      return false;
    }

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      console.log(`✅ File deleted: ${fullPath}`);
      return true;
    }
    
    console.warn(`⚠️ File not found for deletion: ${fullPath}`);
    return false;
  } catch (err) {
    console.error('❌ Failed to delete file:', err);
    return false;
  }
};

// Batch file deletion
const deleteFiles = async (filePaths) => {
  const results = await Promise.allSettled(
    filePaths.filter(Boolean).map(deleteFile)
  );
  
  return results.map((result, index) => ({
    path: filePaths[index],
    success: result.status === 'fulfilled' ? result.value : false,
    error: result.status === 'rejected' ? result.reason : null
  }));
};



// Add this to your existing utils/upload.js file
// Place this code AFTER your existing multer configuration and BEFORE module.exports

// Badge-specific upload configuration (memory storage)
const badgeStorage = multer.memoryStorage();

const badgeUploadInstance = multer({
  storage: badgeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for badges
    files: 1 // Only one badge file at a time
  },
  fileFilter: (req, file, cb) => {
    console.log(`Badge upload filter - File: ${file.originalname}, MIME: ${file.mimetype}`);
    
    // Accept PNG and JPEG files for badges
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for badge: ${file.mimetype}. Only PNG and JPEG files are allowed.`), false);
    }
  }
});

// Enhanced badge upload middleware wrapper
const uploadBadge = (fieldName = 'badge') => {
  return (req, res, next) => {
    console.log(`Badge upload middleware activated for field: ${fieldName}`);
    
    badgeUploadInstance.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error('Badge upload error:', {
          error: err.message,
          code: err.code,
          field: fieldName
        });
        
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                message: 'Badge file too large. Maximum size is 10MB.',
                error: 'FILE_TOO_LARGE'
              });
            
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                message: `Unexpected file field. Expected field name: ${fieldName}`,
                error: 'UNEXPECTED_FILE'
              });
            
            default:
              return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`,
                error: 'UPLOAD_ERROR'
              });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'Badge upload failed',
          error: 'BADGE_UPLOAD_ERROR'
        });
      }
      
      // Log successful upload
      if (req.file) {
        console.log('Badge file uploaded successfully:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          bufferLength: req.file.buffer?.length
        });
      } else {
        console.log('No file received in badge upload');
      }
      
      next();
    });
  };
};


// Enhanced cleanup middleware with better error tracking
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  let cleanupExecuted = false;

  const cleanup = async () => {
    if (cleanupExecuted || res.statusCode < 400) return;
    
    cleanupExecuted = true;
    console.log('🧹 Cleaning up files due to error response');

    const filesToDelete = [];

    if (req.file) {
      filesToDelete.push(req.file.path);
    }

    if (Array.isArray(req.files)) {
      filesToDelete.push(...req.files.map(file => file.path));
    } else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          filesToDelete.push(...fileArray.map(file => file.path));
        }
      });
    }

    if (filesToDelete.length > 0) {
      const results = await deleteFiles(filesToDelete);
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error('❌ Failed to cleanup some files:', failed);
      }
    }
  };

  res.send = function (...args) {
    cleanup().finally(() => originalSend.apply(res, args));
  };

  res.json = function (...args) {
    cleanup().finally(() => originalJson.apply(res, args));
  };

  next();
};

// Enhanced file URL generation with security
const getFileUrl = (req, filename, folder = null) => {
  if (!filename) return null;

  // Sanitize filename to prevent path traversal
  const safeName = path.basename(filename);
  
  const detectedFolder = folder || getFolderFromRoute(req);
  
  return `/uploads/${detectedFolder}/${safeName}`;
};

// Get file info utility
const getFileInfo = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return null;
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase().slice(1);
    
    return {
      size: stats.size,
      extension: ext,
      created: stats.birthtime,
      modified: stats.mtime,
      isImage: FILE_TYPES.images.extensions.includes(ext),
      isDocument: FILE_TYPES.documents.extensions.includes(ext),
      isVideo: FILE_TYPES.videos.extensions.includes(ext)
    };
  } catch (err) {
    console.error('Error getting file info:', err);
    return null;
  }
};

// Validate upload directory structure
const validateUploadStructure = () => {
  const requiredFolders = [
    'general', 
    'team', 
    'blogs', 
    'projects', 
    'partners', 
    'logos',           // Main website logos
    'transaction-logos', // NEW: Transaction method logos  
    'testimonials',
        'events',
        'resumes',
        'highlights' // 👈 NEW

  ];
  
  requiredFolders.forEach(folder => {
    const folderPath = path.join(BASE_UPLOAD_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`✅ Created upload folder: ${folder}`);
    }
  });
};

// Initialize upload structure on module load
validateUploadStructure();

module.exports = {
  // Core upload instances
  upload,
  createUploadInstance,
  
  // Middleware wrappers
  uploadSingle,
  uploadMultiple,
  uploadFields,
  
  // Utility functions
  deleteFile,
  deleteFiles,
  cleanupOnError,
  getFileUrl,
  getFileInfo,
  validateUploadStructure,
  
  // Configuration
  BASE_UPLOAD_DIR,
  FILE_TYPES,
  
  // Helper functions
  generateSecureFilename,
  validateFile,
  getFolderFromRoute,
  uploadBadge,
  badgeUploadInstance
};