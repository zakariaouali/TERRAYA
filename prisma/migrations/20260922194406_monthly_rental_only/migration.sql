-- TERRAYA is long-term rental only (6-month minimum, enforced in the app,
-- not the schema). Nightly/weekly holiday rentals are discontinued, so the
-- rentalPeriod column (which only ever held "DAY" | "WEEK") is dropped.
ALTER TABLE `Property` DROP COLUMN `rentalPeriod`;
