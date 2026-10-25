# PROEDGE storefront and admin

Next.js App Router storefront with Supabase catalog, admin order management and WhatsApp checkout inquiries.

## Local development

Use Node.js 24 and npm. Run `npm ci`, copy `.env.example` to `.env.local`, configure your Supabase URL/public key and canonical site URL, then run `npm run dev`.

Never commit `.env.local`, admin credentials or service-role keys. Admin access is checked using the authenticated user's trusted `app_metadata.is_admin` claim and database RLS.

## Order and inventory rules

- Checkout creates an inquiry at current database product prices. It does not reserve stock.
- Confirming a sale reserves stock through transactional admin RPCs. Repeated confirmation does not reserve twice.
- Cancelling an unfulfilled sale restores reserved stock once. Shipped/delivered orders cannot be cancelled here; deleting delivered history does not restore inventory.
- Order revisions reject stale edits. Stock adjustments compare the value the administrator originally loaded.
- Request IDs make retries of the same inquiry idempotent. Database throttling is present; verified bot protection is not configured.
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

Playwright starts a production server on port 3005. Checkout UI tests intercept submissions and never create live orders. The cache mutation test is disabled unless `E2E_MUTATIONS_ALLOWED=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `E2E_PRODUCT_ID` and `E2E_PRODUCT_SLUG` identify a dedicated test fixture. Do not opt in against real merchandise.

## Database and release

See [database workflow](docs/database.md), [repair status](REVIEW_AND_FIXES.md), and the historical [handover](PROEDGE_COMPLETE_HANDOVER.md). Apply reviewed additive migrations before deploying code that calls their RPCs. A push to `main` can trigger the connected Vercel production deployment; verify its status separately.

Product duplication runs atomically and creates an inactive copy. Image URLs can be shared between copies. Deleting an image reference or a product therefore retains physical storage objects; any future orphan cleanup must account for all references and concurrent uploads.
