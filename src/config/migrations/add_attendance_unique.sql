-- Chạy thủ công nếu DB đã tồn tại trước khi có UNIQUE trên attendance_records
USE `he_thong_quan_ly_thieu_nhi_thanh_the`;

ALTER TABLE `attendance_records`
  ADD UNIQUE KEY `uk_attendance_record` (`student_id`, `class_id`, `semester_id`, `attendance_date`, `attendance_type`);

INSERT IGNORE INTO `score_types` (id, name, code, display_position) VALUES
('st-dd', 'Đạo đức', 'DD', 5);
