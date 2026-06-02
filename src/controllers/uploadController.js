const { resolveMediaUrl } = require('../utils/mediaPath');

// Controller xử lý upload file
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn file để upload'
    });
  }

  const filePath = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Upload file thành công',
    data: {
      filename: req.file.filename,
      path: filePath,
      url: resolveMediaUrl(filePath, req),
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
};

module.exports = {
  uploadFile
};
