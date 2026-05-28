/**
 * Parse attendance_configs rows (7 days × 2 types) into structured config for grade service.
 */
function parseAttendanceConfigRows(rows) {
  const massSchedule = Array.from({ length: 7 }, () => ({ is_enabled: false }));
  const catechismSchedule = Array.from({ length: 7 }, () => ({ is_enabled: false }));

  let mass_required = 0;
  let mass_allowed_absence = 0;
  let catechism_required = 0;
  let catechism_allowed_absence = 0;
  let count_all_mass_days = false;
  let disable_ethics_score = false;

  for (const c of rows || []) {
    const day = c.day_of_week;
    const enabled = c.is_enabled === 1 || c.is_enabled === true;

    if (c.config_type === 'mass' && day >= 0 && day <= 6) {
      massSchedule[day] = { is_enabled: enabled };
      mass_required = c.required_count ?? mass_required;
      mass_allowed_absence = c.allowed_absence ?? mass_allowed_absence;
    } else if (c.config_type === 'catechism' && day >= 0 && day <= 6) {
      catechismSchedule[day] = { is_enabled: enabled };
      catechism_required = c.required_count ?? catechism_required;
      catechism_allowed_absence = c.allowed_absence ?? catechism_allowed_absence;
    }

    if (c.count_all_mass_days === 1 || c.count_all_mass_days === true) {
      count_all_mass_days = true;
    }
    if (c.disable_ethics_score === 1 || c.disable_ethics_score === true) {
      disable_ethics_score = true;
    }
  }

  return {
    massSchedule,
    catechismSchedule,
    mass_required,
    mass_allowed_absence,
    catechism_required,
    catechism_allowed_absence,
    count_all_mass_days,
    disable_ethics_score,
  };
}

/** Chuẩn hóa DATE từ MySQL/JSON → YYYY-MM-DD (giờ địa phương, tránh lệch ngày UTC) */
function normalizeDateInput(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return null;
}

function getDayOfWeek(dateInput) {
  const ymd = normalizeDateInput(dateInput);
  if (!ymd) return 0;
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** Ngày được phép điểm danh theo lịch cấu hình Tab 4 */
function isDateEnabledForType(config, dateInput, attendanceType) {
  if (!dateInput || !attendanceType) return false;
  const dow = getDayOfWeek(dateInput);
  if (attendanceType === 'mass') {
    if (config.count_all_mass_days) return true;
    return config.massSchedule[dow]?.is_enabled === true;
  }
  if (attendanceType === 'catechism') {
    return config.catechismSchedule[dow]?.is_enabled === true;
  }
  return false;
}

/** Đã lưu cấu hình chuyên cần cho lớp/học kỳ (có số buổi cần) */
function isAttendanceConfigComplete(config) {
  const hasMass = (config.mass_required || 0) > 0;
  const hasCat = (config.catechism_required || 0) > 0;
  const hasMassDay =
    config.count_all_mass_days ||
    config.massSchedule.some((d) => d.is_enabled);
  const hasCatDay = config.catechismSchedule.some((d) => d.is_enabled);
  return hasMass && hasCat && hasMassDay && hasCatDay;
}

module.exports = {
  parseAttendanceConfigRows,
  normalizeDateInput,
  getDayOfWeek,
  DAY_NAMES,
  isDateEnabledForType,
  isAttendanceConfigComplete,
};
