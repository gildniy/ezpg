#!/bin/bash

# Complete Database Reset Script - Direct approach
# This script:
# 1. Drops and recreates the database
# 2. Uses turbo run prisma:migrate:reset to handle schema and data seeding

set -e  # Exit on error

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
elif [ -f ../../.env ]; then
  export $(grep -v '^#' ../../.env | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Please make sure it's defined in your .env file."
  exit 1
fi

# Parse DATABASE_URL for psql connection
# Format: postgresql://username:password@hostname:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\).*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Using database connection from DATABASE_URL environment variable"

# Step 1: Drop and recreate the database
echo "Dropping and recreating database: $DB_NAME"
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);"
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Step 2: Push schema directly (bypassing migrations) with --force-reset for clean slate
echo "Pushing Prisma schema directly (bypassing migrations)"
npx prisma db push --force-reset --schema=prisma/schema.prisma

# Step 3: Apply the agent-merchant relationship fix
echo "Applying agent-merchant relationship fix..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -d $DB_NAME -c "
-- Ensure the agent.merchant_id column is nullable 
ALTER TABLE IF EXISTS agents ALTER COLUMN merchant_id DROP NOT NULL;

-- Ensure no unique constraint on merchant_id
DROP INDEX IF EXISTS agents_merchant_id_key;

-- Add comments explaining the relationship constraints
COMMENT ON TABLE agents IS 'Agent records. Each agent can be assigned to 0 or 1 merchant. Each merchant must have at least one agent.';
COMMENT ON COLUMN agents.merchant_id IS 'Optional FK to the merchant this agent belongs to. Can be null for unassigned agents.';
"

# Step 4: Run seed script to populate database with initial data
echo "Running database seed..."
npx tsx prisma/seed.ts

echo "✅ Database has been completely reset and populated with fresh data!" 