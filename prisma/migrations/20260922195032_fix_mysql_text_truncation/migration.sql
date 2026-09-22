-- AlterTable
ALTER TABLE `auditlog` MODIFY `metadata` TEXT NULL,
    MODIFY `userAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `consultationrequest` MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `message` TEXT NULL;

-- AlterTable
ALTER TABLE `inquiry` MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `newslettersignup` MODIFY `email` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `property` MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `tagline` VARCHAR(255) NULL,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `location` VARCHAR(255) NOT NULL,
    MODIFY `heroImage` VARCHAR(600) NOT NULL,
    MODIFY `images` TEXT NOT NULL,
    MODIFY `amenities` TEXT NOT NULL,
    MODIFY `highlights` TEXT NOT NULL,
    MODIFY `brochureUrl` VARCHAR(600) NULL,
    MODIFY `videoUrl` VARCHAR(600) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(255) NOT NULL;
