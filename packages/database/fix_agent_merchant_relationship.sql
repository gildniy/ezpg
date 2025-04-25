-- Step 1: Drop the unique index on agent.merchant_id if it exists
DROP INDEX IF EXISTS agents_merchant_id_key;

-- Step 2: Modify the agent.merchant_id column to be nullable if not already
ALTER TABLE "agents" ALTER COLUMN "merchant_id" DROP NOT NULL;

-- Step 3: Create a trigger to ensure each merchant has at least one agent
-- This trigger prevents deleting an agent if it would leave a merchant with zero agents
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

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS ensure_merchant_has_agents ON agents;

-- Create the trigger
CREATE TRIGGER ensure_merchant_has_agents
BEFORE DELETE ON agents
FOR EACH ROW
EXECUTE FUNCTION check_merchant_has_minimum_agents();

-- Step 4: Add a comment explaining the relationship constraints
COMMENT ON TABLE agents IS 'Agent records. Each agent can be assigned to 0 or 1 merchant. Each merchant must have at least one agent.';
COMMENT ON COLUMN agents.merchant_id IS 'Optional FK to the merchant this agent belongs to. Can be null for unassigned agents.';

-- Done! The relationship now allows:
-- 1. An agent can belong to 0 or 1 merchant (nullable merchant_id)
-- 2. A merchant must have at least 1 agent (enforced by trigger)
-- 3. Multiple agents can be assigned to the same merchant (no unique constraint) 