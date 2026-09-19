# PROEDGE Shoe Store Database Workflow

This project uses the official **Supabase CLI** to manage database schema migrations and seed data.

We **NEVER** manually paste SQL files into the Supabase Dashboard SQL Editor during normal development. All schema changes must be tracked in version control.

## 1. Directory Structure

- supabase/migrations/: Contains strictly ordered, timestamped SQL files. These define the actual production schema (tables, RLS policies, functions, storage configuration). **NO mock data is allowed here.**
- supabase/seed.sql: Contains development and test data only (fake products, dummy users, test orders). This is **never** applied to production.
- supabase/config.toml: Contains the project's Supabase CLI configuration. Secrets are strictly omitted and managed via environment variables.

## 2. Managing Migrations

When you need to change the database (e.g., adding a table, changing a policy):

1. **Create a new migration file:**
   ``bash
   npx supabase migration new my_descriptive_name
   ``
   This generates a timestamped file in supabase/migrations/ (e.g., 20240215120000_my_descriptive_name.sql).

2. **Write your SQL:**
   Edit the new file. Use idempotent PostgreSQL constructs where appropriate:
   - CREATE TABLE IF NOT EXISTS
   - CREATE INDEX IF NOT EXISTS
   - CREATE OR REPLACE FUNCTION
   - DROP POLICY IF EXISTS ...; CREATE POLICY ...

3. **Check migration status:**
   Verify what is pending before applying:
   ``bash
   npx supabase migration list
   ``

4. **Apply to your linked database:**
   ``bash
   npx supabase db push
   ``
   This command reads supabase_migrations.schema_migrations and applies ONLY the missing migrations sequentially.

## 3. Local Development

To spin up a local instance of the database (requires Docker):
``bash
npx supabase start
``
This automatically applies all migrations and loads supabase/seed.sql, giving you a fully seeded local testing environment at localhost:54322.

## 4. Production vs. Development

*   **Production**: Only receives the schema changes defined in supabase/migrations/ via the 
px supabase db push command (or via CI/CD pipelines). Production never touches seed.sql.
*   **Development/Testing**: Uses both migrations/ and seed.sql. Playwright tests run against this seeded data.

## 5. Mock Data vs Real Operations

Never write migrations that insert normal application data (e.g., creating categories or products). The application relies on Admin UI endpoints for real-world data entry. Only use supabase/seed.sql for fake development data.

## 6. Linking the Remote Project

Before running supabase db push or supabase migration list, you must link your local repository to your Supabase project using your Project Reference ID and a Database Password:
``bash
npx supabase link --project-ref your-project-ref
``
Do not commit passwords or service-role keys to Git.
