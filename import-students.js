const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Danh sách tên thánh phổ biến
const saintNames = [
  'Phêrô', 'Phaolô', 'Gioan', 'Giuse', 'Maria', 'Anna', 'Têrêsa', 'Phanxicô',
  'Antôn', 'Đaminh', 'Anrê', 'Giacôbê', 'Philippe', 'Tôma', 'Matthêu', 'Marcô',
  'Luca', 'Micae', 'Raphael', 'Gabriel', 'Mônica', 'Cecilia', 'Agnes', 'Lucia',
  'Catarina', 'Clara', 'Rita', 'Rosa', 'Bernadette', 'Therese'
];

// Danh sách họ phổ biến
const lastNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đào', 'Mai', 'Tô'
];

// Danh sách tên đệm
const middleNames = ['Văn', 'Thị', 'Đức', 'Minh', 'Hồng', 'Thanh', 'Quang', 'Anh', 'Hữu', 'Thành'];

// Danh sách tên
const firstNamesMale = [
  'An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hùng', 'Khang', 'Long', 'Minh',
  'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Tuấn', 'Việt', 'Vinh', 'Thắng', 'Hoàng'
];

const firstNamesFemale = [
  'Anh', 'Chi', 'Hà', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Nhung', 'Oanh',
  'Phương', 'Quỳnh', 'Thảo', 'Thu', 'Trang', 'Vy', 'Yến', 'Hằng', 'Huyền', 'Nhi'
];

// Hàm random
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Hàm tạo mã học viên
function generateStudentCode(index) {
  return `MHV-${String(index).padStart(4, '0')}`;
}

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'he_thong_quan_ly_thieu_nhi_thanh_the'
  });

  console.log('✅ Kết nối database thành công!');

  // Lấy danh sách lớp
  const [classes] = await connection.query(`
    SELECT c.id, c.name, c.academic_year_id, b.name as block_name 
    FROM classes c 
    JOIN blocks b ON c.block_id = b.id 
    WHERE c.deleted_at IS NULL
  `);

  console.log(`\n📚 Tìm thấy ${classes.length} lớp học`);

  // Lấy danh sách giáo họ
  const [parishes] = await connection.query(`
    SELECT id, name FROM parishes WHERE deleted_at IS NULL
  `);

  if (parishes.length === 0) {
    console.log('❌ Không có giáo họ nào. Vui lòng tạo giáo họ trước!');
    await connection.end();
    return;
  }


  // Lấy mã học viên lớn nhất hiện tại
  const [maxCode] = await connection.query(`
    SELECT MAX(CAST(SUBSTRING(code, 5) AS UNSIGNED)) as max_num 
    FROM students 
    WHERE code LIKE 'MHV-%'
  `);
  
  let startIndex = (maxCode[0]?.max_num || 0) + 1;
  console.log(`\n🔢 Bắt đầu từ mã: MHV-${String(startIndex).padStart(4, '0')}`);

  let totalCreated = 0;

  for (const classInfo of classes) {
    console.log(`\n📝 Đang tạo học viên cho lớp: ${classInfo.name} (${classInfo.block_name})`);

    // Tạo 20 học viên cho mỗi lớp
    for (let i = 0; i < 20; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const saintName = randomItem(saintNames);
      const lastName = randomItem(lastNames);
      const middleName = randomItem(middleNames);
      const firstName = gender === 'male' ? randomItem(firstNamesMale) : randomItem(firstNamesFemale);
      
      const dob = randomDate(new Date(2010, 0, 1), new Date(2018, 11, 31));
      const parishId = randomItem(parishes).id;
      
      const studentId = uuidv4();
      const code = generateStudentCode(startIndex++);

      // Insert student
      await connection.query(`
        INSERT INTO students (
          id, code, saint_name, first_name, last_name, gender, dob,
          parish_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId, code, saintName, `${lastName} ${middleName}`, firstName,
        gender, formatDate(dob), parishId, 'active'
      ]);

      // Enroll student vào lớp
      await connection.query(`
        INSERT INTO student_enrollments (
          id, student_id, class_id, academic_year_id, 
          enrollment_date, status
        ) VALUES (?, ?, ?, ?, NOW(), 'enrolled')
      `, [uuidv4(), studentId, classInfo.id, classInfo.academic_year_id]);

      totalCreated++;
    }

    console.log(`   ✅ Đã tạo 20 học viên`);
  }

  console.log(`\n🎉 Hoàn tất! Đã tạo tổng cộng ${totalCreated} học viên cho ${classes.length} lớp.`);
  
  await connection.end();
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
