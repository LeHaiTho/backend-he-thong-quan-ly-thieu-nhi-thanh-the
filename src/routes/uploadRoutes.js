const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../config/multer');

const runUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.statusCode = 413;
      err.message = 'File quá lớn (tối đa 5MB)';
    } else if (!err.statusCode) {
      err.statusCode = 400;
    }
    next(err);
  });
};

router.post('/', runUpload, uploadController.uploadFile);

module.exports = router;
