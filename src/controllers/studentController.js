const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');

/** Tiêu đề cột file mẫu / import (tiếng Việt, sheet "Hoc_vien") */
const IMPORT_HEADERS = {
  saint_name: 'Tên thánh',
  first_name: 'Họ',
  last_name: 'Tên',
  gender: 'Giới tính',
  dob: 'Ngày sinh',
  pob: 'Nơi sinh',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  village: 'Thôn/xóm',
  family_number: 'Số sổ gia đình',
  father_saint_name: 'Tên thánh cha',
  father_name: 'Họ tên cha',
  mother_saint_name: 'Tên thánh mẹ',
  mother_name: 'Họ tên mẹ',
  baptism_date: 'Ngày rửa tội',
  baptism_place: 'Nơi rửa tội',
  baptism_book: 'Số sách rửa tội',
  first_communion_date: 'Ngày rước lễ',
  first_communion_place: 'Nơi rước lễ',
  confirmation_date: 'Ngày thêm sức',
  confirmation_place: 'Nơi thêm sức',
  confirmation_book: 'Số sách thêm sức',
  notes: 'Ghi chú',
};

/** Alias cột (file cũ snake_case) — vẫn đọc được khi import */
const IMPORT_HEADER_ALIASES = {
  Ten_thanh: 'saint_name',
  Ho: 'first_name',
  Ten: 'last_name',
  Gioi_tinh: 'gender',
  Ngay_sinh: 'dob',
  Noi_sinh: 'pob',
  So_dien_thoai: 'phone',
  Dia_chi: 'address',
  Thon_xom: 'village',
  So_so_gia_dinh: 'family_number',
  Ten_thanh_cha: 'father_saint_name',
  Ho_ten_cha: 'father_name',
  Ten_thanh_me: 'mother_saint_name',
  Ho_ten_me: 'mother_name',
  Ngay_rua_toi: 'baptism_date',
  Noi_rua_toi: 'baptism_place',
  So_sach_rua_toi: 'baptism_book',
  Ngay_ruoc_le: 'first_communion_date',
  Noi_ruoc_le: 'first_communion_place',
  Ngay_them_suc: 'confirmation_date',
  Noi_them_suc: 'confirmation_place',
  So_sach_them_suc: 'confirmation_book',
  Ghi_chu: 'notes',
  STT: null,
  Stt: null,
};

const TEMPLATE_DATA_HEADERS = [
  'STT',
  IMPORT_HEADERS.saint_name,
  IMPORT_HEADERS.first_name,
  IMPORT_HEADERS.last_name,
  IMPORT_HEADERS.gender,
  IMPORT_HEADERS.dob,
  IMPORT_HEADERS.pob,
  IMPORT_HEADERS.phone,
  IMPORT_HEADERS.address,
  IMPORT_HEADERS.village,
  IMPORT_HEADERS.family_number,
  IMPORT_HEADERS.father_saint_name,
  IMPORT_HEADERS.father_name,
  IMPORT_HEADERS.mother_saint_name,
  IMPORT_HEADERS.mother_name,
  IMPORT_HEADERS.baptism_date,
  IMPORT_HEADERS.baptism_place,
  IMPORT_HEADERS.baptism_book,
  IMPORT_HEADERS.first_communion_date,
  IMPORT_HEADERS.first_communion_place,
  IMPORT_HEADERS.confirmation_date,
  IMPORT_HEADERS.confirmation_place,
  IMPORT_HEADERS.confirmation_book,
  IMPORT_HEADERS.notes,
];

const CLASS_LABEL = 'Lớp:';
const HEADER_MARKERS = new Set([
  IMPORT_HEADERS.gender.toLowerCase(),
  'gioi_tinh',
  'giới tính',
]);

function rawRowHasData(raw) {
  const n = normalizeRowKeys(raw);
  return Object.values(n).some((v) => {
    if (v == null || v === '') return false;
    if (v instanceof Date) return !Number.isNaN(v.getTime());
    return stripBom(v) !== '';
  });
}

const { resolvePersonCode } = require('../services/personCodeHelper');
const { studentScopeClause } = require('../services/accessScopeService');
const {
  assertClassAccess,
  assertBlockAccess,
  assertStudentAccess,
  denyForbidden,
} = require('../middlewares/accessScope');

function stripBom(str) {
  return String(str ?? '').replace(/^\uFEFF/, '').trim();
}

function cellStr(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = stripBom(v);
  return s === '' ? null : s;
}

