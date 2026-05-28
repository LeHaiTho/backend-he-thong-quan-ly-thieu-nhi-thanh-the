const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { loadAcademicScoreTypes, buildDefaultConfigs } = require('../services/scoreConfigHelper');
const {
  ETHICS_SCORE_TYPE_CODE,
  ensureEthicsScoreType,
} = require('../services/ethicsScoreTypeHelper');
const { assertClassAccess } = require('../middlewares/accessScope');

/**
 * Lấy danh sách học viên và điểm số của một lớp trong một học kỳ
 * GET /api/scores
 */
const getScoresByClass = async (req, res, next) => {
  try {
    const { class_id, semester_id } = req.query;

    if (!class_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc semester_id' });
    }
    if (!(await assertClassAccess(req, res, class_id))) return;

    // 1. Lấy danh sách học viên trong lớp
    const [students] = await db.query(`
      SELECT s.id, s.code, s.saint_name, s.first_name, s.last_name, s.dob, s.status
      FROM students s
      JOIN student_enrollments se ON s.id = se.student_id AND se.deleted_at IS NULL
      WHERE se.class_id = ? AND s.deleted_at IS NULL
      ORDER BY s.first_name ASC, s.last_name ASC
    `, [class_id]);

    const ethicsType = await ensureEthicsScoreType(db);
    const ethicsTypeId = ethicsType?.id ?? null;

    // 2. Lấy điểm số hiện có
    const [scores] = await db.query(`
      SELECT * FROM scores 
      WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL
    `, [class_id, semester_id]);

    // 3. Lấy cấu hình điểm để biết số cột và hệ số
    const [configs] = await db.query(
      `SELECT sc.*, st.code AS score_type_code, st.name AS score_type_name, st.display_position
       FROM score_configs sc
       JOIN score_types st ON sc.score_type_id = st.id
       WHERE sc.class_id = ? AND sc.semester_id = ? AND sc.deleted_at IS NULL
         AND UPPER(st.code) != 'DD'
       ORDER BY st.display_position ASC`,
      [class_id, semester_id]
    );

    let resolvedConfigs = configs;
    if (resolvedConfigs.length === 0) {
      const types = await loadAcademicScoreTypes(db);
      resolvedConfigs = buildDefaultConfigs(types).map((c) => ({
        id: null,
        class_id,
        semester_id,
        score_type_id: c.score_type_id,
        score_type_code: c.score_type_code,
        score_type_name: c.score_type_name,
        column_count: c.column_count,
        weight_factor: c.weight_factor,
        academic_percentage: 60,
        diligence_percentage: 40,
        control_score: 2.5,
      }));
    }

    // Tổ chức lại dữ liệu điểm theo student_id
    const studentScores = {};
    students.forEach(student => {
      studentScores[student.id] = {
        ...student,
        scores: {},
        ethics_score: null,
      };
    });

    scores.forEach(score => {
      if (!studentScores[score.student_id]) return;

      if (
        ethicsTypeId &&
        score.score_type_id === ethicsTypeId &&
        score.score_category === 'diligence'
      ) {
        studentScores[score.student_id].ethics_score =
          score.score_value != null ? parseFloat(score.score_value) : null;
        return;
      }

      if (score.score_category !== 'academic') return;

      if (!studentScores[score.student_id].scores[score.score_type_id]) {
        studentScores[score.student_id].scores[score.score_type_id] = [];
      }
      studentScores[score.student_id].scores[score.score_type_id][score.score_order - 1] =
        score.score_value;
    });

    res.status(200).json({
      success: true,
      data: {
        students: Object.values(studentScores),
        configs: resolvedConfigs,
        configs_from_defaults: configs.length === 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lưu/Cập nhật điểm số hàng loạt
 * POST /api/scores/bulk
 */
const saveBulkScores = async (req, res, next) => {
  const { class_id, semester_id, student_scores, ethics_only } = req.body;

  if (!class_id || !semester_id || !Array.isArray(student_scores)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
  }
  if (!(await assertClassAccess(req, res, class_id))) return;

  if (ethics_only) {
    return saveEthicsScores(req, res, next);
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Xóa điểm cũ của các học viên này trong lớp/học kỳ này
    // Để đơn giản và chính xác, ta xóa hết rồi insert lại
    const studentIds = student_scores.map(s => s.student_id);
    if (studentIds.length > 0) {
      await connection.query(
        `DELETE FROM scores
         WHERE class_id = ? AND semester_id = ? AND student_id IN (?)
           AND score_category = 'academic'`,
        [class_id, semester_id, studentIds]
      );
    }

    // 2. Insert điểm mới
    for (const studentData of student_scores) {
      const { student_id, scores } = studentData;
      
      // scores là object: { score_type_id: [val1, val2, ...] }
      for (const score_type_id in scores) {
        const values = scores[score_type_id];
        if (Array.isArray(values)) {
          for (let i = 0; i < values.length; i++) {
            const val = values[i];
            if (val !== null && val !== undefined && val !== '') {
              await connection.query(`
                INSERT INTO scores (
                  id, student_id, class_id, semester_id, score_type_id, 
                  score_category, score_value, score_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                uuidv4(),
                student_id,
                class_id,
                semester_id,
                score_type_id,
                'academic', // Mặc định là học lực
                val,
                i + 1 // score_order bắt đầu từ 1
              ]);
            }
          }
        }
      }
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Lưu điểm thành công'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Lưu điểm đạo đức (Đđ) hàng loạt
 * PUT /api/scores/ethics
 */
const saveEthicsScores = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { class_id, semester_id, student_scores } = req.body;

    if (!class_id || !semester_id || !Array.isArray(student_scores)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }
    if (!(await assertClassAccess(req, res, class_id))) {
      await connection.rollback();
      connection.release();
      return;
    }

    const ethicsType = await ensureEthicsScoreType(connection);
    const ethicsTypeId = ethicsType.id;
    const studentIds = student_scores.map((s) => s.student_id);

    if (studentIds.length > 0) {
      await connection.query(
        `DELETE FROM scores
         WHERE class_id = ? AND semester_id = ? AND score_type_id = ?
           AND score_category = 'diligence' AND student_id IN (?)`,
        [class_id, semester_id, ethicsTypeId, studentIds]
      );
    }

    for (const row of student_scores) {
      const val = row.ethics_score ?? row.score_value;
      if (val === null || val === undefined || val === '') continue;

      await connection.query(
        `INSERT INTO scores (
          id, student_id, class_id, semester_id, score_type_id,
          score_category, score_value, score_order
        ) VALUES (?, ?, ?, ?, ?, 'diligence', ?, 1)`,
        [uuidv4(), row.student_id, class_id, semester_id, ethicsTypeId, val]
      );
    }

    await connection.commit();
    res.status(200).json({ success: true, message: 'Lưu điểm đạo đức thành công' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getScoresByClass,
  saveBulkScores,
  saveEthicsScores,
};

