const db = require('../config/db');

// Controller kiểm tra trạng thái server (+ MySQL khi gọi /api/health/db)
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString()
  });
};

const getDbHealth = async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'MySQL connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  getDbHealth
};
