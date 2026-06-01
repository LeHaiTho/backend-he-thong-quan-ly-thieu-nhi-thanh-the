const mysql = require('mysql2');

// Tạo connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Chuyển sang dạng promise để sử dụng async/await
const promisePool = pool.promise();

// Kiểm tra kết nối (chỉ chạy ở môi trường development để tránh treo Serverless trên Production)
if (process.env.NODE_ENV !== 'production') {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Lỗi kết nối MySQL:', err.message);
    } else {
      console.log('✅ Kết nối MySQL thành công!');
      connection.release();
    }
  });
}


module.exports = promisePool;
