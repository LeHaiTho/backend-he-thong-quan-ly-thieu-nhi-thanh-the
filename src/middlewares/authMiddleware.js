const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực Token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    let token;

    // 1. Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập. Vui lòng gửi token kèm theo.'
      });
    }

    // 2. Giải mã và kiểm tra token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Gắn thông tin user vào request để các middleware sau sử dụng
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn, vui lòng đăng nhập lại'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

module.exports = {
  verifyToken
};
