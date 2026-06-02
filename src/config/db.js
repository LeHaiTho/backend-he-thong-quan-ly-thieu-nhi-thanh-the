const mysql = require('mysql2');

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

// Tạo connection pool (trim env — tránh lỗi ENOTFOUND do khoảng trắng trên Vercel)
const pool = mysql.createPool({
  host: trim(process.env.DB_HOST) || 'localhost',
  port: parseInt(trim(process.env.DB_PORT), 10) || 3306,
  user: trim(process.env.DB_USER) || 'root',
  password: trim(process.env.DB_PASSWORD) || '',
  database: trim(process.env.DB_NAME) || 'test',
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
