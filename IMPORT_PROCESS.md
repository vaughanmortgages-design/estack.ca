# eStack Production Catalog Import Process

## Purpose

The production Google Sheet is the single source of truth for eStack product
data. The refresh workflow reads the published CSV, validates every row,
generates customer and channel feeds, and commits the generated outputs.

Do not enter invented products, prices, specifications, images, or affiliate
URLs. Affiliate and image URLs are retained exactly as stored in the source
row.

## 1. Publish the Google Sheet as CSV

1. Use a dedicated product tab with this exact header:

```csv
id,sku,dealer_id,brand,category,title,description,long_description,product_url,affiliate_url,image,additional_image_urls,price,previous_price,currency,availability,badge,featured,new_arrival,clearance,best_value,best_seller,merchant_priority,collection,metal_type,weight,purity,country,mint,created_at,last_updated,condition,active
```

2. Put the header in row 1 with no title or instruction rows above it.
3. Use one product per row and no merged cells.
4. Publish only the product tab as CSV.
5. Copy the published CSV/export URL, including the correct product-tab `gid`.
6. Open the URL in a clean browser session and confirm that it returns CSV
   rather than a Google login or HTML permission page.

The importer ignores fully blank rows.

## 2. Update `PRODUCT_SHEET_CSV_URL`

1. Open the repository's **Settings → Secrets and variables → Actions**.
2. Create or update the repository secret `PRODUCT_SHEET_CSV_URL`.
3. Paste the published product-tab CSV URL without quotation marks or
   surrounding whitespace.
4. Do not store the Sheet URL in application code or customer-visible files.

If this secret is absent, the workflow falls back to
`data/products/source.json`. The checked-in fallback contains no live products,
so an empty fallback build is not a successful production import.

## 3. Run the refresh workflow

1. Open **Actions → Refresh commerce catalog**.
2. Select **Run workflow**.
3. Select the branch being validated.
4. Leave the optional `source_url` input blank. This confirms the configured
   `PRODUCT_SHEET_CSV_URL` rather than an override.
5. Run the workflow.
6. Confirm the regeneration, tests, and generated-output commit all succeed.

The workflow writes a structured validation report to:

```text
data/analytics/product-import-report.json
```

The report includes:

- total source rows;
- imported rows;
- skipped rows;
- blank rows;
- inactive rows;
- duplicate rows;
- invalid rows;
- missing required-field counts;
- rejected affiliate-link IDs; and
- the source and generation timestamp.

Invalid rows do not stop valid rows from importing. Review every invalid,
duplicate, inactive, and rejected record before release.

## 4. Row validation rules

Every intended active row must contain:

- `id`
- `dealer_id`
- `category`
- `title`
- `description`
- `product_url`
- `affiliate_url`
- `image`
- `currency`
- `availability`
- `featured`
- `new_arrival`
- `clearance`
- `best_value`
- `best_seller`
- `merchant_priority`
- `collection`
- `last_updated`
- `condition`
- `active`

Additional rules:

- IDs must be unique.
- `dealer_id` must match an enabled merchant.
- Categories must match a supported storefront category.
- Product, affiliate, primary image, and additional image URLs must be HTTPS.
- Currency must be a three-letter uppercase code; Version 1 uses `CAD`.
- Availability must be `in stock`, `preorder`, or `out of stock`.
- Condition must be `new`.
- Boolean values must be explicit valid Boolean values.
- Merchant priority must be a whole number from 0 through 10.
- `last_updated` must be a valid date-time.
- `active=FALSE` rows are ignored before publication validation so incomplete
  draft or retired products remain safely unpublished.
- The first valid active occurrence of an ID is retained; later occurrences
  are reported and skipped.

The importer preserves these source values without URL reconstruction:

- merchant name;
- canonical product URL;
- affiliate URL;
- primary image URL; and
- additional image URLs.

Affiliate validation checks the stored URL but does not replace it. A product
with a missing, placeholder, malformed, or unapproved affiliate URL is excluded
from purchase CTAs and Meta feeds.

## 5. Verify generated outputs

### `products.json`

Confirm:

- the file is valid JSON;
- `generatedAt` matches the workflow run;
- `products` contains the expected valid active rows;
- IDs are unique;
- inactive and invalid rows are absent;
- merchant names and source URLs match the Sheet exactly; and
- intended live products have `affiliateVerified=true`.

### `catalog.csv`

Confirm:

- the file parses as CSV;
- the header is Meta-compatible;
- every Meta-eligible product has one row;
- IDs are unique;
- prices are verified and formatted with currency;
- `link` equals the stored approved affiliate URL exactly; and
- `image_link` equals the stored image URL exactly.

Products without a verified price or affiliate URL are intentionally absent
from the Meta CSV.

### `catalog.xml`

Confirm:

- the file is well-formed XML;
- its item count matches `catalog.csv`;
- each product ID is unique;
- `<g:link>` equals the stored approved affiliate URL;
- `<g:image_link>` equals the stored primary image URL; and
- price, currency, availability, condition, brand, and category match the
  source.

## 6. Confirm products on the storefront

Using the branch preview:

1. Open the homepage and confirm curated products appear.
2. Open relevant category pages and confirm products are classified correctly.
3. Open `/ig/` and confirm the catalog loads.
4. Open `/ig/?product=<product-id>` for at least one imported product.
5. Confirm title, description, merchant, image, price presentation, and related
   products match generated data.
6. Confirm inactive, invalid, duplicate, out-of-stock, and unapproved products
   are excluded as intended.
7. Test desktop and mobile layouts.

## 7. Confirm `Shop Now`

For at least one intended live product from each represented merchant:

1. Read the exact `affiliate_url` in the published CSV.
2. Open the product on the branch preview.
3. Inspect the `Shop Now` destination.
4. Confirm it is identical to the stored `affiliate_url`.
5. Open it in a clean browser session.
6. Confirm it reaches the intended merchant.
7. Confirm the required tracking values remain present through the handoff.

Merchant tracking requirements:

- Money Metals Exchange: Awin host with `v=88985` and `r=2936205`.
- Kitco: Awin host with `v=84579` and `r=2936205`.
- Sprott Money: `acc=paul-maladrino-5887a` exactly as issued.

Do not correct or normalize the merchant-issued Sprott surname spelling.

## 8. Successful import acceptance

The first production import is successful only when:

- imported row count is greater than zero;
- skipped and invalid rows are understood;
- duplicate row count is zero;
- missing required-field counts are zero for intended live rows;
- rejected affiliate-link count is zero for intended live rows;
- `products.json`, `catalog.csv`, and `catalog.xml` validate;
- output merchant and product counts reconcile with the Sheet;
- products appear on the storefront;
- images load;
- product lookups work; and
- one exact affiliate handoff per represented merchant succeeds.

Do not merge or deploy until these checks are complete and explicitly approved.
