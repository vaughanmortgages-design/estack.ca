# eStack Master Product Catalog Specification

Version: 1.0  
Owner: eStack.ca  
Status: Production data contract

## Purpose

The Master Product Catalog is the single source of truth for eStack.ca, Meta
Commerce Manager, Instagram Shop, Facebook Shop, Make.com and future
feed-grounded AI content.

The Google Sheet is the editable master. JSON is the normalized internal
representation. CSV and XML are generated distribution formats. The public
storefront consumes curated generated feeds; it must never link to the master
Sheet or expose it in customer navigation.

## Canonical Google Sheet columns

Use this exact header order:

```csv
id,sku,dealer_id,brand,category,title,description,long_description,product_url,affiliate_url,image,additional_image_urls,price,previous_price,currency,availability,badge,featured,new_arrival,clearance,best_value,best_seller,merchant_priority,collection,metal_type,weight,purity,country,mint,created_at,last_updated,condition,active
```

Do not merge cells, insert title rows above the header, or place formulas that
return errors in catalog rows. Use one product per row.

## Field dictionary

| Column | Type | Value required | Rules |
|---|---|---:|---|
| `id` | string | Yes | Stable, unique product ID. Never recycle an ID. Recommended pattern: `merchant-product-slug`. |
| `sku` | string | No | Merchant or manufacturer SKU. Preserve leading zeroes by formatting the Sheet column as plain text. |
| `dealer_id` | string | Yes | Merchant registry ID. Initially `money-metals-exchange`, `kitco`, or `sprott-money`. |
| `brand` | string | No | Manufacturer, refiner or recognized product brand. |
| `category` | enum | Yes | One supported storefront category. |
| `title` | string | Yes | Factual product title; 1–150 characters. |
| `description` | string | Yes | Feed-grounded short description; 1–500 characters. |
| `long_description` | string | No | Additional factual detail; maximum 5,000 characters. No unsupported claims. |
| `product_url` | HTTPS URL | Yes | Canonical merchant product page without affiliate tracking. Used for identity and validation, not the customer CTA. |
| `affiliate_url` | HTTPS URL | Yes | Exact approved tracked destination. This is the only Shop Now destination. |
| `image` | HTTPS URL | Yes | Direct primary image URL. No login, HTML page or placeholder image. |
| `additional_image_urls` | URL list | No | Zero or more direct HTTPS image URLs separated by `|` in Sheet/CSV and represented as an array in JSON. |
| `price` | decimal/null | No | Current verified price, zero or greater. No currency symbols or commas. Required for Meta export. |
| `previous_price` | decimal/null | No | Previous verified price. Must be greater than `price`; otherwise leave blank. |
| `currency` | ISO currency | Yes | Three uppercase letters. Version 1 uses `CAD`. |
| `availability` | enum | Yes | `in stock`, `preorder`, or `out of stock`. |
| `badge` | string | No | Customer-facing badge text supported by the current merchandising policy. Must agree with the boolean flags. |
| `featured` | boolean | Yes | `TRUE` or `FALSE`. |
| `new_arrival` | boolean | Yes | `TRUE` only for a verified new release. |
| `clearance` | boolean | Yes | `TRUE` only when the merchant identifies the item as clearance. |
| `best_value` | boolean | Yes | Editorial merchandising flag; not a price claim. |
| `best_seller` | boolean | Yes | `TRUE` only when supported by merchant data. |
| `merchant_priority` | integer | Yes | `0`–`10`; controls ranking without changing the schema. |
| `collection` | string | Yes | Broad grouping such as `gold`, `silver`, `platinum`, `palladium`, `copper`, `collectibles`, or `deals`. |
| `metal_type` | string/null | No | Normalized metal name. Leave blank when not applicable. |
| `weight` | string/null | No | Merchant-supplied value including unit, for example `1 oz`. Never infer it from the title. |
| `purity` | string/null | No | Merchant-supplied fineness or karat value. Never infer it. |
| `country` | string/null | No | Two-letter uppercase country code when supplied, such as `CA` or `US`. |
| `mint` | string/null | No | Merchant-supplied mint or refiner. |
| `created_at` | date/null | No | First catalog date in `YYYY-MM-DD` format. Used for new-arrival scoring. |
| `last_updated` | datetime | Yes | UTC ISO 8601 timestamp, for example `2026-07-25T18:30:00Z`. |
| `condition` | enum | Yes | Version 1 uses `new`. |
| `active` | boolean | Yes | `TRUE` to publish; `FALSE` to retain the record without storefront or channel distribution. |

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

## Merchant registry

Products reference merchants through `dealer_id`; merchant-specific tracking
rules do not belong in product rows. New merchants are added to the dealer
registry without changing this product schema.

| Merchant | `dealer_id` | Approved affiliate validation |
|---|---|---|
| Money Metals Exchange | `money-metals-exchange` | HTTPS host `www.awin1.com`; query `v=88985`; query `r=2936205` |
| Kitco | `kitco` | HTTPS host `www.awin1.com`; query `v=84579`; query `r=2936205` |
| Sprott Money | `sprott-money` | HTTPS host `www.sprottmoney.ca`; query `acc=paul-maladrino-5887a` exactly as issued by Sprott; do not normalize the surname |

The merchant registry owns the display name, badge, approved hosts, required
tracking parameters and supported categories.

## Canonical JSON structure

