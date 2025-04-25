-- Fix for Prisma Studio error with nullable merchant_id
-- This fixes the issue with the error: 
-- Error converting field "merchant_id" of expected non-nullable type "String", found incompatible value of "null"

-- Check for any null merchant_id values in the agents table
SELECT agent_id, merchant_id FROM agents WHERE merchant_id IS NULL;

-- The issue is with Prisma Studio's handling of nullable relationships
-- The Agent model has a nullable merchant_id which is correct
-- But Prisma Studio is expecting it to be non-nullable when joining with User

-- No actual database change is needed, as the schema is correct
-- This is likely a prisma-client issue with how it handles nulls in relations

-- To work around this in Prisma Studio temporarily, you can:
-- 1. Manually edit the relation in the Studio interface
-- 2. Or restart Prisma Studio with a fresh connection
-- 3. Or use a different client to view the data 