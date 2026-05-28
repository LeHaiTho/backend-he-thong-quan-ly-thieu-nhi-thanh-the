const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const {
  parseAttendanceConfigRows,
  isDateEnabledForType,
  isAttendanceConfigComplete,
  DAY_NAMES,
  getDayOfWeek,
} = require('../services/attendanceConfigHelper');

/**
 * Lấy cấu hình chuyên cần theo lớp và học kỳ
 * GET /api/attendance-configs
 */
const getAttendanceConfigs = async (req, res, next) => {
  try {
    const { class_id, semester_id } = req.query;

    if (!class_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc semester_id' });
    }

    const [configs] = await db.query(
      'SELECT * FROM attendance_configs WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL',
      [class_id, semester_id]
    );

    res.status(200).json({
      success: true,
      data: configs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lưu/Cập nhật cấu hình chuyên cần
 * POST /api/attendance-configs/bulk
 */
const saveAttendanceConfigs = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { class_id, semester_id, configs, global_settings } = req.body;

    if (!class_id || !semester_id || !Array.isArray(configs)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    // 1. Xóa cấu hình cũ
    await connection.query(
      'DELETE FROM attendance_configs WHERE class_id = ? AND semester_id = ?',
      [class_id, semester_id]
    );

    // 2. Thêm cấu hình mới cho từng ngày và loại (mass/catechism)
    for (const config of configs) {
      await connection.query(`
        INSERT INTO attendance_configs (
          id, class_id, semester_id, config_type, day_of_week, 
          is_enabled, start_time, end_time, required_count, allowed_absence,
          count_all_mass_days, disable_ethics_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        class_id,
        semester_id,
        config.config_type,
        config.day_of_week,
        config.is_enabled ? 1 : 0,
        config.start_time || null,
        config.end_time || null,
        config.required_count || 0,
        config.allowed_absence || 0,
        global_settings?.count_all_mass_days ? 1 : 0,
        global_settings?.disable_ethics_score ? 1 : 0
      ]);
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Lưu cấu hình chuyên cần thành công'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Trạng thái cấu hình + kiểm tra ngày có trong lịch (dùng trước khi điểm danh)
 * GET /api/attendance-configs/status
 */
const getAttendanceConfigStatus = async (req, res, next) => {
  try {
    const { class_id, semester_id, attendance_date, attendance_type } = req.query;

    if (!class_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'Thiếu class_id hoặc semester_id' });
    }

    const [configRows] = await db.query(
      'SELECT * FROM attendance_configs WHERE class_id = ? AND semester_id = ? AND deleted_at IS NULL',
      [class_id, semester_id]
    );

    const parsed = parseAttendanceConfigRows(configRows);
    const is_configured = configRows.length > 0 && isAttendanceConfigComplete(parsed);

    let is_date_enabled = null;
    let day_label = null;
    if (attendance_date && attendance_type && attendance_type !== 'all') {
      const dow = getDayOfWeek(attendance_date);
      day_label = DAY_NAMES[dow];
      is_date_enabled = isDateEnabledForType(parsed, attendance_date, attendance_type);
    }

    res.status(200).json({
      success: true,
      data: {
        is_configured,
        is_date_enabled,
        day_label,
        mass_required: parsed.mass_required,
        catechism_required: parsed.catechism_required,
        count_all_mass_days: parsed.count_all_mass_days,
        disable_ethics_score: parsed.disable_ethics_score,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceConfigs,
  saveAttendanceConfigs,
  getAttendanceConfigStatus,
};
