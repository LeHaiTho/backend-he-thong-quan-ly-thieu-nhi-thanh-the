const db = require('../config/db');
const { parseAttendanceConfigRows } = require('../services/attendanceConfigHelper');
const {
  countPresentByType,
  countAbsences,
  computeDiligenceScore,
  computeAcademicScore,
  computeSemesterAverage,
  computeYearAverage,
  evaluatePromotion,
} = require('../services/gradeCalculationService');

const { ensureEthicsScoreType } = require('../services/ethicsScoreTypeHelper');

async function loadGlobalScoreSettings(class_id, semester_id) {
  const [configs] = await db.query(
    `SELECT academic_percentage, diligence_percentage, control_score
     FROM score_configs
     WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL
     LIMIT 1`,
    [class_id, semester_id]
  );
  const row = configs[0] || {};
  return {
    academic_percentage: row.academic_percentage ?? 60,
    diligence_percentage: row.diligence_percentage ?? 40,
    control_score: row.control_score ?? 2.5,
  };
}

async function loadAcademicScoreConfigs(class_id, semester_id) {
  const [configs] = await db.query(
    `SELECT sc.*, st.code AS score_type_code
     FROM score_configs sc
     JOIN score_types st ON st.id = sc.score_type_id
     WHERE sc.class_id = ? AND sc.semester_id = ? AND sc.deleted_at IS NULL
       AND UPPER(st.code) != 'DD'
     ORDER BY st.display_position ASC`,
    [class_id, semester_id]
  );
  return configs;
}

async function loadEthicsScores(class_id, semester_id, studentIds) {
  if (studentIds.length === 0) return {};

  const ethicsType = await ensureEthicsScoreType(db);
  const ethicsTypeId = ethicsType.id;
  const [scores] = await db.query(
    `SELECT student_id, score_value FROM scores
     WHERE class_id = ? AND semester_id = ? AND score_type_id = ?
       AND score_category = 'diligence' AND deleted_at IS NULL
       AND student_id IN (?)`,
    [class_id, semester_id, ethicsTypeId, studentIds]
  );

  const map = {};
  scores.forEach((s) => {
    map[s.student_id] = s.score_value != null ? parseFloat(s.score_value) : null;
  });
  return map;
}

function buildStudentAcademicScores(scoresRows, academicConfigs) {
  const byStudent = {};
  const academicTypeIds = new Set(academicConfigs.map((c) => c.score_type_id));

  scoresRows.forEach((score) => {
    if (!academicTypeIds.has(score.score_type_id)) return;
    if (!byStudent[score.student_id]) byStudent[score.student_id] = {};
    if (!byStudent[score.student_id][score.score_type_id]) {
      byStudent[score.student_id][score.score_type_id] = [];
    }
    byStudent[score.student_id][score.score_type_id][score.score_order - 1] = score.score_value;
  });
  return byStudent;
}

async function computeSemesterGradesData(class_id, semester_id) {
  const [students] = await db.query(
    `SELECT s.id, s.code, s.saint_name, s.first_name, s.last_name
     FROM students s
     JOIN student_enrollments se ON se.student_id = s.id AND se.deleted_at IS NULL
     WHERE se.class_id = ? AND s.deleted_at IS NULL
     ORDER BY s.first_name, s.last_name`,
    [class_id]
  );

  const studentIds = students.map((s) => s.id);

  const [configRows] = await db.query(
    `SELECT * FROM attendance_configs
     WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL`,
    [class_id, semester_id]
  );
  const attendanceConfig = parseAttendanceConfigRows(configRows);

  const [records] = studentIds.length
    ? await db.query(
        `SELECT * FROM attendance_records
         WHERE class_id = ? AND semester_id = ? AND student_id IN (?)
           AND deleted_at IS NULL`,
        [class_id, semester_id, studentIds]
      )
    : [[]];

  const recordsByStudent = {};
  records.forEach((r) => {
    if (!recordsByStudent[r.student_id]) recordsByStudent[r.student_id] = [];
    recordsByStudent[r.student_id].push(r);
  });

  const globalSettings = await loadGlobalScoreSettings(class_id, semester_id);
  const academicConfigs = await loadAcademicScoreConfigs(class_id, semester_id);

  const [allScores] = studentIds.length
    ? await db.query(
        `SELECT * FROM scores
         WHERE class_id = ? AND semester_id = ? AND student_id IN (?)
           AND score_category = 'academic' AND deleted_at IS NULL`,
        [class_id, semester_id, studentIds]
      )
    : [[]];

  const academicByStudent = buildStudentAcademicScores(allScores, academicConfigs);
  const ethicsByStudent = await loadEthicsScores(class_id, semester_id, studentIds);

  const results = students.map((student) => {
    const studentRecords = recordsByStudent[student.id] || [];
    const { mass, catechism } = countPresentByType(studentRecords, attendanceConfig);
    const absences = countAbsences(studentRecords, attendanceConfig);

    const diligence = computeDiligenceScore({
      massPresent: mass,
      catechismPresent: catechism,
      massRequired: attendanceConfig.mass_required,
      catechismRequired: attendanceConfig.catechism_required,
      ethicsScore: ethicsByStudent[student.id],
      disableEthicsScore: attendanceConfig.disable_ethics_score,
      diligencePercentage: globalSettings.diligence_percentage,
    });

    const academic = computeAcademicScore(
      academicConfigs,
      academicByStudent[student.id] || {},
      globalSettings.academic_percentage
    );

    const semester = computeSemesterAverage(academic.dhl, diligence.dcc);

    const warnings = [];
    if (absences.massAbsent > attendanceConfig.mass_allowed_absence) {
      warnings.push('Vượt số buổi nghỉ Thánh lễ cho phép');
    }
    if (absences.catechismAbsent > attendanceConfig.catechism_allowed_absence) {
      warnings.push('Vượt số buổi nghỉ Giáo lý cho phép');
    }

    return {
      ...student,
      mass_present: mass,
      catechism_present: catechism,
      mass_absent: absences.massAbsent,
      catechism_absent: absences.catechismAbsent,
      tl: diligence.tl,
      gl: diligence.gl,
      ethics_score: diligence.ethics,
      dcc: diligence.dcc,
      dhl: academic.dhl,
      tbhk: semester.tbhk,
      is_controlled: diligence.dcc < globalSettings.control_score,
      warnings,
    };
  });

  return {
    students: results,
    settings: globalSettings,
    attendance_config: {
      mass_required: attendanceConfig.mass_required,
      catechism_required: attendanceConfig.catechism_required,
      mass_allowed_absence: attendanceConfig.mass_allowed_absence,
      catechism_allowed_absence: attendanceConfig.catechism_allowed_absence,
      count_all_mass_days: attendanceConfig.count_all_mass_days,
      disable_ethics_score: attendanceConfig.disable_ethics_score,
    },
  };
}

