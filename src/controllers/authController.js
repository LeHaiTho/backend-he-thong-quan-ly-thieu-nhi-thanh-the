const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

/**
 * Đăng nhập người dùng
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp username và password'
      });
    }

    // 2. Tìm user trong DB (bao gồm cả thông tin role)
    const [users] = await db.query(`
      SELECT u.*, r.code as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.username = ? AND u.deleted_at IS NULL
    `, [username]);

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username hoặc password không chính xác'
      });
    }

    // 3. Kiểm tra password
    // Trong thực tế, bạn nên dùng bcrypt.compare cho mật khẩu đã hash
    let isPasswordCorrect = false;
    try {
      isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    } catch (err) {
      console.error('Bcrypt error:', err);
    }
    
    // Fallback cho dữ liệu mẫu (plain text) - CHỈ DÙNG TRONG DEVELOPMENT
    const isDevMatch = password === user.password_hash;

    if (!isPasswordCorrect && !isDevMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username hoặc password không chính xác'
      });
    }

    // 4. Tạo JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        sub_role_block_id: user.sub_role_block_id,
        teacher_id: user.teacher_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // 5. Trả về kết quả (không gửi password_hash)
    delete user.password_hash;
    
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
