# PROEDGE — complete project and repair handover

Prepared: 23 October 2026, Sri Lanka.
Purpose: share with another developer or coding chat to continue the existing work.

## 1. Critical status

PROEDGE is a shoe/sports storefront with product variants, cart, WhatsApp order inquiries and administrative order/inventory management. This work began as a comparison with a separate Tours website and became a series of commerce correctness and security repairs.

The project is NOT fully finished. Four database repair migrations were previously reported applied and tested. Corresponding website changes were last reported local and NOT deployed. A complete production build and browser verification have not been established. There is also a confirmed pending checkout repair that was not saved.

This file is a detailed handover, not a complete repository backup or verbatim chat export. It combines supplied conversation history with files directly read during preparation. Earlier test results and cloud changes are historical evidence, not fresh verification. No credentials, environment values or customer data are included.

Evidence categories:
- Read during handover: saved review, package.json, checkout action, migration filenames, unit/SQL test filenames and Playwright configuration.
- Previously reported: repair implementation, cloud migrations, test passes and service-access failures.
- Pending: unfinished work or verification still missing.

The original saved REVIEW_AND_FIXES.md is included in full at the end.

## 2. Project purpose and business workflow

The initial goal was a sample store for a client, with WhatsApp ordering and administration added later. PROEDGE sells shoes and sports merchandise; business context also mentions football/rugby/badminton/running/casual products and accessories. Inspect the actual current catalog before changing category definitions.

Previously described public routes:
- / — homepage.
- /shop — catalog.
- /sale, /sports, /men, /women — browsing collections.
- /product/[slug] — product detail and variant selection.
- /cart — shopping cart.
- /checkout — customer details and WhatsApp inquiry.
- /admin — administration, with product/order/settings workflows.

Previously described features include featured/new-arrival products, size/color selection, wishlist, cart and WhatsApp ordering. This is context rather than a fresh browser inventory.

Essential stock model:
1. Customer chooses products and variants.
2. Checkout creates an inquiry with server-authoritative prices.
3. The inquiry does NOT reserve/deduct stock.
4. Administrator confirms the actual sale; this reserves/deducts stock.
5. Allowed cancellation restores reserved stock exactly once.
6. Deleting a delivered historical record does not imply a return and must not restock it.

The earlier suspicion of live checkout deducting stock followed by a second admin deduction was investigated and NOT confirmed. Live checkout already used the inquiry model.

## 3. Stack and paths

Read from current package.json:

| Component | Declared version |
| --- | --- |
| Next.js | 16.3.5 |
| React and React DOM | 19.2.8 |
| Supabase JS | ^2.116.0 |
| Supabase SSR | ^0.12.7 |
| Tailwind CSS | ^4 |
| TypeScript | ^5 |
| Playwright | ^1.63.0 |
| ESLint | ^9 |
| Lucide React | ^1.46.0 |

Uses Next.js App Router, Server Actions, Supabase Postgres/Auth and Vercel. Version ranges are declarations, not proof of exact installed lockfile versions.

Actual source:
C:\Users\shamh\Desktop\MyProjects\proedge\shoe-store

Attached writable workspace in this chat:
C:\Users\shamh\Documents\ChatGPT\proedge shoe store

During the final access checks, the attached workspace had no project source. Temporary file creation/removal worked there. The actual Desktop project remained outside this session's allowed write locations; inspected checkout ACL granted CodexSandboxUsers ReadAndExecute, Synchronize.

During handover, file reads succeeded but git status failed with Permission denied. Current branch, HEAD and full uncommitted diff were not established. No application source was changed in this handover turn.

Do not confuse the ChatGPT project grouping with a coding session's attached local directory. Another chat may have different filesystem access; this chat did not verify that other session.

## 4. Chronology — how the work started and where it stopped

### A. Initial comparison
Owner asked to read the files, find issues, and compare PROEDGE against Tours. Earlier source review concluded Tours had a stronger engineering foundation, while PROEDGE offered more commerce functionality.

