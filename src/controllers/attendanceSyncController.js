const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/attendance-sync-logs
 */
const listSyncLogs = async (req, res, next) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT * FROM attendance_sync_logs
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (attendant_name LIKE ? OR sync_id LIKE ? OR attendant_phone LIKE ?)';
      const p = `%${search}%`;
      params.push(p, p, p);
    }

    query += ' ORDER BY send_time DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM attendance_sync_logs`
    );

    res.status(200).json({
      success: true,
      data: rows,
      total: countRows[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance-sync-logs/:syncId
 */
const getSyncLogDetail = async (req, res, next) => {
  try {
    const { syncId } = req.params;
    const [logs] = await db.query(
      'SELECT * FROM attendance_sync_logs WHERE sync_id = ? OR id = ? LIMIT 1',
      [syncId, syncId]
    );
    if (logs.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch sử đồng bộ' });
    }

    const log = logs[0];
    let items = [];
    if (log.raw_data) {
      try {
        const parsed = typeof log.raw_data === 'string' ? JSON.parse(log.raw_data) : log.raw_data;
        items = parsed.items || parsed.students || parsed.records || (Array.isArray(parsed) ? parsed : []);
      } catch {
        items = [];
      }
    }

    const [linkedRecords] = await db.query(
      `SELECT ar.*, s.code AS student_code, s.first_name, s.last_name, s.saint_name
       FROM attendance_records ar
       JOIN students s ON s.id = ar.student_id
       WHERE ar.d2_sync_id = ? AND ar.deleted_at IS NULL`,
      [log.sync_id]
    );

    res.status(200).json({
      success: true,
      data: { log, items, linkedRecords },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/attendance-sync/process
 * Body: { sync_id } hoặc { raw_data, sync_id, attendant_name, ... }
 */
const processSync = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const {
      sync_id: syncIdBody,
      attendant_name,
      attendant_phone,
      raw_data,
      items,
    } = req.body;

    let syncId = syncIdBody;
    let logRow = null;

    if (syncId) {
      const [logs] = await connection.query(
        'SELECT * FROM attendance_sync_logs WHERE sync_id = ? LIMIT 1',
        [syncId]
      );
      logRow = logs[0] || null;
    }

    const payloadItems = items || (() => {
      if (!raw_data && logRow?.raw_data) {
        try {
          const p = typeof logRow.raw_data === 'string' ? JSON.parse(logRow.raw_data) : logRow.raw_data;
          return p.items || p.students || p.records || (Array.isArray(p) ? p : []);
        } catch {
          return [];
        }
      }
      if (raw_data) {
        const p = typeof raw_data === 'string' ? JSON.parse(raw_data) : raw_data;
        return p.items || p.students || p.records || (Array.isArray(p) ? p : []);
      }
      return [];
    })();

    if (!syncId) {
      syncId = `SYNC-${Date.now()}`;
    }

    if (!logRow) {
      const logId = uuidv4();
      await connection.query(
        `INSERT INTO attendance_sync_logs (
          id, sync_id, attendant_name, attendant_phone, total_count,
          success_count, fail_count, send_time, complete_time, status, raw_data
        ) VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NULL, 'pending', ?)`,
        [
          logId,
          syncId,
          attendant_name || null,
          attendant_phone || null,
          payloadItems.length,
          JSON.stringify({ items: payloadItems }),
        ]
      );
    }

    let success = 0;
    let fail = 0;
    const errors = [];

    for (const item of payloadItems) {
      try {
        const student_id = item.student_id || item.studentId;
        const class_id = item.class_id || item.classId;
        const semester_id = item.semester_id || item.semesterId;
        const attendance_date = item.attendance_date || item.date;
        let attendance_type = item.attendance_type || item.type;
        let status = item.status || 'present';

        if (attendance_type === 'Giáo lý' || attendance_type === 'catechism') attendance_type = 'catechism';
        if (attendance_type === 'Thánh lễ' || attendance_type === 'mass') attendance_type = 'mass';
        if (attendance_type === 'Hiện diện Thánh lễ') {
          attendance_type = 'mass';
          status = 'present';
        }

        if (!student_id || !class_id || !semester_id || !attendance_date || !attendance_type) {
          fail += 1;
          errors.push({ item, message: 'Thiếu trường bắt buộc' });
          continue;
        }

        const [existing] = await connection.query(
          `SELECT id FROM attendance_records
           WHERE student_id = ? AND class_id = ? AND semester_id = ?
             AND attendance_date = ? AND attendance_type = ? AND deleted_at IS NULL`,
          [student_id, class_id, semester_id, attendance_date, attendance_type]
        );

        if (existing.length > 0) {
          await connection.query(
            `UPDATE attendance_records SET status = ?, check_in_time = ?, d2_sync_id = ?, sync_status = 'synced', updated_at = NOW()
             WHERE id = ?`,
            [status, item.check_in_time || item.time || null, syncId, existing[0].id]
          );
        } else {
          await connection.query(
            `INSERT INTO attendance_records (
              id, student_id, class_id, semester_id, attendance_date, attendance_type,
              status, check_in_time, d2_sync_id, sync_status, recorded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NOW())`,
            [
              uuidv4(),
              student_id,
              class_id,
              semester_id,
              attendance_date,
              attendance_type,
              status,
              item.check_in_time || item.time || null,
              syncId,
            ]
          );
        }
        success += 1;
      } catch (e) {
        fail += 1;
        errors.push({ item, message: e.message });
      }
    }

    await connection.query(
      `UPDATE attendance_sync_logs SET
        success_count = ?, fail_count = ?, complete_time = NOW(), status = 'completed'
       WHERE sync_id = ?`,
      [success, fail, syncId]
    );

    await connection.commit();
    res.status(200).json({
      success: true,
      message: `Đã xử lý ${success} bản ghi thành công, ${fail} lỗi`,
      data: { sync_id: syncId, success_count: success, fail_count: fail, errors },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  listSyncLogs,
  getSyncLogDetail,
  processSync,
};
