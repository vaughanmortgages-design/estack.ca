# eStack Version 1 Final Launch Checklist

Status: Pre-production  
Scope: eStack bullion storefront and commerce catalog  
Release rule: Do not merge or deploy until every blocking checkbox is complete.

## Current launch state

The commerce code and automated tests are complete, but the checked-in catalog
contains zero products. The current `Bullion Finds` tab in the **eStack Bullion
Commerce Engine** Google Sheet contains only its header and does not use the
production catalog schema.

The first live catalog refresh must not be treated as successful until:

- the production Sheet uses the exact required header;
- it contains validated active products;
- `PRODUCT_SHEET_CSV_URL` targets the published product tab, including its
  correct `gid`;
- the refresh workflow reports a non-zero import with no unexplained errors;
- generated JSON, CSV, and XML contain the expected products; and
- one `Shop Now` handoff per represented merchant has been tested.

## 1. GitHub Secrets

Repository: `vaughanmortgages-design/estack.ca`

### Required

- [ ] In GitHub, open **Settings → Secrets and variables → Actions**.
- [ ] Confirm a repository secret named `PRODUCT_SHEET_CSV_URL` exists.
- [ ] Confirm the secret contains the published CSV/export URL for the
      production product tab—not the spreadsheet edit URL and not the Dashboard
      tab.
- [ ] Confirm the URL includes the correct product-tab `gid`.
- [ ] Confirm the URL can be read by an unauthenticated HTTP request. The
      workflow cannot open a private Sheet that requires an interactive Google
      login.
- [ ] Confirm the published response is CSV, begins with the exact catalog
      header, and contains at least one intended product row.
- [ ] Confirm the secret contains no surrounding quotation marks or whitespace.

The workflow references the secret correctly:

```yaml
PRODUCT_SHEET_CSV_URL: ${{ secrets.PRODUCT_SHEET_CSV_URL }}
```

The build scripts read it as:

```text
PRODUCT_SHEET_CSV_URL
```

If the secret is blank or unavailable, the build silently falls back to
`data/products/source.json`, which currently contains zero products. A workflow
that succeeds with the empty fallback is not a successful production import.

### Optional

- [ ] `AI_CONTENT_WEBHOOK_URL` is either intentionally unset or points to a
      working approved webhook.

`AI_CONTENT_WEBHOOK_URL` is optional. When it is unset, the engine uses its
deterministic feed-grounded content generator. Version 1 does not require the
webhook.

### Automatically supplied or workflow-scoped

- `GITHUB_TOKEN` is supplied automatically by GitHub Actions and is used by the
  workflow to commit generated outputs.
- `INPUT_SOURCE` is populated only when a manual workflow input or dispatch
  payload supplies an override URL. It is not a required repository secret.

### Secret acceptance

- [ ] No secret value appears in the repository, Google Sheet, generated
      catalog, workflow log, or browser-delivered JavaScript.
- [ ] The workflow has `contents: write` permission so its generated-output
      commit can be pushed.
- [ ] The first manual run targets the intended branch.

## 2. Google Sheet verification

### Source workbook

- [ ] Confirm the intended workbook is **eStack Bullion Commerce Engine** or
      document the replacement workbook.
- [ ] Confirm the product tab—not Dashboard, Settings, Merchant Feeds, or
      Affiliate Accounts—is published as CSV.
- [ ] Confirm row 1 is the header and no title or instruction rows appear above
      it.
- [ ] Confirm there are no merged cells in the product table.
- [ ] Confirm one product occupies exactly one row.

### Exact required column order

```csv
id,sku,dealer_id,brand,category,title,description,long_description,product_url,affiliate_url,image,additional_image_urls,price,previous_price,currency,availability,badge,featured,new_arrival,clearance,best_value,best_seller,merchant_priority,collection,metal_type,weight,purity,country,mint,created_at,last_updated,condition,active
```

### Required values for every production product

- [ ] `id` is present, unique, stable, and never reused.
- [ ] `dealer_id` is exactly `money-metals-exchange`, `kitco`, or
      `sprott-money`.
- [ ] `category` uses a supported category slug.
- [ ] `title` is present and factual.
- [ ] `description` is present and feed-grounded.
- [ ] `product_url` is the canonical HTTPS merchant product page.
- [ ] `affiliate_url` is the exact approved tracked HTTPS URL.
- [ ] `image` is a direct, public, working HTTPS image.
- [ ] `currency` is `CAD`.
- [ ] `availability` is `in stock`, `preorder`, or `out of stock`.
- [ ] `featured`, `new_arrival`, `clearance`, `best_value`, `best_seller`, and
      `active` contain explicit `TRUE` or `FALSE` values.
