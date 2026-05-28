const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { studentScopeClause } = require('../services/accessScopeService');
const { assertClassAccess, assertStudentAccess, denyForbidden } = require('../middlewares/accessScope');

/**
 * Lấy danh sách học viên theo lớp để xếp lớp
 */
const getStudentsForEnrollment = async (req, res, next) => {
  try {
    const { academic_year_id, block_id, class_id } = req.query;

    let query = `
      SELECT 
        s.id, 
        s.code, 
        s.saint_name, 
        s.first_name, 
        s.last_name, 
        s.dob, 
        s.status,
        se.class_id as current_class_id,
        c.name as current_class_name,
        se.academic_year_id as current_academic_year_id
      FROM students s
      JOIN student_enrollments se ON s.id = se.student_id
      LEFT JOIN classes c ON se.class_id = c.id
      WHERE s.deleted_at IS NULL AND se.deleted_at IS NULL
    `;

    const params = [];

    if (class_id && class_id !== 'all') {
      query += ` AND se.class_id = ?`;
      params.push(class_id);
    } else if (block_id && block_id !== 'all') {
      query += ` AND c.block_id = ?`;
      params.push(block_id);
    }

    if (academic_year_id) {
      query += ` AND se.academic_year_id = ?`;
      params.push(academic_year_id);
    }

    const scopeSql = studentScopeClause(req.accessScope, 'c');
    query += scopeSql.clause;
    params.push(...scopeSql.params);

    query += ` ORDER BY s.first_name ASC, s.last_name ASC`;

    const [students] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lưu xếp lớp hàng loạt
 */
const saveBulkEnrollments = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { enrollments, target_academic_year_id } = req.body;
    const userId = req.user?.id;

    if (!enrollments || !Array.isArray(enrollments)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    if (req.accessScope?.roleCode === 'LECTURER') {
      return denyForbidden(res, 'Giáo lý viên không được xếp lớp hàng loạt');
    }

    for (const item of enrollments) {
      const { student_id, to_class_id } = item;
      if (to_class_id && !(await assertClassAccess(req, res, to_class_id))) {
        await connection.rollback();
        connection.release();
        return;
      }
      if (student_id && !(await assertStudentAccess(req, res, student_id))) {
        await connection.rollback();
        connection.release();
        return;
      }
    }

    for (const item of enrollments) {
      const { student_id, to_class_id, from_class_id, from_academic_year_id } = item;

      // 1. Kiểm tra xem đã có enrollment cho niên học đích chưa
      const [existing] = await connection.query(
        'SELECT id FROM student_enrollments WHERE student_id = ? AND academic_year_id = ? AND deleted_at IS NULL',
        [student_id, target_academic_year_id]
      );

      if (existing.length > 0) {
        // Cập nhật enrollment hiện có
        await connection.query(
          'UPDATE student_enrollments SET class_id = ?, updated_by = ? WHERE id = ?',
          [to_class_id, userId, existing[0].id]
        );
      } else {
        // Tạo enrollment mới
        await connection.query(
          `INSERT INTO student_enrollments (id, student_id, class_id, academic_year_id, updated_by) 
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), student_id, to_class_id, target_academic_year_id, userId]
        );
      }

      // 2. Ghi log vào class_transfers nếu có thay đổi lớp hoặc niên học
      if (from_class_id !== to_class_id || from_academic_year_id !== target_academic_year_id) {
        await connection.query(
          `INSERT INTO class_transfers (id, student_id, from_class_id, from_academic_year_id, to_class_id, to_academic_year_id, transfer_type, status, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), 
            student_id, 
            from_class_id || null, 
            from_academic_year_id || null, 
            to_class_id, 
            target_academic_year_id,
            from_academic_year_id === target_academic_year_id ? 'transfer' : 'promotion',
            'completed',
            userId
          ]
        );
      }
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Xếp lớp thành công'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getStudentsForEnrollment,
  saveBulkEnrollments
};
