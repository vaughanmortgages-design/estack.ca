# eStack Product Operations Guide

Version: 1.0  
Owner: eStack.ca  
System of record: Production Google Sheet referenced by `PRODUCT_SHEET_CSV_URL`

## 1. Purpose and operating principles

This guide is the operating manual for the eStack bullion product catalog. The
Google Sheet is the single editable source of truth for:

- the curated eStack storefront;
- the `/catalog` machine endpoint;
- the `/ig` Instagram storefront;
- Make.com regeneration;
- Meta Commerce Manager feeds; and
- generated `products.json`, `catalog.csv`, and `catalog.xml` files.

The raw Google Sheet and raw catalog are private operating resources. They must
not be linked from customer navigation or presented as the storefront.

Use one product per row. Do not merge cells, add title rows above the header,
hide required values in formulas, or publish rows containing formula errors.
Product information must come from the merchant feed or another verified
merchant source. Never invent a product, price, specification, availability
claim, image, or affiliate URL.

## 2. Production Google Sheet

### Exact column order

Use this exact header row:

```csv
id,sku,dealer_id,brand,category,title,description,long_description,product_url,affiliate_url,image,additional_image_urls,price,previous_price,currency,availability,badge,featured,new_arrival,clearance,best_value,best_seller,merchant_priority,collection,metal_type,weight,purity,country,mint,created_at,last_updated,condition,active
```

The examples below describe formatting only. They are not inventory and must
not be copied into the live catalog as products.

### Field dictionary

