require('dotenv').config();
const app = require('./src/app');
require('./src/config/db'); // Khởi tạo kết nối database

module.exports = app;
