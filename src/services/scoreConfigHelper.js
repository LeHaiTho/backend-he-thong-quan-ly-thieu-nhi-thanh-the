const ACADEMIC_TYPE_EXCLUDE = ['DD'];

const DEFAULT_WEIGHT_BY_CODE = {
  DAG: 1,
  '15PH': 1,
  '45PH': 2,
  KK: 3,
  THI: 3,
};

function defaultWeightForCode(code) {
  return DEFAULT_WEIGHT_BY_CODE[String(code || '').toUpperCase()] ?? 1;
}

async function loadAcademicScoreTypes(connection) {
  const db = connection;
  const [types] = await db.query(
    `SELECT id, name, code, display_position
     FROM score_types
     WHERE deleted_at IS NULL AND UPPER(code) NOT IN (${ACADEMIC_TYPE_EXCLUDE.map(() => '?').join(',')})
     ORDER BY display_position ASC`,
    ACADEMIC_TYPE_EXCLUDE
  );
  return types;
}

function buildDefaultConfigs(types) {
  return types.map((t) => ({
    score_type_id: t.id,
    score_type_name: t.name,
    score_type_code: t.code,
    column_count: 1,
    weight_factor: defaultWeightForCode(t.code),
    is_active: true,
    is_default_template: true,
  }));
}

module.exports = {
  ACADEMIC_TYPE_EXCLUDE,
  defaultWeightForCode,
  loadAcademicScoreTypes,
  buildDefaultConfigs,
};