| Column Name | Required | Data Type | Example Value | Validation Rules | Notes |
|---|---|---|---|---|---|
| `id` | Yes | Text | `merchant-stable-product-id` | Unique; 1–160 characters; lowercase letters, numbers, `.`, `_`, and `-`; pattern `^[a-z0-9][a-z0-9._-]*$` | Permanent product identity. Never recycle or change after publication. |
| `sku` | No | Text | `00012345` | Maximum 120 characters | Format the Sheet column as plain text to preserve leading zeroes. |
| `dealer_id` | Yes | Controlled text | `sprott-money` | Must match an enabled dealer registry ID | V1 values: `money-metals-exchange`, `kitco`, `sprott-money`. |
| `brand` | No | Text | `Royal Canadian Mint` | Maximum 160 characters; merchant-supplied | Manufacturer, mint, refiner, or recognized brand. Do not infer. |
| `category` | Yes | Dropdown | `gold-coins` | Must be one supported category slug | Drives category routing and Meta `product_type`. |
| `title` | Yes | Text | `Feed-supplied product title` | 1–150 characters; factual; no unsupported claims | Used by the storefront, `/ig`, JSON, CSV, XML, SEO, and Meta. |
| `description` | Yes | Text | `Feed-supplied short description.` | 1–500 characters; factual and feed-grounded | Primary customer-facing and Meta description. |
| `long_description` | No | Long text | `Verified merchant-supplied product details.` | Maximum 5,000 characters; no invented specifications or claims | Retain in the master record even when a generated V1 channel does not consume it. |
| `product_url` | Yes | HTTPS URL | `https://merchant.example/product` | Valid absolute HTTPS URL; canonical merchant product page | Used for product identity and audit. It is not the customer purchase CTA. |
| `affiliate_url` | Yes | HTTPS URL | `https://approved-tracked.example/click` | Valid absolute HTTPS URL; must pass the selected dealer's host and tracking rules | The only permitted `Shop Now` destination. Preserve the entire merchant-issued URL exactly. |
| `image` | Yes | HTTPS URL | `https://images.example/product.webp` | Valid direct public HTTPS image; no login, HTML page, placeholder, or broken image | Primary image for storefront and Meta `image_link`. |
| `additional_image_urls` | No | URL list | `https://images.example/side.webp\|https://images.example/back.webp` | Each value must be a valid direct public HTTPS image; maximum 20 unique URLs | Separate values with `\|` in Sheets/CSV; generated JSON uses an array. |
| `price` | No | Decimal | `125.50` | Number greater than or equal to 0; no commas or currency symbols | Storefront may show “See dealer for price” when blank. A verified price is required for Meta export. |
| `previous_price` | No | Decimal | `139.50` | Number greater than or equal to 0 and strictly greater than `price` | Use only for a verified prior price. Leave blank otherwise. |
| `currency` | Yes | ISO currency code | `CAD` | Exactly three uppercase letters; pattern `^[A-Z]{3}$` | V1 production currency is `CAD`. |
| `availability` | Yes | Dropdown | `in stock` | One of `in stock`, `preorder`, `out of stock` | Do not use free-form status text in this column. |
| `badge` | No | Text | `Featured` | Maximum 40 characters; must agree with verified merchandising flags | Customer-facing badge. Do not use it to make an unsupported price or popularity claim. |
| `featured` | Yes | Checkbox/Boolean | `TRUE` | Exactly `TRUE` or `FALSE` | Adds featured ranking weight. It does not bypass validation. |
| `new_arrival` | Yes | Checkbox/Boolean | `FALSE` | Exactly `TRUE` or `FALSE`; `TRUE` requires a valid `created_at` and merchant evidence | Governance flag. V1 New Releases ranking also uses `created_at`; the flag alone does not create a release date. |
| `clearance` | Yes | Checkbox/Boolean | `FALSE` | Exactly `TRUE` or `FALSE`; `TRUE` requires merchant clearance evidence | Governance flag. Never infer clearance from a lower price. |
| `best_value` | Yes | Checkbox/Boolean | `FALSE` | Exactly `TRUE` or `FALSE`; editorially approved and evidence-based | Governance flag, not a savings claim. V1 Best Value display also requires verified price comparison data. |
| `best_seller` | Yes | Checkbox/Boolean | `FALSE` | Exactly `TRUE` or `FALSE`; `TRUE` requires merchant evidence | Affects scoring. Do not infer from clicks or editorial preference. |
| `merchant_priority` | Yes | Whole number | `5` | Integer from 0 through 10 | Configurable ranking input. Higher values receive greater scoring weight. |
| `collection` | Yes | Dropdown/Text | `gold` | Controlled broad collection value | V1 values: `gold`, `silver`, `platinum`, `palladium`, `copper`, `collectibles`, `deals`. |
| `metal_type` | No | Text | `gold` | Maximum 80 characters; merchant-supplied | Leave blank when not applicable. |
| `weight` | No | Text | `1 oz` | Maximum 80 characters; include the supplied unit | Never infer weight from an image or title. |
| `purity` | No | Text | `9999` | Maximum 80 characters; merchant-supplied | Preserve merchant formatting; do not calculate or infer fineness. |
| `country` | No | Country code | `CA` | Exactly two uppercase letters when present; pattern `^[A-Z]{2}$` | Country associated with the product when supplied by the merchant. |
| `mint` | No | Text | `Royal Canadian Mint` | Maximum 160 characters; merchant-supplied | Mint or refiner; leave blank if not verified. |
| `created_at` | No | Date | `2026-07-25` | Valid `YYYY-MM-DD` date | First catalog/release date used by new-arrival scoring. Required when `new_arrival=TRUE`. |
| `last_updated` | Yes | UTC datetime | `2026-07-25T18:30:00Z` | Valid ISO 8601 UTC timestamp | Change whenever any product field changes. Used for update detection and audit. |
| `condition` | Yes | Dropdown | `new` | V1 accepts only `new` | Maps to Meta condition. Do not add other values without an approved schema change. |
| `active` | Yes | Checkbox/Boolean | `TRUE` | Exactly `TRUE` or `FALSE` | Master publishing switch. `FALSE` excludes the product from every generated public and channel feed. |

### Supported category values

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

### Sheet controls

Configure the production Sheet as follows:

1. Freeze and protect the header row.
2. Protect validation lists and the merchant-registry tab.
3. Reject duplicate values in `id`.
4. Use dropdowns for `dealer_id`, `category`, `availability`, `collection`, and
   `condition`.
5. Use checkboxes for `featured`, `new_arrival`, `clearance`, `best_value`,
   `best_seller`, and `active`.
6. Restrict `merchant_priority` to whole numbers from 0 through 10.
7. Restrict `price` and `previous_price` to decimals greater than or equal to
   zero.
