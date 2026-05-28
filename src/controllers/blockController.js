const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function normalizeBlockName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function slugBlockCode(name) {
  const stripped = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 20);
  }
  return stripped.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().slice(0, 20) || 'KHOI';
}

async function findDuplicateName(connection, academicYearId, name, excludeId = null) {
  const norm = normalizeBlockName(name);
  const [rows] = await connection.query(
    `SELECT id, name FROM blocks
     WHERE academic_year_id = ? AND deleted_at IS NULL
       ${excludeId ? 'AND id != ?' : ''}`,
    excludeId ? [academicYearId, excludeId] : [academicYearId]
  );
  return rows.find((r) => normalizeBlockName(r.name) === norm);
}

async function ensureUniqueCode(connection, academicYearId, baseCode, excludeId = null) {
  let code = baseCode;
  let n = 1;
  for (;;) {
    const params = excludeId ? [academicYearId, code, excludeId] : [academicYearId, code];
    const [ex] = await connection.query(
      `SELECT id FROM blocks WHERE academic_year_id = ? AND code = ? AND deleted_at IS NULL
       ${excludeId ? 'AND id != ?' : ''} LIMIT 1`,
      params
    );
    if (ex.length === 0) return code;
    code = `${baseCode}${n}`;
    n += 1;
    if (n > 99) {
      const err = new Error('Không tạo được mã khối duy nhất');
      err.statusCode = 500;
      throw err;
    }
  }
}

/**
 * GET /api/blocks?academic_year_id=
 */
const getAllBlocks = async (req, res, next) => {
  try {
    const { academic_year_id } = req.query;
    let query = `
      SELECT b.*,
        ay.name AS academic_year_name,
        (SELECT COUNT(*) FROM classes c
         WHERE c.block_id = b.id AND c.deleted_at IS NULL) AS class_count
      FROM blocks b
      LEFT JOIN academic_years ay ON ay.id = b.academic_year_id
      WHERE b.deleted_at IS NULL
    `;
    const params = [];
    if (academic_year_id) {
      query += ' AND b.academic_year_id = ?';
      params.push(academic_year_id);
    }
    if (req.accessScope && !req.accessScope.isFullAccess && req.accessScope.blockIds?.length > 0) {
      query += ' AND b.id IN (?)';
      params.push(req.accessScope.blockIds);
    }
    query += ' ORDER BY b.display_order ASC, b.name ASC';
    const [blocks] = await db.query(query, params);
    res.status(200).json({ success: true, data: blocks });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blocks
 */
const createBlock = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const { academic_year_id, name, code, display_order } = req.body;
    if (!academic_year_id || !String(name || '').trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu niên học hoặc tên khối' });
    }

    const [years] = await connection.query(
      'SELECT id FROM academic_years WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [academic_year_id]
    );
    if (years.length === 0) {
      return res.status(400).json({ success: false, message: 'Niên học không tồn tại' });
    }

    const dup = await findDuplicateName(connection, academic_year_id, name);
    if (dup) {
      return res.status(409).json({
        success: false,
        message: `Khối "${dup.name}" đã tồn tại trong niên học này`,
      });
    }

    const baseCode = (code && String(code).trim()) || slugBlockCode(name);
    const finalCode = await ensureUniqueCode(connection, academic_year_id, baseCode);

    const [orderRows] = await connection.query(
      'SELECT COALESCE(MAX(display_order), 0) AS mx FROM blocks WHERE academic_year_id = ? AND deleted_at IS NULL',
      [academic_year_id]
    );
    const order = display_order ?? orderRows[0].mx + 1;
    const id = uuidv4();

    await connection.query(
      `INSERT INTO blocks (id, academic_year_id, code, name, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [id, academic_year_id, finalCode, String(name).trim(), order]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Thêm khối thành công',
      data: { id, code: finalCode, name: String(name).trim(), academic_year_id, display_order: order },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * PUT /api/blocks/:id
 */
const updateBlock = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const { id } = req.params;
    const { name, code, display_order } = req.body;

    const [existing] = await connection.query(
      'SELECT * FROM blocks WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khối' });
    }
    const block = existing[0];

    const newName = name != null ? String(name).trim() : block.name;
    if (!newName) {
      return res.status(400).json({ success: false, message: 'Tên khối không được để trống' });
    }

    const dup = await findDuplicateName(connection, block.academic_year_id, newName, id);
    if (dup) {
      return res.status(409).json({
        success: false,
        message: `Khối "${dup.name}" đã tồn tại trong niên học này`,
      });
    }

    let finalCode = block.code;
    if (code && String(code).trim() && String(code).trim() !== block.code) {
      finalCode = await ensureUniqueCode(connection, block.academic_year_id, String(code).trim(), id);
    }

    await connection.query(
      `UPDATE blocks SET name = ?, code = ?, display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [newName, finalCode, display_order ?? null, id]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: 'Cập nhật khối thành công' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * DELETE /api/blocks/:id
 */
const deleteBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT id, name FROM blocks WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khối' });
    }

    const [classRows] = await db.query(
      'SELECT COUNT(*) AS cnt FROM classes WHERE block_id = ? AND deleted_at IS NULL',
      [id]
    );
    if (classRows[0].cnt > 0) {
      return res.status(409).json({
        success: false,
        message: `Không thể xóa khối "${existing[0].name}" vì còn ${classRows[0].cnt} lớp thuộc khối này`,
      });
    }

    await db.query('UPDATE blocks SET deleted_at = NOW() WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Đã xóa khối' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
};
