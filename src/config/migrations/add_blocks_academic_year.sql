-- Khối gắn với niên học (chạy một lần trên DB hiện có)
ALTER TABLE `blocks`
  ADD COLUMN `academic_year_id` CHAR(36) NULL AFTER `id`;

UPDATE `blocks` SET `academic_year_id` = (
  SELECT `id` FROM `academic_years` WHERE `is_current` = TRUE AND `deleted_at` IS NULL LIMIT 1
) WHERE `academic_year_id` IS NULL;

UPDATE `blocks` SET `academic_year_id` = 'ay2' WHERE `academic_year_id` IS NULL;

ALTER TABLE `blocks`
  MODIFY COLUMN `academic_year_id` CHAR(36) NOT NULL,
  ADD CONSTRAINT `fk_blocks_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`);

ALTER TABLE `blocks` DROP INDEX `code`;
ALTER TABLE `blocks`
  ADD UNIQUE KEY `uk_block_year_code` (`academic_year_id`, `code`),
  ADD UNIQUE KEY `uk_block_year_name` (`academic_year_id`, `name`);
