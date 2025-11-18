-- AlterTable: JobHistory 컬럼 변경 (터미널 코드 → 터미널 이름)
-- 기존 데이터를 Terminal 테이블과 조인하여 이름으로 변환

-- 1. 새로운 컬럼 추가
ALTER TABLE `job_history` ADD COLUMN `departure` VARCHAR(50) NULL;
ALTER TABLE `job_history` ADD COLUMN `arrival` VARCHAR(50) NULL;

-- 2. 기존 데이터 마이그레이션 (코드 → 이름)
UPDATE `job_history` jh
LEFT JOIN `terminals` t1 ON jh.`depr_cd` = t1.`terminal_cd`
LEFT JOIN `terminals` t2 ON jh.`arvl_cd` = t2.`terminal_cd`
SET
  jh.`departure` = COALESCE(t1.`terminal_nm`, jh.`depr_cd`),
  jh.`arrival` = COALESCE(t2.`terminal_nm`, jh.`arvl_cd`);

-- 3. NOT NULL 제약 조건 추가
ALTER TABLE `job_history` MODIFY COLUMN `departure` VARCHAR(50) NOT NULL;
ALTER TABLE `job_history` MODIFY COLUMN `arrival` VARCHAR(50) NOT NULL;

-- 4. 기존 컬럼 삭제
ALTER TABLE `job_history` DROP COLUMN `depr_cd`;
ALTER TABLE `job_history` DROP COLUMN `arvl_cd`;
