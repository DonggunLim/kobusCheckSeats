-- CreateTable: job_history
-- 실행 방법: 크롤링 완료 후 Docker 컨테이너에서 실행
-- docker exec kobus-mysql mysql -u root -p kobus < prisma/migrations/add_job_history.sql

CREATE TABLE IF NOT EXISTS `job_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `job_id` VARCHAR(50) NOT NULL,
  `depr_cd` VARCHAR(10) NOT NULL,
  `arvl_cd` VARCHAR(10) NOT NULL,
  `target_month` VARCHAR(7) NOT NULL,
  `target_date` VARCHAR(10) NOT NULL,
  `target_times` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'waiting',
  `progress` INT NOT NULL DEFAULT 0,
  `result` TEXT NULL,
  `error` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `completed_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `job_history_job_id_key` (`job_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
