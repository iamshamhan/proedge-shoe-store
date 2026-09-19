# PROEDGE Shoe Store — Database Workflow

This project uses the **Supabase CLI** (@supabase/cli) to manage database migrations in version control.

You should **never** need to paste SQL into the Supabase Dashboard SQL Editor for normal development or deployment.

---

## Directory Structure

```
supabase/
├── migrations/          ← Production schema changes (version-controlled)
│   ├── 20240101000001_schema.sql
│   ├── 20240101000002_add_settings.sql
│   ├── ...
│   └── 20240101000011_phase1_security_hardening.sql
├── seed.sql             ← Development/test data ONLY (never runs in production)
└── config.toml          ← Supabase CLI project configuration (no secrets)
```

---

## Production vs Development

| | Production | Development |
|---|---|---|
| Migrations | ✅ Applied via db push | ✅ Applied automatically on supabase start |
| seed.sql | ❌ Never applied | ✅ Applied automatically on supabase start |
| Mock products/orders | ❌ Use Admin UI | ✅ Loaded from seed.sql |

---

## Normal Application Data (no SQL needed)

These operations go through the application — not SQL files:

| Operation | How |
|---|---|
| Create/edit products | Admin UI → /admin/products |
| Create/edit categories | Admin UI → /admin/categories |
| Store settings | Admin UI → /admin/settings |
| Orders | Customer checkout flow |
| Customer accounts | Supabase Auth / application |

---

## Developer Workflow

### Linking the project (one-time setup)

Requires a Supabase Access Token (from https://supabase.com/dashboard/account/tokens)
and your database password (Supabase Dashboard → Project Settings → Database).

```bash
# Set access token (do not commit this)
$env:SUPABASE_ACCESS_TOKEN = "your-token"    # PowerShell
export SUPABASE_ACCESS_TOKEN="your-token"     # bash/zsh

# Link to the remote project
npx supabase link --project-ref ettkbxmmdflpxwjpircs
```

### Creating a new migration

```bash
npx supabase migration new describe_your_change
# Edit the generated file in supabase/migrations/
git add supabase/migrations/
git commit -m "chore(db): add describe_your_change migration"
```

### Checking migration status

```bash
npx supabase migration list --linked
```

Local and remote columns should match for all applied migrations.
Any migration with a local entry but empty remote is pending.

### Applying pending migrations to production

```bash
npx supabase db push --linked
```

This applies only migrations that are not yet in the remote history table.
It does NOT re-run already applied migrations.

### Dry-run (preview without applying)

```bash
npx supabase db push --linked --dry-run
```

---

## Migration History Reconciliation (completed 2026-09-19)

The first 11 migrations were originally applied manually via the Supabase SQL Editor
before this migration system was established.

They were reconciled using migration repair — which records them as applied in the
supabase_migrations.schema_migrations tracking table **without re-executing any SQL**:

```bash
npx supabase migration repair --status applied 20240101000001 --linked
# ... repeated for 20240101000002 through 20240101000011
```

All 11 migrations now appear as applied in both local and remote history.

---

## Security

- Never commit secrets, passwords, or access tokens
- The .env.local file (git-ignored) holds the anon key and Supabase URL
- The service-role key and database password are never stored in the repository
- Rotate credentials after any accidental exposure
