-- =====================================================
-- DATABASE SCHEMA FOR HE THONG QUAN LY THIEU NHI THANH THE
-- Target: MySQL
-- =====================================================

DROP DATABASE IF EXISTS `he_thong_quan_ly_thieu_nhi_thanh_the`;
CREATE DATABASE `he_thong_quan_ly_thieu_nhi_thanh_the` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `he_thong_quan_ly_thieu_nhi_thanh_the`;

-- 1. parishes
CREATE TABLE IF NOT EXISTS `parishes` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL
);

-- 2. blocks (theo niên học)
CREATE TABLE IF NOT EXISTS `blocks` (
  `id` CHAR(36) PRIMARY KEY,
  `academic_year_id` CHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` INTEGER DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_block_year_code` (`academic_year_id`, `code`),
  UNIQUE KEY `uk_block_year_name` (`academic_year_id`, `name`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`)
);

-- RBAC: roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RBAC: permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RBAC: role_permissions
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` CHAR(36) NOT NULL,
  `permission_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);

-- 3. academic_years
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(20) UNIQUE NOT NULL,
  `note` TEXT,
  `is_current` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL
);

-- 4. semesters
CREATE TABLE IF NOT EXISTS `semesters` (
  `id` CHAR(36) PRIMARY KEY,
  `academic_year_id` CHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `semester_number` INTEGER NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_academic_semester` (`academic_year_id`, `semester_number`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`)
);

-- 5. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `role_id` CHAR(36) NOT NULL,
  `sub_role_block_id` CHAR(36),
  `teacher_id` CHAR(36),
  `status` VARCHAR(20) DEFAULT 'active',
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
  FOREIGN KEY (`sub_role_block_id`) REFERENCES `blocks`(`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_users_teacher` (`teacher_id`)
);

-- 6. system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` CHAR(36) PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` TEXT,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36)
);

-- 9. teachers (Needed for classes)
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(20) UNIQUE NOT NULL,
  `saint_name` VARCHAR(50),
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `gender` VARCHAR(10),
  `dob` DATE,
  `pob` VARCHAR(200),
  `patron_day` VARCHAR(10),
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `address` TEXT,
  `parish_id` CHAR(36),
  `village` VARCHAR(100),
  `family_number` VARCHAR(20),
  `family_code` VARCHAR(50),
  `baptism_date` DATE,
  `baptism_place` VARCHAR(200),
  `baptism_book` VARCHAR(50),
  `first_communion_date` DATE,
  `first_communion_place` VARCHAR(200),
  `confirmation_date` DATE,
  `confirmation_place` VARCHAR(200),
  `confirmation_book` VARCHAR(50),
  `vow_date` DATE,
  `level` VARCHAR(30),
  `end_date` DATE,
  `allow_attendance` BOOLEAN DEFAULT TRUE,
  `status` VARCHAR(20) DEFAULT 'active',
  `avatar_url` VARCHAR(500),
  `d2_password_hash` VARCHAR(255),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`parish_id`) REFERENCES `parishes`(`id`)
);

-- 7. classes
CREATE TABLE IF NOT EXISTS `classes` (
  `id` CHAR(36) PRIMARY KEY,
  `academic_year_id` CHAR(36) NOT NULL,
  `block_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `room` VARCHAR(100),
  `head_teacher_id` CHAR(36),
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_academic_class` (`academic_year_id`, `name`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`),
  FOREIGN KEY (`block_id`) REFERENCES `blocks`(`id`),
  FOREIGN KEY (`head_teacher_id`) REFERENCES `teachers`(`id`)
);

-- 8. students
CREATE TABLE IF NOT EXISTS `students` (
  `id` CHAR(36) PRIMARY KEY,
  `code` VARCHAR(20) UNIQUE NOT NULL,
  `saint_name` VARCHAR(50),
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `gender` VARCHAR(10),
  `dob` DATE,
  `pob` VARCHAR(200),
  `phone` VARCHAR(20),
  `address` TEXT,
  `parish_id` CHAR(36),
  `village` VARCHAR(100),
  `family_number` VARCHAR(20),
  `father_name` VARCHAR(100),
  `father_saint_name` VARCHAR(50),
  `mother_name` VARCHAR(100),
  `mother_saint_name` VARCHAR(50),
  `baptism_date` DATE,
  `baptism_place` VARCHAR(200),
  `baptism_book` VARCHAR(50),
  `first_communion_date` DATE,
  `first_communion_place` VARCHAR(200),
  `confirmation_date` DATE,
  `confirmation_place` VARCHAR(200),
  `confirmation_book` VARCHAR(50),
  `status` VARCHAR(20) DEFAULT 'active',
  `avatar_url` VARCHAR(500),
  `qr_code` VARCHAR(100),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`parish_id`) REFERENCES `parishes`(`id`)
);

