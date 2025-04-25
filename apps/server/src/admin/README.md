# Admin Module

This module contains all the admin-related functionality for the EZPG system.

## ID Format Changes

We have updated the codebase to use string-based IDs consistently across:

- `user_id`
- `merchant_id`
- `agent_id`
- `admin_id`

### Updated Components

- Admin controllers now accept string IDs via APIs
- Admin services now handle string IDs for database operations
- JwtUser interface updated to use string userId
- Service methods updated to accept string-based IDs

### Critical Database Mismatch Issue

There is a critical mismatch between our code and database schema:

1. Our TypeScript code now expects `user_id`, `merchant_id`, and `agent_id` to be strings
2. But the Prisma schema (database) still has these fields as integers/numbers

**Required actions:**

1. Create a database migration to change the ID columns to string (VARCHAR) type

   ```bash
   npx prisma migrate dev --name update_id_columns_to_string
   ```

2. Update the Prisma schema to reflect the string types:

   ```prisma
   // Example change in schema.prisma
   model User {
     user_id    String    @id @default(uuid())
     // other fields...
   }
   ```

3. After running the migration, run:
   ```bash
   npx prisma generate
   ```

Until the database schema is updated, TypeScript errors will persist due to the type mismatch.

### Temporary Workaround (Not Recommended)

As a temporary workaround, you can use `as any` or type assertions to bypass the TypeScript errors, but this is not
recommended for production code as it only hides the issue rather than solving it.

```typescript
// Example (not recommended):
await prisma.user.findUnique({
  where: { user_id: userId as any },
});
```

### Potential Issues To Address

1. Database migrations might be needed to update ID columns
2. Foreign key constraints may need to be updated
3. Client-side code may need to be updated to handle string IDs
4. Authentication flow might require updates if tokens contain userId

### Linter Errors

There may still be linter errors in parts of the codebase where we have references to numeric IDs.
These should be updated as they are encountered with proper type conversions.

## Next Steps

1. Create and apply the database migration to change ID columns to string type
2. Update Prisma schema to use string types for ID fields
3. Test the admin functionality thoroughly
4. Update client-side code to handle string IDs
5. Run linter across the entire codebase to identify remaining type mismatches
