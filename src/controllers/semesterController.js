const db = require('../config/db');

/**
 * Lấy danh sách tất cả học kỳ
 * GET /api/semesters
 */
const getAllSemesters = async (req, res, next) => {
  try {
    const [semesters] = await db.query(`
      SELECT s.*, ay.name as academic_year_name 
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE s.deleted_at IS NULL
      ORDER BY ay.name DESC, s.semester_number ASC
    `);
    res.status(200).json({
      success: true,
      data: semesters
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSemesters
};