-- 10. student_enrollments
CREATE TABLE IF NOT EXISTS `student_enrollments` (
  `id` CHAR(36) PRIMARY KEY,
  `student_id` CHAR(36) NOT NULL,
  `class_id` CHAR(36) NOT NULL,
  `academic_year_id` CHAR(36) NOT NULL,
  `enrollment_date` DATE DEFAULT (CURRENT_DATE),
  `status` VARCHAR(20) DEFAULT 'enrolled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_student_academic` (`student_id`, `academic_year_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`)
);

-- 11. teacher_assignments
CREATE TABLE IF NOT EXISTS `teacher_assignments` (
  `id` CHAR(36) PRIMARY KEY,
  `teacher_id` CHAR(36) NOT NULL,
  `class_id` CHAR(36) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'assistant',
  `assignment_date` DATE DEFAULT (CURRENT_DATE),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_teacher_class` (`teacher_id`, `class_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`)
);

-- 12. attendance_records
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` CHAR(36) PRIMARY KEY,
  `student_id` CHAR(36) NOT NULL,
  `class_id` CHAR(36) NOT NULL,
  `semester_id` CHAR(36) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `attendance_type` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `check_in_time` TIME,
  `recorded_by` CHAR(36),
  `recorded_at` TIMESTAMP NULL,
  `sync_status` VARCHAR(20) DEFAULT 'synced',
  `d2_sync_id` VARCHAR(50),
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`),
  FOREIGN KEY (`recorded_by`) REFERENCES `teachers`(`id`),
  UNIQUE KEY `uk_attendance_record` (`student_id`, `class_id`, `semester_id`, `attendance_date`, `attendance_type`)
);

-- 13. attendance_sync_logs
CREATE TABLE IF NOT EXISTS `attendance_sync_logs` (
  `id` CHAR(36) PRIMARY KEY,
  `sync_id` VARCHAR(50) UNIQUE NOT NULL,
  `attendant_name` VARCHAR(100),
  `attendant_phone` VARCHAR(20),
  `total_count` INTEGER DEFAULT 0,
  `success_count` INTEGER DEFAULT 0,
  `fail_count` INTEGER DEFAULT 0,
  `send_time` TIMESTAMP NULL,
  `complete_time` TIMESTAMP NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `raw_data` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 14. score_types (must exist before scores / score_configs FKs)
CREATE TABLE IF NOT EXISTS `score_types` (
  `id` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) UNIQUE NOT NULL,
  `display_position` INTEGER DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
);

-- 15. scores
CREATE TABLE IF NOT EXISTS `scores` (
  `id` CHAR(36) PRIMARY KEY,
  `student_id` CHAR(36) NOT NULL,
  `class_id` CHAR(36) NOT NULL,
  `semester_id` CHAR(36) NOT NULL,
  `score_type_id` CHAR(36) NOT NULL,
  `score_category` VARCHAR(20) NOT NULL,
  `score_value` DECIMAL(5,2),
  `score_order` INTEGER DEFAULT 1,
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`),
  FOREIGN KEY (`score_type_id`) REFERENCES `score_types`(`id`)
);

