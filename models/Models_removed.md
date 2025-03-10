# MongoDB Models Removed

The MongoDB models (`user.model.js` and `content.model.js`) have been removed from this project as we've migrated to Supabase for authentication and data storage.

## Why Were These Files Removed?

We've migrated from:
- MongoDB → PostgreSQL (Supabase)
- Mongoose → Supabase Database
- Custom JWT Authentication → Supabase Auth

## Where Is The Schema Now?

The database schema is now defined in SQL and managed through Supabase:

1. User data is split between:
   - `auth.users` table (managed by Supabase Auth)
   - `public.profiles` table (our custom user profile data)

2. Content data is stored in:
   - `public.content` table

## Reference Documentation

For details on the new schema structure, please refer to:
- `schemas/README.md` for schema documentation
- `supabase/schema.sql` for the complete SQL schema definition
- `SUPABASE_SETUP.md` for setup instructions

## Code References

The application now interacts with Supabase instead of MongoDB:

- Frontend: Uses the Supabase JavaScript client
- Backend: Uses the Supabase Node.js client
- API requests: Authenticated with Supabase JWT tokens