const {
  loadUserAccessScope,
  hasClassAccess,
  hasBlockAccess,
  hasStudentAccess,
} = require('../services/accessScopeService');

/**
 * Gắn phạm vi truy cập (block/lớp) sau verifyToken
 */
const attachAccessScope = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập',
      });
    }

    const scope = await loadUserAccessScope(req.user.id);
    if (!scope) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không hợp lệ hoặc đã bị khóa',
      });
    }

    req.accessScope = scope;
    next();
  } catch (error) {
    console.error('Access scope error:', error);
    next(error);
  }
};

const denyForbidden = (res, message = 'Bạn không có quyền truy cập dữ liệu này') =>
  res.status(403).json({ success: false, message });

const assertClassAccess = async (req, res, classId) => {
  const ok = await hasClassAccess(req.accessScope, classId);
  if (ok) return true;
  denyForbidden(res);
  return false;
};

const assertBlockAccess = (req, res, blockId) => {
  if (hasBlockAccess(req.accessScope, blockId)) return true;
  denyForbidden(res);
  return false;
};

const assertStudentAccess = async (req, res, studentId) => {
  const ok = await hasStudentAccess(req.accessScope, studentId);
  if (ok) return true;
  denyForbidden(res);
  return false;
};

const assertTeacherSelfOrElevated = (req, res, teacherId) => {
  const scope = req.accessScope;
  if (scope.isFullAccess) return true;
  if (scope.roleCode === 'BRANCH_SECRETARY') {
    // Quản lý ngành: kiểm tra GLV có dạy trong khối được gán
    return true; // kiểm tra chi tiết ở controller qua teacherScope
  }
  if (scope.roleCode === 'LECTURER' && scope.teacherId === teacherId) return true;
  denyForbidden(res, 'Giáo lý viên chỉ được sửa hồ sơ tài khoản của mình');
  return false;
};

module.exports = {
  attachAccessScope,
  denyForbidden,
  assertClassAccess,
  assertBlockAccess,
  assertStudentAccess,
  assertTeacherSelfOrElevated,
};
