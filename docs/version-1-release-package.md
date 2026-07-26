# eStack Version 1 Release Package

Release candidate: PR #12  
Branch: `agent/estack-bullion-instagram-storefront-20260725`  
Target: `main`  
Prepared: 2026-07-25  
Status: Engineering complete; production data activation pending

## 1. Architecture summary

```text
Merchant product data and merchant-issued affiliate URL
  → Master Product Catalog in Google Sheets
  → Make.com watches approved catalog changes
  → GitHub repository_dispatch triggers the catalog workflow
  → eStack importer validates, normalizes, scores and curates active products
  → products.json and category/showroom JSON power eStack.ca
  → catalog.csv and catalog.xml power Meta Commerce Manager
  → Meta distributes eligible products to Instagram and Facebook surfaces
  → Customer opens eStack or a Meta product placement
  → Shop Now uses the verified merchant-issued affiliate URL
  → Merchant completes checkout and attributes the affiliate transaction
```

### Source and output ownership

| Layer | Responsibility |
|---|---|
| Merchant | Supplies factual product information, images, availability, price and the issued affiliate destination. |
| Google Sheets | Editable master product catalog and single source of truth. |
| Make.com | Detects approved Sheet changes and sends `commerce-catalog-update` to GitHub. |
| GitHub Actions | Runs the daily commerce engine, tests the output and commits generated artifacts. |
| eStack catalog engine | Normalizes product records, detects duplicates, validates affiliate tracking, excludes inactive products and selects curated products. |
| eStack storefront | Reads curated JSON; it does not link customers to the master Sheet or raw catalog. |
| Meta feed | Receives active, priced, image-complete products through CSV or XML. |
| Instagram/Facebook | Presents Meta-approved catalog items and sends customers to the configured tracked destination. |
| Merchant checkout | Completes the transaction outside eStack. |

### Generated artifacts

- `products.json`: normalized active product output.
- `data/products/catalog.json`: canonical generated catalog.
- `data/products/showroom-products.json`: compact curated homepage feed.
- `data/products/featured-products.json`: daily featured selection.
- `data/products/instagram.json`: social storefront feed.
- `data/products/<category>.json`: category feeds.
- `catalog.csv`: Meta-compatible CSV.
- `catalog.xml`: Meta-compatible XML.
- `sitemap.xml`: storefront and eligible product URLs.
- `data/analytics/products.json`: product import and merchandising data.
- `data/analytics/product-import-log.jsonl`: append-only import results.

### Privacy boundary

- The editable Google Sheet is not linked publicly.
- Customer navigation does not expose the raw catalog.
- Machine feeds are marked `X-Robots-Tag: noindex`.
- GitHub and Make credentials remain in their secret stores.
- Public Meta feeds necessarily remain machine-accessible; `noindex` prevents search indexing but is not access control.

## 2. Production checklist

### GitHub and workflow

- [ ] Confirm PR #12 still targets `main`.
- [ ] Confirm `PRODUCT_SHEET_CSV_URL` exists in GitHub Actions secrets.
- [ ] Open the secret URL in a private browser and confirm it returns the product CSV without authentication.
- [ ] Leave `AI_CONTENT_WEBHOOK_URL` unset unless the optional webhook is verified.
- [ ] Confirm the Actions-generated `GITHUB_TOKEN` has `contents: write` through the workflow permission.
- [ ] Run `Refresh commerce catalog` manually from the PR #12 branch before merging.
- [ ] Confirm all commerce tests pass.
- [ ] Confirm the workflow commits generated outputs only to the selected test branch.

### Master Product Catalog

- [ ] Use the exact 33-column header from `data/products/master-product-template.csv`.
- [ ] Keep one product per row.
- [ ] Confirm every active product has a unique stable `id`.
- [ ] Confirm every active product has `dealer_id`, `title`, `description`, `product_url`, `affiliate_url`, `image`, `currency`, `availability`, `last_updated`, `condition` and `active`.
- [ ] Confirm dropdown and checkbox validation is enabled in the Sheet.
- [ ] Confirm no test, placeholder or example row is active.
- [ ] Confirm inactive rows use `active=FALSE`.

### Product import

