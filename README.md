# PROEDGE storefront and admin

Next.js App Router storefront with Supabase catalog, admin order management and WhatsApp checkout inquiries.

## Local development

Use Node.js 24 and npm. Run `npm ci`, copy [.env.example](.env.example) to `.env.local`, configure your Supabase URL/public key, server-only Supabase secret and canonical site URL, then run `npm run dev`.

Checkout uses Cloudflare Turnstile. Local `next dev` uses Cloudflare's test keys; Vercel preview/production require real `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` values with a hostname matching `NEXT_PUBLIC_SITE_URL`. `SUPABASE_SECRET_KEY` is server-only. Production checkout trusts Vercel's forwarded IP header and fails closed without it.

Never commit `.env.local`, admin credentials or service-role keys. Admin access is checked using the authenticated user's trusted `app_metadata.is_admin` claim and database RLS.

## Order and inventory rules

- Checkout creates an inquiry at current database product prices. It does not reserve stock.
- Confirming a sale reserves stock through transactional admin RPCs. Repeated confirmation does not reserve twice.
- Cancelling an unfulfilled sale restores reserved stock once. Shipped/delivered orders cannot be cancelled here; deleting delivered history does not restore inventory.
- Order revisions reject stale edits. Stock adjustments compare the value the administrator originally loaded.
- Product and store-settings editors compare the loaded database timestamp and reject stale saves. Successful settings saves return the next timestamp for subsequent edits.
- Request IDs make retries of the same inquiry idempotent. The server verifies Turnstile and consumes database-backed IP/email limits before calling the server-only checkout RPC; phone/global limits also apply in the database. Deployment configuration still needs independent verification.
- Sale campaign text is descriptive. Set product prices explicitly to offer discounts.

## Checks

```sh
npm run test:unit
npm run lint
npx tsc --noEmit --incremental false
npm run build
npm run test:e2e
```

The production build reads Supabase catalog/settings; it requires network access and correct environment configuration. Prerender concurrency is capped at two workers.

Development and production builds use webpack. Turbopack currently crashes while starting the CSS processor on this Windows environment; `npm run dev:turbo` and `npm run build:turbo` remain available for investigating that upstream/environment issue.

Playwright starts a production server on port 3005. Checkout UI tests intercept submissions and never create live orders. The cache mutation test is disabled unless `E2E_MUTATIONS_ALLOWED=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `E2E_PRODUCT_ID` and `E2E_PRODUCT_SLUG` identify a dedicated test fixture. Do not opt in against real merchandise.

## Project structure

- [src/app](src/app): storefront/admin routes, API handlers and Server Actions.
- [src/components](src/components) and [src/context](src/context): feature components and shared client state.
- [src/lib](src/lib): shared utilities, Supabase access, authentication and checkout protection.
- [src/data/categories.ts](src/data/categories.ts): category hierarchy and legacy URL mappings; merchandise comes from Supabase.
- [src/types](src/types): product and order types.
- [src/proxy.ts](src/proxy.ts): the single Next.js proxy entry point, alongside the App Router.
- [public](public): served branding, optimized catalog images and the product placeholder. The built-in logos use SVGs; JPEG originals remain in [public/images/branding](public/images/branding) for reference and raster previews. Catalog images also support legacy database image URLs.
- [supabase](supabase): migrations, local seed data and rollback SQL tests.
- [tests](tests): unit and browser regressions. Keep repair regression tests after their fixes are complete.
- [docs](docs): database workflow and remaining maintenance work.

Root files configure the framework and tooling. Build output, browser reports, local secrets and agent tooling are ignored by [.gitignore](.gitignore).

## Database and release

See [database workflow](docs/database.md) and [remaining repair and release checks](docs/REVIEW_AND_FIXES.md). Apply reviewed additive migrations before deploying code that calls their RPCs. A push to `main` can trigger the connected Vercel production deployment; verify its status separately.

Product duplication runs atomically and creates an inactive copy. Image URLs can be shared between copies. Deleting an image reference or a product therefore retains physical storage objects; any future orphan cleanup must account for all references and concurrent uploads.

Admin revenue is aggregated in PostgreSQL, and stock filters paginate in the database. Query failures are surfaced instead of displayed as zero totals. Successful catalog and settings mutations expire the corresponding cache tags.
