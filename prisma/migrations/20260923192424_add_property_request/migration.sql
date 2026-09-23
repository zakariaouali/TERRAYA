-- CreateTable
CREATE TABLE `PropertyRequest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `listingType` VARCHAR(191) NOT NULL,
    `propertyType` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `bedrooms` INTEGER NULL,
    `minBudget` BIGINT NULL,
    `maxBudget` BIGINT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PropertyRequest_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
