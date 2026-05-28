const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const {
  ACADEMIC_TYPE_EXCLUDE,
  loadAcademicScoreTypes,
  buildDefaultConfigs,
} = require('../services/scoreConfigHelper');

const { ensureEthicsScoreType } = require('../services/ethicsScoreTypeHelper');

/**
 * Cấu hình chuyên cần: loại điểm Đạo đức (DD) + cờ tắt cột Đđ từ attendance_configs.
 */
async function loadDiligenceSettings(class_id, semester_id) {
  const ethicsType = await ensureEthicsScoreType(db);

  const [attRows] = await db.query(
    `SELECT disable_ethics_score FROM attendance_configs
     WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL
     LIMIT 1`,
    [class_id, semester_id]
  );

  const disable_ethics_score =
    attRows[0]?.disable_ethics_score === 1 || attRows[0]?.disable_ethics_score === true;

  return {
    ethics_score_type: {
      id: ethicsType.id,
      name: ethicsType.name,
      code: ethicsType.code,
      display_position: ethicsType.display_position,
    },
    disable_ethics_score,
  };
}

/**
 * Lấy cấu hình điểm theo lớp và học kỳ (+ loại điểm có thể thêm)
 * GET /api/score-configs
 */
const getScoreConfigs = async (req, res, next) => {
  try {
    const { class_id, semester_id } = req.query;

    if (!class_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc semester_id' });
    }

    const allTypes = await loadAcademicScoreTypes(db);

    const [savedRows] = await db.query(
      `SELECT sc.*, st.name AS score_type_name, st.code AS score_type_code, st.display_position
       FROM score_configs sc
       JOIN score_types st ON sc.score_type_id = st.id
       WHERE sc.class_id = ? AND sc.semester_id = ? AND sc.deleted_at IS NULL
         AND UPPER(st.code) NOT IN (${ACADEMIC_TYPE_EXCLUDE.map(() => '?').join(',')})
       ORDER BY st.display_position ASC`,
      [class_id, semester_id, ...ACADEMIC_TYPE_EXCLUDE]
    );

    const global_settings =
      savedRows.length > 0
        ? {
            academic_percentage: savedRows[0].academic_percentage ?? 60,
            diligence_percentage: savedRows[0].diligence_percentage ?? 40,
            control_score: savedRows[0].control_score ?? 2.5,
          }
        : {
            academic_percentage: 60,
            diligence_percentage: 40,
            control_score: 2.5,
          };

    const configs =
      savedRows.length > 0
        ? savedRows.map((c) => ({
            score_type_id: c.score_type_id,
            score_type_name: c.score_type_name,
            score_type_code: c.score_type_code,
            column_count: c.column_count,
            weight_factor: c.weight_factor,
            is_active: true,
            is_default_template: false,
          }))
        : buildDefaultConfigs(allTypes);

    const activeIds = new Set(configs.map((c) => c.score_type_id));
    const available_types = allTypes
      .filter((t) => !activeIds.has(t.id))
      .map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        display_position: t.display_position,
      }));

    const diligence_settings = await loadDiligenceSettings(class_id, semester_id);

    res.status(200).json({
      success: true,
      data: {
        configs,
        available_types,
        global_settings,
        diligence_settings,
        is_class_configured: savedRows.length > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lưu/Cập nhật cấu hình điểm (chỉ các cột đang bật)
 * POST /api/score-configs/bulk
 */
const saveScoreConfigs = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { class_id, semester_id, configs, global_settings: globalFromBody } = req.body;

    if (!class_id || !semester_id || !Array.isArray(configs)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    const activeConfigs = configs.filter(
      (c) => c.is_active !== false && c.score_type_id && (c.column_count ?? 0) > 0
    );

    if (activeConfigs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất một cột điểm học lực',
      });
    }

    const gs = globalFromBody || {};
    const academicPct = gs.academic_percentage ?? configs[0]?.academic_percentage ?? 60;
    const diligencePct = gs.diligence_percentage ?? configs[0]?.diligence_percentage ?? 40;
    const controlScore = gs.control_score ?? configs[0]?.control_score ?? 2.5;

    await connection.query('DELETE FROM score_configs WHERE class_id = ? AND semester_id = ?', [
      class_id,
      semester_id,
    ]);

    for (const config of activeConfigs) {
      await connection.query(
        `INSERT INTO score_configs (
          id, class_id, semester_id, score_type_id, column_count, weight_factor,
          academic_percentage, diligence_percentage, control_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          class_id,
          semester_id,
          config.score_type_id,
          config.column_count || 1,
          config.weight_factor ?? 1,
          academicPct,
          diligencePct,
          controlScore,
        ]
      );
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Lưu cấu hình điểm thành công',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getScoreConfigs,
  saveScoreConfigs,
  loadDiligenceSettings,
};
