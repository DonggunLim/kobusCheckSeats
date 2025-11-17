-- CreateTable
CREATE TABLE `terminals` (
    `terminal_cd` VARCHAR(10) NOT NULL,
    `terminal_nm` VARCHAR(50) NOT NULL,
    `area_cd` VARCHAR(5) NULL,

    INDEX `idx_terminal_nm`(`terminal_nm`),
    PRIMARY KEY (`terminal_cd`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `routes_direct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depr_cd` VARCHAR(10) NOT NULL,
    `arvl_cd` VARCHAR(10) NOT NULL,
    `take_time` SMALLINT NULL,
    `home_tick_yn` CHAR(1) NULL DEFAULT 'N',
    `prmm_dc_yn` CHAR(1) NULL DEFAULT 'N',

    INDEX `arvl_cd`(`arvl_cd`),
    UNIQUE INDEX `uq_route`(`depr_cd`, `arvl_cd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `routes_transfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depr_cd` VARCHAR(10) NOT NULL,
    `arvl_cd` VARCHAR(10) NOT NULL,
    `tfr_cd` VARCHAR(10) NOT NULL,
    `arvl_nm_all` VARCHAR(100) NULL,

    INDEX `arvl_cd`(`arvl_cd`),
    INDEX `tfr_cd`(`tfr_cd`),
    UNIQUE INDEX `uq_route_tfr`(`depr_cd`, `arvl_cd`, `tfr_cd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `area_codes` (
    `area_cd` VARCHAR(5) NOT NULL,
    `area_nm` VARCHAR(30) NOT NULL,

    INDEX `idx_area_nm`(`area_nm`),
    PRIMARY KEY (`area_cd`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bus_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depr_cd` VARCHAR(10) NOT NULL,
    `arvl_cd` VARCHAR(10) NOT NULL,
    `departure_time` VARCHAR(5) NOT NULL,
    `bus_class` VARCHAR(20) NULL,
    `bus_company` VARCHAR(50) NULL,
    `is_via_route` BOOLEAN NOT NULL DEFAULT false,
    `via_location` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_route`(`depr_cd`, `arvl_cd`),
    INDEX `idx_time`(`departure_time`),
    UNIQUE INDEX `uq_schedule`(`depr_cd`, `arvl_cd`, `departure_time`, `bus_class`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_id` VARCHAR(50) NOT NULL,
    `depr_cd` VARCHAR(10) NOT NULL,
    `arvl_cd` VARCHAR(10) NOT NULL,
    `target_month` VARCHAR(7) NOT NULL,
    `target_date` VARCHAR(10) NOT NULL,
    `target_times` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'waiting',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `result` TEXT NULL,
    `error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `completed_at` DATETIME(3) NULL,

    UNIQUE INDEX `job_history_job_id_key`(`job_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `routes_direct` ADD CONSTRAINT `routes_direct_ibfk_1` FOREIGN KEY (`depr_cd`) REFERENCES `terminals`(`terminal_cd`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `routes_direct` ADD CONSTRAINT `routes_direct_ibfk_2` FOREIGN KEY (`arvl_cd`) REFERENCES `terminals`(`terminal_cd`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `routes_transfer` ADD CONSTRAINT `routes_transfer_ibfk_1` FOREIGN KEY (`depr_cd`) REFERENCES `terminals`(`terminal_cd`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `routes_transfer` ADD CONSTRAINT `routes_transfer_ibfk_2` FOREIGN KEY (`arvl_cd`) REFERENCES `terminals`(`terminal_cd`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `routes_transfer` ADD CONSTRAINT `routes_transfer_ibfk_3` FOREIGN KEY (`tfr_cd`) REFERENCES `terminals`(`terminal_cd`) ON DELETE NO ACTION ON UPDATE NO ACTION;
