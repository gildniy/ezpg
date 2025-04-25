# Deposits Module

This module handles merchant deposit management in the admin panel.

## Overview

The Deposits module provides an abstraction layer over the Transaction table, presenting deposit transactions in a
user-friendly format for the admin panel. It doesn't use a dedicated Deposit table but calculates deposit information
from the existing Transaction records.

## Setup

1. The module is now configured to use Prisma for database operations.

2. To set up the database schema, run the following commands:

```bash
# Set the DATABASE_URL environment variable
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ezpg"

# Create the migration
cd packages/database && npx prisma migrate dev --name add_deposits_model

# Apply the migration
cd packages/database && npx prisma migrate deploy
```

3. Alternatively, you can add the DATABASE_URL to your `.env` file in the `packages/database` directory.

## Features

- View and filter deposit transactions
- Role-based access control:
  - Admins can only see transactions from merchants they created
  - Superadmins can see all transactions or filter by specific admin
- Search by multiple criteria:
  - Transaction ID
  - Bank (은행)
  - Virtual Account (가상계좌)
  - Format (형식)
  - Status (상태)
  - Depositor Name (입금자명)
  - Deposit Amount (입금금액)
- Show detailed deposit statistics
- Export deposits to Excel
- View detailed deposit information

## API Endpoints

- `GET /admin/deposits` - Get paginated deposits with optional filters
- `GET /admin/deposits/stats` - Get deposit statistics
- `GET /admin/deposits/:id` - Get detailed deposit information
- `POST /admin/deposits/export` - Export deposits to Excel

## Implementation Details

The module is implemented using:

- Prisma ORM for database operations on the Transaction table
- ExcelJS for Excel export
- NestJS for API endpoints with Swagger documentation

## Notes for Developers

- All deposit records are calculated from the Transaction table, filtering for transaction_status="0" (DEPOSIT)
- Fees are calculated based on the merchant's deposit_fee_percent setting
- Deposit IDs are composite strings in the format: `transaction_date|van_id|van_transaction_id`
- Role-based access is enforced at the service level:
  - The user's ID and role are extracted from the JWT token
  - Admins are restricted to seeing only their merchants' data
  - Superadmins can see all data or filter by specific admin
