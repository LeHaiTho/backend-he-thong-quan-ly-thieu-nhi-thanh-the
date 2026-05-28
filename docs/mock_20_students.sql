-- Tạo 20 học viên (tiếng Việt) và xếp vào lớp c1 (Chiên Con 1), năm học ay2
USE `he_thong_quan_ly_thieu_nhi_thanh_the`;

INSERT INTO `students` (id, code, saint_name, first_name, last_name, gender, dob, parish_id, status) VALUES 
('st_mock_01', '2026101', 'Giuse', 'Nguyễn Văn', 'An', 'male', '2016-01-15', 'p1', 'active'),
('st_mock_02', '2026102', 'Maria', 'Trần Thị', 'Bình', 'female', '2016-02-20', 'p1', 'active'),
('st_mock_03', '2026103', 'Phêrô', 'Lê Hoàng', 'Cường', 'male', '2016-03-05', 'p1', 'active'),
('st_mock_04', '2026104', 'Anna', 'Phạm Ngọc', 'Dung', 'female', '2016-04-12', 'p1', 'active'),
('st_mock_05', '2026105', 'Đaminh', 'Hoàng Minh', 'Đức', 'male', '2016-05-25', 'p1', 'active'),
('st_mock_06', '2026106', 'Têrêsa', 'Huỳnh Thị', 'Hoa', 'female', '2016-06-30', 'p1', 'active'),
('st_mock_07', '2026107', 'Vinhsơn', 'Phan Hữu', 'Hùng', 'male', '2016-07-08', 'p1', 'active'),
('st_mock_08', '2026108', 'Maria', 'Vũ Thu', 'Hương', 'female', '2016-08-14', 'p1', 'active'),
('st_mock_09', '2026109', 'Giuse', 'Võ Thanh', 'Kiên', 'male', '2016-09-22', 'p1', 'active'),
('st_mock_10', '2026110', 'Anna', 'Đặng Mai', 'Linh', 'female', '2016-10-18', 'p1', 'active'),
('st_mock_11', '2026111', 'Phanxicô', 'Bùi Xuân', 'Nam', 'male', '2016-11-03', 'p1', 'active'),
('st_mock_12', '2026112', 'Maria', 'Đỗ Như', 'Quỳnh', 'female', '2016-12-11', 'p1', 'active'),
('st_mock_13', '2026113', 'Giuse', 'Nguyễn Tuấn', 'Tài', 'male', '2016-01-28', 'p1', 'active'),
('st_mock_14', '2026114', 'Têrêsa', 'Trần Phương', 'Thảo', 'female', '2016-02-15', 'p1', 'active'),
('st_mock_15', '2026115', 'Phêrô', 'Lê Đình', 'Uyển', 'male', '2016-03-29', 'p1', 'active'),
('st_mock_16', '2026116', 'Anna', 'Phạm Bích', 'Vân', 'female', '2016-04-06', 'p1', 'active'),
('st_mock_17', '2026117', 'Đaminh', 'Hoàng Trọng', 'Khánh', 'male', '2016-05-19', 'p1', 'active'),
('st_mock_18', '2026118', 'Maria', 'Huỳnh Thanh', 'Trúc', 'female', '2016-06-02', 'p1', 'active'),
('st_mock_19', '2026119', 'Giuse', 'Phan Quốc', 'Bảo', 'male', '2016-07-17', 'p1', 'active'),
('st_mock_20', '2026120', 'Anna', 'Vũ Hồng', 'Ngọc', 'female', '2016-08-25', 'p1', 'active')
ON DUPLICATE KEY UPDATE first_name = VALUES(first_name);

INSERT INTO `student_enrollments` (id, student_id, class_id, academic_year_id) VALUES 
('se_mock_01', 'st_mock_01', 'c1', 'ay2'),
('se_mock_02', 'st_mock_02', 'c1', 'ay2'),
('se_mock_03', 'st_mock_03', 'c1', 'ay2'),
('se_mock_04', 'st_mock_04', 'c1', 'ay2'),
('se_mock_05', 'st_mock_05', 'c1', 'ay2'),
('se_mock_06', 'st_mock_06', 'c1', 'ay2'),
('se_mock_07', 'st_mock_07', 'c1', 'ay2'),
('se_mock_08', 'st_mock_08', 'c1', 'ay2'),
('se_mock_09', 'st_mock_09', 'c1', 'ay2'),
('se_mock_10', 'st_mock_10', 'c1', 'ay2'),
('se_mock_11', 'st_mock_11', 'c1', 'ay2'),
('se_mock_12', 'st_mock_12', 'c1', 'ay2'),
('se_mock_13', 'st_mock_13', 'c1', 'ay2'),
('se_mock_14', 'st_mock_14', 'c1', 'ay2'),
('se_mock_15', 'st_mock_15', 'c1', 'ay2'),
('se_mock_16', 'st_mock_16', 'c1', 'ay2'),
('se_mock_17', 'st_mock_17', 'c1', 'ay2'),
('se_mock_18', 'st_mock_18', 'c1', 'ay2'),
('se_mock_19', 'st_mock_19', 'c1', 'ay2'),
('se_mock_20', 'st_mock_20', 'c1', 'ay2')
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);

INSERT INTO `class_transfers` (id, student_id, to_class_id, to_academic_year_id, transfer_type, status) VALUES 
('ct_mock_01', 'st_mock_01', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_02', 'st_mock_02', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_03', 'st_mock_03', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_04', 'st_mock_04', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_05', 'st_mock_05', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_06', 'st_mock_06', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_07', 'st_mock_07', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_08', 'st_mock_08', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_09', 'st_mock_09', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_10', 'st_mock_10', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_11', 'st_mock_11', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_12', 'st_mock_12', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_13', 'st_mock_13', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_14', 'st_mock_14', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_15', 'st_mock_15', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_16', 'st_mock_16', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_17', 'st_mock_17', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_18', 'st_mock_18', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_19', 'st_mock_19', 'c1', 'ay2', 'new_enrollment', 'completed'),
('ct_mock_20', 'st_mock_20', 'c1', 'ay2', 'new_enrollment', 'completed')
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);
