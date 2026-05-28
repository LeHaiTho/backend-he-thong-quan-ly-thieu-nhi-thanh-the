const db = require('../config/db');

/**
 * Middleware kiểm tra quyền hạn (RBAC) theo permission code.
 * Phạm vi dữ liệu (khối/lớp) được kiểm tra bởi attachAccessScope + accessScopeService.
 *
 * SECRETARY / ADMIN: toàn đoàn (mọi blocks)
 * BRANCH_SECRETARY: sub_role_block_id
 * LECTURER: users.teacher_id → teacher_assignments + head_teacher_id
 *
 * @param {string} requiredPermission - Mã quyền (VD: 'student.read')
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện hành động này',
        });
      }

      const userId = req.user.id;

      const [permissions] = await db.query(
        `
        SELECT p.code
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ? AND u.deleted_at IS NULL
        `,
        [userId]
      );

      const userPermissions = permissions.map((p) => p.code);

      if (userPermissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này',
        required: requiredPermission,
      });
    } catch (error) {
      console.error('RBAC Error:', error);
      next(error);
    }
  };
};

module.exports = {
  checkPermission
};
