const db = require('../config/db');

/**
 * Lấy danh sách tất cả loại điểm
 * GET /api/score-types
 */
const getAllScoreTypes = async (req, res, next) => {
  try {
    const [types] = await db.query('SELECT * FROM score_types WHERE deleted_at IS NULL ORDER BY display_position ASC');
    res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllScoreTypes
};
