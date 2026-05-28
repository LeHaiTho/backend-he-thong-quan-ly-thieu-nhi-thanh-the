const { v4: uuidv4 } = require('uuid');

const ETHICS_SCORE_TYPE_ID = 'st-dd';
const ETHICS_SCORE_TYPE_CODE = 'DD';
const ETHICS_SCORE_TYPE_NAME = 'Đạo đức';
const ETHICS_DISPLAY_POSITION = 5;

/**
 * Đảm bảo có loại điểm Đạo đức (DD) — tự tạo nếu DB chưa seed.
 * @param {import('mysql2/promise').Pool | import('mysql2/promise').PoolConnection} conn
 */
async function ensureEthicsScoreType(conn) {
  const [rows] = await conn.query(
    `SELECT id, name, code, display_position
     FROM score_types
     WHERE UPPER(code) = ? AND deleted_at IS NULL
     LIMIT 1`,
    [ETHICS_SCORE_TYPE_CODE]
  );
  if (rows.length > 0) return rows[0];

  const [deleted] = await conn.query(
    `SELECT id FROM score_types WHERE UPPER(code) = ? AND deleted_at IS NOT NULL LIMIT 1`,
    [ETHICS_SCORE_TYPE_CODE]
  );
  if (deleted.length > 0) {
    await conn.query(
      `UPDATE score_types
       SET deleted_at = NULL, name = ?, display_position = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ETHICS_SCORE_TYPE_NAME, ETHICS_DISPLAY_POSITION, deleted[0].id]
    );
    return {
      id: deleted[0].id,
      name: ETHICS_SCORE_TYPE_NAME,
      code: ETHICS_SCORE_TYPE_CODE,
      display_position: ETHICS_DISPLAY_POSITION,
    };
  }

  const id = ETHICS_SCORE_TYPE_ID;
  try {
    await conn.query(
      `INSERT INTO score_types (id, name, code, display_position) VALUES (?, ?, ?, ?)`,
      [id, ETHICS_SCORE_TYPE_NAME, ETHICS_SCORE_TYPE_CODE, ETHICS_DISPLAY_POSITION]
    );
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err;
    const [again] = await conn.query(
      `SELECT id, name, code, display_position FROM score_types
       WHERE UPPER(code) = ? AND deleted_at IS NULL LIMIT 1`,
      [ETHICS_SCORE_TYPE_CODE]
    );
    if (again.length > 0) return again[0];
    const fallbackId = uuidv4();
    await conn.query(
      `INSERT INTO score_types (id, name, code, display_position) VALUES (?, ?, ?, ?)`,
      [fallbackId, ETHICS_SCORE_TYPE_NAME, ETHICS_SCORE_TYPE_CODE, ETHICS_DISPLAY_POSITION]
    );
    return {
      id: fallbackId,
      name: ETHICS_SCORE_TYPE_NAME,
      code: ETHICS_SCORE_TYPE_CODE,
      display_position: ETHICS_DISPLAY_POSITION,
    };
  }

  return {
    id,
    name: ETHICS_SCORE_TYPE_NAME,
    code: ETHICS_SCORE_TYPE_CODE,
    display_position: ETHICS_DISPLAY_POSITION,
  };
}

module.exports = {
  ETHICS_SCORE_TYPE_CODE,
  ETHICS_SCORE_TYPE_ID,
  ensureEthicsScoreType,
};