8. Validate `created_at` as a date and `last_updated` as an ISO 8601 UTC
   timestamp.
9. Apply conditional formatting to every missing hard-required field.
10. Publish/export only the intended catalog tab as CSV for
    `PRODUCT_SHEET_CSV_URL`.

## 3. How operational flags and status work

There is no separate canonical `status` column. Do not add one. The importer
recognizes `status` as an alias for `availability`, so a second status concept
would be ambiguous.

Operational state is derived from the following fields:

| State | Meaning and action |
|---|---|
| `active=TRUE`, availability `in stock` or `preorder`, validation passes | Publishable product. It may appear in eligible storefront, `/ig`, and channel outputs. |
| `active=FALSE` | Inactive record retained for history. Excluded from all generated public and channel feeds. |
| availability `out of stock` | Retain the record but exclude it from curated storefront sections until availability is verified again. |
| Validation fails | Reject the row from the affected outputs and correct the source data before publishing. |
| Price blank | May be eligible for eStack with “See dealer for price”; excluded from Meta CSV/XML. |

The merchandising flags have distinct purposes:

- `featured`: gives an eligible product additional ranking weight.
- `new_arrival`: records a verified new-arrival designation. A valid
  `created_at` is also required because V1 New Releases are date-driven.
- `best_value`: records an approved editorial designation. V1 Best Value
  merchandising also depends on a verified `previous_price` greater than
  `price`; the flag alone is not proof of savings.
- `clearance`: records a merchant-confirmed clearance designation. It is not
  inferred from a price change.
- `best_seller`: adds scoring weight only when merchant evidence supports the
  claim.

Flags never override `active`, availability, affiliate validation, image
validation, or other hard requirements.

## 4. Product lifecycle

### New Product

1. Add one new row with a permanent, unique `id`.
2. Set `active` to `FALSE` while the row is being prepared.
3. Select the registered `dealer_id`, category, collection, availability, and
   condition.
4. Enter only verified merchant data, including the canonical `product_url`,
   exact `affiliate_url`, direct image URL, and any price.
5. Complete every required field and set all merchandising flags explicitly.
6. Set `created_at` when known and set `last_updated` to the current UTC time.
7. Complete the per-product quality-control checklist in section 7.
8. Set `active` to `TRUE` only after the row passes quality control.
9. Trigger the existing Make.com/catalog regeneration workflow.
10. Confirm the import log shows an imported product, no duplicate, and no
    error. Verify the intended generated outputs and one `Shop Now` handoff.

### Update Product

1. Locate the existing row by `id`. Never change its `id`.
2. Change only fields supported by a current merchant source.
3. Preserve the complete affiliate URL exactly unless the merchant has issued
   an official replacement.
4. When a verified price changes, move the former current price to
   `previous_price` only if it remains valid and greater than the new `price`;
   otherwise clear `previous_price`.
5. Update `last_updated` to the current UTC time.
6. Run the quality-control checklist and trigger regeneration.
7. Confirm the import log records an update rather than a new product and
   verify the updated storefront/channel representation.

### Deactivate Product

Use deactivation when a product should stop publishing but its history should
remain.

1. Set `active` to `FALSE`.
2. Update `last_updated`.
3. Trigger regeneration.
4. Confirm the record is absent from storefront collections, `/ig`, generated
   `products.json`, Meta CSV/XML, and generated sitemap product entries.
5. Keep the row and never reuse its `id`.

For a temporary stock condition, use `availability=out of stock` instead of
deleting the row. Update `last_updated` and regenerate.

### Remove Product

Removal means deleting or archiving the source row and should be rare.

1. Deactivate the product first and complete a regeneration cycle.
2. Verify it is absent from every public and channel output.
3. Preserve an audit copy if required by eStack's retention process.
4. Delete or move the row to a non-published archive tab.
5. Trigger regeneration again and confirm the import log detects the removed
   product ID without creating a duplicate or error.
6. Never assign the removed `id` to another product.

## 5. Merchant standards

Every product must use a registered `dealer_id`. Merchant settings, approved
hosts, and required tracking parameters belong in the dealer registry rather
than being improvised in product rows.

