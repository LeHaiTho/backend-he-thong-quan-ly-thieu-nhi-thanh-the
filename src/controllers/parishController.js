const db = require('../config/db');

/**
 * Lấy danh sách tất cả giáo họ
 * GET /api/parishes
 */
const getAllParishes = async (req, res, next) => {
  try {
    const [parishes] = await db.query('SELECT * FROM parishes WHERE deleted_at IS NULL ORDER BY name ASC');
    res.status(200).json({
      success: true,
      data: parishes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllParishes
};
