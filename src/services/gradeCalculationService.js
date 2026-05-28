/**
 * Tính điểm học lực / chuyên cần theo server/docs/cai-dat-hocluc-chuyencan.md
 */

const COUNTABLE_STATUSES = ['present', 'late'];

const CLASSIFICATION_BANDS = [
  { min: 9.5, max: 10, label: 'Xuất sắc', result: 'Lên lớp' },
  { min: 8.0, max: 9.49, label: 'Giỏi', result: 'Lên lớp' },
  { min: 6.5, max: 7.99, label: 'Khá', result: 'Lên lớp' },
  { min: 5.0, max: 6.49, label: 'Trung bình', result: 'Lên lớp' },
  { min: 3.5, max: 4.99, label: 'Yếu', result: 'Thi lại' },
  { min: 0, max: 3.49, label: 'Kém', result: 'Ở lại lớp' },
];

function roundToDecimals(value, decimals) {
  if (value == null || Number.isNaN(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** §8.1 — ĐHL / TBHK: làm tròn 1 chữ số thập phân */
function roundAcademic(value) {
  return roundToDecimals(value, 1);
}

/** §8.2 — TBCN: 3 chữ số → 2 chữ số */
function roundYearAverage(value) {
  return roundToDecimals(roundToDecimals(value, 3), 2);
}

/** §8.3 — Tl / Gl thành phần: 3 chữ số thập phân */
function roundComponentTlGl(value) {
  return roundToDecimals(value, 3);
}

const { normalizeDateInput, getDayOfWeek } = require('./attendanceConfigHelper');

function isMassRecordCountable(record, attendanceConfig) {
  if (record.attendance_type !== 'mass') return false;
  if (!COUNTABLE_STATUSES.includes(record.status)) return false;
  if (attendanceConfig.count_all_mass_days) return true;
  const dow = getDayOfWeek(record.attendance_date);
  return attendanceConfig.massSchedule[dow]?.is_enabled === true;
}

function isCatechismRecordCountable(record, attendanceConfig) {
  if (record.attendance_type !== 'catechism') return false;
  if (!COUNTABLE_STATUSES.includes(record.status)) return false;
  const dow = getDayOfWeek(record.attendance_date);
  return attendanceConfig.catechismSchedule[dow]?.is_enabled === true;
}

function countPresentByType(records, attendanceConfig) {
  let mass = 0;
  let catechism = 0;
  for (const r of records) {
    if (isMassRecordCountable(r, attendanceConfig)) mass += 1;
    if (isCatechismRecordCountable(r, attendanceConfig)) catechism += 1;
  }
  return { mass, catechism };
}

function countAbsences(records, attendanceConfig) {
  let massAbsent = 0;
  let catechismAbsent = 0;
  for (const r of records) {
    if (r.status !== 'absent') continue;
    if (r.attendance_type === 'mass') massAbsent += 1;
    if (r.attendance_type === 'catechism') catechismAbsent += 1;
  }
  return { massAbsent, catechismAbsent };
}

/**
 * @param {number} countPresent
 * @param {number} requiredCount
 */
function computeComponentScore(countPresent, requiredCount) {
  if (!requiredCount || requiredCount <= 0) return 0;
  const pointPer = 10 / requiredCount;
  return roundComponentTlGl(countPresent * pointPer);
}

/**
 * @param {object} params
 * @param {number} params.massPresent
 * @param {number} params.catechismPresent
 * @param {number} params.massRequired
 * @param {number} params.catechismRequired
 * @param {number|null} params.ethicsScore - Đđ (0-10)
 * @param {boolean} params.disableEthicsScore
 * @param {number} params.diligencePercentage - Ptr (e.g. 40)
 */
function computeDiligenceScore({
  massPresent,
  catechismPresent,
  massRequired,
  catechismRequired,
  ethicsScore,
  disableEthicsScore,
  diligencePercentage,
}) {
  const tl = computeComponentScore(massPresent, massRequired);
  const gl = computeComponentScore(catechismPresent, catechismRequired);
  const dd = disableEthicsScore ? 0 : (ethicsScore != null ? Number(ethicsScore) : 0);
  const n = disableEthicsScore ? 2 : 3;
  const sum = tl + gl + (disableEthicsScore ? 0 : dd);
  const ptr = (diligencePercentage || 0) / 100;
  const raw = (sum / n) * ptr;
  return {
    tl,
    gl,
    ethics: disableEthicsScore ? null : dd,
    dcc: roundAcademic(raw),
    dccRaw: raw,
  };
}

/**
 * @param {Array<{score_type_id, column_count, weight_factor}>} scoreConfigs
 * @param {Record<string, Array<number|null>>} studentScores - score_type_id -> values
 * @param {number} academicPercentage
 */
function computeAcademicScore(scoreConfigs, studentScores, academicPercentage) {
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const config of scoreConfigs) {
    const values = studentScores[config.score_type_id] || [];
    for (let i = 0; i < config.column_count; i++) {
      const score = values[i];
      if (score !== null && score !== undefined && score !== '') {
        const w = parseFloat(config.weight_factor) || 1;
        totalWeighted += parseFloat(score) * w;
        totalWeight += w;
      }
    }
  }

  // Nếu không có điểm nào, trả về null thay vì 0
  if (totalWeight === 0) {
    return { dhl: null, dhlRaw: null, averageOn10: null };
  }

  const averageOn10 = totalWeighted / totalWeight;
  const ptr = (academicPercentage || 0) / 100;
  const raw = averageOn10 * ptr;
  return {
    dhl: roundAcademic(raw),
    dhlRaw: raw,
    averageOn10: roundAcademic(averageOn10),
  };
}

function computeSemesterAverage(dhl, dcc) {
  // Nếu DHL hoặc DCC là null, TBHK cũng là null
  if (dhl === null || dhl === undefined || dcc === null || dcc === undefined) {
    return {
      tbhk: null,
      tbhkRaw: null,
    };
  }
  
  const raw = (parseFloat(dhl) || 0) + (parseFloat(dcc) || 0);
  return {
    tbhk: roundAcademic(raw),
    tbhkRaw: raw,
  };
}

function computeYearAverage(tbhk1, tbhk2) {
  const raw = ((parseFloat(tbhk1) || 0) + (parseFloat(tbhk2) || 0)) / 2;
  return {
    tbcn: roundYearAverage(raw),
    tbcnRaw: raw,
  };
}

function isControlViolation(dcc, controlScore) {
  if (controlScore == null) return false;
  return (parseFloat(dcc) || 0) < parseFloat(controlScore);
}

function classifyAcademic(tbcn, isControlled) {
  const score = parseFloat(tbcn) || 0;
  for (const band of CLASSIFICATION_BANDS) {
    if (score >= band.min && score <= band.max) {
      let result = band.result;
      if (isControlled && result === 'Lên lớp') {
        result = 'Ở lại lớp';
      }
      if (band.label === 'Yếu' && isControlled) {
        result = 'Ở lại lớp';
      }
      return { label: band.label, result, isControlled };
    }
  }
  return { label: 'Kém', result: 'Ở lại lớp', isControlled };
}

function evaluatePromotion({ tbcn, dccSemester1, dccSemester2, controlScore, missingExamSemesters = [] }) {
  const controlled =
    isControlViolation(dccSemester1, controlScore) ||
    isControlViolation(dccSemester2, controlScore);
  const classification = classifyAcademic(tbcn, controlled);
  let promotionResult = classification.result;

  if (missingExamSemesters.length > 0) {
    promotionResult = 'Thi lại';
  } else if ((parseFloat(tbcn) || 0) < 5.0) {
    promotionResult = classification.label === 'Yếu' ? 'Thi lại' : 'Ở lại lớp';
  }

  return {
    ...classification,
    promotionResult,
    isControlled: controlled,
    controlScore,
  };
}

module.exports = {
  COUNTABLE_STATUSES,
  roundAcademic,
  roundYearAverage,
  roundComponentTlGl,
  getDayOfWeek,
  isMassRecordCountable,
  isCatechismRecordCountable,
  countPresentByType,
  countAbsences,
  computeComponentScore,
  computeDiligenceScore,
  computeAcademicScore,
  computeSemesterAverage,
  computeYearAverage,
  isControlViolation,
  classifyAcademic,
  evaluatePromotion,
};
