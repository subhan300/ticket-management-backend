const multer = require('multer');
const path = require('path');

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Limit the total size of all files to 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
}).fields([{ name: 'images', maxCount: 4 }, { name: 'files', maxCount: 4 }]);

// Middleware function
const uploadMiddleware = (req, res, next) => {
if(req.files){
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A multer error occurred when uploading
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading
      return res.status(400).json({ error: err.message });
    }

    // Check the total size of uploaded files
    
    // Everything went fine
    next();
  });
}
next();
};

module.exports = {uploadMiddleware};
