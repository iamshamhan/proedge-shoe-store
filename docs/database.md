# Database workflow

PROEDGE production project: `ettkbxmmdflpxwjpircs`. Schema changes live in `supabase/migrations`; rollback regression scripts live in `supabase/tests`. Never load seed data into production.

## Create and review migrations

1. Run `npx supabase migration new describe_your_change` and edit the generated file.
2. Inspect the target project's schema and migration ledger before applying changes.
3. Test against an isolated database where possible. Regression scripts create synthetic fixtures and roll them back; inspect each script before running it.
4. Apply the reviewed migration using the Supabase CLI or connected migration tool, verify the function/table grants and behavior, then deploy dependent application code.
5. If the connected tool assigns a different version, reconcile the local filename with the version actually recorded remotely.

On restricted Windows workstations, `SUPABASE_TELEMETRY_DISABLED=1` avoids the CLI attempting to write telemetry outside the project.

## Existing migration history discrepancy

Production contains migrations 20240101000001 through 20240101000011. Local `20240101000012_whatsapp_inquiry_orders.sql` is absent from its ledger, although the live inquiry workflow was already present before the October repairs. Do not blindly run a bulk `db push` or replay that historical migration. Inspect the deployed definitions and reconcile history first.

October repair migrations add transactional order/inventory operations, authoritative checkout prices and retry receipts, function privilege hardening, stale-order revision checks, and atomic product duplication. The current authoritative applied versions and verification limits are recorded in `REVIEW_AND_FIXES.md`.

## Tests and access

- `order_inventory.sql`: repeat confirmation/cancellation, insufficient stock rollback and fulfilled-history deletion.
- `order_revisions.sql`: stale save/status/delete rejection.
- `checkout.sql`: database prices, request identity, WhatsApp, inquiry stock behavior and throttling.
- `rls.sql`: anonymous table and admin-RPC privilege rejection.
- `catalog.sql`: duplication, size-system preservation and stale stock compare-and-set; transaction rolls back.

Admin RPCs use invoker security, require trusted admin claims and retain table RLS. Guest checkout intentionally exposes `place_order` with definer security and explicit input/rate checks. The private request receipt table intentionally has no client policies or grants.

Keep database passwords and access tokens in local/provider secret storage. No credentials belong in migrations, tests or Git.
