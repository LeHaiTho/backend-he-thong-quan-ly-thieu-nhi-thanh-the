// Controller xử lý upload file
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn file để upload'
    });
  }

  // Trả về đường dẫn file
  const filePath = `/uploads/${req.file.filename}`;
  const fullUrl = `${process.env.APP_URL || 'http://localhost:5000'}${filePath}`;

  res.status(200).json({
    success: true,
    message: 'Upload file thành công',
    data: {
      filename: req.file.filename,
      path: filePath,
      url: fullUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
};

module.exports = {
  uploadFile
};
