/**
 * Chạy file SQL migration (một hoặc nhiều file).
 * Usage: node src/config/runMigration.js add_user_teacher_link.sql
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function main() {
  const fileArg = process.argv[2] || 'add_user_teacher_link.sql';
  const sqlPath = path.join(__dirname, 'migrations', fileArg);

  if (!fs.existsSync(sqlPath)) {
    console.error('Không tìm thấy file:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'he_thong_quan_ly_thieu_nhi_thanh_the',
    multipleStatements: true,
  });

  try {
    console.log('Database:', process.env.DB_NAME);
    console.log('Running:', fileArg);
    await connection.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column teacher_id already exists — migration may have been applied before.');
    } else {
      console.error('Migration failed:', err.message);
      process.exit(1);
    }
  } finally {
    await connection.end();
  }
}

main();
