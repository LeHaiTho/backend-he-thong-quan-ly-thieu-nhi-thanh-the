const db = require('../config/db');

/**
 * Lấy thống kê tổng quan cho Dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Lấy tổng số học viên (theo giới tính)
    const [studentStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
      FROM students
      WHERE deleted_at IS NULL AND status = 'active'
    `);

    // 2. Lấy tổng số giáo lý viên
    const [teacherStats] = await db.query(`
      SELECT COUNT(*) as total
      FROM teachers
      WHERE deleted_at IS NULL AND status = 'active'
    `);

    // 3. Lấy niên học hiện tại
    const [currentYear] = await db.query(`
      SELECT id, name FROM academic_years WHERE is_current = 1 AND deleted_at IS NULL LIMIT 1
    `);

    const academicYearId = currentYear[0]?.id;
    const academicYearName = currentYear[0]?.name || 'N/A';

    // 4. Lấy sỉ số học viên theo từng lớp trong niên học hiện tại
    let classStats = [];
    if (academicYearId) {
      [classStats] = await db.query(`
        SELECT 
          c.id,
          c.name,
          COUNT(se.student_id) as total_students,
          SUM(CASE WHEN s.gender = 'male' THEN 1 ELSE 0 END) as male_students,
          SUM(CASE WHEN s.gender = 'female' THEN 1 ELSE 0 END) as female_students,
          ht.saint_name as head_teacher_saint,
          ht.first_name as head_teacher_first,
          ht.last_name as head_teacher_last
        FROM classes c
        LEFT JOIN student_enrollments se ON c.id = se.class_id AND se.deleted_at IS NULL
        LEFT JOIN students s ON se.student_id = s.id AND s.deleted_at IS NULL
        LEFT JOIN teachers ht ON c.head_teacher_id = ht.id
        WHERE c.academic_year_id = ? AND c.deleted_at IS NULL
        GROUP BY c.id, c.name, ht.id
        ORDER BY c.name ASC
      `, [academicYearId]);

      // Lấy thêm danh sách GLV phụ cho từng lớp
      for (let i = 0; i < classStats.length; i++) {
        const [assistants] = await db.query(`
          SELECT 
            t.saint_name, t.first_name, t.last_name
          FROM teacher_assignments ta
          JOIN teachers t ON ta.teacher_id = t.id
          WHERE ta.class_id = ? AND ta.role = 'assistant' AND ta.deleted_at IS NULL
        `, [classStats[i].id]);
        
        classStats[i].assistants = assistants;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents: studentStats[0].total || 0,
          maleStudents: studentStats[0].male || 0,
          femaleStudents: studentStats[0].female || 0,
          totalTeachers: teacherStats[0].total || 0,
          currentYearName: academicYearName
        },
        classStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
