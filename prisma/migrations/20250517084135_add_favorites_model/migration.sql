-- CreateTable
CREATE TABLE `Favorite` (
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    INDEX `Favorite_userId_idx`(`userId`),
    INDEX `Favorite_productId_idx`(`productId`),
    PRIMARY KEY (`userId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productID`) ON DELETE CASCADE ON UPDATE CASCADE;
