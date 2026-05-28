const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Lấy danh sách niên học kèm học kỳ
 * GET /api/academic-years
 */
const getAllAcademicYears = async (req, res, next) => {
  try {
    const [years] = await db.query(`
      SELECT * FROM academic_years WHERE deleted_at IS NULL ORDER BY name DESC
    `);

    // Lấy học kỳ cho từng niên học
    const yearsWithSemesters = await Promise.all(years.map(async (year) => {
      const [semesters] = await db.query(
        'SELECT * FROM semesters WHERE academic_year_id = ? AND deleted_at IS NULL ORDER BY semester_number ASC',
        [year.id]
      );
      return { ...year, semesters };
    }));

    res.status(200).json({
      success: true,
      data: yearsWithSemesters
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo niên học mới và 2 học kỳ mặc định
 * POST /api/academic-years
 */
const createAcademicYear = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { name, note, semesters } = req.body;

    // 1. Kiểm tra trùng tên
    const [existing] = await connection.query('SELECT id FROM academic_years WHERE name = ? AND deleted_at IS NULL', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên niên học đã tồn tại' });
    }

    // 2. Tạo niên học
    const yearId = uuidv4();
    await connection.query(
      'INSERT INTO academic_years (id, name, note) VALUES (?, ?, ?)',
      [yearId, name, note]
    );

    // 3. Tạo 2 học kỳ
    if (semesters && semesters.length === 2) {
      for (const sem of semesters) {
        await connection.query(
          'INSERT INTO semesters (id, academic_year_id, name, semester_number, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), yearId, sem.name, sem.semester_number, sem.start_date, sem.end_date]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Tạo niên học thành công' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật niên học và học kỳ
 * PUT /api/academic-years/:id
 */
const updateAcademicYear = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { name, note, semesters } = req.body;

    // 1. Cập nhật niên học
    await connection.query(
      'UPDATE academic_years SET name = ?, note = ? WHERE id = ?',
      [name, note, id]
    );

    // 2. Cập nhật học kỳ
    if (semesters && semesters.length > 0) {
      for (const sem of semesters) {
        await connection.query(
          'UPDATE semesters SET start_date = ?, end_date = ? WHERE id = ?',
          [sem.start_date, sem.end_date, sem.id]
        );
      }
    }

    await connection.commit();
    res.status(200).json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Kích hoạt niên học hiện tại
 * PATCH /api/academic-years/:id/activate
 */
const activateAcademicYear = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;

    // 1. Tắt tất cả niên học khác
    await connection.query('UPDATE academic_years SET is_current = FALSE');

    // 2. Kích hoạt niên học được chọn
    await connection.query('UPDATE academic_years SET is_current = TRUE WHERE id = ?', [id]);

    await connection.commit();
    res.status(200).json({ success: true, message: 'Kích hoạt niên học thành công' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Xóa niên học (soft delete)
 * DELETE /api/academic-years/:id
 */
const deleteAcademicYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE academic_years SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Đã xóa niên học' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  deleteAcademicYear
};
