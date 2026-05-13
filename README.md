# Matt CRE — Commercial Real Estate Site

Next.js marketing + listings site for a commercial real estate brokerage. Listings are pulled live from the **Zoho CRM Deals module** — only deals with custom field `Publish_Webpage = true` are surfaced publicly.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript (strict)
- Tailwind v4
- **Payload CMS 3** for marketing copy (Home, About, Site Settings) — Postgres + Vercel Blob
- `@zohocrm/typescript-sdk-8.0` for CRM-driven listings
- ISR (5 min revalidate) + optional webhook-driven revalidation

## Payload CMS

Owns marketing content; Zoho still owns listings.

**Globals (singletons):**

- `site-settings` — brand name, tagline, phone, email, license number
- `home-page` — hero, stats, services, why-choose, final CTA
- `about-page` — hero, expertise areas, credentials, philosophy, CTA

**Collection:**

- `media` — uploads with auto-resized variants (`thumb`, `card`, `hero`). Stored in Vercel Blob.

**Setup:**

1. Provision Postgres. Easiest: [Neon](https://neon.tech) free tier → copy connection string into `DATABASE_URL`.
2. `openssl rand -hex 32` → `PAYLOAD_SECRET`.
3. (Optional, prod) Create a Vercel Blob store → copy token into `BLOB_READ_WRITE_TOKEN`. Skip in dev — uploads fall back to local FS.
4. `pnpm dev` → visit `http://localhost:3000/admin` → create first user.
5. Edit `Site Settings`, `Home Page`, `About Page` globals as needed. Every field has a default matching the original Figma Make design, so pages render correctly even before any edits.
6. After adding custom Payload components later, run `pnpm generate:importmap`.

**Graceful fallback:** if `DATABASE_URL` is unset or the DB is unreachable, [`lib/payload/queries.ts`](lib/payload/queries.ts) returns the hardcoded defaults from [`lib/payload/defaults.ts`](lib/payload/defaults.ts). Site never breaks on a CMS outage.

## Required Zoho setup

### Custom fields on the Deals module

The site reads these fields. Built-ins (`Deal_Name`, `Description`, `Stage`, `Closing_Date`, `Modified_Time`, `Amount`, `Type`) come standard. Custom fields needed:

| Purpose           | API name                           | Type                                                                   |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Show on website   | `Publish_Webpage`                  | Boolean                                                                |
| Sale / Lease      | `Type`                             | Picklist (text containing "Sale" or "Lease")                           |
| Property use      | `Use`                              | Picklist (Office, Retail, Industrial, Multifamily, Land, Mixed-Use, …) |
| Listing price     | `Listing_Price`                    | Currency / Decimal (falls back to `Amount` if empty)                   |
| Street            | `Property_Address_Street_Address`  | Single Line                                                            |
| City              | `Property_Address_City`            | Single Line                                                            |
| State / Province  | `Property_Address_State_Province`  | Single Line                                                            |
| Zip / Postal Code | `Property_Address_Zip_Postal_Code` | Single Line                                                            |
| Country / Region  | `Property_Address_Country_Region`  | Single Line                                                            |
| Lot size (sq ft)  | `Lot_Size`                         | Number                                                                 |
| Parcel number     | `Parcel_Number`                    | Single Line                                                            |

Listing photos: upload as **attachments** on the Deal record. Image extensions (`.jpg`, `.png`, `.webp`, `.gif`, `.avif`) are surfaced; all other attachments are ignored.

### OAuth credentials

1. Go to https://api-console.zoho.com → New Client → **Self Client**.
2. Note the Client ID and Client Secret.
3. Generate a grant token with these scopes:
   - `ZohoCRM.coql.READ` (COQL listing query)
   - `ZohoCRM.modules.deals.READ` (read Deal records)
   - `ZohoCRM.files.READ` (download `Listing_Photos` files)
4. Exchange the grant token for a refresh token (one-time):
   ```bash
   curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
     -d "grant_type=authorization_code" \
     -d "client_id=$ZOHO_CLIENT_ID" \
     -d "client_secret=$ZOHO_CLIENT_SECRET" \
     -d "redirect_uri=https://localhost" \
     -d "code=$GRANT_TOKEN"
   ```
5. Copy `refresh_token` from the response into `.env.local`.

## Local development

```bash
cp .env.example .env.local       # then fill in Zoho creds
pnpm install
pnpm smoke                        # verifies Zoho creds + field mapping
pnpm dev                          # http://localhost:3000
```

Node 20.9+ required.

## Routes

- `/` — Home with featured listings strip
- `/listings` — All public listings, ISR
- `/listings/[slug]` — Detail page with gallery + inquiry form
- `/about`, `/services`, `/contact` — Static marketing pages
- `/contact` form → creates a Lead in Zoho (`Lead_Source = Website`)
- `POST /api/revalidate` — webhook endpoint (auth via `x-zoho-secret` header)
- `GET /api/listings/:dealId/photos/:attachmentId` — streams Zoho attachment

## Caching

- `listPublicDeals()` is wrapped in `unstable_cache` (5 min revalidate, tag `zoho:listings`).
- Page-level `revalidate = 300` on `/`, `/listings`, `/listings/[slug]`.
- Photos: per-deal cache + 1-day HTTP cache via the proxy route.
- Real-time updates: configure a Zoho workflow rule on Deals to POST to `/api/revalidate` whenever a deal changes. Body: `{"dealId": "${Deals.id}"}`. Header: `x-zoho-secret: <ZOHO_REVALIDATE_SECRET>`.

## Verification checklist

1. `pnpm smoke` — confirms credentials, COQL works, photos resolve.
2. `pnpm dev` → `/listings` shows N cards matching Zoho count.
3. Click a card → `/listings/[slug]` loads w/ gallery + specs.
4. Toggle `Publish_Webpage = false` on a deal → after revalidate window, deal disappears + detail returns 404.
5. Submit `/contact` form → new Lead in Zoho with `Lead_Source = Website`.
6. `pnpm typecheck && pnpm build` succeeds.