### Money Metals Exchange

- `dealer_id`: `money-metals-exchange`
- Display name: Money Metals Exchange
- Approved affiliate host: `www.awin1.com`
- Required tracking: `v=88985` and `r=2936205`
- Current approved landing URL:
  `https://www.awin1.com/cread.php?s=3928272&v=88985&q=519076&r=2936205`
- Supported V1 categories: gold bars, gold coins, silver bars, silver coins,
  platinum, and copper.

### Kitco

- `dealer_id`: `kitco`
- Display name: Kitco
- Approved affiliate host: `www.awin1.com`
- Required tracking: `v=84579` and `r=2936205`
- Current approved landing URL:
  `https://www.awin1.com/cread.php?s=3795009&v=84579&q=505826&r=2936205`
- Supported V1 categories: gold bars, gold coins, silver bars, silver coins,
  platinum, and palladium.

### Sprott Money

- `dealer_id`: `sprott-money`
- Display name: Sprott Money
- Approved affiliate host: `www.sprottmoney.ca`
- Required tracking: `acc=paul-maladrino-5887a`
- Current approved landing URL:
  `https://www.sprottmoney.ca/?acc=paul-maladrino-5887a`
- Supported V1 categories: gold bars, gold coins, silver bars, silver coins,
  and platinum.

The spelling `paul-maladrino-5887a` is the authoritative merchant-issued
tracking value. Do not normalize, correct, decode, reorder, shorten, or
reconstruct it. Preserve it exactly until Sprott provides an official
replacement.

### Standards applying to every merchant

1. Copy affiliate URLs from the approved merchant source; never type them from
   memory or build them from a generic homepage.
2. Preserve the URL scheme, host, path, query parameters, parameter spelling,
   parameter values, and any required fragment exactly.
3. Do not substitute the untracked `product_url` for `affiliate_url`.
4. Do not use placeholders, generic searches, URL shorteners, or guessed
   product links.
5. If a verified product-level affiliate URL is unavailable, keep
   `active=FALSE`; do not publish a purchase CTA.
6. Test the final `Shop Now` URL in a clean browser session and confirm it
   reaches the intended merchant destination without losing required tracking.
7. Add a new merchant through the dealer registry and validation process. Do
   not change the product schema merely to add a merchant.

## 6. Output and channel rules

### eStack storefront and `/ig`

- Read curated generated product data, never the editable Sheet directly in
  the browser.
- Publish only records that are active, valid, and eligible for the relevant
  curated section.
- Use `affiliate_url` for every `Shop Now` button.
- Use verified `price` when available; otherwise use the approved no-price
  presentation.
- Never expose the raw catalog as customer-facing navigation.

### `/catalog`, JSON, and Make.com

- The existing workflow reads the CSV source defined by
  `PRODUCT_SHEET_CSV_URL`.
- `id` and `last_updated` control stable identity and update detection.
- Generated JSON uses camelCase field names, including `dealerId`,
  `affiliateUrl`, `additionalImages`, `previousPrice`, `newArrival`,
  `bestValue`, `bestSeller`, `merchantPriority`, `createdAt`, and
  `lastUpdated`.
- The Sheet remains authoritative even when a V1 generated output does not yet
  consume every optional master field.
- A regeneration run must report imported, updated, duplicate-skipped, and
  error counts. Investigate any non-zero error or duplicate count before
  release.

### Meta Commerce Manager

Only active, otherwise valid products with a verified price are Meta-eligible.

| Meta Field | Source | Production Rule |
|---|---|---|
| `id` | `id` | Stable and unique. |
| `title` | `title` | Factual, merchant-supplied title. |
| `description` | `description` | Use verified `long_description` only when supported by the export. |
| `availability` | `availability` | Normalize only to a Meta-supported value. |
| `condition` | `condition` | V1 value is `new`. |
| `price` | `price` + `currency` | Format as `125.50 CAD`; required for Meta. |
| `link` | `affiliate_url` | Exact approved tracked URL. |
| `image_link` | `image` | Direct public HTTPS primary image. |
| `additional_image_link` | `additional_image_urls` | Export only valid supported additional images. |
| `brand` | `brand` | Use verified brand; merchant display name may be used only when appropriate. |
| `product_type` | `category` | Preserve the eStack category slug. |
| `custom_label_0` | `dealer_id` | Merchant segmentation. |
| `custom_label_1` | `collection` | Collection/metal segmentation. |
| `custom_label_2` | merchandising flags | One controlled label such as featured, new-arrival, clearance, or best-value. |

