require('dotenv').config();
const db = require('./db');

async function check() {
  const [indexes] = await db.query('SHOW INDEX FROM score_configs');
  console.log(JSON.stringify(indexes, null, 2));
  process.exit();
}

check();
