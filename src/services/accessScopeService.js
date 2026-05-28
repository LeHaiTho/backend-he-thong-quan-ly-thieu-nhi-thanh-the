const db = require('../config/db');

const FULL_ACCESS_ROLES = new Set(['ADMIN', 'SECRETARY']);

/**
 * Lớp GLV được phân công (chủ nhiệm hoặc phụ dạy)
 */
async function getTeacherClassIds(teacherId) {
  if (!teacherId) return [];
  const [rows] = await db.query(
    `
    SELECT DISTINCT c.id
    FROM classes c
    WHERE c.deleted_at IS NULL AND c.head_teacher_id = ?
    UNION
    SELECT DISTINCT ta.class_id AS id
    FROM teacher_assignments ta
    JOIN classes c2 ON c2.id = ta.class_id AND c2.deleted_at IS NULL
    WHERE ta.teacher_id = ? AND ta.deleted_at IS NULL
    `,
    [teacherId, teacherId]
  );
  return rows.map((r) => r.id);
}

async function getBlockIdsForClasses(classIds) {
  if (!classIds.length) return [];
  const [rows] = await db.query(
    `SELECT DISTINCT block_id AS id FROM classes WHERE id IN (?) AND deleted_at IS NULL`,
    [classIds]
  );
  return rows.map((r) => r.id);
}

/**
 * Tải phạm vi truy cập theo user đăng nhập
 */
async function loadUserAccessScope(userId) {
  const [users] = await db.query(
    `
    SELECT u.id, u.teacher_id, u.sub_role_block_id, u.status, r.code AS role_code
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.deleted_at IS NULL
    `,
    [userId]
  );

  if (!users.length || users[0].status !== 'active') {
    return null;
  }

  const u = users[0];
  const roleCode = u.role_code;

  if (FULL_ACCESS_ROLES.has(roleCode)) {
    return {
      userId: u.id,
      roleCode,
      teacherId: u.teacher_id,
      isFullAccess: true,
      blockIds: null,
      classIds: null,
    };
  }

  if (roleCode === 'BRANCH_SECRETARY') {
    const blockIds = u.sub_role_block_id ? [u.sub_role_block_id] : [];
    return {
      userId: u.id,
      roleCode,
      teacherId: u.teacher_id,
      isFullAccess: false,
      blockIds,
      classIds: null,
    };
  }

  if (roleCode === 'LECTURER') {
    const classIds = await getTeacherClassIds(u.teacher_id);
    const blockIds = await getBlockIdsForClasses(classIds);
    return {
      userId: u.id,
      roleCode,
      teacherId: u.teacher_id,
      isFullAccess: false,
      blockIds,
      classIds,
    };
  }

  return {
    userId: u.id,
    roleCode,
    teacherId: u.teacher_id,
    isFullAccess: false,
    blockIds: [],
    classIds: [],
  };
}

function hasBlockAccess(scope, blockId) {
  if (!blockId || scope?.isFullAccess) return Boolean(scope?.isFullAccess);
  if (scope.blockIds?.length) return scope.blockIds.includes(blockId);
  return false;
}

async function hasClassAccess(scope, classId) {
  if (!classId) return false;
  if (scope?.isFullAccess) return true;
  if (scope.classIds?.length) return scope.classIds.includes(classId);
  if (scope.blockIds?.length) {
    const [rows] = await db.query(
      'SELECT block_id FROM classes WHERE id = ? AND deleted_at IS NULL',
      [classId]
    );
    return rows.length > 0 && scope.blockIds.includes(rows[0].block_id);
  }
  return false;
}

async function hasStudentAccess(scope, studentId) {
  if (!studentId) return false;
  if (scope?.isFullAccess) return true;

  const [rows] = await db.query(
    `
    SELECT se.class_id, c.block_id
    FROM student_enrollments se
    JOIN classes c ON c.id = se.class_id AND c.deleted_at IS NULL
    WHERE se.student_id = ? AND se.deleted_at IS NULL
    ORDER BY se.created_at DESC
    LIMIT 1
    `,
    [studentId]
  );

  if (!rows.length) return scope.roleCode === 'SECRETARY' || scope.roleCode === 'ADMIN';

  const { class_id: classId, block_id: blockId } = rows[0];
  if (scope.classIds?.length) return hasClassAccess(scope, classId);
  if (scope.blockIds?.length) return hasBlockAccess(scope, blockId);
  return false;
}

/**
 * SQL bổ sung cho bảng classes (alias mặc định: c)
 */
function classScopeClause(scope, alias = 'c') {
  if (!scope || scope.isFullAccess) return { clause: '', params: [] };
  if (scope.classIds?.length) {
    return { clause: ` AND ${alias}.id IN (?)`, params: [scope.classIds] };
  }
  if (scope.blockIds?.length) {
    return { clause: ` AND ${alias}.block_id IN (?)`, params: [scope.blockIds] };
  }
  return { clause: ' AND 1=0', params: [] };
}

/**
 * SQL bổ sung lọc học viên qua enrollment (alias lớp: c)
 */
function studentScopeClause(scope, classAlias = 'c') {
  if (!scope || scope.isFullAccess) return { clause: '', params: [] };
  if (scope.classIds?.length) {
    return {
      clause: ` AND ${classAlias}.id IN (?)`,
      params: [scope.classIds],
    };
  }
  if (scope.blockIds?.length) {
    return {
      clause: ` AND ${classAlias}.block_id IN (?)`,
      params: [scope.blockIds],
    };
  }
  return { clause: ' AND 1=0', params: [] };
}

/**
 * SQL lọc giáo lý viên: GLV thuộc lớp được phân hoặc chính mình
 */
function teacherScopeClause(scope, teacherAlias = 't') {
  if (!scope || scope.isFullAccess) return { clause: '', params: [] };
  if (scope.roleCode === 'LECTURER') {
    if (!scope.teacherId) return { clause: ' AND 1=0', params: [] };
    if (!scope.classIds?.length) {
      return { clause: ` AND ${teacherAlias}.id = ?`, params: [scope.teacherId] };
    }
    return {
      clause: `
        AND (
          ${teacherAlias}.id = ?
          OR ${teacherAlias}.id IN (
            SELECT DISTINCT ta.teacher_id
            FROM teacher_assignments ta
            WHERE ta.class_id IN (?) AND ta.deleted_at IS NULL
          )
          OR ${teacherAlias}.id IN (
            SELECT DISTINCT c.head_teacher_id
            FROM classes c
            WHERE c.id IN (?) AND c.deleted_at IS NULL AND c.head_teacher_id IS NOT NULL
          )
        )`,
      params: [scope.teacherId, scope.classIds, scope.classIds],
    };
  }
  if (scope.blockIds?.length) {
    return {
      clause: `
        AND ${teacherAlias}.id IN (
          SELECT DISTINCT ta.teacher_id
          FROM teacher_assignments ta
          JOIN classes c ON c.id = ta.class_id
          WHERE c.block_id IN (?) AND ta.deleted_at IS NULL
          UNION
          SELECT DISTINCT c.head_teacher_id
          FROM classes c
          WHERE c.block_id IN (?) AND c.deleted_at IS NULL AND c.head_teacher_id IS NOT NULL
        )`,
      params: [scope.blockIds, scope.blockIds],
    };
  }
  return { clause: ' AND 1=0', params: [] };
}

module.exports = {
  loadUserAccessScope,
  getTeacherClassIds,
  hasClassAccess,
  hasBlockAccess,
  hasStudentAccess,
  classScopeClause,
  studentScopeClause,
  teacherScopeClause,
  FULL_ACCESS_ROLES,
};