- [ ] `merchant_priority` is a whole number from 0 through 10.
- [ ] `collection` is present.
- [ ] `last_updated` is a valid UTC ISO 8601 timestamp.
- [ ] `condition` is `new`.

### Optional values

- [ ] `sku` is stored as plain text when supplied.
- [ ] `brand`, `metal_type`, `weight`, `purity`, `country`, and `mint` contain
      only merchant-supplied facts.
- [ ] `long_description` contains no invented specifications or claims.
- [ ] `additional_image_urls` uses pipe-delimited direct HTTPS image URLs.
- [ ] `price` is blank or a verified non-negative decimal without a currency
      symbol.
- [ ] `previous_price` is blank or a verified value greater than `price`.
- [ ] `badge` agrees with the verified merchandising flags.
- [ ] `created_at` uses `YYYY-MM-DD` when supplied and is present whenever
      `new_arrival=TRUE`.

### Supported categories

- `gold-bars`
- `gold-coins`
- `silver-bars`
- `silver-coins`
- `platinum`
- `palladium`
- `copper`
- `vault-products`
- `collectibles`
- `deals`

### Sheet validation

- [ ] Duplicate `id` values are rejected.
- [ ] Dropdowns restrict merchant, category, availability, collection, and
      condition values.
- [ ] Boolean fields use checkboxes or literal `TRUE`/`FALSE`.
- [ ] Required fields have no blanks in intended active rows.
- [ ] No formula in a catalog row returns an error.
- [ ] No comma, quote, or line break produces malformed CSV.
- [ ] Unfinished rows use `active=FALSE`.
- [ ] Out-of-stock products use `availability=out of stock`.
- [ ] Rows without approved affiliate URLs remain inactive.
- [ ] Placeholder names, URLs, images, and prices have been removed.

### Publish CSV

- [ ] Publish only the completed product tab.
- [ ] Open the published CSV URL in a clean browser session.
- [ ] Confirm the first row is the exact 33-column header.
- [ ] Confirm product rows are visible in the CSV response.
- [ ] Confirm the export is not an HTML permission or login page.
- [ ] Confirm the `gid` remains stable after publishing.
- [ ] Save the final published URL as `PRODUCT_SHEET_CSV_URL`.

## 3. Refresh workflow

Workflow: `.github/workflows/refresh-commerce-catalog.yml`  
Workflow name: **Refresh commerce catalog**

### Manual run

- [ ] Open **GitHub → Actions → Refresh commerce catalog**.
- [ ] Select **Run workflow**.
- [ ] Select the intended PR #12 branch for pre-merge validation.
- [ ] Leave `source_url` blank to test the configured
      `PRODUCT_SHEET_CSV_URL`.
- [ ] Run the workflow.
- [ ] Confirm **Regenerate storefront and catalogs** succeeds.
- [ ] Confirm **Validate catalog engine** succeeds.
- [ ] Confirm all 22 catalog tests pass.
- [ ] Confirm **Commit generated outputs** succeeds or correctly reports no
      changes.
- [ ] Confirm the workflow does not deploy the website.

If `source_url` is supplied manually, that run validates the override—not the
configured secret. The final acceptance run must leave the override blank.

### Expected import log

- [ ] `total` is greater than zero.
- [ ] `productsImported` matches new product rows.
- [ ] `productsUpdated` matches changed product rows.
- [ ] `duplicatesSkipped` is zero.
- [ ] `affiliateLinksRejected` is empty for intended live products.
- [ ] `errors` is empty.
- [ ] Merchant and category counts match the Sheet.
- [ ] Inactive products do not enter generated public feeds.

### Expected generated outputs

- `products.json`
- `data/products/catalog.json`
- `data/products/products.json`
- `data/products/instagram.json`
- `data/products/featured-products.json`
- `data/products/showroom-products.json`
- one JSON feed for each supported category
- `catalog.csv`
- `catalog.xml`
- `sitemap.xml`
- `data/products/import-state.json`
- `data/analytics/products.json`
- `data/analytics/product-import-log.jsonl`
- regenerated homepage, `/ig`, category pages, storefront JavaScript, and
  storefront CSS

### Workflow success criteria

- [ ] The source type identifies Google Sheets or the intended remote CSV.
- [ ] Imported active product count is greater than zero.
- [ ] No active product has an unknown dealer.
- [ ] Duplicate count is zero.
- [ ] No intended live affiliate URL is rejected.
- [ ] Generated outputs parse successfully.
- [ ] The workflow commits only expected generated files.
- [ ] A second unchanged run reports unchanged products rather than duplicates
      or new imports.

