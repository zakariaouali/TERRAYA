-- AlterTable
ALTER TABLE `property` ADD COLUMN `features` VARCHAR(500) NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE INDEX `Property_listingType_status_idx` ON `Property`(`listingType`, `status`);

-- CreateIndex
CREATE INDEX `Property_priceEur_idx` ON `Property`(`priceEur`);
