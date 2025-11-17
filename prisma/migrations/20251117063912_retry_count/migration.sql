/*
  Warnings:

  - You are about to drop the column `progress` on the `job_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `job_history` DROP COLUMN `progress`,
    ADD COLUMN `retry_count` INTEGER NOT NULL DEFAULT 0;