## 4. Catalog verification

### `products.json`

- [ ] File parses as valid JSON.
- [ ] `schemaVersion` is present.
- [ ] `generatedAt` reflects the successful workflow run.
- [ ] `sourceType` is not the empty fallback unless intentionally testing it.
- [ ] `products` contains the expected active products.
- [ ] Every product has a unique `id`.
- [ ] Every product has the expected `dealerId`, category, availability, image,
      and affiliate URL.
- [ ] `affiliateVerified=true` appears only for approved tracked destinations.
- [ ] Inactive products are absent.
- [ ] No placeholder values remain.

### `catalog.csv`

- [ ] File has the Meta-compatible header:

```csv
id,title,description,availability,condition,price,link,image_link,brand,product_type
```

- [ ] File contains one row for every Meta-eligible product.
- [ ] Product IDs are unique.
- [ ] Prices use `0.00 CAD` formatting.
- [ ] `link` contains the exact approved affiliate URL.
- [ ] `image_link` is a direct working HTTPS image.
- [ ] Products without a verified price are correctly excluded.
- [ ] CSV quoting is valid for commas, quotes, and line breaks.

### `catalog.xml`

- [ ] File is well-formed XML.
- [ ] RSS and Google merchant namespaces are present.
- [ ] Item count matches `catalog.csv`.
- [ ] Every `<g:id>` is unique.
- [ ] Every `<g:link>` contains the exact approved affiliate URL.
- [ ] Every `<g:image_link>` resolves to a public image.
- [ ] Price, currency, availability, condition, brand, and product type match
      the source data.
- [ ] XML-special characters are escaped correctly.

### Cross-output reconciliation

- [ ] Active Sheet count matches `products.json`.
- [ ] Meta-eligible count matches both `catalog.csv` and `catalog.xml`.
- [ ] CSV and XML contain the same product IDs.
- [ ] Merchant counts match across the Sheet and generated outputs.
- [ ] No removed or inactive ID remains in a generated public/channel feed.

## 5. Storefront verification

Use the existing PR preview for these checks. Do not test only local files.

### Homepage

- [ ] Homepage loads without a blank screen or console error.
- [ ] Today’s Picks contains curated live products.
- [ ] Gold, Silver, Platinum, New Releases, and Best Value show only eligible
      products.
- [ ] Empty sections retain an intentional editorial state rather than a broken
      grid.
- [ ] Merchant badges match the source merchant.
- [ ] Product images and titles open the corresponding product detail.
- [ ] The featured hero uses a valid product and verified affiliate destination
      when a lead product exists.

### Category pages

- [ ] Every supported category page opens.
- [ ] Products appear only in their matching category.
- [ ] No category displays more than the intended curated limit.
- [ ] Cards include image, title, merchant, description, price presentation,
      and CTA.
- [ ] Out-of-stock, inactive, placeholder, and unapproved products are absent.
- [ ] Empty categories show the intended non-broken empty state.

### Product pages

- [ ] `/ig/?product=<id>` resolves the selected product.
- [ ] Product title, image, merchant, description, availability, and price
      presentation match the generated catalog.
- [ ] Related products exclude the current product.
- [ ] Related products use valid product IDs and approved destinations.
- [ ] Unknown product IDs do not produce a JavaScript error.
- [ ] Product metadata, canonical URL, Open Graph, Twitter Card, and JSON-LD
      reflect the selected product.

### Shop Now buttons

- [ ] A button is shown only when `affiliateVerified=true`.
- [ ] `Shop Now` uses `affiliate_url`, never `product_url`.
- [ ] The browser-visible destination matches the stored URL exactly.
- [ ] The CTA opens in a new tab.
- [ ] The CTA contains `rel="sponsored nofollow noopener noreferrer"`.
- [ ] Missing or rejected affiliate URLs produce no purchase button.
- [ ] No placeholder URL, generic merchant search, or untracked homepage is
      used as a product CTA.

### Images

- [ ] Every active product has a public direct HTTPS primary image.
- [ ] Images return an image content type rather than HTML.
- [ ] Images load on homepage, category, `/ig`, and product detail views.
- [ ] Images have meaningful alt text grounded in the product feed.
- [ ] Images remain legible and correctly cropped on mobile.
- [ ] No placeholder or broken-image icon is visible.

### Prices

