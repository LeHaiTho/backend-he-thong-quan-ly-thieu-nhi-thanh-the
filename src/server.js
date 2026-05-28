require('dotenv').config();
const app = require('./app');
require('./config/db'); // Khởi tạo kết nối database

const PORT = process.env.PORT || 5000;

// Khởi tạo server
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  📡 Port: ${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}
  Health check: http://localhost:${PORT}/api/health
  `);
});

// Xử lý lỗi không mong muốn
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
