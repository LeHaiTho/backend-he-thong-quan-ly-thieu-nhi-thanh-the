const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { classScopeClause } = require('../services/accessScopeService');
const { assertClassAccess, assertBlockAccess, denyForbidden } = require('../middlewares/accessScope');

/**
 * Lấy danh sách lớp học theo niên học và khối
 * GET /api/classes
 */
const getAllClasses = async (req, res, next) => {
  try {
    const { academic_year_id, block_id } = req.query;
    
    let query = `
      SELECT c.*, b.name as block_name, t.first_name as head_teacher_first_name, t.last_name as head_teacher_last_name, t.saint_name as head_teacher_saint_name
      FROM classes c
      JOIN blocks b ON c.block_id = b.id
      LEFT JOIN teachers t ON c.head_teacher_id = t.id
      WHERE c.deleted_at IS NULL
    `;
    const params = [];

    if (academic_year_id) {
      query += ' AND c.academic_year_id = ?';
      params.push(academic_year_id);
    }

    if (block_id && block_id !== 'all') {
      query += ' AND c.block_id = ?';
      params.push(block_id);
    }

    const scopeSql = classScopeClause(req.accessScope, 'c');
    query += scopeSql.clause;
    params.push(...scopeSql.params);

    query += ' ORDER BY b.display_order ASC, c.name ASC';

    const [classes] = await db.query(query, params);

    // Lấy danh sách GLV cho từng lớp (từ bảng teacher_assignments)
    const classesWithTeachers = await Promise.all(classes.map(async (cls) => {
      const [assignments] = await db.query(`
        SELECT ta.*, t.first_name, t.last_name, t.saint_name
        FROM teacher_assignments ta
        JOIN teachers t ON ta.teacher_id = t.id
        WHERE ta.class_id = ? AND ta.deleted_at IS NULL
      `, [cls.id]);
      
      return { ...cls, teachers: assignments };
    }));

    res.status(200).json({
      success: true,
      data: classesWithTeachers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo lớp học mới
 * POST /api/classes
 */
const createClass = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const id = uuidv4();
    const { 
      academic_year_id, block_id, name, room, head_teacher_id, note, teacher_ids 
    } = req.body;

    if (req.accessScope?.roleCode === 'LECTURER') {
      return denyForbidden(res, 'Giáo lý viên không được tạo lớp mới');
    }
    if (!assertBlockAccess(req, res, block_id)) return;

    // 1. Thêm vào bảng classes
    await connection.query(`
      INSERT INTO classes (id, academic_year_id, block_id, name, room, head_teacher_id, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, academic_year_id, block_id, name, room, head_teacher_id, note]);

    // 2. Thêm vào bảng teacher_assignments nếu có
    if (teacher_ids && Array.isArray(teacher_ids)) {
      for (const teacherId of teacher_ids) {
        await connection.query(`
          INSERT INTO teacher_assignments (id, teacher_id, class_id, role)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), teacherId, id, teacherId === head_teacher_id ? 'head' : 'assistant']);
      }
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Tạo lớp học thành công',
      data: { id }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật lớp học
 * PUT /api/classes/:id
 */
const updateClass = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { 
      block_id, name, room, head_teacher_id, note, teacher_ids 
    } = req.body;

    if (req.accessScope?.roleCode === 'LECTURER') {
      return denyForbidden(res, 'Giáo lý viên không được sửa cấu hình lớp');
    }
    if (!(await assertClassAccess(req, res, id))) return;
    if (!assertBlockAccess(req, res, block_id)) return;

    // 1. Cập nhật bảng classes
    await connection.query(`
      UPDATE classes SET 
        block_id = ?, name = ?, room = ?, head_teacher_id = ?, note = ?
      WHERE id = ?
    `, [block_id, name, room, head_teacher_id, note, id]);

    // 2. Cập nhật teacher_assignments (xóa cũ thêm mới cho đơn giản)
    await connection.query('DELETE FROM teacher_assignments WHERE class_id = ?', [id]);
    
    if (teacher_ids && Array.isArray(teacher_ids)) {
      for (const teacherId of teacher_ids) {
        await connection.query(`
          INSERT INTO teacher_assignments (id, teacher_id, class_id, role)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), teacherId, id, teacherId === head_teacher_id ? 'head' : 'assistant']);
      }
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Cập nhật lớp học thành công'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Xóa lớp học (soft delete)
 * DELETE /api/classes/:id
 */
const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.accessScope?.roleCode === 'LECTURER') {
      return denyForbidden(res, 'Giáo lý viên không được xóa lớp');
    }
    if (!(await assertClassAccess(req, res, id))) return;
    await db.query('UPDATE classes SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Đã xóa lớp học'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass
};
