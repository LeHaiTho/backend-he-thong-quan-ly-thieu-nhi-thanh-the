const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('./uploadsDir');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Cảnh báo: Không thể tạo thư mục uploads:', err.message);
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất: timestamp-tên_gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_IMAGE_MIME = /^image\/(jpeg|png|webp|gif|pjpeg|x-png|heic|heif)$/i;

function isAllowedImage(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();
  const extOk = !ext || ALLOWED_IMAGE_EXT.has(ext);
  const mimeOk = ALLOWED_IMAGE_MIME.test(mime) || mime.startsWith('image/');
  // Chấp nhận khi MIME là ảnh (trình duyệt đôi khi gửi tên "blob" không có đuôi file)
  if (mimeOk) return true;
  if (extOk && mime === 'application/octet-stream') return true;
  return extOk && ALLOWED_IMAGE_EXT.has(ext);
}

const fileFilter = (req, file, cb) => {
  if (isAllowedImage(file)) {
    return cb(null, true);
  }
  const err = new Error('Chỉ cho phép upload file ảnh (JPG, PNG, WEBP, GIF)');
  err.statusCode = 400;
  cb(err);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