function parseDateValue(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = stripBom(v);
  const dmY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmY) {
    const [, dd, mm, yyyy] = dmY;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return s;
  return null;
}

/** Chuẩn hóa giới tính về male/female (đồng bộ dashboard & seed) */
function normalizeGender(raw) {
  const s = stripBom(raw).toLowerCase();
  if (!s) return null;
  if (s === 'nam' || s === 'male' || s === 'm') return 'male';
  if (s === 'nữ' || s === 'nu' || s === 'female' || s === 'f') return 'female';
  return null;
}

function buildHeaderToFieldMap() {
  const map = new Map();
  for (const [field, label] of Object.entries(IMPORT_HEADERS)) {
    map.set(label.toLowerCase(), field);
  }
  for (const [alias, field] of Object.entries(IMPORT_HEADER_ALIASES)) {
    if (field) map.set(alias.toLowerCase(), field);
  }
  return map;
}

const HEADER_TO_FIELD = buildHeaderToFieldMap();

/** Đọc tên lớp (ô B2) và các dòng dữ liệu từ sheet có phần đầu mẫu mới */
function parseImportSheet(sheet) {
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
  if (!aoa.length) {
    return { className: null, rows: [], headerRowIndex: -1 };
  }

  let className = null;
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(aoa.length, 20); i += 1) {
    const row = aoa[i] || [];
    const col0 = stripBom(row[0]);
    const col0Lower = col0.toLowerCase();

    if (col0Lower.startsWith('lớp') || col0Lower.startsWith('lop')) {
      const inline = col0.replace(/^l[oớ]p\s*:\s*/i, '').trim();
      className = cellStr(row[1]) || (inline || null);
    }

    const headers = row.map((c) => stripBom(c));
    const hasGenderCol = headers.some((h) => HEADER_MARKERS.has(h.toLowerCase()));
    if (hasGenderCol) headerRowIndex = i;
  }

  if (headerRowIndex < 0) {
    return { className, rows: XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true }), headerRowIndex: 0 };
  }

  const headers = (aoa[headerRowIndex] || []).map((c) => stripBom(c));
  const rows = [];
  for (let i = headerRowIndex + 1; i < aoa.length; i += 1) {
    const line = aoa[i] || [];
    const obj = {};
    headers.forEach((h, j) => {
      if (h) obj[h] = line[j] ?? '';
    });
    rows.push(obj);
  }

  return { className, rows, headerRowIndex };
}

function normalizeRowKeys(rowObj) {
  const out = {};
  for (const [k, v] of Object.entries(rowObj)) {
    out[stripBom(k)] = v;
  }
  return out;
}

function pickRow(rowObj) {
  const n = normalizeRowKeys(rowObj);
  const r = {};
  for (const [header, value] of Object.entries(n)) {
    const field = HEADER_TO_FIELD.get(header.toLowerCase());
    if (field) r[field] = value;
  }
  return r;
}

/**
 * Lấy danh sách học viên kèm thông tin lớp học và niên học
 * GET /api/students
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { academic_year_id, block_id, class_id, search } = req.query;
    
    let query = `
      SELECT s.*, se.class_id, c.name as class_name, b.name as block_name, b.id as block_id
      FROM students s
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.deleted_at IS NULL
      LEFT JOIN classes c ON se.class_id = c.id
      LEFT JOIN blocks b ON c.block_id = b.id
      WHERE s.deleted_at IS NULL
    `;
    const params = [];

    if (academic_year_id) {
      query += ' AND se.academic_year_id = ?';
      params.push(academic_year_id);
    }

    if (block_id && block_id !== 'all') {
      query += ' AND b.id = ?';
      params.push(block_id);
    }

    if (class_id && class_id !== 'all') {
      query += ' AND se.class_id = ?';
      params.push(class_id);
    }

    if (search) {
      query += ' AND (s.saint_name LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.code LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    const scopeSql = studentScopeClause(req.accessScope, 'c');
    query += scopeSql.clause;
    params.push(...scopeSql.params);

    query += ' ORDER BY s.last_name ASC, s.first_name ASC';

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
 * Lấy chi tiết học viên
 * GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [students] = await db.query(`
      SELECT s.*, se.class_id, se.academic_year_id, c.name as class_name, b.name as block_name
      FROM students s
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.deleted_at IS NULL
      LEFT JOIN classes c ON se.class_id = c.id
      LEFT JOIN blocks b ON c.block_id = b.id
      WHERE s.id = ? AND s.deleted_at IS NULL
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });
    }

    if (!(await assertStudentAccess(req, res, id))) return;

    res.status(200).json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo học viên mới
 * POST /api/students
 */