Both reportedly passed lint/TypeScript; Tours had 36 passing tests. Builds were incomplete or blocked. No rendered side-by-side visual comparison was completed.

### B. PROEDGE issues discovered
Review found a reproducible inventory corruption path, wrong deletion/restocking, inconsistent pricing, misleading mock fallback, weak tests, duplicate/spam inquiries, lost WhatsApp details and truncated reports.

A mocked reproduction started stock at 5. A sale adjustment restored stock to 7, then returned insufficient stock; the failed operation left stock changed.

### C. Owner authorized repairs and connected-service checks
Owner requested detailed Tours findings first, then PROEDGE fixes one by one, including Supabase and Vercel inspection.

Earlier cloud inspection found live checkout already used inquiries. An old local migration was missing from the remote ledger, but its behavior was already present: a migration-history mismatch rather than confirmed live double deduction.

### D. Main fixes
Atomic admin stock RPCs, deletion rules, consistent prices, request receipts, database submission limits and WhatsApp persistence were applied. Local frontend/actions, catalog fallback, reporting, tests and session-refresh changes followed. Reported unit totals progressed through 18 and 20 tests.

### E. Additional fixes
Function privileges/search paths were hardened; Google Fonts network dependency was removed; order revision checks rejected stale administrator changes. Reported suite reached 21 tests. Database rollback checks included actual authenticated-admin and anonymous roles.

### F. Remaining blockers
Vercel detail access returned HTTP 403. Build initially encountered Google Fonts DNS and filesystem errors. After font removal, a later build compiled and passed TypeScript but failed writing generated pages with Windows EPERM.

The next checkout issue was identified: product cache invalidation happens after saving an inquiry, so a revalidation error can make a saved order look failed. Stricter runtime validation of cart fields was also planned. Source edits failed; neither pending fix was saved.

### G. Session/access loop and handover
Some later sessions were reported as empty Linux workspaces. This chat was on Windows, but attached to the empty Documents directory instead of the Desktop project. Repeated checks did not change the access situation. No deployment was established.

The owner then requested this complete shareable file. This turn produces documentation; it does not finish the repairs.

## 5. Original defects and last known disposition

| Issue | Original problem | Last known result |
| --- | --- | --- |
| Non-atomic stock updates | Restore/deduct and order writes could partially succeed | Transactional RPCs implemented; database tested; frontend deployment pending |
| Delivered-order deletion | Historical deletion restored sold goods | Database rule fixed; frontend pending |
| Price mismatch | Global campaign discount silently applied at checkout to all products | Checkout uses products.price |
| Demo fallback | Deleted/inactive slug or failed catalog read showed mock products | Source removes fallback; deployment pending |
| Misleading tests | Wrong cart storage key, no city/success assertion, schema errors accepted as RLS denial | Unit/SQL tests added and E2E files corrected; browser execution pending |
| Duplicate inquiries | Retried requests generated new inquiries | Request IDs, payload fingerprints and private receipt table |
| Submission abuse | Guest callers could invoke checkout directly | Database limits added; verified bot protection pending |
| WhatsApp lost | Entered WhatsApp number not stored | orders.whatsapp persisted and used with phone fallback |
| Truncated lists/totals | Reads silently stopped at API row limit | Stable paged reads; still loads all pages in admin |
| Revenue omission | ready_to_ship excluded | Included |
| Session refresh | Refreshed cookies absent from render/redirect | Cookie/header propagation repaired |
| Stale admin changes | One admin overwrote another's newer order edits | Revision-based checks for order workflows |
| Function findings | Excess privileges and mutable search path | Two advisories reportedly cleared |
| Google Fonts build | DNS download dependency | System font stack |
| Post-save revalidation | Saved inquiry can appear to fail | Still present in checkout file read now |
| Cart-field coercion | Malformed fields converted to strings | Stricter validation remains pending |

## 6. Technical details to preserve

