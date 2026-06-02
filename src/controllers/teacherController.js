const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const {
  normalizeStoredMediaPath,
  enrichMediaList,
} = require('../utils/mediaPath');
const { resolvePersonCode } = require('../services/personCodeHelper');
const { teacherScopeClause } = require('../services/accessScopeService');
const { denyForbidden, assertTeacherSelfOrElevated } = require('../middlewares/accessScope');

/**
 * Lấy danh sách giáo lý viên
 * GET /api/teachers
 */
const getAllTeachers = async (req, res, next) => {
  try {
    let query = `
      SELECT t.*, p.name as parish_name,
        u.id AS user_id, u.username AS user_username
      FROM teachers t
      LEFT JOIN parishes p ON t.parish_id = p.id
      LEFT JOIN users u ON u.teacher_id = t.id AND u.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
    `;
    const params = [];
    const scopeSql = teacherScopeClause(req.accessScope, 't');
    query += scopeSql.clause;
    params.push(...scopeSql.params);
    query += ' ORDER BY t.created_at DESC';

    const [teachers] = await db.query(query, params);
    res.status(200).json({
      success: true,
      data: enrichMediaList(teachers, req),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo giáo lý viên mới
 * POST /api/teachers
 */
const createTeacher = async (req, res, next) => {
  if (req.accessScope?.roleCode === 'LECTURER') {
    return denyForbidden(res, 'Giáo lý viên không được thêm hồ sơ GLV mới');
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const id = uuidv4();
    const { 
      code, saint_name, first_name, last_name, gender, dob, pob, 
      patron_day, phone, email, address, parish_id, village, 
      family_number, family_code, baptism_date, baptism_place, 
      baptism_book, first_communion_date, first_communion_place, 
      confirmation_date, confirmation_place, confirmation_book, 
      vow_date, level, allow_attendance, status, avatar_url, notes 
    } = req.body;
    const storedAvatarUrl = normalizeStoredMediaPath(avatar_url);

    const teacherCode = await resolvePersonCode(connection, {
      table: 'teachers',
      providedCode: code,
    });

    await connection.query(`
      INSERT INTO teachers (
        id, code, saint_name, first_name, last_name, gender, dob, pob, 
        patron_day, phone, email, address, parish_id, village, 
        family_number, family_code, baptism_date, baptism_place, 
        baptism_book, first_communion_date, first_communion_place, 
        confirmation_date, confirmation_place, confirmation_book, 
        vow_date, level, allow_attendance, status, avatar_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, teacherCode, saint_name, first_name, last_name, gender, dob, pob, 
      patron_day, phone, email, address, parish_id, village, 
      family_number, family_code, baptism_date, baptism_place, 
      baptism_book, first_communion_date, first_communion_place, 
      confirmation_date, confirmation_place, confirmation_book, 
      vow_date, level, allow_attendance, status, storedAvatarUrl, notes
    ]);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Thêm giáo lý viên thành công',
      data: { id, code: teacherCode }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật giáo lý viên
 * PUT /api/teachers/:id
 */
const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.accessScope?.roleCode === 'LECTURER') {
      if (!assertTeacherSelfOrElevated(req, res, id)) return;
    } else if (!req.accessScope?.isFullAccess && req.accessScope?.roleCode === 'BRANCH_SECRETARY') {
      const scopeSql = teacherScopeClause(req.accessScope, 't');
      const [rows] = await db.query(
        `SELECT t.id FROM teachers t WHERE t.id = ? AND t.deleted_at IS NULL ${scopeSql.clause}`,
        [id, ...scopeSql.params]
      );
      if (!rows.length) return denyForbidden(res);
    }

    const {
      code, saint_name, first_name, last_name, gender, dob, pob, 
      patron_day, phone, email, address, parish_id, village, 
      family_number, family_code, baptism_date, baptism_place, 
      baptism_book, first_communion_date, first_communion_place, 
      confirmation_date, confirmation_place, confirmation_book, 
      vow_date, level, allow_attendance, status, avatar_url, notes, end_date
    } = req.body;
    const storedAvatarUrl = normalizeStoredMediaPath(avatar_url);

    await db.query(`
      UPDATE teachers SET 
        code = ?, saint_name = ?, first_name = ?, last_name = ?, gender = ?, 
        dob = ?, pob = ?, patron_day = ?, phone = ?, email = ?, 
        address = ?, parish_id = ?, village = ?, family_number = ?, 
        family_code = ?, baptism_date = ?, baptism_place = ?, 
        baptism_book = ?, first_communion_date = ?, first_communion_place = ?, 
        confirmation_date = ?, confirmation_place = ?, confirmation_book = ?, 
        vow_date = ?, level = ?, allow_attendance = ?, status = ?, 
        avatar_url = ?, notes = ?, end_date = ?
      WHERE id = ?
    `, [
      code, saint_name, first_name, last_name, gender, 
      dob, pob, patron_day, phone, email, 
      address, parish_id, village, family_number, 
      family_code, baptism_date, baptism_place, 
      baptism_book, first_communion_date, first_communion_place, 
      confirmation_date, confirmation_place, confirmation_book, 
      vow_date, level, allow_attendance, status, 
      storedAvatarUrl, notes, end_date, id
    ]);

    res.status(200).json({
      success: true,
      message: 'Cập nhật giáo lý viên thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa giáo lý viên (soft delete)
 * DELETE /api/teachers/:id
 */
const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.accessScope?.roleCode === 'LECTURER') {
      return denyForbidden(res, 'Giáo lý viên không được xóa hồ sơ GLV');
    }
    if (!req.accessScope?.isFullAccess) {
      return denyForbidden(res, 'Chỉ Thư ký đoàn / Admin được xóa hồ sơ GLV');
    }
    await db.query('UPDATE teachers SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Đã xóa giáo lý viên'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
