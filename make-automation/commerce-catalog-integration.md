# eStack Commerce Catalog — Make.com Integration

## Source of truth

Use one Google Sheet as the master product source. Publish only the product tab as CSV, then save its URL in the GitHub Actions secret `PRODUCT_SHEET_CSV_URL`.

Required columns:

`id`, `title`, `description`, `price`, `currency`, `image`, `availability`, `dealer_id`, `affiliate_url`, `category`, `collection`, `featured`, `brand`, `condition`, `product_page_url`

Supported dealer IDs:

- `money-metals-exchange`
- `kitco`
- `sprott-money`

Leave `affiliate_url` empty until the exact tracked product URL is verified. Empty or placeholder URLs stay out of the Meta feed.

## Make.com scenario

1. Google Sheets — Watch Rows
2. Tools — Sleep for 60 seconds to combine rapid edits
3. HTTP — Make a request

HTTP request:

- Method: `POST`
- URL: `https://api.github.com/repos/vaughanmortgages-design/estack.ca/dispatches`
- Headers:
  - `Accept: application/vnd.github+json`
  - `Authorization: Bearer {{GITHUB_TOKEN}}`
  - `X-GitHub-Api-Version: 2022-11-28`
- JSON body:

```json
{
  "event_type": "commerce-catalog-update",
  "client_payload": {
    "branch": "main"
  }
}
```

Store the GitHub token in Make.com’s encrypted connection or secret store. Do not place it in the Sheet or repository.

## Generated outputs

Each successful refresh rebuilds:

- storefront HTML
- `data/products/catalog.json`
- category JSON files
- `data/products/instagram.json`
- `catalog.csv`
- `catalog.xml`
- `sitemap.xml`

Meta Commerce Manager can use either:

- `https://estack.ca/catalog`
- `https://estack.ca/catalog.xml`

No deployment is triggered by this workflow. Deployment remains a separate reviewed action.