- [ ] Run an initial import with at least one real product per enabled merchant.
- [ ] Confirm `productsImported` equals the expected new-product count.
- [ ] Run the same feed a second time.
- [ ] Confirm unchanged products are not imported again.
- [ ] Confirm `duplicatesSkipped` is zero.
- [ ] Confirm `affiliateLinksRejected` is empty.
- [ ] Confirm the import log contains no errors.
- [ ] Confirm `active=FALSE` products appear in none of the generated public or channel feeds.

### Product export

- [ ] Confirm `products.json` contains the expected active product IDs.
- [ ] Confirm `data/products/catalog.json` parses.
- [ ] Confirm every category JSON file parses.
- [ ] Confirm `data/products/showroom-products.json` contains only curated eligible products.
- [ ] Confirm `catalog.csv` contains one row per Meta-eligible product.
- [ ] Confirm `catalog.xml` contains one `<item>` per Meta-eligible product.
- [ ] Confirm products without verified prices remain out of Meta CSV/XML.
- [ ] Confirm JSON, CSV and XML contain no secrets.

### SEO and discovery

- [x] `robots.txt` allows the public site and identifies `https://estack.ca/sitemap.xml`.
- [x] Machine catalog endpoints carry `noindex` headers.
- [x] Storefront pages contain titles, descriptions, canonical URLs, Open Graph and Twitter metadata.
- [x] Product metadata supports Product JSON-LD when real product data exists.
- [ ] Regenerate `sitemap.xml` with live products and validate the XML.
- [ ] Confirm only active, eligible product URLs appear in the commerce sitemap block.

### Storefront and mobile

- [x] Homepage renders curated sections rather than a raw product grid.
- [x] Category pages contain heroes, introductions, curated products and merchant badges.
- [x] Product selection uses the `/ig/?product=` detail experience.
- [x] Product images and titles are clickable.
- [x] Responsive breakpoints exist at 900px and 620px.
- [ ] Test the live product feed at desktop width.
- [ ] Test the live product feed at common phone width.
- [ ] Confirm search, filters, related products and the sticky mobile Shop control work with live data.

### Shop Now and affiliate tracking

- [x] Shop Now is generated only after dealer-specific affiliate validation.
- [x] Affiliate CTAs use `rel="sponsored nofollow noopener noreferrer"`.
- [x] Invalid, missing or placeholder affiliate URLs do not become purchase buttons.
- [ ] Test one live Shop Now handoff per enabled merchant in a private browser.
- [ ] Record product ID, source URL, final merchant domain, test date and outcome.
- [ ] Confirm no handoff produces a blank page, warning, 404 or redirect loop.

### Product images

- [ ] Open every primary image URL without authentication.
- [ ] Confirm each URL returns an actual image rather than an HTML page.
- [ ] Confirm every displayed image matches its product.
- [ ] Confirm no placeholder image enters the live feed.
- [ ] Confirm the primary image is usable on mobile and in Meta diagnostics.

### Meta Commerce Manager

- [ ] Add `https://estack.ca/catalog` or `https://estack.ca/catalog.xml` as the scheduled data source.
- [ ] Confirm Meta accepts the feed format.
- [ ] Resolve every rejected item before release.
- [ ] Confirm item IDs remain stable across refreshes.
- [ ] Confirm `link` contains the exact approved affiliate destination.
- [ ] Confirm price, currency, availability, brand and category match the Sheet.
- [ ] Confirm Instagram and Facebook catalog surfaces receive the expected items.

### Make.com

- [ ] Confirm the GitHub connection/token is stored in Make's encrypted connection.
- [ ] Confirm the token can dispatch `commerce-catalog-update`.
- [ ] Confirm the production payload uses `"branch": "main"` only after PR #12 is merged.
- [ ] Run one controlled post-merge Sheet change.
- [ ] Confirm Make triggers GitHub, outputs regenerate and Meta refreshes.

## 3. Merchant readiness

Merchant URLs are immutable source data. Do not normalize names, rewrite query
parameters or replace tracked URLs with generic merchant pages.

### Money Metals Exchange

- Dealer ID: `money-metals-exchange`
- Badge: `MME`
- Affiliate host: `www.awin1.com`
- Required merchant parameter: `v=88985`
- Required publisher parameter: `r=2936205`
- Approved issued landing URL:
  `https://www.awin1.com/cread.php?s=3928272&v=88985&q=519076&r=2936205`
- Supported categories: gold bars, gold coins, silver bars, silver coins, platinum and copper.
- Engineering status: validation implemented and tested.
- Manual release gate: one real product-level handoff must reach the intended merchant destination.

