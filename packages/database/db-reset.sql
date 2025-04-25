-- Comprehensive Database Reset Script
-- This script handles dependencies and constraints in the proper order

-- Start a transaction to ensure all operations succeed or fail together
BEGIN;

-- Disable all triggers temporarily to avoid constraint violations
SET session_replication_role = 'replica';

-- Drop the unique index on merchant_id in the agents table if it exists
DROP INDEX IF EXISTS agents_merchant_id_key;

-- Clear all tables in reverse dependency order
TRUNCATE TABLE 
    balance_logs,
    blacklist,
    civil_complaints,
    export_files,
    logs,
    qna,
    notices,
    withdrawals,
    merchant_transaction_uri,
    merchant_wallet,
    merchant_fee,
    transaction_references,
    virtual_account,
    transaction,
    transaction_summary,
    pending_delivery_transaction,
    agents,
    merchants,
    merchant_groups,
    admins,
    users,
    roles,
    banks,
    bank_code_mappings
CASCADE;

-- Re-enable triggers
SET session_replication_role = 'default';

-- Apply the agent-merchant relationship fix
-- 1. Ensure the agent.merchant_id column is nullable 
ALTER TABLE IF EXISTS "agents" ALTER COLUMN "merchant_id" DROP NOT NULL;

-- 2. Create a trigger function to ensure each merchant has at least one agent
DROP FUNCTION IF EXISTS check_merchant_has_minimum_agents() CASCADE;

CREATE OR REPLACE FUNCTION check_merchant_has_minimum_agents()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the last agent for a merchant
    IF OLD.merchant_id IS NOT NULL AND 
       (SELECT COUNT(*) FROM agents WHERE merchant_id = OLD.merchant_id) <= 1 THEN
        RAISE EXCEPTION 'Cannot delete the last agent for merchant %', OLD.merchant_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS ensure_merchant_has_agents ON agents;

CREATE TRIGGER ensure_merchant_has_agents
BEFORE DELETE ON agents
FOR EACH ROW
EXECUTE FUNCTION check_merchant_has_minimum_agents();

-- 4. Add comments explaining the relationship constraints
COMMENT ON TABLE agents IS 'Agent records. Each agent can be assigned to 0 or 1 merchant. Each merchant must have at least one agent.';
COMMENT ON COLUMN agents.merchant_id IS 'Optional FK to the merchant this agent belongs to. Can be null for unassigned agents.';

-- Commit the transaction
COMMIT;

-- Done! The database is now reset and the relationship constraints are properly configured 