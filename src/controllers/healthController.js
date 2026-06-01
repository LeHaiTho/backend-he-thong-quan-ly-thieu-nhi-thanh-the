const db = require('../config/db');

// Controller kiểm tra trạng thái server và kết nối database
const getHealth = async (req, res) => {
  try {
    // Chạy truy vấn đơn giản để kiểm tra kết nối Database
    await db.query('SELECT 1');
    
    res.status(200).json({
      success: true,
      message: 'Server is running smoothly',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server is running, but database connection failed',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getHealth
};
