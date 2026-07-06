import multer from 'multer';

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.fieldname === 'image') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for the profile photo.'));
    }
    return cb(null, true);
  }
  if (file.fieldname === 'resume') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Resume must be a PDF file.'));
    }
    return cb(null, true);
  }
  cb(new Error(`Unexpected field: ${file.fieldname}`));
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

// Used on PUT /profile — accepts an optional new photo AND/or an optional
// new resume PDF in the same multipart request.
export const uploadProfileFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB, generous enough for a PDF resume
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);