### Inventory transactions
Original affected functions were confirmOrderSale, updateOrderStatus, createManualOrder and deleteOrder in src/app/admin/actions.ts. New RPCs use input checks, admin authorization and ordered locks so errors roll back order and stock changes together.

Repeated confirmation/cancellation must not double-count stock. Reserved orders must be cancelled before deletion. Documented workflow rejects cancellation of shipped/delivered orders. Returns/refunds are not established as a separate implemented workflow; do not use record deletion as a return.

### Pricing
products.price is the actual selling price. Promotion percentage is descriptive campaign text; it must not silently apply another discount. The original example was Rs.10,000 displayed becoming Rs.7,000 at checkout under a 30% global campaign, even when not on sale.

Client prices, names, subtotals and totals must not determine financial calculations.

### Retry handling
Optional request IDs have private receipts and payload fingerprints. Identical retries return the same result; changed payload cannot reuse the ID. Client reportedly retains the ID for the same form while mounted. Do not assume durable cross-tab/reload recovery without inspecting/testing it.

### Rate limits and bots
Database enforces five inquiries per phone and 100 overall per hour, including direct RPC calls. These are basic limits, not bot verification. Rotated phone numbers can still exhaust the global allowance.

Verified bot protection needs a server-verified challenge and a database boundary that cannot be bypassed through another guest endpoint. Never put service-role or verification-secret keys in client code.

### Revisions
Orders have incrementing revisions. Snapshot reads pair header/items/version consistently. Save/status/cancel/delete compare expected revision while holding the order lock. A stale action asks the user to reload.

Legacy RPCs remain for deployment compatibility. Inspect all callers before retiring old paths. Product editors/other admin forms have not received equivalent stale-edit protection.

### Catalog/reporting
Real missing/inactive products remain missing; read failures raise errors. Neutral placeholders are acceptable for missing images; fabricated products/stock/prices are not.

Paged fetching solves API truncation but still loads every row. Bounded admin UI pagination and database aggregate reports are later scalability work.

## 7. Database migrations and drift

Four repair migration files exist locally and were previously reported applied:

1. 20261021163148_atomic_admin_order_inventory.sql
2. 20261021163519_consistent_checkout_prices_and_requests.sql
3. 20261022170057_function_privilege_hardening.sql
4. 20261022221846_admin_order_revision_checks.sql

Earlier statements of two or three applied migrations were intermediate milestones.

Older local migrations run from 20240101000001 through 20240101000012. The last is 20240101000012_whatsapp_inquiry_orders.sql. It was absent from the remote ledger even though the deployed checkout already had inquiry behavior.

Do NOT blindly replay migrations or bulk-push the local history. Compare the actual live ledger and definitions first. Live state was not re-queried during this handover.

## 8. Checks completed historically

Reported passes:
- 21 unit tests.
- TypeScript without incremental writes.
- ESLint.
- order_inventory.sql: repeated confirmation/cancellation, failed adjustments/manual creation, fulfilled rules, delivered deletion.
- checkout.sql: authoritative prices, retry identity, changed payload rejection, WhatsApp persistence, no inquiry stock deduction, per-phone limit.
- order_revisions.sql: stale save/status/delete rejected; correct revision succeeds.
- Authenticated-admin rollback checks: snapshot, trigger, cancellation/deletion under RLS.
- rls.sql using actual anon role: valid-column inserts and admin execution must fail specifically with insufficient privilege.
- Follow-up DB inspection reportedly found no synthetic products/categories and no negative stock; two existing orders remained. This is historical test evidence, not a current order count.

Read-now test filenames:
- tests/unit/catalog.test.mjs
- tests/unit/checkout.test.mjs
- tests/unit/orders.test.mjs
- tests/unit/session.test.mjs
- tests/unit/load-ts.mjs (helper)
- supabase/tests/checkout.sql
- supabase/tests/order_inventory.sql
- supabase/tests/order_revisions.sql
- supabase/tests/rls.sql

