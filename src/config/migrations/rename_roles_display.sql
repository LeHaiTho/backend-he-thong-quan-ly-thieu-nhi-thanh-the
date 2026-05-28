-- Đổi tên hiển thị vai trò (giữ nguyên code RBAC)
UPDATE `roles` SET `name` = 'Thư ký đoàn', `description` = 'Quản lý hồ sơ, điểm, điểm danh toàn đoàn' WHERE `code` = 'SECRETARY';
UPDATE `roles` SET `name` = 'Quản lý ngành', `description` = 'Quản lý trong phạm vi ngành/khối được phân công' WHERE `code` = 'BRANCH_SECRETARY';
UPDATE `roles` SET `name` = 'Giáo lý viên', `description` = 'Điểm danh và nhập điểm lớp được phân công' WHERE `code` IN ('LECTURER', 'VIEWER');
UPDATE `users` SET `name` = 'Quản lý ngành AN' WHERE `username` = 'thukyan' AND `role_id` = 'r3';