/**
 * GET /api/grades/semester?class_id=&semester_id=
 */
const getSemesterGrades = async (req, res, next) => {
  try {
    const { class_id, semester_id } = req.query;
    if (!class_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc semester_id' });
    }

    const data = await computeSemesterGradesData(class_id, semester_id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/grades/year?class_id=&academic_year_id=
 */
const getYearGrades = async (req, res, next) => {
  try {
    const { class_id, academic_year_id } = req.query;
    if (!class_id || !academic_year_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc academic_year_id' });
    }

    const [semesters] = await db.query(
      `SELECT id, name, semester_number FROM semesters
       WHERE academic_year_id = ? AND deleted_at IS NULL
       ORDER BY semester_number ASC`,
      [academic_year_id]
    );

    const semesterGrades = {};
    for (const sem of semesters) {
      semesterGrades[sem.id] = await computeSemesterGradesData(class_id, sem.id);
    }

    const firstSem = semesters[0];
    const controlScore = firstSem
      ? semesterGrades[firstSem.id]?.settings?.control_score ?? 2.5
      : 2.5;

    const studentMap = new Map();
    for (const sem of semesters) {
      const block = semesterGrades[sem.id];
      if (!block) continue;
      block.students.forEach((s) => {
        if (!studentMap.has(s.id)) {
          studentMap.set(s.id, { ...s });
        }
      });
    }

    const yearResults = Array.from(studentMap.values()).map((student) => {
      const tbhkBySem = semesters.map((sem) => {
        const row = semesterGrades[sem.id]?.students?.find((s) => s.id === student.id);
        return row ? parseFloat(row.tbhk) : 0;
      });
      const dccBySem = semesters.map((sem) => {
        const row = semesterGrades[sem.id]?.students?.find((s) => s.id === student.id);
        return row ? parseFloat(row.dcc) : 0;
      });

      const tbhk1 = tbhkBySem[0] || 0;
      const tbhk2 = tbhkBySem[1] || 0;
      const dcc1 = dccBySem[0] || 0;
      const dcc2 = dccBySem[1] || 0;

      const year = computeYearAverage(tbhk1, tbhk2);
      const promotion = evaluatePromotion({
        tbcn: year.tbcn,
        dccSemester1: dcc1,
        dccSemester2: dcc2,
        controlScore,
      });

      return {
        id: student.id,
        code: student.code,
        saint_name: student.saint_name,
        first_name: student.first_name,
        last_name: student.last_name,
        tbhk_semester_1: tbhk1,
        tbhk_semester_2: tbhk2,
        dcc_semester_1: dcc1,
        dcc_semester_2: dcc2,
        tbcn: year.tbcn,
        classification: promotion.label,
        promotion_result: promotion.promotionResult,
        is_controlled: promotion.isControlled,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        students: yearResults,
        semesters,
        control_score: controlScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSemesterGrades,
  getYearGrades,
  computeSemesterGradesData,
};