const createStudent = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const id = uuidv4();
    const { 
      code, saint_name, first_name, last_name, gender, dob, pob, 
      phone, address, parish_id, village, family_number, 
      father_name, father_saint_name, mother_name, mother_saint_name,
      baptism_date, baptism_place, baptism_book,
      first_communion_date, first_communion_place,
      confirmation_date, confirmation_place, confirmation_book,
      status, avatar_url, notes,
      academic_year_id, class_id
    } = req.body;

    if (class_id && !(await assertClassAccess(req, res, class_id))) {
      await connection.rollback();
      connection.release();
      return;
    }
    if (req.body.block_id && !assertBlockAccess(req, res, req.body.block_id)) {
      await connection.rollback();
      connection.release();
      return;
    }

    const studentCode = await resolvePersonCode(connection, {
      table: 'students',
      providedCode: code,
    });

    // 1. Thêm vào bảng students
    await connection.query(`
      INSERT INTO students (
        id, code, saint_name, first_name, last_name, gender, dob, pob, 
        phone, address, parish_id, village, family_number, 
        father_name, father_saint_name, mother_name, mother_saint_name,
        baptism_date, baptism_place, baptism_book,
        first_communion_date, first_communion_place,
        confirmation_date, confirmation_place, confirmation_book,
        status, avatar_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, studentCode, saint_name, first_name, last_name, gender, dob, pob, 
      phone, address, parish_id, village, family_number, 
      father_name, father_saint_name, mother_name, mother_saint_name,
      baptism_date, baptism_place, baptism_book,
      first_communion_date, first_communion_place,
      confirmation_date, confirmation_place, confirmation_book,
      status || 'active', avatar_url, notes
    ]);

    // 2. Nếu có thông tin lớp học, tạo enrollment
    if (academic_year_id && class_id) {
      await connection.query(`
        INSERT INTO student_enrollments (id, student_id, class_id, academic_year_id)
        VALUES (?, ?, ?, ?)
      `, [uuidv4(), id, class_id, academic_year_id]);
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Thêm học viên thành công',
      data: { id, code: studentCode }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật học viên
 * PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { 
      code, saint_name, first_name, last_name, gender, dob, pob, 
      phone, address, parish_id, village, family_number, 
      father_name, father_saint_name, mother_name, mother_saint_name,
      baptism_date, baptism_place, baptism_book,
      first_communion_date, first_communion_place,
      confirmation_date, confirmation_place, confirmation_book,
      status, avatar_url, notes,
      academic_year_id, class_id
    } = req.body;

    if (!(await assertStudentAccess(req, res, id))) {
      await connection.rollback();
      connection.release();
      return;
    }
    if (class_id && !(await assertClassAccess(req, res, class_id))) {
      await connection.rollback();
      connection.release();
      return;
    }

    // 1. Cập nhật bảng students
    await connection.query(`
      UPDATE students SET 
        code = ?, saint_name = ?, first_name = ?, last_name = ?, gender = ?, 
        dob = ?, pob = ?, phone = ?, address = ?, parish_id = ?, 
        village = ?, family_number = ?, father_name = ?, father_saint_name = ?, 
        mother_name = ?, mother_saint_name = ?, baptism_date = ?, 
        baptism_place = ?, baptism_book = ?, first_communion_date = ?, 
        first_communion_place = ?, confirmation_date = ?, 
        confirmation_place = ?, confirmation_book = ?, 
        status = ?, avatar_url = ?, notes = ?
      WHERE id = ?
    `, [
      code, saint_name, first_name, last_name, gender, 
      dob, pob, phone, address, parish_id, 
      village, family_number, father_name, father_saint_name, 
      mother_name, mother_saint_name, baptism_date, 
      baptism_place, baptism_book, first_communion_date, 
      first_communion_place, confirmation_date, 
      confirmation_place, confirmation_book, 
      status, avatar_url, notes, id
    ]);

    // 2. Cập nhật enrollment nếu có thay đổi lớp học
    if (academic_year_id && class_id) {
      // Kiểm tra đã có enrollment chưa
      const [existing] = await connection.query(
        'SELECT id FROM student_enrollments WHERE student_id = ? AND academic_year_id = ? AND deleted_at IS NULL',
        [id, academic_year_id]
      );

      if (existing.length > 0) {
        await connection.query(
          'UPDATE student_enrollments SET class_id = ? WHERE id = ?',
          [class_id, existing[0].id]
        );
      } else {
        await connection.query(`
          INSERT INTO student_enrollments (id, student_id, class_id, academic_year_id)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), id, class_id, academic_year_id]);
      }
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Cập nhật học viên thành công'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Xóa học viên (soft delete)
 * DELETE /api/students/:id
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!(await assertStudentAccess(req, res, id))) return;
    await db.query('UPDATE students SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Đã xóa học viên'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tải file Excel mẫu import học viên (sheet dữ liệu + sheet tham chiếu giáo xứ)
 * GET /api/students/import-template
 */
const downloadImportTemplate = async (req, res, next) => {
  try {
    const academicYearId = req.query.academic_year_id || null;
    let classNames = [];
    if (academicYearId) {
      const [classRows] = await db.query(
        'SELECT name FROM classes WHERE academic_year_id = ? AND deleted_at IS NULL ORDER BY name ASC',
        [academicYearId]
      );
      classNames = classRows.map((c) => c.name);
    }

    const wb = XLSX.utils.book_new();
    const templateRows = [
      ['DANH SÁCH HỌC VIÊN — NHẬP TỰ ĐỘNG'],
      [CLASS_LABEL, ''],
      [
        'Ghi chú: Cột ngày tháng nhập theo định dạng Ngày/Tháng/Năm (ví dụ: 12/05/2007). Giới tính: nam hoặc nữ.',
      ],
      TEMPLATE_DATA_HEADERS,
    ];
    const wsMain = XLSX.utils.aoa_to_sheet(templateRows);
    wsMain['!cols'] = TEMPLATE_DATA_HEADERS.map((h) => ({
      wch: h === 'STT' ? 6 : Math.max(12, Math.min(22, h.length + 2)),
    }));
    XLSX.utils.book_append_sheet(wb, wsMain, 'Hoc_vien');

    if (classNames.length > 0) {
      const wsClasses = XLSX.utils.aoa_to_sheet([
        ['Tên lớp (tham khảo — điền vào ô cạnh "Lớp:" ở sheet Hoc_vien)'],
        ...classNames.map((n) => [n]),
      ]);
      wsClasses['!cols'] = [{ wch: 36 }];
      XLSX.utils.book_append_sheet(wb, wsClasses, 'Danh_sach_lop');
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="mau_import_hoc_vien.xlsx"');
    res.status(200).send(buf);
  } catch (error) {
    next(error);
  }
};

/**
 * Import học viên từ file Excel (multipart field: file)
 * POST /api/students/import
 */
const importStudents = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file Excel (.xlsx)' });
    }

    const academicYearId = stripBom(req.body?.academic_year_id) || null;
    if (!academicYearId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn niên học trên màn hình trước khi import',
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames.includes('Hoc_vien') ? 'Hoc_vien' : workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: 'File không có sheet dữ liệu' });
    }
    const sheet = workbook.Sheets[sheetName];
    const { className: classNameFromSheet, rows, headerRowIndex } = parseImportSheet(sheet);

    if (!classNameFromSheet) {
      return res.status(400).json({
        success: false,
        message: 'Chưa điền tên lớp ở ô cạnh "Lớp:" (dòng 2, sheet Hoc_vien)',
      });
    }

    const [classMatch] = await db.query(
      `SELECT id FROM classes
       WHERE academic_year_id = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?)) AND deleted_at IS NULL
       LIMIT 1`,
      [academicYearId, classNameFromSheet]
    );
    const class_id = classMatch[0]?.id || null;
    if (!class_id) {
      return res.status(400).json({
        success: false,
        message: `Không tìm thấy lớp "${classNameFromSheet}" trong niên học đã chọn`,
      });
    }

    const [ayFromClass] = await db.query(
      'SELECT academic_year_id FROM classes WHERE id = ? LIMIT 1',
      [class_id]
    );
    const enrollmentAcademicYearId = ayFromClass[0]?.academic_year_id || academicYearId;

    const imported = [];
    const errors = [];
    const dataStartRow = headerRowIndex >= 0 ? headerRowIndex + 2 : 2;
    let rowNum = dataStartRow - 1;

    for (const raw of rows) {
      rowNum += 1;
      if (!rawRowHasData(raw)) continue;

      const row = pickRow(raw);

      const saint_nameRaw = cellStr(row.saint_name);
      const saint_name = saint_nameRaw ? saint_nameRaw.slice(0, 50) : null;
      const first_name = (cellStr(row.first_name) || 'Học viên').slice(0, 100);
      const rawLast = cellStr(row.last_name) || saint_nameRaw || `Mới ${rowNum}`;
      const last_name = rawLast.slice(0, 50);

      const id = uuidv4();
      const gender = normalizeGender(row.gender);
      const status = 'active';
      const parish_id = null;
      const dob = parseDateValue(row.dob);
      const baptism_date = parseDateValue(row.baptism_date);
      const first_communion_date = parseDateValue(row.first_communion_date);
      const confirmation_date = parseDateValue(row.confirmation_date);

      const connection = await db.getConnection();
      await connection.beginTransaction();
      let code;
      try {
        code = await resolvePersonCode(connection, { table: 'students', providedCode: null });

        await connection.query(
          `INSERT INTO students (
            id, code, saint_name, first_name, last_name, gender, dob, pob,
            phone, address, parish_id, village, family_number,
            father_name, father_saint_name, mother_name, mother_saint_name,
            baptism_date, baptism_place, baptism_book,
            first_communion_date, first_communion_place,
            confirmation_date, confirmation_place, confirmation_book,
            status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            code,
            saint_name,
            first_name,
            last_name,
            gender,
            dob,
            cellStr(row.pob),
            cellStr(row.phone),
            cellStr(row.address),
            parish_id,
            cellStr(row.village),
            cellStr(row.family_number),
            cellStr(row.father_name),
            cellStr(row.father_saint_name),
            cellStr(row.mother_name),
            cellStr(row.mother_saint_name),
            baptism_date,
            cellStr(row.baptism_place),
            cellStr(row.baptism_book),
            first_communion_date,
            cellStr(row.first_communion_place),
            confirmation_date,
            cellStr(row.confirmation_place),
            cellStr(row.confirmation_book),
            status,
            cellStr(row.notes),
          ]
        );

        await connection.query(
          `INSERT INTO student_enrollments (id, student_id, class_id, academic_year_id)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), id, class_id, enrollmentAcademicYearId]
        );

        await connection.commit();
        imported.push({ row: rowNum, code, id });
      } catch (e) {
        await connection.rollback();
        errors.push({ row: rowNum, code, message: e.message || 'Lỗi khi lưu dòng' });
      } finally {
        connection.release();
      }
    }

    if (imported.length === 0 && errors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dòng nào có dữ liệu (điền ít nhất một ô trong sheet, không cần mã hay khóa ngoại)',
      });
    }

    res.status(200).json({
      success: true,
      message: `Đã import ${imported.length} học viên${errors.length ? `, ${errors.length} dòng lỗi` : ''}`,
      data: { imported: imported.length, errors },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Tra cứu học viên và điểm số công khai (không cần login)
 * GET /api/students/public/lookup?code=... hoặc ?name=...
 */
const lookupStudentPublic = async (req, res, next) => {
  try {
    const { code, name } = req.query;
    const searchQuery = code || name;
    
    if (!searchQuery) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã hoặc tên học viên' });
    }

    let whereClause = '';
    let params = [];

    // Nếu là mã (xác định bằng độ dài hoặc format)
    if (code && /^[A-Za-z0-9\-]{5,}$/.test(code)) {
      whereClause = `LOWER(TRIM(s.code)) = LOWER(TRIM(?))`;
      params = [code.trim()];
    } else if (name) {
      // Tìm theo tên
      const namePattern = `%${name.trim()}%`;
      whereClause = `(
        CONCAT(s.first_name, ' ', s.last_name) LIKE ?
        OR CONCAT(s.last_name, ' ', s.first_name) LIKE ?
        OR s.first_name LIKE ?
        OR s.last_name LIKE ?
        OR s.saint_name LIKE ?
      )`;
      params = [namePattern, namePattern, namePattern, namePattern, namePattern];
    } else {
      // Cố gắng tìm theo cả mã và tên
      const pattern = `%${searchQuery.trim()}%`;
      whereClause = `(
        LOWER(TRIM(s.code)) = LOWER(TRIM(?))
        OR CONCAT(s.first_name, ' ', s.last_name) LIKE ?
        OR CONCAT(s.last_name, ' ', s.first_name) LIKE ?
        OR s.first_name LIKE ?
        OR s.last_name LIKE ?
        OR s.saint_name LIKE ?
      )`;
      params = [searchQuery.trim(), pattern, pattern, pattern, pattern, pattern];
    }

    // 1. Tìm thông tin học viên
    const [students] = await db.query(`
      SELECT s.id, s.code, s.saint_name, s.first_name, s.last_name, s.gender, s.dob, s.pob, s.phone, s.address, s.status, s.avatar_url,
             c.id as class_id, c.name as class_name, b.name as block_name, ay.id as academic_year_id, ay.name as academic_year_name
      FROM students s
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.deleted_at IS NULL
      LEFT JOIN classes c ON se.class_id = c.id
      LEFT JOIN blocks b ON c.block_id = b.id
      LEFT JOIN academic_years ay ON se.academic_year_id = ay.id
      WHERE ${whereClause} AND s.deleted_at IS NULL
      ORDER BY ay.created_at DESC
    `, params);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên với thông tin đã nhập' });
    }

    const studentInfo = students[0];

    // Lấy danh sách lớp/niên học đã học
    const enrollments = students.map(s => ({
      class_id: s.class_id,
      class_name: s.class_name,
      block_name: s.block_name,
      academic_year_id: s.academic_year_id,
      academic_year_name: s.academic_year_name
    })).filter(e => e.class_id !== null);

    // 2. Với mỗi lớp/niên học, tìm các học kỳ và tính điểm chi tiết cho học viên này
    const termResults = [];
    const { computeSemesterGradesData } = require('./gradeController');

    for (const enrollment of enrollments) {
      // Tìm các học kỳ của niên học này
      const [semesters] = await db.query(`
        SELECT id, name, semester_number
        FROM semesters
        WHERE academic_year_id = ? AND deleted_at IS NULL
        ORDER BY semester_number ASC
      `, [enrollment.academic_year_id]);

      for (const sem of semesters) {
        try {
          const semData = await computeSemesterGradesData(enrollment.class_id, sem.id);
          const studentSemGrade = semData.students.find(s => s.id === studentInfo.id);

          if (studentSemGrade) {
            // Lấy điểm số chi tiết (academic) cho học kỳ này của học viên
            const [scores] = await db.query(`
              SELECT s.score_value, s.score_order, st.name as score_type_name, st.code as score_type_code, st.id as score_type_id
              FROM scores s
              JOIN score_types st ON s.score_type_id = st.id
              WHERE s.student_id = ? AND s.class_id = ? AND s.semester_id = ? AND s.score_category = 'academic' AND s.deleted_at IS NULL
              ORDER BY st.display_position ASC, s.score_order ASC
            `, [studentInfo.id, enrollment.class_id, sem.id]);

            termResults.push({
              academic_year_id: enrollment.academic_year_id,
              academic_year_name: enrollment.academic_year_name,
              class_id: enrollment.class_id,
              class_name: enrollment.class_name,
              block_name: enrollment.block_name,
              semester_id: sem.id,
              semester_name: sem.name,
              summary: {
                mass_present: studentSemGrade.mass_present,
                catechism_present: studentSemGrade.catechism_present,
                mass_absent: studentSemGrade.mass_absent,
                catechism_absent: studentSemGrade.catechism_absent,
                tl: studentSemGrade.tl,
                gl: studentSemGrade.gl,
                ethics_score: studentSemGrade.ethics_score,
                dcc: studentSemGrade.dcc,
                dhl: studentSemGrade.dhl,
                tbhk: studentSemGrade.tbhk,
                is_controlled: studentSemGrade.is_controlled,
                warnings: studentSemGrade.warnings
              },
              configs: semData.settings,
              attendance_config: semData.attendance_config,
              detailed_scores: scores
            });
          }
        } catch (err) {
          console.error(`Error computing grades for class ${enrollment.class_id} sem ${sem.id}:`, err);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: studentInfo.id,
          code: studentInfo.code,
          saint_name: studentInfo.saint_name,
          first_name: studentInfo.first_name,
          last_name: studentInfo.last_name,
          gender: studentInfo.gender,
          dob: studentInfo.dob,
          pob: studentInfo.pob,
          phone: studentInfo.phone,
          address: studentInfo.address,
          status: studentInfo.status,
          avatar_url: studentInfo.avatar_url,
        },
        enrollments,
        semester_grades: termResults
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lookupStudentPublic,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  downloadImportTemplate,
  importStudents,
};
