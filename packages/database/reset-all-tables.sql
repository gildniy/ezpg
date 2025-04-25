-- Reset all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Disable all triggers temporarily
    EXECUTE 'SET session_replication_role = replica';
    
    -- Truncate all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
    
    -- Re-enable triggers
    EXECUTE 'SET session_replication_role = DEFAULT';
END $$; 