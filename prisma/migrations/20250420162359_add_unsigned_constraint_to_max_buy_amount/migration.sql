/*
  Warnings:

  - You are about to alter the column `maxBuyAmount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.

*/
-- AlterTable
ALTER TABLE `Product` MODIFY `maxBuyAmount` INTEGER UNSIGNED NOT NULL DEFAULT 1;
