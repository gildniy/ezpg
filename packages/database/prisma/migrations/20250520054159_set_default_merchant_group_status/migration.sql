-- Set default status for existing merchant groups
UPDATE "merchant_groups"
SET "status" = 'ACTIVE'
WHERE "status" IS NULL; 