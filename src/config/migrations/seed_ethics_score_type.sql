-- Chạy một lần nếu thiếu loại điểm Đạo đức (DD)
INSERT IGNORE INTO `score_types` (id, name, code, display_position) VALUES
('st-dd', 'Đạo đức', 'DD', 5);
