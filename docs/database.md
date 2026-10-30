# Database workflow

PROEDGE production project: `ettkbxmmdflpxwjpircs`. Schema changes live in [supabase/migrations](../supabase/migrations); rollback regression scripts live in [supabase/tests](../supabase/tests). Never load seed data into production. The live schema, migration ledger and advisors were checked on 30 October 2026.

## Create and review migrations

1. Run `npx supabase migration new describe_your_change` and edit the generated file.
2. Inspect the target project's schema and migration ledger before applying changes.
3. Test against an isolated database where possible. Regression scripts create synthetic fixtures and roll them back; inspect each script before running it.
4. Apply the reviewed migration using the Supabase CLI or connected migration tool, verify the function/table grants and behavior, then deploy dependent application code.
5. If the connected tool assigns a different version, reconcile the local filename with the version actually recorded remotely.

On restricted Windows workstations, `SUPABASE_TELEMETRY_DISABLED=1` avoids the CLI attempting to write telemetry outside the project.

## Existing migration history discrepancy

The 30 October inspection found migrations 20240101000001 through 20240101000011 in production but not [20240101000012_whatsapp_inquiry_orders.sql](../supabase/migrations/20240101000012_whatsapp_inquiry_orders.sql), although the live inquiry workflow exists. The ledger also omits [server-only checkout](../supabase/migrations/20261026165353_server_only_checkout.sql) and [store logos](../supabase/migrations/20261028143000_store_logos.sql), despite their functions/tables/columns being present. Inspect the deployed definitions and reconcile history before a bulk `db push` or replay of those migrations.

Image reordering was actually absent and was applied as `20261030104146`. Admin read models/indexes and the admin INSERT privilege repair were applied as `20261030104305` and `20261030104441`. Local filenames match the versions assigned by the connected migration tool.

October migrations add transactional order/inventory operations, authoritative checkout prices and retry receipts, function privilege hardening, stale-order revision checks, atomic product duplication/image reordering, server-only checkout limits and configurable logos. Compare every local migration with the target ledger; file presence does not establish that it has been applied. See [remaining repair and release checks](REVIEW_AND_FIXES.md).

## Tests and access

- `order_inventory.sql`: repeat confirmation/cancellation, insufficient stock rollback and fulfilled-history deletion.
- `order_revisions.sql`: stale save/status/delete rejection.
- `checkout.sql`: database prices, request identity, WhatsApp, inquiry stock behavior and throttling.
- `checkout-security.sql`: server-only checkout grants and durable IP/email limits.
- `rls.sql`: anonymous table and admin-RPC privilege rejection.
- `catalog.sql`: duplication, size-system preservation and stale stock compare-and-set; transaction rolls back.
- `admin_read_models.sql`: admin authorization, stock/search pagination across 27 fixture products, revenue, product timestamp conflicts and atomic image reordering.

Admin RPCs use invoker security, require trusted admin claims and retain table RLS. `place_order` and `consume_checkout_limits` are executable only by `service_role`; direct order inserts remain revoked from `anon`. [The admin privilege repair](../supabase/migrations/20261030104441_restore_admin_order_inserts.sql) restores authenticated INSERT with restrictive admin-only policies, so admin RPCs work and signed-in non-admins remain denied. The [server-only writer](../src/lib/checkout-security.ts) verifies Turnstile before using the secret key. The private receipt/limit tables have no client grants.

Prefer an isolated database for SQL regression scripts. Review their fixture scope and rollback behavior first. Inventory and revision tests explicitly switch to the authenticated role as well as setting admin claims; the RLS script tests anonymous and authenticated non-admin denial. Checkout's functional script uses the privileged role, while checkout-security tests its grants and durable limits. All seven passed on 30 October using rollback fixtures in the connected project.

Keep database passwords and access tokens in local/provider secret storage. No credentials belong in migrations, tests or Git.