- [ ] Prices appear only when supplied and verified.
- [ ] Currency is displayed as CAD.
- [ ] No price, discount, premium, or savings claim is invented.
- [ ] Products without prices use the approved “See dealer for price”
      presentation.
- [ ] Products without prices remain excluded from Meta CSV/XML.
- [ ] `previous_price` is shown or scored only when it is verified and greater
      than the current price.

### Mobile

- [ ] Homepage works at 320px, 375px, 390px, and 430px widths.
- [ ] Mobile navigation opens, closes, and remains keyboard accessible.
- [ ] Product cards fit without horizontal scrolling.
- [ ] Product detail becomes a readable single-column layout.
- [ ] Shop buttons have usable mobile tap targets.
- [ ] Search and filters work without obscuring products.

## 6. Merchant verification

Affiliate URLs are authoritative merchant-issued data. Do not normalize,
correct, shorten, decode, reconstruct, or reorder them.

### Money Metals Exchange

- [ ] At least one intended active Money Metals product exists in the Sheet.
- [ ] `dealer_id` is `money-metals-exchange`.
- [ ] Affiliate host is `www.awin1.com`.
- [ ] Required query value `v=88985` is present.
- [ ] Required publisher value `r=2936205` is present.
- [ ] Product appears in `products.json`.
- [ ] Priced product appears in `catalog.csv` and `catalog.xml`.
- [ ] `Shop Now` uses the exact stored URL.
- [ ] Clean-browser handoff reaches the intended Money Metals destination.
- [ ] Tracking parameters remain present after redirect.

### Kitco

- [ ] At least one intended active Kitco product exists in the Sheet.
- [ ] `dealer_id` is `kitco`.
- [ ] Affiliate host is `www.awin1.com`.
- [ ] Required query value `v=84579` is present.
- [ ] Required publisher value `r=2936205` is present.
- [ ] Product appears in `products.json`.
- [ ] Priced product appears in `catalog.csv` and `catalog.xml`.
- [ ] `Shop Now` uses the exact stored URL.
- [ ] Clean-browser handoff reaches the intended Kitco destination.
- [ ] Tracking parameters remain present after redirect.

### Sprott Money

- [ ] At least one intended active Sprott product exists in the Sheet.
- [ ] `dealer_id` is `sprott-money`.
- [ ] Affiliate host is `www.sprottmoney.ca`.
- [ ] Required query value is exactly `acc=paul-maladrino-5887a`.
- [ ] The merchant-issued spelling `maladrino` has not been corrected to
      `malandrino`.
- [ ] Product appears in `products.json`.
- [ ] Priced product appears in `catalog.csv` and `catalog.xml`.
- [ ] `Shop Now` uses the exact stored URL.
- [ ] Clean-browser handoff reaches the intended Sprott destination.
- [ ] The `acc=paul-maladrino-5887a` value remains present after handoff.

## 7. Production sign-off

### Blocking sign-off

- [ ] `PRODUCT_SHEET_CSV_URL` is configured and confirmed.
- [ ] The published CSV uses the exact 33-column production schema.
- [ ] The Sheet contains real validated product rows.
- [ ] Placeholder rows and URLs are absent or inactive.
- [ ] The first secret-backed refresh succeeds.
- [ ] Imported active product count is greater than zero.
- [ ] Duplicate count is zero.
- [ ] Import error count is zero.
- [ ] Rejected affiliate count is zero for intended live products.
- [ ] `products.json`, `catalog.csv`, and `catalog.xml` validate.
- [ ] Homepage, category, and product views display live catalog products.
- [ ] Product lookups work.
- [ ] Product images work.
- [ ] Mobile layout is usable.
- [ ] One clean-browser affiliate handoff succeeds for each represented
      merchant.
- [ ] No secret or credential is publicly exposed.
- [ ] No unrelated file was changed by the refresh.

### Final approvals

- [ ] Catalog owner confirms product data accuracy.
- [ ] Affiliate owner confirms merchant tracking.
- [ ] Technical reviewer confirms workflow and generated-output integrity.
- [ ] Editorial reviewer confirms titles and descriptions contain no invented
      claims.
- [ ] Release owner confirms no production blockers remain.
- [ ] PR #12 receives final review approval.

### Release authorization

Do not merge or deploy merely because automated tests pass. Merge and
production deployment require explicit approval after every blocking checkbox
above is complete.

| Sign-off | Name | Date | Status |
|---|---|---|---|
| Catalog |  |  | Pending |
| Affiliate tracking |  |  | Pending |
| Technical |  |  | Pending |
| Editorial |  |  | Pending |
| Release |  |  | Pending |
