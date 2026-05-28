require('dotenv').config();
const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function insertMockData() {
  try {
    const sqlPath = path.join(__dirname, 'docs', 'mock_20_students.sql');
    const sqlString = fs.readFileSync(sqlPath, 'utf-8');
    
    const statements = sqlString.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const stmt of statements) {
      await db.query(stmt);
    }
    
    console.log('✅ Đã thêm thành công 20 học viên mẫu vào database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

insertMockData();
