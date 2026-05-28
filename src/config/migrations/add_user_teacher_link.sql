-- Liên kết tài khoản user với hồ sơ giáo lý viên (phân quyền LECTURER)
-- Chạy thủ công trên DB đã tồn tại

ALTER TABLE `users`
  ADD COLUMN `teacher_id` CHAR(36) NULL AFTER `sub_role_block_id`,
  ADD CONSTRAINT `fk_users_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL,
  ADD UNIQUE KEY `uk_users_teacher` (`teacher_id`);

-- Tài khoản mẫu GLV (mật khẩu: admin123) — chỉ chạy nếu chưa có u3
INSERT INTO `users` (id, name, username, password_hash, role_id, sub_role_block_id, teacher_id)
SELECT 'u3', 'GLV Chiên Con 1', 'glv001',
  '$2b$10$EIDtpZxVMWytOfT8Sd73Bul05zIMQD1slRs4F2BAmS1GeDIIxJ8a.', 'r4', NULL, 't1'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'u3' OR username = 'glv001');