Unit tests execute TypeScript modules using dependency doubles. They do not replace live database/browser testing.

Original weak tests used proedge-cart while application used proedge_cart_v1, omitted required city, lacked successful submission assertions, and accepted schema errors as proof of RLS. Do not restore those patterns.

Not established:
- Complete successful production build.
- Passing production-server Playwright suite.
- Deployment of repaired frontend.
- Current live configuration and deployment commit.
- Verified bot protection.
- Full end-to-end workflow under realistic concurrency.

No test suite was rerun while preparing this document.

## 9. Exact pending checkout repair

Read now: src/app/checkout/actions.ts still imports revalidatePath.

After a successful place_order RPC and a basic response-object check:
1. It calls revalidatePath("/shop", "page") outside try/catch.
2. It queries product slugs and revalidates product pages inside try/catch.
3. It returns the success receipt afterward.

Inquiries do not change stock, so these product-cache operations are unnecessary. The first call may throw after the order is saved, making the user think checkout failed.

Planned fix: remove the unused revalidatePath import and the unnecessary post-save product query/revalidation block. Preserve the successful receipt return. Keep actual stock-changing admin cache updates where required.

Also tighten cart runtime validation before mapping. Current productId, variantId, sizes and color can be stringified from malformed input. Reject invalid types/identifiers and excessive lengths while preserving legitimate supported size formats. Database validation remains authoritative.

Current inspected input rules:
- Sri Lankan phone format: 0 followed by nine digits.
- Optional WhatsApp uses same format; email optional.
- Name, address and city required.
- Maximum 30 items; integer quantity 1–99.
- Field length caps: name 200; phone/WhatsApp 20; email 254; address 1000; city 100; postal code 20; notes 4000.
- Optional UUID-shaped request ID.

Focused regression expectations:
- Successful RPC returns receipt without product-cache/query dependency.
- Malformed fields fail before database RPC.
- Valid variant and supported legacy size/color submissions remain supported.
- Client-supplied prices cannot affect totals.
- Database failures return clear errors.
- Identical retry does not duplicate inquiries.

## 10. Service blockers and unresolved advisories

Vercel project: proedge-shoe-store.
Vercel team: alien-5181.

Earlier project listing worked, but detail inspection returned 403. Suggested team authorization/SSO tool was unavailable in that session. No successful CLI workaround or deployment was established.

Reconnect/authorize the existing team through supported controls. Verify repository, branch, build logs, current commit and environment names. Do not invent a live URL or create another project merely to bypass access problems.

Supabase was reported healthy. Remaining advisory included disabled leaked-password protection; available connector lacked the Auth configuration update capability. Guest execution of checkout SECURITY DEFINER is intentional in the current design. Admin RPCs deny anonymous execution. Private receipt storage intentionally revokes client privileges and has no client policies. Do not broadly grant access merely to silence an advisory.

Earlier local environment inspection found Supabase URL/public key but no bot-verification keys. Check current configuration without printing secrets. Verify preview and production separately.

## 11. Tours comparison and later corrections

Initial conclusion: Tours better engineered overall; PROEDGE has a different and more commerce-heavy feature set.

Tours strengths included shared Zod schemas, transactional tour/route saves, stale-edit protection, user/database membership authorization and broader page/navigation/footer/theme/SEO/media editing. PROEDGE's original large admin actions file was reported around 1,644 lines; current count was not remeasured.

Initial Tours findings:
- Direct anonymous database submissions bypassed Server Action Turnstile.
- Review submissions lacked Turnstile.
- Detail requests loaded full catalog with uncached reads.
- Read failures became empty content or misleading not-found pages.
- Compressed code and stale README.

These were later corrected after Tours changed. The saved review records:
- 20261021223249_server_only_submissions.sql revokes anonymous inserts, limits submission RPC to service_role and removes old trigger; it was present in connected Tours ledger.
- src/lib/supabase/submissions.ts verifies Turnstile for inquiries/reviews and an IP-bound signed form ticket.
- src/lib/public/cache.ts provides 60-second caching; getTourDetail scopes related reads.
- dataFailure raises PublicDataError rather than swallowing database/schema errors.
- Reviewed files formatted; README updated with server-only secret, Turnstile and test instructions.

