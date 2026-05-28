const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'he_thong_quan_ly_thieu_nhi_thanh_the'
  });

  console.log('✅ Kết nối database thành công!');

  // Lấy danh sách giáo lý viên
  const [teachers] = await connection.query(`
    SELECT id, code, first_name, last_name 
    FROM teachers 
    WHERE deleted_at IS NULL 
    ORDER BY created_at
  `);

  console.log(`\n📚 Tìm thấy ${teachers.length} giáo lý viên`);
  
  if (teachers.length === 0) {
    console.log('❌ Không có giáo lý viên nào!');
    await connection.end();
    return;
  }

  console.log('\n📋 Danh sách giáo lý viên hiện tại:');
  teachers.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.code} - ${t.first_name} ${t.last_name}`);
  });

  console.log('\n🔄 Đang cập nhật mã giáo lý viên...');

  // Bước 1: Đổi tất cả mã sang mã tạm để tránh conflict
  console.log('\n   Bước 1: Đổi sang mã tạm...');
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    const tempCode = `TEMP-${i + 1}`;
    await connection.query(
      'UPDATE teachers SET code = ? WHERE id = ?',
      [tempCode, teacher.id]
    );
  }

  // Bước 2: Đổi từ mã tạm sang mã chính thức
  console.log('   Bước 2: Đổi sang mã chính thức...');
  let updated = 0;
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    const newCode = `MGV-${String(i + 1).padStart(4, '0')}`;
    
    await connection.query(
      'UPDATE teachers SET code = ? WHERE id = ?',
      [newCode, teacher.id]
    );
    console.log(`   ✅ ${teacher.code} → ${newCode} (${teacher.first_name} ${teacher.last_name})`);
    updated++;
  }

  console.log(`\n🎉 Hoàn tất! Đã cập nhật ${updated}/${teachers.length} giáo lý viên.`);
  console.log(`📋 Mã giáo lý viên: MGV-0001 đến MGV-${String(teachers.length).padStart(4, '0')}`);
  
  await connection.end();
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
