const db = require('../config/db');

/**
 * Lấy danh sách tất cả vai trò
 * GET /api/roles
 */
const getAllRoles = async (req, res, next) => {
  try {
    const [roles] = await db.query('SELECT * FROM roles ORDER BY name ASC');
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoles
};
