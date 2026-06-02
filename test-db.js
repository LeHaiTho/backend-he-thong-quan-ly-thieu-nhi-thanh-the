const mysql = require('mysql2');
require('dotenv').config();

console.log('Connecting to:', process.env.DB_HOST);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
  } else {
    console.log('✅ Connected successfully!');
    connection.query('SHOW TABLES', (err, results) => {
      if (err) {
        console.error('❌ Query error:', err.message);
      } else {
        console.log('📋 Tables:', results);
      }
      connection.end();
    });
  }
});
