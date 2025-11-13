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