A product may be valid for eStack but excluded from Meta when `price` is blank.
That is a channel exclusion, not a reason to invent a price.

## 7. Per-product quality-control checklist

Copy this checklist into the product review ticket or operating log for every
new, updated, reactivated, or materially changed product:

### Identity and content

- [ ] Product ID is present, unique, stable, and correctly formatted.
- [ ] Product title is present, factual, and 150 characters or fewer.
- [ ] Short description is present, factual, and 500 characters or fewer.
- [ ] Optional bullion facts are merchant-supplied and not inferred.

### Required destinations and image

- [ ] `product_url` is present, HTTPS, and opens the canonical product page.
- [ ] `affiliate_url` is present and copied exactly from the approved source.
- [ ] Affiliate host and every required tracking parameter pass the selected
      merchant's validation rules.
- [ ] A clean-session `Shop Now` test reaches the intended merchant website.
- [ ] Primary `image` is present, HTTPS, public, direct, relevant, and not a
      placeholder.
- [ ] Every additional image URL used is direct, public, HTTPS, and valid.

### Classification and publication

- [ ] Merchant/dealer is correct and exists in the registry.
- [ ] Category is present and supported.
- [ ] Collection is present and correct.
- [ ] Availability is one of `in stock`, `preorder`, or `out of stock`.
- [ ] `active` is explicitly set; it is `TRUE` only after all required checks
      pass.
- [ ] `featured` is explicitly set and editorially approved when `TRUE`.
- [ ] `new_arrival`, `clearance`, `best_value`, and `best_seller` have evidence
      when `TRUE`.
- [ ] Badge text, if present, agrees with the product flags and evidence.

### Price and channel readiness

- [ ] Price is verified and entered as a plain non-negative decimal, or is
      intentionally blank.
- [ ] Currency is `CAD`.
- [ ] Previous price, if present, is verified and greater than current price.
- [ ] Products without a price are excluded from Meta rather than assigned a
      fabricated price.
- [ ] `last_updated` contains the current valid UTC ISO 8601 timestamp.
- [ ] Regeneration completes with no duplicate or validation error for the row.
- [ ] Intended storefront, `/ig`, JSON, CSV, and XML outputs were spot-checked.

## 8. Launch and ongoing operating checks

Before a catalog release:

- [ ] `PRODUCT_SHEET_CSV_URL` points to the intended production tab.
- [ ] The exact 33-column header is present and unchanged.
- [ ] Duplicate product ID count is zero.
- [ ] Hard validation error count is zero for all intended active products.
- [ ] Inactive products are absent from all generated public/channel feeds.
- [ ] Out-of-stock products are absent from curated storefront sections.
- [ ] Missing-image and invalid-image counts are zero for active products.
- [ ] Missing or invalid affiliate URL count is zero for active products.
- [ ] One active product for Money Metals, Kitco, and Sprott passes a clean
      browser `Shop Now` handoff.
- [ ] Sprott tracking remains exactly `acc=paul-maladrino-5887a`.
- [ ] `products.json` parses successfully.
- [ ] `catalog.csv` has a valid header and parseable rows.
- [ ] `catalog.xml` is well-formed.
- [ ] Meta-eligible rows contain price, currency, availability, condition,
      link, image, and unique ID.
- [ ] The storefront and `/ig` show curated products rather than the raw
      database.
- [ ] No secret, credential, private Sheet edit URL, or API token appears in
      catalog rows or generated outputs.

After each scheduled or manual update, retain the generation log and review:

- products imported;
- products updated;
- duplicates skipped;
- products removed/deactivated; and
- errors.

Do not release a catalog run with unexplained duplicates, rejected active
products, broken images, or failed affiliate handoffs.