### Kitco

- Dealer ID: `kitco`
- Badge: `K`
- Affiliate host: `www.awin1.com`
- Required merchant parameter: `v=84579`
- Required publisher parameter: `r=2936205`
- Approved issued landing URL:
  `https://www.awin1.com/cread.php?s=3795009&v=84579&q=505826&r=2936205`
- Supported categories: gold bars, gold coins, silver bars, silver coins, platinum and palladium.
- Engineering status: validation implemented and tested.
- Manual release gate: one real product-level handoff must reach the intended merchant destination.

### Sprott Money

- Dealer ID: `sprott-money`
- Badge: `SM`
- Affiliate host: `www.sprottmoney.ca`
- Required issued parameter: `acc=paul-maladrino-5887a`
- Approved issued URL:
  `https://www.sprottmoney.ca/?acc=paul-maladrino-5887a`
- The issued slug intentionally contains `maladrino`. Do not change it to the correct surname spelling and do not normalize it until Sprott officially supplies a replacement.
- Supported categories: gold bars, gold coins, silver bars, silver coins and platinum.
- Engineering status: exact-string validation implemented and tested.
- Manual release gate: a real Shop Now handoff must reach Sprott successfully.

## 4. Version 1 risk assessment

### Production blockers

1. **The committed production catalog is empty.**
   - `products.json` contains zero products.
   - `catalog.csv` contains only its header.
   - `catalog.xml` contains no product items.
   - Impact: no customer can complete the intended product-to-merchant journey.
   - Resolution: connect and import the populated production Sheet.

2. **`PRODUCT_SHEET_CSV_URL` cannot be verified from repository contents.**
   - Impact: the scheduled workflow may fall back to the checked-in empty source.
   - Resolution: confirm the GitHub Actions secret and run a successful branch import.

3. **No live merchant handoff has been recorded from real feed data.**
   - Impact: code-level URL validation cannot prove that the affiliate networks and merchants still redirect correctly.
   - Resolution: complete and record one handoff per enabled merchant.

4. **Meta has not accepted a populated production feed.**
   - Impact: valid local CSV/XML does not prove Commerce Manager policy or item acceptance.
   - Resolution: load the populated feed into Meta and clear its diagnostics.

### Controlled Version 1 risks

- Image validation confirms HTTPS syntax but not live image response, dimensions or content.
- Invalid availability text currently normalizes to `out of stock`; Sheet dropdown validation is required.
- Missing-field reporting is less detailed than the catalog specification; operators must review the import log and Sheet validation.
- The optional AI webhook can interrupt a run if configured and unavailable; leave it unset for Version 1 unless verified.

### Risks already controlled

- Duplicate IDs are detected and logged.
- Invalid affiliate hosts and tracking parameters are rejected.
- Missing-price products are excluded from Meta.
- Inactive products are excluded from public and channel feeds.
- Sitemap URL escaping and duplicate product entries are fixed.
- Raw feeds are absent from customer navigation and marked noindex.
- No repository secrets are embedded in generated outputs.

## 5. Release decision

### Engineering decision

The Version 1 code is ready for production data testing. Automated tests pass,
the catalog outputs validate, inactive products are excluded and merchant
tracking rules are enforced.

### Business release decision

Do not merge for public launch until:

1. `PRODUCT_SHEET_CSV_URL` is confirmed.
2. The production Sheet contains real approved inventory.
3. A successful branch import produces populated JSON, CSV and XML.
4. Money Metals, Kitco and Sprott handoffs pass.
5. Meta accepts the populated feed without blocking diagnostics.

## 6. Version 2 recommendations — do not implement in Version 1

1. Automated image URL, MIME type, size and dimension validation.
2. Detailed per-row rejection reports for missing fields and invalid values.
3. Preserve and validate the distinct merchant `product_url`.
4. Import and export `additional_image_urls`.
5. Meta `additional_image_link`, custom labels and standardized product-category mapping.
6. Resilient optional AI webhook with timeout, retry and deterministic fallback on network or JSON errors.
7. GA4 commerce events for product view, merchant click and outbound handoff.
8. Merchant feed adapters that retain the same master schema.
9. Automated live affiliate redirect checks with alerting.
10. Catalog health dashboard for active items, rejected items, stale prices, missing images and merchant coverage.