-- 16. class_transfers
CREATE TABLE IF NOT EXISTS `class_transfers` (
  `id` CHAR(36) PRIMARY KEY,
  `student_id` CHAR(36) NOT NULL,
  `from_class_id` CHAR(36),
  `from_academic_year_id` CHAR(36),
  `to_class_id` CHAR(36),
  `to_academic_year_id` CHAR(36) NOT NULL,
  `transfer_type` VARCHAR(20) NOT NULL,
  `transfer_date` DATE DEFAULT (CURRENT_DATE),
  `status` VARCHAR(20) DEFAULT 'pending',
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  FOREIGN KEY (`from_class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`to_class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`from_academic_year_id`) REFERENCES `academic_years`(`id`),
  FOREIGN KEY (`to_academic_year_id`) REFERENCES `academic_years`(`id`)
);

-- 17. attendance_configs
CREATE TABLE IF NOT EXISTS `attendance_configs` (
  `id` CHAR(36) PRIMARY KEY,
  `class_id` CHAR(36) NOT NULL,
  `semester_id` CHAR(36) NOT NULL,
  `config_type` VARCHAR(20) NOT NULL,
  `day_of_week` INTEGER,
  `is_enabled` BOOLEAN DEFAULT FALSE,
  `start_time` TIME,
  `end_time` TIME,
  `required_count` INTEGER DEFAULT 0,
  `allowed_absence` INTEGER DEFAULT 0,
  `count_all_mass_days` BOOLEAN DEFAULT FALSE,
  `disable_ethics_score` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_attendance_config` (`class_id`, `semester_id`, `config_type`, `day_of_week`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`)
);

