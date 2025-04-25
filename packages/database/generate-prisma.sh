#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set the schema path
SCHEMA_PATH="$DIR/prisma/schema.prisma"

echo "Generating Prisma client from schema at $SCHEMA_PATH"

# Run the prisma generate command with the absolute path
npx prisma generate --schema="$SCHEMA_PATH"

exit_code=$?
if [ $exit_code -ne 0 ]; then
  echo "Error: Prisma client generation failed with exit code $exit_code"
  exit $exit_code
fi

echo "Prisma client generation completed successfully" 