The normalized JSON document is an object containing schema metadata and a
`products` array:

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-07-25T18:30:00Z",
  "source": "google-sheets",
  "products": [
    {
      "id": "merchant-stable-product-id",
      "sku": null,
      "dealerId": "money-metals-exchange",
      "brand": null,
      "category": "gold-bars",
      "title": "Feed-supplied product title",
      "description": "Feed-supplied short description.",
      "longDescription": null,
      "productUrl": "https://merchant.example/product",
      "affiliateUrl": "https://approved-tracked.example/click",
      "image": "https://images.example/product.webp",
      "additionalImages": [],
      "price": null,
      "previousPrice": null,
      "currency": "CAD",
      "availability": "in stock",
      "badge": null,
      "featured": false,
      "newArrival": false,
      "clearance": false,
      "bestValue": false,
      "bestSeller": false,
      "merchantPriority": 0,
      "collection": "gold",
      "metalType": "gold",
      "weight": null,
      "purity": null,
      "country": null,
      "mint": null,
      "createdAt": null,
      "lastUpdated": "2026-07-25T18:30:00Z",
      "condition": "new",
      "active": true
    }
  ]
}
```

The example documents structure only. It is not a real product and must never
be imported as inventory.

## Canonical CSV structure

- Encoding: UTF-8.
- Header: exact Google Sheet header shown above.
- Record separator: newline.
- Delimiter: comma.
- Quote any field containing commas, quotes or newlines.
- Escape embedded quotes by doubling them.
- Serialize booleans as `TRUE` or `FALSE`.
- Serialize null optional values as empty cells.
- Serialize `additional_image_urls` as a pipe-delimited list.
- Serialize prices as plain decimals, for example `125.50`.
- Never include currency symbols in `price` or `previous_price`.

## Meta Commerce mapping

Only active records with a valid approved affiliate URL, valid HTTPS primary
image, non-null price and valid currency are eligible for Meta export.

| Meta field | Master source | Rule |
|---|---|---|
| `id` | `id` | Stable and unique. |
| `title` | `title` | Feed-supplied; no generated specifications. |
| `description` | `description` | Use `long_description` only when it is present and verified. |
| `availability` | `availability` | Normalize to Meta-supported availability text. |
| `condition` | `condition` | Version 1: `new`. |
| `price` | `price` + `currency` | Format as `125.50 CAD`. Required for Meta. |
| `link` | `affiliate_url` | Exact approved tracked URL. |
| `image_link` | `image` | Direct HTTPS primary image. |
| `additional_image_link` | `additional_image_urls` | Export supported additional HTTPS images. |
| `brand` | `brand` | Fall back to merchant display name only when appropriate. |
| `product_type` | `category` | Preserve the eStack category slug. |
| `custom_label_0` | `dealer_id` | Merchant segmentation. |
| `custom_label_1` | `collection` | Metal/collection segmentation. |
| `custom_label_2` | merchandising flags | One controlled label: featured, new-arrival, clearance or best-value. |

Meta eligibility is stricter than storefront eligibility. A missing price may
show as “See dealer for price” on eStack, but that product must not enter the
Meta catalog.

## Validation policy

### Hard rejection

Reject the entire row when any of these conditions is true:

1. `id` is blank or duplicates another product ID.
2. `title`, `dealer_id`, `product_url`, `affiliate_url` or `image` is blank.
3. `dealer_id` does not exist in the merchant registry.
4. `product_url`, `affiliate_url` or `image` is not a valid HTTPS URL.
5. `affiliate_url` fails the registered merchant host or tracking-parameter rules.
6. `category` or `availability` is unsupported.
7. `price` or `previous_price` is present but is not a non-negative number.
8. `currency` is not three uppercase letters.
9. `last_updated` is missing or invalid.
10. A required boolean or `merchant_priority` is invalid.

### Channel exclusion without deleting the master record

- `active=FALSE`: exclude from every public and channel feed.
- `availability=out of stock`: retain but exclude from curated storefront sections.
- Missing `price`: allow eligible eStack display, exclude from Meta.
- Invalid additional image: drop that additional image; retain the product if the primary image is valid.
- Missing optional bullion attributes: retain the product and leave the fields null.

### Cross-field validation

- `previous_price` must be greater than `price`.
- `clearance=TRUE` requires verified merchant clearance evidence.
- `new_arrival=TRUE` requires a valid `created_at`.
- `badge` must agree with the boolean merchandising flags.
- `metal_type`, `weight`, `purity`, `country` and `mint` may only contain merchant-supplied facts.
- `product_url` is for identity and audit; `affiliate_url` is the only purchase CTA.

## Google Sheet validation configuration

Apply these controls to the product tab:

- Reject duplicates in `id`.
- Dropdowns for `dealer_id`, `category`, `availability`, `collection` and `condition`.
- Checkboxes for all boolean fields.
- Whole-number validation from 0 to 10 for `merchant_priority`.
- Decimal validation greater than or equal to zero for price fields.
- Date validation for `created_at`.
- ISO timestamp validation for `last_updated`.
- Conditional formatting for missing hard-required fields.
- Protected header row and protected validation lists.
- A separate read-only merchant-registry tab.

## Distribution and privacy

- The editable Google Sheet is never linked from the website.
- The storefront reads only curated generated JSON.
- Raw generated feeds remain absent from customer navigation.
- Machine endpoints use `X-Robots-Tag: noindex`.
- Meta and Make.com receive only the fields required for their channel.
- Secrets and API tokens never appear in catalog rows or generated outputs.
- AI receives only feed fields and must not infer price, purity, weight, availability or product claims.

## Release acceptance

The catalog is ready for production only when:

1. Schema validation passes.
2. Duplicate count is zero.
3. Hard-rejection count is zero for all intended active products.
4. One active product per enabled merchant passes Shop Now handoff testing.
5. JSON parses and Meta CSV/XML validate.
6. Inactive and rejected products are absent from public channel feeds.
7. No raw Sheet or secret URL appears in public navigation.
