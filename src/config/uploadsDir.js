const path = require('path');

// Vercel serverless: chỉ ghi được /tmp (không bền). Render/local: thư mục uploads cố định.
const isVercelServerless = Boolean(process.env.VERCEL);

const uploadDir = isVercelServerless
  ? '/tmp'
  : path.join(__dirname, '../uploads');

module.exports = { uploadDir, isVercelServerless };
