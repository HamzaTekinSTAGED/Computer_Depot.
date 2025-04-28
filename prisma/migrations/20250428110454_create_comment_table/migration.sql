-- CreateTable
CREATE TABLE `Comment` (
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `star` INTEGER NOT NULL,
    `comment` VARCHAR(200) NULL,
    `getLiked` INTEGER NOT NULL DEFAULT 0,
    `photo` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Comment_userId_idx`(`userId`),
    INDEX `Comment_productId_idx`(`productId`),
    PRIMARY KEY (`userId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productID`) ON DELETE CASCADE ON UPDATE CASCADE;
