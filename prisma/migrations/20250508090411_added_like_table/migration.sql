-- CreateTable
CREATE TABLE `Reply` (
    `replyID` INTEGER NOT NULL AUTO_INCREMENT,
    `commentUser` INTEGER NOT NULL,
    `commentProduct` INTEGER NOT NULL,
    `userID` INTEGER NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Reply_commentUser_commentProduct_idx`(`commentUser`, `commentProduct`),
    INDEX `Reply_userID_idx`(`userID`),
    PRIMARY KEY (`replyID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reply` ADD CONSTRAINT `Reply_commentUser_commentProduct_fkey` FOREIGN KEY (`commentUser`, `commentProduct`) REFERENCES `Comment`(`userId`, `productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reply` ADD CONSTRAINT `Reply_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`userID`) ON DELETE CASCADE ON UPDATE CASCADE;
