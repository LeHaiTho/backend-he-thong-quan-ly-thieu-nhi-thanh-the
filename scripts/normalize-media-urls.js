/**
 * Chuyển avatar_url từ URL localhost đầy đủ → /uploads/filename
 * Chạy: node scripts/normalize-media-urls.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');
const { normalizeStoredMediaPath } = require('../src/utils/mediaPath');

const TABLES = ['students', 'teachers'];

async function run() {
  for (const table of TABLES) {
    const [rows] = await db.query(
      `SELECT id, avatar_url FROM ${table} WHERE avatar_url IS NOT NULL AND avatar_url != '' AND deleted_at IS NULL`
    );
    let updated = 0;
    for (const row of rows) {
      const next = normalizeStoredMediaPath(row.avatar_url);
      if (next && next !== row.avatar_url) {
        await db.query(`UPDATE ${table} SET avatar_url = ? WHERE id = ?`, [next, row.id]);
        updated += 1;
      }
    }
    console.log(`${table}: ${updated}/${rows.length} row(s) normalized`);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
