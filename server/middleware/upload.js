const multer = require('multer');
const path = require('path');

// ========================================
// STORAGE CONFIGURATION
// ========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `event-${Date.now()}${ext}`
    );
  },
});

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files are allowed')
    );
  }
};

// ========================================
// MULTER CONFIG
// ========================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ========================================
// EXPORT MIDDLEWARE
// ========================================

const uploadImages = upload.array('images', 5);

module.exports = {
  uploadImages,
};