Do not repeat old findings as current without reading latest Tours code. Full-catalog/map payload scaling remains a consideration where intentionally loaded. Deployment/browser configuration was not proven. No Tours source was changed during PROEDGE repair. No visual winner was claimed.

## 12. What the next developer/chat should do

1. Read current project instructions, REVIEW_AND_FIXES.md, source, tests and migrations.
2. Confirm correct authorized writable source directory. Preserve all uncommitted changes. If working on a copy, explicitly establish the authoritative copy.
3. Inspect git root/branch/HEAD/diff. Do not reset, discard work or replace local repairs with stale remote code.
4. Implement pending checkout revalidation removal and strict validation, with focused tests.
5. Run unit tests, TypeScript, lint and complete production build.
6. Inspect live Supabase migration ledger/definitions; reconcile historical drift deliberately.
7. Confirm order revision callers/grants and legacy compatibility.
8. Implement/configure verified bot protection, including direct-API bypass tests.
9. Resolve Vercel team access, deploy verified source through existing project, and confirm deployed commit.
10. Run complete browser flows against isolated fixtures/test environment.
11. Recheck advisories including leaked-password protection.
12. Update review with exact outcomes and residual limitations.
13. Later improve bounded admin pagination/aggregates and non-order stale-edit protection.

Commands from current scripts, run in correct writable source directory:

~~~powershell
npm run test:unit
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run lint
npm run build -- --webpack
npm run test:e2e
~~~

Regular build script is next build; webpack was used to isolate build problems.

Playwright configuration read now:
- Chromium.
- http://localhost:3005.
- Starts npx next start -p 3005.
- One worker; fullyParallel false; zero retries.
- reuseExistingServer false.
- 180-second web-server timeout.
- Loads .env.local.
- Therefore needs a successful production build before that suite can run.
- Read mutation fixture opt-ins before executing tests.

Browser acceptance checklist:
- Correct visible/inactive/missing products and variant availability.
- Cart persistence and server-authoritative pricing.
- Required fields, valid checkout success and correct WhatsApp handoff.
- Separate WhatsApp persistence.
- Retry without duplicate inquiry.
- No stock change from inquiry.
- Confirmation deducts once.
- Failed adjustment/manual order leaves stock and order unchanged.
- Cancellation restores once; fulfilled restrictions work.
- Delivered history deletion leaves stock untouched.
- Two admins cause stale-version conflict rather than overwrite.
- Revenue includes ready-to-ship; lists/totals not cut off.
- Session refresh works through render/redirect.
- Unauthorized admin requests and direct order inserts fail.
- Bot protection cannot be bypassed via another public submission endpoint.

Use rollback/disposable test fixtures. Do not mutate real customer orders to demonstrate a test.

## 13. How to use this handover

Keep the actual repository and uncommitted fixes. This file is not the source tree, database backup, environment configuration or complete original tool transcript. Deleting the chat does not preserve those missing artifacts.

Paste this instruction into the next working chat:

"Read this handover and current project files. Continue the existing PROEDGE repairs without discarding uncommitted work. First confirm the writable source path and current diff. Fix the pending checkout post-save cache/validation issue, run checks, reconcile Supabase history, resolve deployment and verify browser workflows. Distinguish local source, applied database changes, frontend deployment and tested results. Do not assume old Tours issues remain current or claim all issues are fixed."

## Appendix A — original saved review

The following is the complete REVIEW_AND_FIXES.md read from the actual source project during this handover. It is preserved as historical status; it is not fresh live verification.


# PROEDGE review and repair status

Updated 23 October 2026. This records source review and the checks actually completed; it is not a claim that the new frontend is deployed or that every browser flow has passed.

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

