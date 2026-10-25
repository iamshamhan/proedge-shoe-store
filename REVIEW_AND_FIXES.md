# PROEDGE review and repair status

Historical review from 23 October 2026; see the 24 October release update below for current status. This records source review and the checks actually completed; it is not a claim that the new frontend is deployed or that every browser flow has passed.

## Tours comparison: correction to the initial findings

Tours changed after the initial review. Its current files must take precedence over the earlier findings. No Tours files were modified during this PROEDGE repair.

| Initial Tours finding | Impact in the earlier version | Current evidence and status |
| --- | --- | --- |
| Anonymous database inserts bypassed the Server Action's Turnstile check | A caller could submit directly to the public API. Caller-controlled submission headers were not a trusted bot boundary. | `20261021223249_server_only_submissions.sql` revokes anonymous inserts, restricts the submission RPC to `service_role`, and removes the old trigger. This migration is present in the connected Tours database ledger. |
| Reviews lacked Turnstile verification | Honeypots, moderation and throttles alone did not establish a verified visitor. | `src/lib/supabase/submissions.ts` verifies Turnstile for both inquiries and reviews and verifies an IP-bound signed form ticket. Fixed in current source; browser deployment configuration has not been verified here. |
| Every detail request loaded the entire catalogue without persistent caching | Database work and transferred data grew with all tours, places, itinerary days, stops and media. | `src/lib/public/cache.ts` now provides a 60-second persistent cache. `getTourDetail` scopes related reads. `getCatalogue` still reads the full catalogue where explicitly used, so large catalogue/map payloads remain a scaling consideration. |
| Read failures became empty content or missing pages | Visitors could see misleading empty lists or 404s during an outage. | `dataFailure` now raises `PublicDataError`; database and schema-validation failures are not silently swallowed. A genuinely unpublished/missing configuration still intentionally hides content. |
| Compressed source and stale README | Maintenance and correct deployment were harder. | The reviewed files are formatted; README documents the server-only submission secret, Turnstile and test commands. This finding is no longer current for those files. |

Tours remains the stronger reference for structured validation, content editing, public submission protection and scoped content queries. PROEDGE serves a different purpose: product variants, cart, WhatsApp inquiries and stock-reserving order confirmation. More commerce features do not by themselves mean better implementation quality. No visual-design winner is claimed without a current browser comparison.

## PROEDGE fixes

| Problem | Change | Deployment status |
| --- | --- | --- |
| Failed order edits could partially restore/deduct stock | Admin save, status changes and deletion now have transactional RPCs with ordered row locks, input checks and admin authorization. Frontend actions call these RPCs. | Database functions applied; frontend source pending deployment. |
| Deleting delivered history restored goods already sold | Delivered deletion leaves inventory unchanged. Reserved orders must be cancelled before deletion; shipped/delivered orders cannot be cancelled through this workflow. | Database applied; frontend source pending deployment. |
| Checkout prices differed from displayed product prices | Checkout uses `products.price`; it no longer silently applies a sitewide percentage. Settings explain that promotion text does not change product prices. | Database applied; settings UI pending deployment. |
| Repeated submissions created duplicate inquiries | Optional request IDs have a private database receipt and payload fingerprint. A retry returns the same result; changed payloads cannot reuse the ID. Client keeps the same ID while retrying the same form in the mounted checkout. | Database applied; client pending deployment. |
| Checkout lacked a database submission limit | Database enforces five inquiries per phone and 100 overall in one hour, including direct RPC calls. | Applied. This is basic throttling, not bot verification: rotating numbers and exhausting the global limit remain abuse risks. |
| Separate WhatsApp number was discarded | Checkout persists `orders.whatsapp`; admin links use it with phone fallback. | Column/RPC applied; admin source pending deployment. |
| Missing products or database failures displayed demo merchandise | Catalog queries now return genuine empty/missing results or throw an error; missing images use a neutral placeholder. | Source pending deployment. |
| Lists and revenue silently stopped at the API row limit | Stable, paged reads cover products, categories, orders, item counts and confirmed revenue. Revenue includes `ready_to_ship`. | Source pending deployment. This still loads all rows for these admin screens; server-side UI pagination/aggregates would scale better for a large store. |
| Refreshed sessions were not passed to the current render or redirects | Middleware updates request cookies and preserves response cookies/cache headers on redirects. | Source pending deployment. |
| Two administrators could overwrite each other's order changes | Orders have an incrementing revision. The editor loads a consistent header/items/version snapshot; saves, status changes, cancellations and deletes check that version while holding the order lock. Stale actions ask the user to reload. | Database applied and rollback-tested; frontend pending deployment. Existing legacy RPCs remain available for deployment compatibility. |
| Builds depended on Google Fonts downloads | Layouts now use local system font stacks, removing the Google Fonts build dependency. Windows uses Segoe UI; Apple platforms retain their system font priority. | Source updated; separate filesystem permission problem still blocks full builds. |
| Admin-check function had unnecessary elevated privileges; timestamp trigger had a mutable search path | Changed `is_admin` to invoker security and fixed both function search paths. | Applied; those advisor findings are cleared. |
| Tests passed without proving their named behavior | Added executable unit regressions and rollback SQL tests. Replaced no-assertion checkout tests; corrected cart fixtures and required city; isolated cache mutation test behind an explicit fixture opt-in. | Files saved; verification below. |

