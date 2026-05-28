const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const {
  parseAttendanceConfigRows,
  isDateEnabledForType,
  normalizeDateInput,
} = require('../services/attendanceConfigHelper');

function mapAttendanceRow(row) {
  return {
    ...row,
    attendance_date: normalizeDateInput(row.attendance_date),
    attendance_type: row.attendance_type,
  };
}
const { countPresentByType } = require('../services/gradeCalculationService');
const { classScopeClause } = require('../services/accessScopeService');
const { assertClassAccess } = require('../middlewares/accessScope');

const VALID_TYPES = ['mass', 'catechism'];
const VALID_STATUSES = ['present', 'absent', 'late', 'excused'];

/**
 * GET /api/attendance-records/history
 * Lịch sử điểm danh — lọc linh hoạt, chỉ đọc
 */
const listAttendanceHistory = async (req, res, next) => {
  try {
    const {
      academic_year_id,
      semester_id,
      block_id,
      class_id,
      attendance_type,
      status,
      search,
      attendant_search,
      from,
      to,
      limit = 50,
      offset = 0,
    } = req.query;

    if (!academic_year_id) {
      return res.status(400).json({ success: false, message: 'Thiếu academic_year_id' });
    }

    const baseFrom = `
      FROM attendance_records ar
      JOIN students s ON s.id = ar.student_id AND s.deleted_at IS NULL
      JOIN classes c ON c.id = ar.class_id AND c.deleted_at IS NULL
      JOIN blocks b ON b.id = c.block_id AND b.deleted_at IS NULL
      JOIN semesters sem ON sem.id = ar.semester_id
      LEFT JOIN teachers t ON t.id = ar.recorded_by AND t.deleted_at IS NULL
      LEFT JOIN attendance_sync_logs asl ON asl.sync_id = ar.d2_sync_id
      WHERE ar.deleted_at IS NULL AND c.academic_year_id = ?
    `;
    const params = [academic_year_id];

    let whereExtra = '';

    if (semester_id) {
      whereExtra += ' AND ar.semester_id = ?';
      params.push(semester_id);
    }
    if (block_id && block_id !== 'all') {
      whereExtra += ' AND c.block_id = ?';
      params.push(block_id);
    }
    if (class_id) {
      whereExtra += ' AND ar.class_id = ?';
      params.push(class_id);
    }
    if (from) {
      whereExtra += ' AND ar.attendance_date >= ?';
      params.push(from);
    }
    if (to) {
      whereExtra += ' AND ar.attendance_date <= ?';
      params.push(to);
    }
    if (attendance_type && attendance_type !== 'all') {
      whereExtra += ' AND ar.attendance_type = ?';
      params.push(attendance_type);
    }
    if (status && status !== 'all') {
      whereExtra += ' AND ar.status = ?';
      params.push(status);
    }
    if (search) {
      whereExtra += ` AND (s.code LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.saint_name LIKE ?)`;
      const p = `%${search}%`;
      params.push(p, p, p, p);
    }
    if (attendant_search) {
      whereExtra += ` AND (
        asl.attendant_name LIKE ? OR asl.attendant_phone LIKE ?
        OR t.first_name LIKE ? OR t.last_name LIKE ? OR t.saint_name LIKE ? OR t.phone LIKE ?
      )`;
      const p = `%${attendant_search}%`;
      params.push(p, p, p, p, p, p);
    }

    const scopeSql = classScopeClause(req.accessScope, 'c');
    whereExtra += scopeSql.clause;
    params.push(...scopeSql.params);

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total ${baseFrom}${whereExtra}`,
      params
    );

    const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const off = Math.max(Number(offset) || 0, 0);

    const [rows] = await db.query(
      `SELECT ar.*,
        s.code AS student_code, s.saint_name, s.first_name, s.last_name,
        c.name AS class_name, b.name AS block_name,
        sem.name AS semester_name,
        TRIM(CONCAT(IFNULL(t.saint_name, ''), ' ', t.first_name, ' ', t.last_name)) AS recorder_name,
        t.phone AS recorder_phone,
        asl.attendant_name AS d2_attendant_name,
        asl.attendant_phone AS d2_attendant_phone,
        asl.sync_id AS d2_sync_id_ref
      ${baseFrom}${whereExtra}
      ORDER BY ar.attendance_date DESC, ar.recorded_at DESC, s.first_name ASC
      LIMIT ? OFFSET ?`,
      [...params, lim, off]
    );

    res.status(200).json({
      success: true,
      data: rows.map(mapAttendanceRow),
      total: countRows[0]?.total || 0,
      limit: lim,
      offset: off,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance-records
 */
const listAttendanceRecords = async (req, res, next) => {
  try {
    const { class_id, semester_id, from, to, attendance_type, search } = req.query;

    if (!class_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc semester_id' });
    }
    if (!(await assertClassAccess(req, res, class_id))) return;

    let query = `
      SELECT ar.*,
        s.code AS student_code, s.saint_name, s.first_name, s.last_name,
        b.name AS block_name, c.name AS class_name
      FROM attendance_records ar
      JOIN students s ON s.id = ar.student_id AND s.deleted_at IS NULL
      JOIN classes c ON c.id = ar.class_id
      JOIN blocks b ON b.id = c.block_id
      WHERE ar.class_id = ? AND ar.semester_id = ? AND ar.deleted_at IS NULL
    `;
    const params = [class_id, semester_id];

    if (from) {
      query += ' AND ar.attendance_date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND ar.attendance_date <= ?';
      params.push(to);
    }
    if (attendance_type && attendance_type !== 'all') {
      query += ' AND ar.attendance_type = ?';
      params.push(attendance_type);
    }
    if (search) {
      query += ` AND (s.code LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.saint_name LIKE ?)`;
      const p = `%${search}%`;
      params.push(p, p, p, p);
    }

    query += ' ORDER BY ar.attendance_date DESC, s.first_name ASC';

    const [rows] = await db.query(query, params);
    res.status(200).json({ success: true, data: rows.map(mapAttendanceRow) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance-records/eligible-students
 */
const getEligibleStudents = async (req, res, next) => {
  try {
    const { class_id, semester_id, search, attendance_date, attendance_type } = req.query;
    if (!class_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id' });
    }
    if (!(await assertClassAccess(req, res, class_id))) return;

    let query = `
      SELECT s.id, s.code, s.saint_name, s.first_name, s.last_name, s.status,
        c.name AS class_name, b.name AS block_name
      FROM students s
      JOIN student_enrollments se ON se.student_id = s.id AND se.deleted_at IS NULL
      JOIN classes c ON c.id = se.class_id
      JOIN blocks b ON b.id = c.block_id
      WHERE se.class_id = ? AND s.deleted_at IS NULL
    `;
    const params = [class_id];

    if (search) {
      query += ` AND (s.code LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.saint_name LIKE ?)`;
      const p = `%${search}%`;
      params.push(p, p, p, p);
    }

    query += ' ORDER BY s.first_name ASC, s.last_name ASC';

    const [students] = await db.query(query, params);
    const studentIds = students.map((s) => s.id);

    let attendanceConfig = {
      mass_required: 30,
      catechism_required: 15,
      massSchedule: {},
      catechismSchedule: {},
      count_all_mass_days: false,
    };
    const recordsByStudent = {};

    if (semester_id && studentIds.length > 0) {
      const [configRows] = await db.query(
        `SELECT * FROM attendance_configs
         WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL`,
        [class_id, semester_id]
      );
      attendanceConfig = parseAttendanceConfigRows(configRows);

      const [allRecords] = await db.query(
        `SELECT id, student_id, attendance_date, attendance_type, status
         FROM attendance_records
         WHERE class_id = ? AND semester_id = ? AND student_id IN (?)
           AND deleted_at IS NULL`,
        [class_id, semester_id, studentIds]
      );

      allRecords.forEach((r) => {
        const normalized = {
          ...r,
          attendance_date: normalizeDateInput(r.attendance_date),
          attendance_type: r.attendance_type,
        };
        if (!recordsByStudent[r.student_id]) recordsByStudent[r.student_id] = [];
        recordsByStudent[r.student_id].push(normalized);
      });
    }

    const sessionMap = new Map();
    if (
      semester_id &&
      attendance_date &&
      attendance_type &&
      VALID_TYPES.includes(attendance_type)
    ) {
      const [sessionRows] = await db.query(
        `SELECT id, student_id, status FROM attendance_records
         WHERE class_id = ? AND semester_id = ? AND attendance_date = ?
           AND attendance_type = ? AND deleted_at IS NULL`,
        [class_id, semester_id, attendance_date, attendance_type]
      );
      sessionRows.forEach((r) => {
        sessionMap.set(r.student_id, { id: r.id, status: r.status });
      });
    }

    const enriched = students.map((s) => {
      const studentRecords = recordsByStudent[s.id] || [];
      const { mass, catechism } = countPresentByType(studentRecords, attendanceConfig);
      const session = sessionMap.get(s.id);
      return {
        ...s,
        mass_present: mass,
        catechism_present: catechism,
        mass_required: attendanceConfig.mass_required,
        catechism_required: attendanceConfig.catechism_required,
        attendance_record_id: session?.id || null,
        session_status: session?.status || null,
        is_marked: Boolean(session),
      };
    });

    res.status(200).json({
      success: true,
      data: enriched,
      semester_id: semester_id || null,
      attendance_config: {
        mass_required: attendanceConfig.mass_required,
        catechism_required: attendanceConfig.catechism_required,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/attendance-records
 */
const createAttendanceRecord = async (req, res, next) => {
  try {
    const {
      student_id,
      class_id,
      semester_id,
      attendance_date,
      attendance_type,
      status,
      check_in_time,
      note,
      recorded_by,
    } = req.body;

    if (!student_id || !class_id || !semester_id || !attendance_date || !attendance_type || !status) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    if (!(await assertClassAccess(req, res, class_id))) return;

    const typeNorm = String(attendance_type).trim().toLowerCase();
    if (!VALID_TYPES.includes(typeNorm)) {
      return res.status(400).json({ success: false, message: 'attendance_type không hợp lệ (mass | catechism)' });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'status không hợp lệ' });
    }

    const dateNorm = normalizeDateInput(attendance_date);
    if (!dateNorm) {
      return res.status(400).json({ success: false, message: 'Ngày điểm danh không hợp lệ' });
    }

    const [configRows] = await db.query(
      `SELECT * FROM attendance_configs
       WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL`,
      [class_id, semester_id]
    );
    const attendanceConfig = parseAttendanceConfigRows(configRows);
    const onSchedule = isDateEnabledForType(attendanceConfig, dateNorm, typeNorm);

    const id = uuidv4();
    await db.query(
      `INSERT INTO attendance_records (
        id, student_id, class_id, semester_id, attendance_date, attendance_type,
        status, check_in_time, recorded_by, recorded_at, sync_status, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'synced', ?)`,
      [
        id,
        student_id,
        class_id,
        semester_id,
        attendance_date,
        attendance_type,
        status,
        check_in_time || null,
        recorded_by || null,
        note || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: onSchedule
        ? 'Đã tạo điểm danh'
        : 'Đã lưu điểm danh (ngày ngoài lịch — có thể không tính vào Tl/Gl)',
      data: { id, attendance_type: typeNorm, attendance_date: dateNorm, on_schedule: onSchedule },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Học viên đã được điểm danh trong ngày và loại này',
      });
    }
    next(error);
  }
};

/**
 * PUT /api/attendance-records/:id
 */
const updateAttendanceRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, check_in_time, note, attendance_date, attendance_type } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'status không hợp lệ' });
    }
    if (attendance_type && !VALID_TYPES.includes(attendance_type)) {
      return res.status(400).json({ success: false, message: 'attendance_type không hợp lệ' });
    }

    const [existing] = await db.query(
      'SELECT id FROM attendance_records WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
    }

    await db.query(
      `UPDATE attendance_records SET
        status = COALESCE(?, status),
        check_in_time = COALESCE(?, check_in_time),
        note = COALESCE(?, note),
        attendance_date = COALESCE(?, attendance_date),
        attendance_type = COALESCE(?, attendance_type),
        updated_at = NOW()
      WHERE id = ?`,
      [status, check_in_time, note, attendance_date, attendance_type, id]
    );

    res.status(200).json({ success: true, message: 'Đã cập nhật điểm danh' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Trùng điểm danh cùng ngày/loại' });
    }
    next(error);
  }
};

/**
 * DELETE /api/attendance-records/:id
 */
const deleteAttendanceRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE attendance_records SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Đã xóa điểm danh' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAttendanceHistory,
  listAttendanceRecords,
  getEligibleStudents,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
