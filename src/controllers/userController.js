const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function validateUserRoleLinks({ role_id, sub_role_block_id, teacher_id, excludeUserId }) {
  const [roles] = await db.query('SELECT code FROM roles WHERE id = ?', [role_id]);
  if (!roles.length) {
    return { ok: false, status: 400, message: 'Vai trò không hợp lệ' };
  }
  const code = roles[0].code;

  if (code === 'LECTURER') {
    if (!teacher_id) {
      return {
        ok: false,
        status: 400,
        message: 'Giáo lý viên phải liên kết với hồ sơ GLV (teacher_id)',
      };
    }
    const [teachers] = await db.query(
      'SELECT id FROM teachers WHERE id = ? AND deleted_at IS NULL',
      [teacher_id]
    );
    if (!teachers.length) {
      return { ok: false, status: 400, message: 'Hồ sơ giáo lý viên không tồn tại' };
    }
    let linkSql = 'SELECT id FROM users WHERE teacher_id = ? AND deleted_at IS NULL';
    const linkParams = [teacher_id];
    if (excludeUserId) {
      linkSql += ' AND id != ?';
      linkParams.push(excludeUserId);
    }
    const [linked] = await db.query(linkSql, linkParams);
    if (linked.length) {
      return { ok: false, status: 400, message: 'GLV này đã được liên kết tài khoản khác' };
    }
  } else if (teacher_id) {
    return {
      ok: false,
      status: 400,
      message: 'Chỉ vai trò Giáo lý viên mới được gán teacher_id',
    };
  }

  if (code === 'BRANCH_SECRETARY' && !sub_role_block_id) {
    return {
      ok: false,
      status: 400,
      message: 'Quản lý ngành phải chọn khối (sub_role_block_id)',
    };
  }

  return { ok: true, roleCode: code };
}

/**
 * Lấy danh sách tất cả người dùng (chỉ dành cho Admin)
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.name, 
        u.username, 
        u.phone, 
        u.email, 
        u.status, 
        u.created_at,
        u.role_id,
        u.sub_role_block_id,
        u.teacher_id,
        r.name as role_name,
        r.code as role_code,
        b.name as block_name,
        TRIM(CONCAT(IFNULL(t.saint_name, ''), ' ', t.first_name, ' ', t.last_name)) AS teacher_name,
        t.code AS teacher_code
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN blocks b ON u.sub_role_block_id = b.id
      LEFT JOIN teachers t ON u.teacher_id = t.id AND t.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo người dùng mới
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, username, password, role_id, sub_role_block_id, teacher_id, phone, email } = req.body;

    const validation = await validateUserRoleLinks({ role_id, sub_role_block_id, teacher_id });
    if (!validation.ok) {
      return res.status(validation.status).json({ success: false, message: validation.message });
    }

    // 1. Kiểm tra username tồn tại
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'admin123', salt);

    // 3. Lưu vào DB
    const id = uuidv4();
    await db.query(`
      INSERT INTO users (id, name, username, password_hash, role_id, sub_role_block_id, teacher_id, phone, email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [id, name, username, password_hash, role_id, sub_role_block_id || null, teacher_id || null, phone, email]);

    res.status(201).json({ success: true, message: 'Tạo người dùng thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật người dùng
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, username, password, role_id, sub_role_block_id, teacher_id, phone, email, status } = req.body;

    // 1. Kiểm tra user tồn tại
    const [user] = await db.query('SELECT id, teacher_id FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const validation = await validateUserRoleLinks({
      role_id,
      sub_role_block_id,
      teacher_id,
      excludeUserId: id,
    });
    if (!validation.ok) {
      return res.status(validation.status).json({ success: false, message: validation.message });
    }

    // Kiểm tra trùng teacher_id khi đổi GLV
    if (teacher_id) {
      const [linked] = await db.query(
        'SELECT id FROM users WHERE teacher_id = ? AND id != ? AND deleted_at IS NULL',
        [teacher_id, id]
      );
      if (linked.length) {
        return res.status(400).json({ success: false, message: 'GLV này đã được liên kết tài khoản khác' });
      }
    }

    // 2. Chuẩn bị query cập nhật
    let query = `
      UPDATE users 
      SET name = ?, username = ?, role_id = ?, sub_role_block_id = ?, teacher_id = ?, phone = ?, email = ?, status = ?
    `;
    let params = [name, username, role_id, sub_role_block_id || null, teacher_id || null, phone, email, status];

    // 3. Nếu có đổi mật khẩu
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      query += `, password_hash = ?`;
      params.push(password_hash);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.query(query, params);

    res.status(200).json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa mềm người dùng
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Không cho phép tự xóa chính mình (giả sử req.user.id lưu ID người đang đăng nhập)
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản của chính mình' });
    }

    await db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Đã xóa người dùng' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
