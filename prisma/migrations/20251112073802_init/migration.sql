/*
  Warnings:

  - You are about to drop the `region_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `region_codes`;

-- CreateTable
CREATE TABLE `area_codes` (
    `area_cd` VARCHAR(5) NOT NULL,
    `area_nm` VARCHAR(30) NOT NULL,

    INDEX `idx_area_nm`(`area_nm`),
    PRIMARY KEY (`area_cd`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