-- 18. score_configs
CREATE TABLE IF NOT EXISTS `score_configs` (
  `id` CHAR(36) PRIMARY KEY,
  `class_id` CHAR(36) NOT NULL,
  `semester_id` CHAR(36) NOT NULL,
  `score_type_id` CHAR(36) NOT NULL,
  `column_count` INTEGER DEFAULT 1,
  `weight_factor` DECIMAL(3,1) DEFAULT 1.0,
  `academic_percentage` INTEGER DEFAULT 60,
  `diligence_percentage` INTEGER DEFAULT 40,
  `control_score` DECIMAL(3,1) DEFAULT 2.5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` CHAR(36),
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_score_config` (`class_id`, `semester_id`, `score_type_id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`),
  FOREIGN KEY (`score_type_id`) REFERENCES `score_types`(`id`)
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX idx_students_code ON students(code);
CREATE INDEX idx_students_name ON students(first_name, last_name);
CREATE INDEX idx_students_parish ON students(parish_id);
CREATE INDEX idx_students_status ON students(status);

CREATE INDEX idx_teachers_code ON teachers(code);
CREATE INDEX idx_teachers_name ON teachers(first_name, last_name);
CREATE INDEX idx_teachers_parish ON teachers(parish_id);
CREATE INDEX idx_teachers_status ON teachers(status);

CREATE INDEX idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX idx_classes_block ON classes(block_id);
CREATE INDEX idx_classes_name ON classes(name);

CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_student ON attendance_records(student_id, semester_id);
CREATE INDEX idx_attendance_class ON attendance_records(class_id, attendance_date);
CREATE INDEX idx_attendance_type ON attendance_records(attendance_type);

CREATE INDEX idx_scores_student ON scores(student_id, semester_id);
CREATE INDEX idx_scores_class ON scores(class_id, semester_id);
CREATE INDEX idx_scores_type ON scores(score_type_id, score_category);

CREATE INDEX idx_enrollments_student ON student_enrollments(student_id, academic_year_id);
CREATE INDEX idx_enrollments_class ON student_enrollments(class_id);

CREATE INDEX idx_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX idx_assignments_class ON teacher_assignments(class_id);

-- =====================================================
-- SEED DATA (RBAC & Sample Records)
-- =====================================================

-- 1. parishes
INSERT INTO `parishes` (id, code, name, address) VALUES 
('p1', 'NL', 'Nhã Lộng', 'Địa chỉ Nhã Lộng'),
('p2', 'SC', 'Soi Chiễn', 'Địa chỉ Soi Chiễn');

-- 2. blocks
INSERT INTO `blocks` (id, academic_year_id, code, name, display_order) VALUES 
('b1', 'ay2', 'CC', 'Chiên Con', 1),
('b2', 'ay2', 'AN', 'Ấu Nhi', 2);

-- RBAC: Roles
INSERT INTO `roles` (id, code, name, description) VALUES 
('r1', 'ADMIN', 'Quản trị viên', 'Toàn quyền hệ thống'),
('r2', 'SECRETARY', 'Thư ký đoàn', 'Quản lý hồ sơ, điểm, điểm danh toàn đoàn'),
('r3', 'BRANCH_SECRETARY', 'Quản lý ngành', 'Quản lý trong phạm vi ngành/khối được phân công'),
('r4', 'LECTURER', 'Giáo lý viên', 'Điểm danh và nhập điểm lớp được phân công');

-- RBAC: Permissions
INSERT INTO `permissions` (id, code, name, description) VALUES 
('perm1', 'student.read', 'Xem học viên', 'Quyền xem danh sách và chi tiết học viên'),
('perm2', 'student.create', 'Thêm học viên', 'Quyền thêm học viên mới'),
('perm3', 'student.update', 'Sửa học viên', 'Quyền cập nhật thông tin học viên'),
('perm4', 'student.delete', 'Xóa học viên', 'Quyền xóa học viên'),
('perm5', 'attendance.manage', 'Quản lý điểm danh', 'Quyền thực hiện điểm danh'),
('perm6', 'score.manage', 'Quản lý điểm số', 'Quyền nhập và sửa điểm'),
('perm7', 'class.transfer', 'Chuyển lớp', 'Quyền thực hiện xếp lớp/chuyển lớp'),
('perm8', 'department.manage', 'Quản lý ngành', 'Quyền quản lý cấu hình ngành/khối'),
('perm9', 'system.manage', 'Quản lý hệ thống', 'Quyền cấu hình hệ thống và người dùng');

-- RBAC: Role Permissions mapping
-- ADMIN: All permissions
INSERT INTO `role_permissions` (role_id, permission_id) SELECT 'r1', id FROM `permissions`;
-- SECRETARY: Most permissions except system.manage
INSERT INTO `role_permissions` (role_id, permission_id) SELECT 'r2', id FROM `permissions` WHERE code NOT IN ('system.manage');
-- BRANCH_SECRETARY: Student, attendance, score, transfer within department
INSERT INTO `role_permissions` (role_id, permission_id) SELECT 'r3', id FROM `permissions` WHERE code IN ('student.read', 'student.create', 'student.update', 'attendance.manage', 'score.manage', 'class.transfer');
-- LECTURER: Read student, manage attendance & score
INSERT INTO `role_permissions` (role_id, permission_id) SELECT 'r4', id FROM `permissions` WHERE code IN ('student.read', 'attendance.manage', 'score.manage');

-- 3. academic_years
INSERT INTO `academic_years` (id, name, note, is_current) VALUES 
('ay1', '2024-2025', 'Niên học trước', FALSE),
('ay2', '2025-2026', 'Niên học hiện tại', TRUE);

-- 4. semesters
INSERT INTO `semesters` (id, academic_year_id, name, semester_number, start_date, end_date) VALUES 
('s1', 'ay2', 'Học kỳ I', 1, '2025-09-01', '2026-01-15'),
('s2', 'ay2', 'Học kỳ II', 2, '2026-01-16', '2026-05-31');

-- 5. users
-- Mật khẩu mặc định cho tất cả account mẫu: admin123
INSERT INTO `users` (id, name, username, password_hash, role_id, sub_role_block_id, teacher_id) VALUES 
('u1', 'Admin', 'admin', '$2b$10$EIDtpZxVMWytOfT8Sd73Bul05zIMQD1slRs4F2BAmS1GeDIIxJ8a.', 'r1', NULL, NULL),
('u2', 'Quản lý ngành AN', 'thukyan', '$2b$10$EIDtpZxVMWytOfT8Sd73Bul05zIMQD1slRs4F2BAmS1GeDIIxJ8a.', 'r3', 'b2', NULL),
('u3', 'GLV Chiên Con 1', 'glv001', '$2b$10$EIDtpZxVMWytOfT8Sd73Bul05zIMQD1slRs4F2BAmS1GeDIIxJ8a.', 'r4', NULL, 't1');

-- 6. system_settings
INSERT INTO `system_settings` (id, `key`, `value`, description) VALUES 
('ss1', 'system_name', 'Hệ Thống Quản Lý TNTT', 'Tên hệ thống hiển thị'),
('ss2', 'parish_name', 'Giáo xứ Nhã Lộng', 'Tên giáo xứ');

-- 9. teachers
INSERT INTO `teachers` (id, code, first_name, last_name, gender, phone, parish_id) VALUES 
('t1', 'GLV001', 'Nguyễn Văn', 'A', 'male', '0912345678', 'p1'),
('t2', 'GLV002', 'Trần Thị', 'B', 'female', '0987654321', 'p2');

-- 7. classes
INSERT INTO `classes` (id, academic_year_id, block_id, name, head_teacher_id) VALUES 
('c1', 'ay2', 'b1', 'Chiên Con 1', 't1'),
('c2', 'ay2', 'b2', 'Ấu Nhi 1', 't2');

-- 8. students
INSERT INTO `students` (id, code, first_name, last_name, gender, parish_id) VALUES 
('st1', '2026001', 'Lê Văn', 'C', 'male', 'p1'),
('st2', '2026002', 'Phạm Thị', 'D', 'female', 'p2');

-- 10. student_enrollments
INSERT INTO `student_enrollments` (id, student_id, class_id, academic_year_id) VALUES 
('se1', 'st1', 'c1', 'ay2'),
('se2', 'st2', 'c2', 'ay2');

-- 11. teacher_assignments
INSERT INTO `teacher_assignments` (id, teacher_id, class_id, role) VALUES 
('ta1', 't1', 'c1', 'head'),
('ta2', 't2', 'c2', 'head');

-- 12. attendance_records
INSERT INTO `attendance_records` (id, student_id, class_id, semester_id, attendance_date, attendance_type, status) VALUES 
('ar1', 'st1', 'c1', 's1', '2025-09-07', 'catechism', 'present'),
('ar2', 'st2', 'c2', 's1', '2025-09-07', 'catechism', 'present');

-- 13. attendance_sync_logs
INSERT INTO `attendance_sync_logs` (id, sync_id, attendant_name, status) VALUES 
('sl1', 'SYNC001', 'Nguyễn Văn A', 'completed'),
('sl2', 'SYNC002', 'Trần Thị B', 'completed');

-- 14. score_types (before scores / score_configs — FK to score_types.id)
INSERT INTO `score_types` (id, name, code, display_position) VALUES 
('st-thi', 'Thi', 'THI', 0),
('st-dag', 'Đầu giờ', 'DAG', 1),
('st-15ph', '15 phút', '15PH', 2),
('st-45ph', '45 phút', '45PH', 3),
('st-kk', 'Khảo kinh', 'KK', 4),
('st-dd', 'Đạo đức', 'DD', 5);

-- 15. scores
INSERT INTO `scores` (id, student_id, class_id, semester_id, score_type_id, score_category, score_value) VALUES 
('sc1', 'st1', 'c1', 's1', 'st-thi', 'academic', 8.5),
('sc2', 'st2', 'c2', 's1', 'st-thi', 'academic', 9.0);

-- 16. class_transfers
INSERT INTO `class_transfers` (id, student_id, to_class_id, to_academic_year_id, transfer_type, status) VALUES 
('ct1', 'st1', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct2', 'st2', 'c2', 'ay2', 'new_enrollment', 'completed');

-- 17. attendance_configs
INSERT INTO `attendance_configs` (id, class_id, semester_id, config_type, day_of_week, is_enabled) VALUES 
('ac1', 'c1', 's1', 'catechism', 0, TRUE),
('ac2', 'c2', 's1', 'catechism', 0, TRUE);

-- 18. score_configs
INSERT INTO `score_configs` (id, class_id, semester_id, score_type_id, weight_factor) VALUES 
('scc1', 'c1', 's1', 'st-thi', 3.0),
('scc2', 'c2', 's1', 'st-thi', 3.0);
