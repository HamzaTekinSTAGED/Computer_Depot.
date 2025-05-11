-- AlterTable
ALTER TABLE `Product` MODIFY `description` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Like` (
    `userID` INTEGER NOT NULL,
    `commentUserID` INTEGER NOT NULL,
    `commentProductID` INTEGER NOT NULL,
    `isLiked` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Like_commentUserID_commentProductID_idx`(`commentUserID`, `commentProductID`),
    INDEX `Like_userID_idx`(`userID`),
    PRIMARY KEY (`userID`, `commentUserID`, `commentProductID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_commentUserID_commentProductID_fkey` FOREIGN KEY (`commentUserID`, `commentProductID`) REFERENCES `Comment`(`userId`, `productId`) ON DELETE CASCADE ON UPDATE CASCADE;
