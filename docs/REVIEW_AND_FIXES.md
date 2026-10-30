# Repair status — 30 October 2026

The historical handover was removed after its source repairs were verified. This short file remains because release verification and configuration work below are still outstanding.

## Fixed and verified

- **Admin order creation and edits were broken in the live database.** Checkout hardening revoked INSERT from the authenticated role, but admin RPCs use invoker security. [The repair](../supabase/migrations/20261030104441_restore_admin_order_inserts.sql) restores authenticated INSERT behind restrictive admin-only RLS policies. Guest and signed-in non-admin writes remain denied. Applied to production.
- **Image reordering called a missing production RPC.** [The atomic function](../supabase/migrations/20261030104146_atomic_image_reordering.sql) is now installed; invalid image lists are rejected without partial changes. The local version matches the remote ledger.
- **Old editor tabs could overwrite newer changes.** [Admin actions](../src/app/admin/actions.ts) compare loaded product/settings timestamps, reject stale or deleted rows, validate inputs and return the next settings timestamp. The forms send and retain those versions.
- **Dashboard errors looked like zero totals, and low-stock counts stopped at eight.** [The dashboard](../src/app/admin/page.tsx) surfaces query failures, uses database revenue aggregates and shows the full count alongside its bounded preview. [Product stock filters](../src/app/admin/products/page.tsx) filter and paginate in PostgreSQL. [The read-model migration](../supabase/migrations/20261030104305_admin_read_models.sql) also adds both missing order-item foreign-key indexes; applied to production.
- **Public cached data could remain stale after admin edits.** Successful catalog/order/category and settings mutations expire the appropriate cache tags as well as affected paths.
- **The normal build crashed in Turbopack's CSS subprocess.** The documented webpack option is now the default for development/build scripts. Opt-in Turbopack commands remain for diagnosis; the underlying crash is not claimed fixed.
- **Repository cleanup and branding are complete.** Removed obsolete handover/diagnostics, duplicate proxy and images, unused starter SVGs and mock merchandise. Shared filtering/currency helpers live in [src/lib](../src/lib). The app uses the new SVG logos and retains both original JPEGs. Old built-in JPEG settings resolve to SVG; uploaded logos are preserved.

## Verification

- 63 unit tests pass, including stale saves, invalid input, repeated settings saves, reporting failures and stock-pagination parameters.
- TypeScript, ESLint and the regular webpack production build pass; all 44 pages generate.
- All seven [SQL regression scripts](../supabase/tests) pass against the connected database using rollback fixtures. Admin inventory/revision tests now set the authenticated database role, exposing the INSERT regression missed by earlier privileged tests. Guest/non-admin permission checks pass. Fixture catalog rows were confirmed absent afterward.
- Browser verification will be recorded after the final suite run. Real production Turnstile interaction is separate from mocked checkout tests.
- No commit, push or Vercel application deployment was performed. The connected production deployment inspected still references `dad39d67acb80cb4482978fe2da1c42fa5b15d1b`; local application repairs need release.

## Remaining release and maintenance work

1. **Release and live checkout:** deploy the reviewed application changes, then verify a genuine Turnstile challenge, inquiry receipt, retry identity and WhatsApp handoff. Production environment variable names are present; this does not validate their values or challenge hostname/action. Supabase and Turnstile variables currently target production only, so preview deployments need separate configuration.
2. **Historical migration ledger:** the ledger still omits `20240101000012`, `20261026165353` and `20261028143000`, although inquiry behavior, checkout-limit protection and logo columns exist. Reconcile definitions/history before bulk migration push; do not replay old scripts blindly. Today's three repairs have matching local/remote versions. See [database workflow](database.md).
3. **Leaked-password protection:** the live Auth advisor reports it disabled. This organization is on the Free plan; Supabase provides this control on [Pro and above](https://supabase.com/docs/guides/auth/password-security). No paid plan change was made.
4. **Browser admin lifecycle/cache:** SQL tests cover database behavior. A complete authenticated browser run still needs a dedicated fixture and credentials; the cache mutation test stays opt-in.
5. **Optional maintenance:** physical storage orphan cleanup needs a shared-reference/retention design. The remaining overlapping read-policy and unused-index advisories are not evidence of a broken workflow; do not delete policies/indexes just to silence them.
