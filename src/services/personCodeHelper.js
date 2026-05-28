/**
 * Mã định danh người (học viên / giáo viên)
 *
 * Định dạng: {PREFIX}-{SEQ4}
 *   - MHV-0001  (học viên)
 *   - MGV-0001  (giáo lý viên / giảng viên)
 *
 * Mã mới sinh ra dùng 4 chữ số (MHV-0001).
 * Mã cũ 6 chữ số (MHV-000001) vẫn được chấp nhận (tương thích ngược).
 * SEQ tăng liên tục (global) — đơn giản, dễ tra cứu, tránh trùng, hỗ trợ tới 999999 mã mỗi loại.
 */

const PERSON_CODE_PREFIX = {
  STUDENT: 'MHV',
  TEACHER: 'MGV',
};

const MAX_CODE_LENGTH = 20;
const MAX_GLOBAL_SEQ = 999999;

// Chấp nhận cả 4 và 6 chữ số (tương thích ngược với dữ liệu cũ)
const PERSON_CODE_REGEX = /^(MHV|MGV)-\d{4,6}$/;

const ALLOWED_TABLES = {
  students: PERSON_CODE_PREFIX.STUDENT,
  teachers: PERSON_CODE_PREFIX.TEACHER,
};

function parseSeqFromCode(code, prefix) {
  const expectedPrefix = `${prefix}-`;
  if (!code.startsWith(expectedPrefix)) return 0;
  const seqStr = code.slice(expectedPrefix.length);
  const seq = parseInt(seqStr, 10);
  return Number.isFinite(seq) ? seq : 0;
}

async function isCodeTaken(connection, table, code, excludeId = null) {
  const params = [code];
  // Check cả record đã soft-delete vì DB có UNIQUE constraint trên cột code
  let sql = `SELECT id FROM ${table} WHERE code = ?`;
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await connection.query(sql, params);
  return rows.length > 0;
}

/**
 * Sinh mã mới trong transaction (nên gọi kèm FOR UPDATE trên cùng connection).
 */
async function generateUniquePersonCode(connection, table) {
  const prefix = ALLOWED_TABLES[table];
  if (!prefix) {
    const err = new Error('Bảng không hỗ trợ sinh mã');
    err.statusCode = 500;
    throw err;
  }

  // Chỉ tìm mã đúng định dạng {PREFIX}-{4 chữ số} để tránh mã cũ sai format làm lệch max_seq
  // Tìm mã lớn nhất trong các mã đúng định dạng (kể cả đã soft-delete)
  const [maxSeqResult] = await connection.query(
    `SELECT MAX(CAST(SUBSTRING(code, LENGTH(?) + 2) AS UNSIGNED)) as max_seq
     FROM ${table}
     WHERE code REGEXP ?`,
    [prefix, `^${prefix}-[0-9]{4}$`]
  );

  let nextSeq = 1;
  const maxSeq = maxSeqResult[0]?.max_seq;
  if (maxSeq && Number.isFinite(maxSeq) && maxSeq > 0) {
    nextSeq = maxSeq + 1;
  }

  if (nextSeq > MAX_GLOBAL_SEQ) {
    const err = new Error(
      `Đã đạt giới hạn ${MAX_GLOBAL_SEQ} mã ${prefix}. Vui lòng liên hệ quản trị viên.`
    );
    err.statusCode = 409;
    throw err;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const seq = nextSeq + attempt;
    if (seq > MAX_GLOBAL_SEQ) break;
    const candidate = `${prefix}-${String(seq).padStart(4, '0')}`;
    if (candidate.length > MAX_CODE_LENGTH) {
      const err = new Error('Mã vượt quá độ dài cho phép');
      err.statusCode = 500;
      throw err;
    }
    const taken = await isCodeTaken(connection, table, candidate);
    if (!taken) return candidate;
  }

  const err = new Error(`Không sinh được mã ${prefix} duy nhất`);
  err.statusCode = 500;
  throw err;
}

/**
 * Dùng mã người dùng nhập hoặc tự sinh nếu để trống.
 */
async function resolvePersonCode(connection, { table, providedCode, excludeId = null }) {
  const prefix = ALLOWED_TABLES[table];
  if (!prefix) {
    const err = new Error('Bảng không hỗ trợ mã định danh');
    err.statusCode = 500;
    throw err;
  }

  const trimmed = String(providedCode ?? '').trim();
  if (!trimmed) {
    return generateUniquePersonCode(connection, table);
  }

  const code = trimmed.toUpperCase();
  if (code.length > MAX_CODE_LENGTH) {
    const err = new Error(`Mã không được dài quá ${MAX_CODE_LENGTH} ký tự`);
    err.statusCode = 400;
    throw err;
  }

  if (await isCodeTaken(connection, table, code, excludeId)) {
    const err = new Error(`Mã "${code}" đã tồn tại`);
    err.statusCode = 409;
    throw err;
  }

  return code;
}

module.exports = {
  PERSON_CODE_PREFIX,
  PERSON_CODE_REGEX,
  MAX_CODE_LENGTH,
  generateUniquePersonCode,
  resolvePersonCode,
  isCodeTaken,
};