The live checkout was already an inquiry workflow before this repair: it did not reserve stock. The original suspicion of a live double deduction at checkout was not confirmed. Stock is reserved when an administrator confirms a sale.

## Verification completed

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false` passed.
- ESLint passed for application source/tests and the final session/UI changes.
- `npm run test:unit`: 21 tests passed. These execute actual TypeScript modules with explicit dependency doubles; they do not replace database or browser tests.
- `supabase/tests/order_revisions.sql`: stale saves, status changes and deletion are rejected; the current revision succeeds. Fixtures roll back. A separate rollback check using the actual authenticated admin role confirmed snapshot reads, the revision trigger, cancellation and deletion work with RLS.
- `supabase/tests/order_inventory.sql`: passed against PROEDGE using synthetic fixtures that roll back. Covers repeat confirmation/cancellation, failed adjustment, failed manual creation, fulfilled-order rules and delivered deletion.
- `supabase/tests/checkout.sql`: passed during the checkout migration with rollback fixtures. Covers authoritative prices, retry identity, payload mismatch, separate WhatsApp, inquiry stock behavior and per-phone limiting.
- `supabase/tests/rls.sql`: passed against PROEDGE using the actual `anon` role. Valid-column inserts and admin RPC execution must fail specifically with insufficient privilege; unrelated schema errors do not count as a pass.
- Follow-up database inspection: no synthetic products/categories remained, no negative stock, and the existing order count remained two. Admin RPCs use invoker security and deny anonymous execution.

Applied PROEDGE migrations:

- `20261021163148_atomic_admin_order_inventory.sql`
- `20261021163519_consistent_checkout_prices_and_requests.sql`
- `20261022170057_function_privilege_hardening.sql`
- `20261022221846_admin_order_revision_checks.sql`

The existing local `20240101000012` migration is absent from the remote ledger even though inquiry behavior was present in the deployed function. Do not blindly replay old migrations against production; reconcile that pre-existing history difference before a bulk database push.

## Remaining checks and limitations

1. **Frontend is not deployed.** The live application still needs the source changes above. Until then, old admin code can still use the old non-atomic mutation paths.
2. **Vercel access:** project `proedge-shoe-store`, team `alien-5181`, returns HTTP 403 for project inspection. The connector asks for team authorization, but its suggested `authorize_team_access`/SSO tool is not exposed in this session. Grant the existing connection access to this team before deployment inspection can continue. Do not share tokens in chat.
3. **Production build is unverified:** the Google Fonts dependency is removed. `next build --webpack` now fails solely with Windows EPERM creating `.next/server/app/checkout`. Inspection showed the sandbox identity has ReadAndExecute access on the build directory. Restore the coding environment's write access or run the build from an ordinary local terminal. Browser E2E tests requiring a production server were not run or reported as passing. The normal Turbopack build also did not complete in the earlier attempt.
4. **Supabase advisories still require follow-up:** leaked-password protection remains disabled; no Auth configuration update capability is exposed in this connector. The public definer checkout RPC is intentionally callable by guests. The private receipt table intentionally has no client RLS policies and explicitly revokes client privileges.
5. **Further improvements:** verified bot protection for checkout; bounded server-side admin pagination and aggregate reporting; a full browser test of successful checkout and admin order lifecycle in an isolated test environment. Revision checks currently protect order workflows; product editors and other admin forms have not received this protection.

Advisor references: [function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [definer function exposure](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).


## Checkout follow-up — 24 October 2026

- Windows source access is restored in the current session.
- Removed checkout's post-save product queries and cache invalidation. Inquiries do not reserve stock; a saved receipt now returns without those failure points.
- Added runtime checks for product/variant UUIDs, supported size systems, size/colour types and lengths, and required legacy size/colour selections. Numeric, fractional and custom sizes remain supported.
- Unit suite: 24/24 passed. TypeScript passed. Tests use dependency doubles and do not write live orders.
- Frontend deployment and production browser verification remain pending. Other review findings remain open.

## Release update - 24 October 2026

This section supersedes the earlier deployment/build status above.

Completed source repairs:

- Checkout returns saved inquiry receipts without unrelated catalog queries and validates item identifiers, size/colour fields and quantities.
- Product duplication uses one transactional, admin-only RPC and preserves brand, image references and all size systems; copies start inactive.
- Product/image deletion retains shared storage objects so deleting a copy cannot break the original. Orphan cleanup is deliberately separate and is not implemented.
- Manual stock edits use a conditional update against the loaded stock value. Stale edits cannot overwrite a reservation; the UI refreshes and reports the conflict.
- Bulk variant creation distinguishes size systems. Storefront size-system selection resolves exact variants without falling back to another system or a truncated legacy size.
- Category counts read all pages with deterministic ordering and surface database errors.
- Missing/unreadable business settings fail explicitly. Saving settings no longer discards unsupported columns and reports success; invalid numeric charges are rejected.
- Cache E2E selectors match the current product form. Admin routes are explicitly dynamic. Prerender worker count is capped at two.
- README and database workflow now describe the actual inquiry model, tests, migrations and storage retention.

Validation:

- 31 unit tests passed, including new catalog, settings, stock and mixed-sizing regressions.
- Production code compiled and passed Next.js TypeScript checking. Standalone TypeScript checking passed.
- Full build did not complete: the initial 23-worker run hit a Supabase request timeout. A direct API request returned HTTP 200; a two-worker build advanced but Windows denied creating generated segment directories (EPERM). A fresh output directory reproduced that filesystem error. Production browser E2E tests therefore remain unrun.
- Applied and confirmed live migration `20261024173152_atomic_product_duplication.sql`. Anonymous execution is denied; signed-in execution is granted with an explicit admin check. A direct non-admin call was rejected as expected. No catalog-test fixture products remained.
- New `supabase/tests/catalog.sql` is saved but not reported as passing: the connector returned `Invalid or expired requestState` for rollback fixture execution. Earlier order/checkout SQL test results above are historical, not new runs.
- Vercel project inspection still returns 403 for team `alien-5181`. A team authorization tool is now available; its consent link was supplied in chat. Push/deployment status must be checked independently.

Remaining work that this release does not claim to finish:

- Complete production build and browser lifecycle verification in an environment with working build-directory permissions.
- Enable Supabase leaked-password protection through authorized Auth configuration; no update capability is exposed by the current Supabase connector.
- Provision and verify bot protection before restricting guest checkout to a server-only API boundary.
- Add bounded admin UI pagination/reporting aggregates for larger catalogs; existing correctness fixes still fetch complete result sets.
- Review performance advisories (two order-item foreign keys lack covering indexes; several read/admin policies overlap). These do not establish a current functional failure and were not changed blindly.
- Full product/general-settings concurrent-editor revision control remains separate from the implemented order revisions and stock compare-and-set.

## Continuation check - 26 October 2026 (Sri Lanka)

- The repair files remain saved locally; no release commit or push has occurred.
- GitHub connector reads still fail with `Unknown tool`. The environment continues to declare the project's `.git` directory read-only; previous staging and isolated-checkout attempts were denied.
- Unit tests rerun: 31 passed. Production build/browser verification remains subject to the previously documented Windows filesystem limitation.
- Resume publication from a normal terminal with write access to this repository's Git metadata, or an environment with a working authorized GitHub connection. Do not force-push or mark the current changes deployed.
